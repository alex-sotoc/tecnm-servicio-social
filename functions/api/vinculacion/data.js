// WF-05 - Conexion de demostracion (SOLO EXPEDIENTES FICTICIOS).
// IMPORTANTE: la clave embebida en este archivo NO es segura en repositorios publicos.
// Para datos reales, configura N8N_WEBHOOK_KEY como secreto en Cloudflare.
import { json, isAdmin } from '../../_lib/vinculacion-auth.js';

const WF05_URL = 'https://servicio-social.app.n8n.cloud/webhook/ss-vinculacion-panel';
const DEMO_N8N_KEY = 'wf05_demo_llzdG_UfFKxzwxFGni4vebniHnLgC5VcTs0XR9Zqp9u1RnwA';

export async function onRequestGet({ request, env }) {
  if (!(await isAdmin(request, env))) {
    return json({ok:false,error:'Acceso administrativo no autorizado.'}, 401);
  }

  // Conserva compatibilidad con una variable real si existe.
  const key = env.N8N_WEBHOOK_KEY || DEMO_N8N_KEY;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const upstream = await fetch(WF05_URL, {
      method: 'GET',
      headers: {
        'X-Automation-Key': key,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });

    if (!upstream.ok) {
      const hints = {
        401: 'n8n rechazo la clave Header Auth. Verifica el encabezado X-Automation-Key y su Value.',
        403: 'n8n rechazo el acceso. Revisa la autenticacion del Webhook.',
        404: 'n8n no encontro el webhook de produccion. Publica WF-05 y comprueba su Path.',
        500: 'WF-05 genero un error. Revisa Executions en n8n.',
      };
      return json({
        ok: false,
        error: hints[upstream.status] || `WF-05 respondio HTTP ${upstream.status}. Revisa Executions en n8n.`,
        status_n8n: upstream.status
      }, 502);
    }

    let data;
    try { data = await upstream.json(); }
    catch { return json({ok:false,error:'WF-05 no devolvio JSON. Verifica Responder panel.'},502); }

    if (data?.ok !== true || !Array.isArray(data.estudiantes) ||
        !Array.isArray(data.expedientes) || !Array.isArray(data.documentos)) {
      return json({ok:false,error:'WF-05 devolvio un JSON incompleto. Revisa Preparar panel: ok, estudiantes, expedientes y documentos.'},502);
    }

    return json(data);
  } catch (error) {
    return json({
      ok:false,
      error: error?.name === 'AbortError'
        ? 'WF-05 tardo mas de 45 segundos en responder.'
        : 'No se pudo conectar con WF-05. Comprueba la URL y la ejecucion del workflow.'
    }, 504);
  } finally {
    clearTimeout(timeout);
  }
}
