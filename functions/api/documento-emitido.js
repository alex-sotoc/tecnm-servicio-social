import {demoAllowed} from '../_lib/demo-session.js';
const json=(body,status=400)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function onRequestPost({request,env}){
  if(!env.N8N_WF06_URL||!env.N8N_WEBHOOK_KEY)return json({ok:false,error:'Configura N8N_WF06_URL y N8N_WEBHOOK_KEY en Cloudflare.'},503);
  let body;try{body=await request.json()}catch{return json({ok:false,error:'JSON inválido.'})}
  const control=String(body.control||'').trim(),tipo=String(body.tipo||'').trim();
  if(!/^2466000[123]$/.test(control)||!['presentacion','constancia'].includes(tipo))return json({ok:false,error:'Solicitud incorrecta.'});
  if(!(await demoAllowed(request,env,control)))return json({ok:false,error:'Sesión no válida.'},401);
  const ctl=new AbortController();const timeout=setTimeout(()=>ctl.abort(),85000);
  try{
    const upstream=await fetch(env.N8N_WF06_URL,{method:'POST',signal:ctl.signal,headers:{'Content-Type':'application/json','Accept':'application/pdf','X-Automation-Key':env.N8N_WEBHOOK_KEY},body:JSON.stringify({control,tipo})});
    if(!upstream.ok)return json({ok:false,error:'WF-06 no pudo generar el documento. Revisa su ejecución en n8n (HTTP '+upstream.status+').'},502);
    const ct=upstream.headers.get('content-type')||'';
    if(!ct.includes('application/pdf'))return json({ok:false,error:'WF-06 no devolvió un PDF. Configura Respond to Webhook → Binary File.'},502);
    const buffer=await upstream.arrayBuffer();
    if(buffer.byteLength<5||buffer.byteLength>8*1024*1024||new TextDecoder().decode(buffer.slice(0,5))!=='%PDF-')return json({ok:false,error:'El contenido recibido no es un PDF válido.'},502);
    return new Response(buffer,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${tipo}_${control}.pdf"`,'Cache-Control':'no-store'}});
  }catch(e){return json({ok:false,error:e.name==='AbortError'?'WF-06 tardó demasiado. Verifica Drive antes de reintentar.':'No se pudo consultar WF-06.'},504)}
  finally{clearTimeout(timeout)}
}
export const onRequestGet=()=>json({error:'Usa POST.'},405);
