// Cloudflare Pages Function. Requiere un webhook WF-AVANCE con comprobaciones
// del lado de n8n. La clave de acceso por sí sola NO identifica a un estudiante.
const json=(o,s=200)=>Response.json(o,{status:s,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const compare=(a,b)=>{let x=new TextEncoder().encode(String(a||'')),y=new TextEncoder().encode(String(b||'')),v=x.length^y.length;for(let i=0;i<Math.max(x.length,y.length);i++)v|=(x[i]||0)^(y[i]||0);return v===0};
export async function onRequestPost({request,env}){
 if(!env.N8N_WF_AVANCE_URL||!env.N8N_WEBHOOK_KEY||!env.DEMO_ACCESS_KEY)return json({ok:false,error:'Falta configurar N8N_WF_AVANCE_URL en Cloudflare.'},503);
 if(!compare(request.headers.get('X-Demo-Access'),env.DEMO_ACCESS_KEY))return json({ok:false,error:'Acceso denegado.'},401);
 let body;try{body=await request.json()}catch{return json({ok:false,error:'JSON no válido.'},400)}
 const control=String(body?.control||''),accion=String(body?.accion||'');
 if(!/^2466000[123]$/.test(control)||!['presentacion','bimestre1','bimestre2','bimestre3'].includes(accion))return json({ok:false,error:'Solicitud no válida.'},400);
 try{
  const timer=new AbortController();const tid=setTimeout(()=>timer.abort(),18000);
  try{
   const res=await fetch(env.N8N_WF_AVANCE_URL,{method:'POST',signal:timer.signal,headers:{'Content-Type':'application/json','X-Automation-Key':env.N8N_WEBHOOK_KEY},body:JSON.stringify({control,accion})});
   const obj=await res.json().catch(()=>({}));
   if(!res.ok||!obj.ok)return json({ok:false,error:obj.error||'No se pudo confirmar el avance.'},res.status===403?403:422);
   return json({ok:true,mensaje:obj.mensaje||'Trámite registrado.'});
  }finally{clearTimeout(tid)}
 }catch{return json({ok:false,error:'El servicio de avance no respondió.'},502)}
}
export const onRequestGet=()=>json({ok:false,error:'Usa POST.'},405);
