export async function onRequestGet() {
  return Response.json({ status: 'ok', service: 'servicio-social' }, { headers: { 'Cache-Control': 'no-store' } });
}
