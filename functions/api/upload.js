export async function onRequestPost() {
  return Response.json({ error: 'Recepción de documentos no configurada' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
}
