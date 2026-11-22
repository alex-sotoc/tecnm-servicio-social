// Cloudflare Pages Function: POST /api/telegram-send
// Uso exclusivo SERVIDOR->SERVIDOR desde n8n. No exponer TELEGRAM_SEND_SECRET.
// En n8n se busca el chat_id vinculado; esta función sólo envía el aviso.
const H={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(v,s=200)=>new Response(JSON.stringify(v),{status:s,headers:H});
function same(a,b){
 const x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||''));
 let diff=x.length^y.length;
 for(let i=0;i<Math.max(x.length,y.length);i++)diff|=(x[i]||0)^(y[i]||0);
 return diff===0;
}
function clean(s,n=240){return String(s??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n)}
function textFor(x){
 const label=clean(x.documento,100)||'Tu documento';
 if(x.tipo==='documento_validado')return `✅ Documento validado técnicamente\n\n${label} pasó la revisión automática. Consulta el portal para verificar su estado. La validación técnica no sustituye las autorizaciones institucionales.`;
 if(x.tipo==='documento_observado')return `📝 Documento con observaciones\n\nRevisa ${label} en el portal para conocer las correcciones solicitadas.`;
 if(x.tipo==='cambio_etapa')return `📌 Nuevo trámite habilitado\n\nTu expediente avanzó a ${clean(x.etapa,70)||'una nueva etapa'}. Consulta tus documentos en el portal.`;
 if(x.tipo==='comunicado'){
  const msg=clean(x.mensaje,1500);
  return msg?`📣 Comunicado de Servicio Social\n\n${msg}`:'';
 }
 return '';
}
export async function onRequestPost({request,env}){
 if(!env.TELEGRAM_SEND_SECRET||!env.TELEGRAM_BOT_TOKEN)return reply({ok:false,error:'Mensajería no configurada.'},503);
 const auth=request.headers.get('Authorization')||'';
 if(!same(auth,`Bearer ${env.TELEGRAM_SEND_SECRET}`))return reply({ok:false,error:'No autorizado.'},401);
 if(!(request.headers.get('content-type')||'').toLowerCase().includes('application/json'))return reply({ok:false,error:'Se requiere JSON.'},415);
 if(Number(request.headers.get('content-length')||0)>4096)return reply({ok:false,error:'Solicitud demasiado grande.'},413);
 let data;try{data=await request.json()}catch{return reply({ok:false,error:'JSON inválido.'},400)}
 const chat_id=String(data?.chat_id??'').trim();
 if(!/^-?\d{3,20}$/.test(chat_id))return reply({ok:false,error:'chat_id inválido.'},400);
 const texto=textFor(data);
 if(!texto)return reply({ok:false,error:'Tipo de aviso o mensaje inválido.'},400);
 const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),12000);
 try{
  const r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,{
   method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json'},
   body:JSON.stringify({chat_id,text:texto,disable_web_page_preview:true})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok||d.ok!==true)return reply({ok:false,error:'Telegram rechazó el mensaje.',telegram_code:d.error_code||null},502);
  return reply({ok:true,message_id:d.result?.message_id||null});
 }catch(e){return reply({ok:false,error:e?.name==='AbortError'?'Telegram tardó demasiado.':'Error de conexión a Telegram.'},502)}
 finally{clearTimeout(timer)}
}
export function onRequestGet(){return reply({ok:false,error:'Usa POST.'},405)}
