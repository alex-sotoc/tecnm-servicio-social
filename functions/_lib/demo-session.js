// Sesión de DEMOSTRACIÓN para tres alumnos ficticios. No es autenticación institucional.
const cookieName = 'ss_demo';
const te = new TextEncoder();
const hex = bytes => [...new Uint8Array(bytes)].map(x => x.toString(16).padStart(2,'0')).join('');
async function sign(payload, secret) {
  const key = await crypto.subtle.importKey('raw',te.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return hex(await crypto.subtle.sign('HMAC',key,te.encode(payload)));
}
export async function makeCookie(control,env) {
  if(!env.DEMO_ACCESS_KEY)throw new Error('Falta DEMO_ACCESS_KEY');
  const expires=Math.floor(Date.now()/1000)+12*3600;
  const payload=`${control}.${expires}`;
  const sig=await sign(payload,env.DEMO_ACCESS_KEY);
  return `${cookieName}=${payload}.${sig}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200`;
}
export async function demoUser(request,env){
  if(!env.DEMO_ACCESS_KEY)return null;
  const cookie=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='));
  if(!cookie)return null;
  const raw=cookie.slice(cookieName.length+1);
  const m=/^(2466000[123])\.(\d{10})\.([a-f0-9]{64})$/.exec(raw);
  if(!m||Number(m[2])<Date.now()/1000)return null;
  const expected=await sign(`${m[1]}.${m[2]}`,env.DEMO_ACCESS_KEY);
  let mismatch=0;for(let i=0;i<64;i++)mismatch|=expected.charCodeAt(i)^m[3].charCodeAt(i);
  return mismatch===0?m[1]:null;
}
export const demoAllowed=async(request,env,control)=> (await demoUser(request,env))===String(control||'').trim();
