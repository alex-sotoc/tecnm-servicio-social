export async function onRequestPost() {
  return Response.json({ error: 'Asistente no configurado' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
