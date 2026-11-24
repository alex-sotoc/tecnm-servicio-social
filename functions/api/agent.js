import { demoAllowed } from '../_lib/demo-session.js';
// Cloudflare Pages Function: /api/agent
// Solo para el entorno académico con tres cuentas ficticias.
// Define N8N_WF01_URL, N8N_WEBHOOK_KEY y DEMO_ACCESS_KEY como secretos en Pages.
const responseHeaders={
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff'
};
function answer(body,status=200){return new Response(JSON.stringify(body),{status,headers:responseHeaders})}
function sameString(a,b){
 const x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||''));
 let mismatch=x.length^y.length;
 const max=Math.max(x.length,y.length);
 for(let i=0;i<max;i++)mismatch|=(x[i]||0)^(y[i]||0);
 return mismatch===0;
}
export async function onRequestPost({request,env}){
 if(!env.N8N_WF01_URL||!env.N8N_WEBHOOK_KEY){
   return answer({error:'El asistente todavía no está configurado.'},503);
 }
 if((request.headers.get('content-type')||'').split(';')[0].trim()!=='application/json')return answer({error:'Solo se admite JSON.'},415);
 const size=Number(request.headers.get('content-length')||0);
 if(size>8000)return answer({error:'La petición supera el tamaño permitido.'},413);
 let input;try{input=await request.json()}catch{return answer({error:'JSON inválido.'},400)}
 const control=String(input?.control||'');
 if(!(await demoAllowed(request,env,control)))return answer({error:'Sesión del alumno no válida.'},401);
 const question=String(input?.question||'').trim();
 const mode=input?.mode==='status'?'status':'chat';
 if(!['24660001','24660002','24660003'].includes(control))return answer({error:'Cuenta no disponible.'},403);
 if(mode==='chat'&&(question.length<2||question.length>700))return answer({error:'Pregunta entre 2 y 700 caracteres.'},400);
 if(mode==='status'&&question.length>700)return answer({error:'Solicitud inválida.'},400);
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),25000);
 try{
  const upstream=await fetch(env.N8N_WF01_URL,{
   method:'POST',signal:controller.signal,
   headers:{'Content-Type':'application/json','X-Automation-Key':env.N8N_WEBHOOK_KEY},
   body:JSON.stringify({control,question:mode==='status'?'Consulta de estado':question,mode})
  });
  if(!upstream.ok)return answer({error:'No fue posible comunicarse con la automatización.'},502);
  const payload=await upstream.json();
  if(!payload||typeof payload!=='object')return answer({error:'Respuesta inesperada de la automatización.'},502);
  const reply=String(payload.reply||'').slice(0,2500);
  const perfil=payload.perfil && typeof payload.perfil==='object'?payload.perfil:null;
  return answer({ok:payload.ok===true,reply,perfil,error:payload.error||undefined},payload.ok===false?422:200);
 }catch(err){return answer({error:err?.name==='AbortError'?'La consulta tardó demasiado.':'Error al consultar la automatización.'},504)}
 finally{clearTimeout(timeout)}
}
export function onRequestGet(){return answer({error:'Usa POST para consultar el asistente.'},405)}
