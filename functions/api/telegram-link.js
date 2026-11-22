// Cloudflare Pages Function: POST /api/telegram-link
// DEMO: comparte la protección X-Demo-Access que ya existe en /api/agent.
// IMPORTANTE: en producción reemplazar este control de acceso por sesiones
// verificadas del lado del servidor y resolver el control desde esa sesión.
const H={ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff' };
const reply=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:H});
function same(a,b){
 const x=new TextEncoder().encode(String(a||''));const y=new TextEncoder().encode(String(b||''));
 let diff=x.length^y.length;
 for(let i=0;i<Math.max(x.length,y.length);i++)diff|=(x[i]||0)^(y[i]||0);
 return diff===0;
}
export async function onRequestPost({request,env}){
 if(!env.DEMO_ACCESS_KEY||!env.N8N_TELEGRAM_LINK_URL||!env.N8N_WEBHOOK_KEY||!env.TELEGRAM_BOT_USERNAME)
  return reply({ok:false,error:'La vinculación de Telegram aún no está configurada.'},503);
 const access=request.headers.get('X-Demo-Access')||'';
 if(access.length>150||!same(access,env.DEMO_ACCESS_KEY))return reply({ok:false,error:'Acceso no autorizado.'},401);
 if(!(request.headers.get('content-type')||'').toLowerCase().includes('application/json'))return reply({ok:false,error:'Se requiere JSON.'},415);
 if(Number(request.headers.get('content-length')||0)>2048)return reply({ok:false,error:'Solicitud demasiado grande.'},413);
 let body;try{body=await request.json()}catch{return reply({ok:false,error:'JSON inválido.'},400)}
 const control=String(body?.control||'').trim();
 if(!['24660001','24660002','24660003'].includes(control))return reply({ok:false,error:'Expediente no disponible.'},403);
 const bot=String(env.TELEGRAM_BOT_USERNAME).replace(/^@/,'').trim();
 if(!/^[A-Za-z0-9_]{5,32}$/.test(bot)||!bot.toLowerCase().endsWith('bot'))
  return reply({ok:false,error:'El usuario del bot no está configurado correctamente.'},503);
 const token=crypto.randomUUID().replace(/-/g,'');
 const vence=new Date(Date.now()+10*60*1000).toISOString();
 const controller=new AbortController();const t=setTimeout(()=>controller.abort(),15000);
 try{
  const upstream=await fetch(env.N8N_TELEGRAM_LINK_URL,{
   method:'POST',signal:controller.signal,
   headers:{'Content-Type':'application/json','X-Automation-Key':env.N8N_WEBHOOK_KEY},
   body:JSON.stringify({control,token,vence})
  });
  const data=await upstream.json().catch(()=>null);
  if(!upstream.ok||data?.ok!==true)return reply({ok:false,error:'n8n no confirmó la vinculación. Revisa WF-03.'},502);
  return reply({ok:true,url:`https://t.me/${bot}?start=${token}`,vence});
 }catch(e){return reply({ok:false,error:e?.name==='AbortError'?'n8n tardó demasiado.':'No fue posible contactar con n8n.'},504)}
 finally{clearTimeout(t)}
}
export function onRequestGet(){return reply({ok:false,error:'Usa POST.'},405)}
