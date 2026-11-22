// Descarga protegida por la automatización institucional; NO crea documentos.
const json=(o,s)=>Response.json(o,{status:s,headers:{'Cache-Control':'no-store'}});
const compare=(a,b)=>{let x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||'')),v=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)v|=(x[i]||0)^(y[i]||0);return v===0};
export async function onRequestGet({request,env}){
 if(!env.N8N_WF_DOCUMENTO_URL||!env.N8N_WEBHOOK_KEY||!env.DEMO_ACCESS_KEY)return json({error:'La descarga institucional todavía no está conectada a n8n.'},503);
 if(!compare(request.headers.get('X-Demo-Access'),env.DEMO_ACCESS_KEY))return json({error:'Acceso denegado.'},401);
 const u=new URL(request.url),control=u.searchParams.get('control')||'',tipo=u.searchParams.get('tipo')||'';
 if(!/^2466000[123]$/.test(control)||!['presentacion','constancia'].includes(tipo))return json({error:'Documento no permitido.'},400);
 try{
  const upstream=await fetch(env.N8N_WF_DOCUMENTO_URL,{method:'POST',headers:{'Content-Type':'application/json','X-Automation-Key':env.N8N_WEBHOOK_KEY},body:JSON.stringify({control,tipo})});
  if(!upstream.ok)return json({error:'El PDF institucional aún no está disponible o no fue autorizado.'},404);
  const contentType=upstream.headers.get('content-type')||'';
  if(!contentType.includes('application/pdf'))return json({error:'La automatización no devolvió un PDF válido.'},502);
  const data=await upstream.arrayBuffer();if(data.byteLength<5||data.byteLength>8*1024*1024)return json({error:'PDF inválido.'},502);
  return new Response(data,{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="${tipo}.pdf"`,'Cache-Control':'no-store'}});
 }catch{return json({error:'No fue posible descargar el documento.'},502)}
}
