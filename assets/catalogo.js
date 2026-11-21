window.SS_CATALOGO = {
  "stages": [
    {
      "num": 1,
      "title": "Convocatoria e inducción",
      "owner": "Vinculación",
      "text": "Publica convocatoria y registra asistencia a la inducción de estudiantes elegibles."
    },
    {
      "num": 2,
      "title": "Solicitud, carta compromiso, carta de asignación y plan",
      "owner": "Estudiante",
      "text": "Descarga y completa los formatos; entrega los cuatro documentos a Vinculación."
    },
    {
      "num": 3,
      "title": "Integración del expediente y carta de presentación",
      "owner": "Vinculación",
      "text": "Registra documentos y emite la carta de presentación para el estudiante."
    },
    {
      "num": 4,
      "title": "Entrega de carta de presentación a la instancia",
      "owner": "Estudiante",
      "text": "Lleva la carta de presentación a la dependencia donde realizará el servicio."
    },
    {
      "num": 5,
      "title": "Emisión de carta de aceptación",
      "owner": "Instancia receptora",
      "text": "La instancia elabora, firma y sella la carta de aceptación."
    },
    {
      "num": 6,
      "title": "Entrega de carta de aceptación",
      "owner": "Estudiante",
      "text": "Solicita la carta de aceptación a la instancia y súbela al portal."
    },
    {
      "num": 7,
      "title": "Integración de carta de aceptación",
      "owner": "Vinculación",
      "text": "La automatización registra y comprueba la carta entregada en el expediente."
    },
    {
      "num": 8,
      "title": "Desarrollo del servicio y preparación de reportes",
      "owner": "Estudiante",
      "text": "Realiza actividades y elabora reportes y evaluaciones por periodo."
    },
    {
      "num": 9,
      "title": "Supervisión y firma de reportes",
      "owner": "Instancia receptora",
      "text": "Tu supervisor revisa y avala los reportes y evaluaciones correspondientes."
    },
    {
      "num": 10,
      "title": "Entrega de reportes y evaluaciones",
      "owner": "Estudiante",
      "text": "Sube el reporte bimestral y los formatos avalados del periodo habilitado."
    },
    {
      "num": 11,
      "title": "Verificación de seguimiento",
      "owner": "Vinculación",
      "text": "El sistema comprueba la recepción de reportes y evaluaciones y prepara el seguimiento."
    },
    {
      "num": 12,
      "title": "Reporte final y solicitud de terminación",
      "owner": "Estudiante",
      "text": "Prepara el reporte final y solicita a la instancia la carta de terminación."
    },
    {
      "num": 13,
      "title": "Emisión de carta de terminación",
      "owner": "Instancia receptora",
      "text": "La instancia avala el reporte final y emite la carta de terminación."
    },
    {
      "num": 14,
      "title": "Entrega de documentos de terminación",
      "owner": "Estudiante",
      "text": "Sube la carta de terminación y el reporte final avalado."
    },
    {
      "num": 15,
      "title": "Verificación y emisión de constancia",
      "owner": "Vinculación",
      "text": "Verifica los requisitos, emite constancia institucional y remite copia a Escolares."
    },
    {
      "num": 16,
      "title": "Recepción de constancia",
      "owner": "Estudiante",
      "text": "Recibe la constancia y deja constancia del acuse de recibido."
    }
  ],
  "documents": [
    {
      "id": "solicitud",
      "name": "Solicitud de Servicio Social",
      "code": "002-01",
      "owner": "Estudiante",
      "action": "upload",
      "start": 2,
      "finish": 2,
      "path": "solicitud.doc",
      "tip": "Completa la solicitud y súbela al portal.",
      "required": true
    },
    {
      "id": "compromiso",
      "name": "Carta compromiso",
      "code": "002-02",
      "owner": "Estudiante",
      "action": "upload",
      "start": 2,
      "finish": 2,
      "path": "carta_compromiso.doc",
      "tip": "Descarga, firma según corresponda y entrega la carta compromiso.",
      "required": true
    },
    {
      "id": "asignacion",
      "name": "Carta de asignación",
      "code": "002-07",
      "owner": "Estudiante",
      "action": "upload",
      "start": 2,
      "finish": 2,
      "path": "carta_asignacion.doc",
      "tip": "Completa la carta de asignación y súbela.",
      "required": true
    },
    {
      "id": "plan",
      "name": "Plan de trabajo",
      "code": "N/A",
      "owner": "Estudiante",
      "action": "upload",
      "start": 2,
      "finish": 2,
      "path": "plan_trabajo.pdf",
      "tip": "Describe actividades, periodo e instancia receptora.",
      "required": true
    },
    {
      "id": "presentacion",
      "name": "Carta de presentación",
      "code": "002-03",
      "owner": "Vinculación",
      "action": "generated",
      "start": 3,
      "finish": 4,
      "path": null,
      "tip": "Este documento lo emite Vinculación. Descárgalo cuando esté emitido y entrégalo a la instancia.",
      "required": true
    },
    {
      "id": "aceptacion",
      "name": "Carta de aceptación",
      "code": "Sin código en sección 7",
      "owner": "Instancia receptora",
      "action": "external",
      "start": 5,
      "finish": 7,
      "path": null,
      "tip": "Acude a la instancia receptora, solicita la carta firmada y sellada, y después súbela al portal.",
      "required": true
    },
    {
      "id": "reporte1",
      "name": "Reporte bimestral 1",
      "code": "002-04",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "reporte_bimestral.doc",
      "tip": "Elabora el reporte del primer bimestre, solicita aval de la instancia y súbelo.",
      "required": true
    },
    {
      "id": "eval1",
      "name": "Evaluación cualitativa (bimestre 1)",
      "code": "002-08",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "evaluacion_cualitativa.doc",
      "fallback": "evaluacion.pdf",
      "tip": "Completa el formato de evaluación y obtiene el aval correspondiente.",
      "required": true
    },
    {
      "id": "autoeval1",
      "name": "Autoevaluación cualitativa (bimestre 1)",
      "code": "002-09",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "autoevaluacion_cualitativa.doc",
      "tip": "Llena el formato de autoevaluación y obtiene los avales indicados.",
      "required": true
    },
    {
      "id": "reporte2",
      "name": "Reporte bimestral 2",
      "code": "002-04",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "reporte_bimestral.doc",
      "tip": "Disponible cuando se abra el segundo bimestre.",
      "required": true,
      "period": 2
    },
    {
      "id": "eval2",
      "name": "Evaluación cualitativa (bimestre 2)",
      "code": "002-08",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "evaluacion_cualitativa.doc",
      "fallback": "evaluacion.pdf",
      "tip": "Evaluación correspondiente al segundo bimestre.",
      "required": true,
      "period": 2
    },
    {
      "id": "autoeval2",
      "name": "Autoevaluación cualitativa (bimestre 2)",
      "code": "002-09",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "autoevaluacion_cualitativa.doc",
      "tip": "Autoevaluación correspondiente al segundo bimestre.",
      "required": true,
      "period": 2
    },
    {
      "id": "reporte3",
      "name": "Reporte bimestral 3",
      "code": "002-04",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "reporte_bimestral.doc",
      "tip": "Disponible cuando se abra el tercer bimestre.",
      "required": true,
      "period": 3
    },
    {
      "id": "eval3",
      "name": "Evaluación cualitativa (bimestre 3)",
      "code": "002-08",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "evaluacion_cualitativa.doc",
      "fallback": "evaluacion.pdf",
      "tip": "Evaluación correspondiente al tercer bimestre.",
      "required": true,
      "period": 3
    },
    {
      "id": "autoeval3",
      "name": "Autoevaluación cualitativa (bimestre 3)",
      "code": "002-09",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 8,
      "finish": 11,
      "path": "autoevaluacion_cualitativa.doc",
      "tip": "Autoevaluación correspondiente al tercer bimestre.",
      "required": true,
      "period": 3
    },
    {
      "id": "reporte_final",
      "name": "Reporte final",
      "code": "N/A",
      "owner": "Estudiante e instancia",
      "action": "upload",
      "start": 12,
      "finish": 14,
      "path": "reporte_final.pdf",
      "tip": "Elabora el reporte final; la instancia debe avalarlo.",
      "required": true
    },
    {
      "id": "eval_actividades",
      "name": "Evaluación de actividades",
      "code": "002-10",
      "owner": "Estudiante",
      "action": "upload",
      "start": 12,
      "finish": 14,
      "path": "evaluacion_actividades.doc",
      "tip": "Completa el formato de evaluación de actividades.",
      "required": true
    },
    {
      "id": "terminacion",
      "name": "Carta de terminación",
      "code": "Sin código en sección 7",
      "owner": "Instancia receptora",
      "action": "external",
      "start": 13,
      "finish": 14,
      "path": null,
      "tip": "La instancia debe emitir esta carta. Recíbela y entrégala en el portal.",
      "required": true
    },
    {
      "id": "constancia",
      "name": "Constancia de terminación de Servicio Social",
      "code": "002-05",
      "owner": "Vinculación",
      "action": "generated",
      "start": 15,
      "finish": 16,
      "path": null,
      "tip": "La constancia la emite Vinculación después de completar los requisitos y autorizaciones.",
      "required": true
    },
    {
      "id": "tarjeta",
      "name": "Tarjeta de control",
      "code": "002-06",
      "owner": "Vinculación",
      "action": "internal",
      "start": 3,
      "finish": 16,
      "path": null,
      "tip": "Registro institucional interno del expediente.",
      "required": false
    }
  ]
};
