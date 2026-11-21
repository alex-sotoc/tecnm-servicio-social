# TecNM Campus Matehuala — Portal del estudiante

## Inicio rápido

1. Extrae el ZIP.
2. Abre `index.html` en un navegador moderno.
3. Ingresa una de las cuentas de esta tabla.
4. Navega por Inicio, Documentos, Horas y Avisos.
5. En Documentos, presiona «Formato» para descargar automáticamente el PDF sin abandonar la página.

| Número de control | NIP de 4 dígitos | Estado |
| --- | --- | --- |
| `24660001` | `1234` | Elegible, seguimiento |
| `24660002` | `2345` | Créditos insuficientes |
| `24660003` | `3456` | Elegible, registro |

**Los NIP son credenciales de demostración incluidas en JavaScript público, no proporcionan autenticación real.** No deben utilizarse para proteger expedientes verdaderos.

## Archivos principales

- `index.html`: entrada web.
- `assets/styles.css`: estilos responsive.
- `assets/app.js`: navegación, ingreso con NIP de demostración, vistas y lógica visible.
- `assets/formatos.js`: rutas fijas a los PDF oficiales.
- `formatos/`: carpeta donde colocarás los archivos oficiales descargables.
- `functions/api/health.js`: comprobación de Cloudflare Pages Functions.
- `functions/api/upload.js` y `functions/api/agent.js`: funciones cerradas hasta conectar autenticación y n8n.

## Nombres EXACTOS de los PDF oficiales

Coloca los archivos directamente en la carpeta `formatos` con los nombres siguientes:

1. `solicitud.pdf`
2. `plan_trabajo.pdf`
3. `carta_presentacion.pdf`
4. `carta_aceptacion.pdf`
5. `reporte_bimestral.pdf` (plantilla de los reportes 1, 2 y 3)
6. `evaluacion.pdf`

No necesitas modificar `assets/formatos.js` si usas estos nombres. Los formatos pueden faltar al principio; la aplicación se puede publicar sin ellos, pero no podrán descargarse hasta que los agregues. **No se incluyen PDFs inventados ni documentos privados.**

Si los documentos institucionales usan un nombre diferente, renómbralos exactamente como aparecen arriba antes de subirlos. Si el formato del bimestre cambia, se pueden cambiar las rutas por bimestre en `assets/formatos.js`.

## Qué funciona ahora

- Ingreso con número de control y NIP de 4 dígitos, solo en el navegador.
- Pantallas y navegación responsive para celular y computadora.
- Cálculo visible de elegibilidad para las cuentas de prueba.
- Restricción de documentos disponibles según la etapa precargada.
- Selección de PDF (máximo 5 MiB) y preparación de envío a `/api/upload`.
- Descarga de formatos al agregar los PDFs a `formatos/`.
- Horas calculadas desde reportes marcados como aceptados en los datos de demostración.
- Respuestas de orientación de la interfaz del asistente.

## Qué NO está conectado todavía

- Autenticación real, sesiones seguras, padrón académico institucional.
- Recepción y almacenamiento de PDF en Drive.
- Validación de contenido mediante IA.
- Agente conectado a n8n y recordatorios por Telegram.

`/api/upload` y `/api/agent` responden 503 hasta que sus funciones se implementen. La página **no registra un PDF como recibido** mientras no exista un servidor que lo confirme.

## Publicar en Cloudflare Pages

1. Crea un repositorio en GitHub.
2. Sube el CONTENIDO de esta carpeta a la raíz del repositorio: `index.html`, `assets/`, `formatos/`, `functions/` y `README.md`.
3. En Cloudflare Pages, crea un proyecto conectado a ese repositorio.
4. Configura un sitio sin framework y sin comando de build.
5. Publica y abre el dominio `.pages.dev`.
6. Agrega los PDFs oficiales a la carpeta `formatos/` y confirma los cambios en GitHub para que se publiquen.

**Seguridad:** el NIP de esta entrega es local y demostrativo, aunque no se mencione dentro de las pantallas. No garantiza identidad ni autorización. La interfaz no debe recibir documentos reales antes de implementar controles de servidor. Los PDFs en la carpeta pública `formatos/` serán descargables por cualquiera que conozca su URL; almacena ahí solamente plantillas oficiales destinadas a distribución pública.

## Cambios de esta versión

- **Descarga automática**: desde Cloudflare Pages, el PDF se lee como archivo y se guarda mediante una descarga del navegador (no se abre una pantalla de PDF).
- El archivo `_headers` configura `Content-Disposition: attachment` para los PDF de `/formatos/` al publicarlos en Cloudflare Pages.
- Si se abre `index.html` desde una carpeta local (`file://`), se usa el atributo `download`, aunque el comportamiento exacto puede depender del navegador. En Cloudflare Pages es más fiable.
- **Regreso sin iniciar sesión de nuevo**: se conserva el número de control en `sessionStorage` durante la sesión de esa pestaña. El NIP no se guarda. Cerrar sesión elimina ese dato. Esto solo mantiene el estado de la demostración, **no es una sesión de autenticación segura**.
- Los nombres de los PDF se mantienen sin cambios: solo coloca los archivos correspondientes en `formatos/`.
- Si actualizas una web ya publicada, sube `_headers` junto a los archivos y realiza una recarga completa.
