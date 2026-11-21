// functions/api/upload.js — demostración con PDF ficticios.
// El navegador envía multipart/form-data; al webhook enviamos el PDF binario puro.
const HEADERS = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const answer = (obj, status=200) => new Response(JSON.stringify(obj), {status,headers:HEADERS});
const ALLOWED = new Set([
  'solicitud','compromiso','asignacion','plan','aceptacion',
  'reporte1','reporte2','reporte3','eval1','eval2','eval3',
  'autoeval1','autoeval2','autoeval3','reporte_final',
  'eval_actividades','terminacion'
]);
function sameString(a,b){
 const x=new TextEncoder().encode(String(a||'')), y=new TextEncoder().encode(String(b||''));
 let mismatch=x.length^y.length;
 for(let i=0;i<Math.max(x.length,y.length);i++)mismatch|=(x[i]||0)^(y[i]||0);
 return mismatch===0;
}
export async function onRequestPost({request,env}) {
  if(!env.N8N_WF02_URL||!env.N8N_WEBHOOK_KEY||!env.DEMO_ACCESS_KEY)
    return answer({ok:false,error:'El servicio documental no está configurado.'},503);
  const gate=request.headers.get('X-Demo-Access')||'';
  if(gate.length>150||!sameString(gate,env.DEMO_ACCESS_KEY))return answer({ok:false,error:'Acceso al servicio no autorizado.'},401);
  if(!(request.headers.get('content-type')||'').includes('multipart/form-data'))
    return answer({ok:false,error:'Se requiere un formulario con un PDF.'},415);
  const max=4*1024*1024;
  const advertised=Number(request.headers.get('content-length')||0);
  if(advertised>max+12000)return answer({ok:false,error:'El archivo excede 4 MB.'},413);
  let form;
  try{form=await request.formData()}catch{return answer({ok:false,error:'No fue posible leer el formulario.'},400)}
  const control=String(form.get('control')||'').trim();
  const tipo=String(form.get('type')||'').trim();
  const file=form.get('file');
  if(!['24660001','24660002','24660003'].includes(control)||!ALLOWED.has(tipo))
    return answer({ok:false,error:'Cuenta o tipo de documento no permitido.'},403);
  if(!file||typeof file.arrayBuffer!=='function')return answer({ok:false,error:'Selecciona un archivo PDF.'},400);
  if(file.size<12||file.size>max)return answer({ok:false,error:'El PDF debe tener entre 12 bytes y 4 MB.'},413);
  if(!String(file.name||'').toLowerCase().endsWith('.pdf'))return answer({ok:false,error:'Solo se admiten archivos PDF.'},415);
  let bytes=new Uint8Array(await file.arrayBuffer());
  if(String.fromCharCode(...bytes.slice(0,5))!=='%PDF-')return answer({ok:false,error:'El archivo no tiene una cabecera PDF válida.'},415);
  const uploadId=crypto.randomUUID();
  const safeName=String(file.name||'archivo.pdf').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100);
  const controller=new AbortController();
  const t=setTimeout(()=>controller.abort(),25000);
  try {
   const upstream=await fetch(env.N8N_WF02_URL,{
    method:'POST',signal:controller.signal,
    headers:{'Content-Type':'application/pdf','X-Automation-Key':env.N8N_WEBHOOK_KEY,
      'X-SS-Control':control,'X-SS-Type':tipo,'X-SS-Upload-ID':uploadId,'X-SS-File-Name':safeName},
    body:bytes
   });
   const payload=await upstream.json().catch(()=>null);
   if(!upstream.ok||!payload||payload.ok!==true)
    return answer({ok:false,error:payload?.error||'El servidor no confirmó la recepción del PDF.'},upstream.status===403?403:502);
   return answer({ok:true,upload_id:uploadId,estado:'EN_REVISION',mensaje:'PDF recibido para procesamiento.'},200);
  } catch(err){return answer({ok:false,error:err?.name==='AbortError'?'La recepción tardó demasiado. Comprueba las ejecuciones de n8n antes de reintentar.':'No fue posible contactar el servicio documental.'},504)}
  finally{clearTimeout(t)}
}
export function onRequestGet(){return answer({ok:false,error:'Usa POST para enviar un PDF.'},405)}
