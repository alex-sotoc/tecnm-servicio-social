import {makeCookie} from '../_lib/demo-session.js';
const demoNips={'24660001':'1234','24660002':'2345','24660003':'3456'};
export async function onRequestPost({request,env}) {
  if(!env.DEMO_ACCESS_KEY)return Response.json({ok:false,error:'Falta DEMO_ACCESS_KEY en Cloudflare.'},{status:503});
  let v;try{v=await request.json()}catch{return Response.json({ok:false,error:'JSON inválido'},{status:400})}
  const control=String(v.control||''),nip=String(v.nip||'');
  if(demoNips[control]!==nip)return Response.json({ok:false,error:'Control o NIP incorrectos.'},{status:401});
  return Response.json({ok:true,control},{headers:{'Set-Cookie':await makeCookie(control,env),'Cache-Control':'no-store'}});
}
export const onRequestGet=()=>Response.json({ok:false,error:'Usa POST.'},{status:405});
