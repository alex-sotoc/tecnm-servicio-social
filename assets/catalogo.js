/* Catálogo del portal del alumno: trámites, NO las 16 actividades administrativas. */
window.SS_CATALOGO = {
  pasos: [
    {id:'registro', nombre:'Registro',detalle:'Entrega los cuatro documentos iniciales.'},
    {id:'presentacion',nombre:'Carta de presentación',detalle:'Descarga la carta emitida por Vinculación y entrégala a tu instancia.'},
    {id:'aceptacion',nombre:'Carta de aceptación',detalle:'Solicita a la instancia su carta de aceptación y súbela.'},
    {id:'bimestre1',nombre:'Bimestre 1',detalle:'Reporte, evaluación y autoevaluación del primer periodo.'},
    {id:'bimestre2',nombre:'Bimestre 2',detalle:'Reporte, evaluación y autoevaluación del segundo periodo.'},
    {id:'bimestre3',nombre:'Bimestre 3',detalle:'Reporte, evaluación y autoevaluación del tercer periodo.'},
    {id:'cierre',nombre:'Cierre y terminación',detalle:'Reporte final, evaluación de actividades y carta de terminación.'},
    {id:'constancia',nombre:'Constancia',detalle:'Descarga la constancia cuando Vinculación la haya emitido.'}
  ],
  documentos: [
    {id:'solicitud',nombre:'Solicitud de Servicio Social',codigo:'002-01',emisor:'Estudiante',paso:'registro',accion:'upload',archivo:'solicitud.doc',alternativas:['solicitud.docx','solicitud.pdf'],instruccion:'Completa tus datos y entrega la solicitud.'},
    {id:'compromiso',nombre:'Carta compromiso',codigo:'002-02',emisor:'Estudiante',paso:'registro',accion:'upload',archivo:'carta_compromiso.doc',alternativas:['carta_compromiso.docx','carta_compromiso.pdf'],instruccion:'Completa y firma el formato que corresponda.'},
    {id:'asignacion',nombre:'Carta de asignación',codigo:'002-07',emisor:'Estudiante',paso:'registro',accion:'upload',archivo:'carta_asignacion.doc',alternativas:['carta_asignacion.docx','carta_asignacion.pdf'],instruccion:'Completa el formato institucional de asignación.'},
    {id:'plan',nombre:'Plan de trabajo',codigo:'N/A',emisor:'Estudiante',paso:'registro',accion:'upload',archivo:'plan_trabajo.pdf',alternativas:['plan_trabajo.doc','plan_trabajo.docx'],instruccion:'Describe tus actividades y la instancia receptora.'},
    {id:'presentacion',nombre:'Carta de presentación',codigo:'002-03',emisor:'Vinculación',paso:'presentacion',accion:'generated',instruccion:'Vinculación la emite. Descárgala y entrégala a tu instancia; confirma después la entrega.'},
    {id:'aceptacion',nombre:'Carta de aceptación',codigo:'Sin código',emisor:'Instancia receptora',paso:'aceptacion',accion:'external',instruccion:'Pide la carta a tu instancia, con las firmas y sellos requeridos. Escanéala y súbela al portal.'},
    ...[1,2,3].flatMap(p=>[
      {id:`reporte${p}`,nombre:`Reporte bimestral ${p}`,codigo:'002-04',emisor:'Estudiante e instancia',paso:`bimestre${p}`,accion:'upload',periodo:p,archivo:'reporte_bimestral.doc',alternativas:['reporte_bimestral.pdf','reporte_bimestral.docx'],instruccion:`Completa el reporte ${p}, comprueba las horas y solicita los avales exigidos.`},
      {id:`eval${p}`,nombre:`Evaluación cualitativa · bimestre ${p}`,codigo:'002-08',emisor:'Instancia receptora',paso:`bimestre${p}`,accion:'upload',periodo:p,archivo:'evaluacion_cualitativa.doc',alternativas:['evaluacion_cualitativa.pdf','evaluacion_cualitativa.docx'],instruccion:'Solicita al responsable del programa que complete la evaluación y los avales correspondientes.'},
      {id:`autoeval${p}`,nombre:`Autoevaluación cualitativa · bimestre ${p}`,codigo:'002-09',emisor:'Estudiante',paso:`bimestre${p}`,accion:'upload',periodo:p,archivo:'autoevaluacion_cualitativa.doc',alternativas:['autoevaluacion_cualitativa.pdf','autoevaluacion_cualitativa.docx'],instruccion:'Completa tu autoevaluación y firma donde corresponde.'}
    ]),
    {id:'reporte_final',nombre:'Reporte final',codigo:'N/A',emisor:'Estudiante e instancia',paso:'cierre',accion:'upload',archivo:'reporte_final.pdf',alternativas:['reporte_final.doc','reporte_final.docx'],instruccion:'Prepara el reporte final con los avales solicitados.'},
    {id:'eval_actividades',nombre:'Evaluación de actividades',codigo:'002-10',emisor:'Estudiante',paso:'cierre',accion:'upload',archivo:'evaluacion_actividades.doc',alternativas:['evaluacion_actividades.pdf','evaluacion_actividades.docx'],instruccion:'Completa la evaluación final de actividades.'},
    {id:'terminacion',nombre:'Carta de terminación',codigo:'Sin código',emisor:'Instancia receptora',paso:'cierre',accion:'external',instruccion:'Solicita a la instancia receptora la carta de terminación y súbela.'},
    {id:'constancia',nombre:'Constancia de terminación',codigo:'002-05',emisor:'Vinculación',paso:'constancia',accion:'generated',instruccion:'Vinculación la emite cuando el trámite de terminación está concluido.'}
  ]
};
