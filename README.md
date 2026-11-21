# Portal del estudiante — TecNM Campus Matehuala

Archivos públicos: `index.html`, `assets/`, `formatos/`, `_headers`, `functions/`.

## Usuarios de interfaz
- 24660001 / 1234 — seguimiento (actividad 10/16)
- 24660002 / 2345 — aún no elegible (actividad 1/16)
- 24660003 / 3456 — registro (actividad 2/16)

Estos NIP están en JavaScript; NO constituyen autenticación institucional. Nunca utilizar datos personales reales con este acceso. La interfaz no muestra advertencias de desarrollo, pero antes de usarla fuera de un entorno de demostración debe implementarse autenticación de servidor.

## Comportamiento actual
- Navegación desktop/mobile, elegibilidad, horas de ejemplo, 16 actividades oficiales, cuatro macroetapas, guía contextual del asistente.
- Solo se habilitan documentos/formato de la etapa y periodo precargado del usuario.
- Descarga de PDF mediante `fetch()` y Blob; mantiene la pantalla abierta. Si el formato no existe muestra error.
- La carta de aceptación y la de terminación son emitidas por la instancia, nunca por el TecNM.
- La carta de presentación y constancia son documentos institucionales de Vinculación y solo se pondrán a descarga tras su emisión autorizada.
- El formulario de subida selecciona PDF pero no finge recepción: `/api/upload` responde HTTP 503 hasta conectar n8n.
- El asistente usa respuestas guiadas locales y NO se anuncia en esta documentación como IA real hasta conectar n8n/LLM.
- El avance no cambia automáticamente en esta versión. Cuando se conecte n8n, la fuente será Google Sheets y las transiciones se comprobarán en el servidor.

## Formatos PDF
Conserva los archivos PDF de tu repositorio actual dentro de `formatos/`. En este ZIP solo hay un archivo `COLOCA_AQUI_TUS_PDF.txt`. Revisa esta lista antes de borrar la versión anterior.

## Publicar en Cloudflare Pages
Mantén el proyecto Pages existente (NO Worker), sube los archivos nuevos, conserva tus PDF actuales y confirma un commit en la rama `main`. Pages desplegará automáticamente. Verifica navegación en móvil y PDFs. No subas claves de IA/n8n al repositorio.

## Migración a Google Sheets
Descarga el archivo Excel complementario, impórtalo a Google Sheets como reemplazo del libro previo (tras conservar una copia). Incluye cinco pestañas `ESTUDIANTES`, `EXPEDIENTES`, `DOCUMENTOS`, `REQUISITOS`, `CONVOCATORIAS`. En esta entrega el portal usa datos locales para no fingir la conexión.

## Documentación normativa
Basado en el procedimiento TecNM-VI-PO-002, revisión 0, en particular las 16 actividades de la sección 5 y registros de la sección 7. Los nombres y entregas definitivos deben verificarse con el responsable institucional y los formatos vigentes.
