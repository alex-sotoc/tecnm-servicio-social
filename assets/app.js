(()=>{
'use strict';
const root=document.getElementById('app');
const CAT=window.SS_CATALOGO;
const PASOS=CAT.pasos,DOCS=CAT.documentos;
const SESSION='tecnm_estudiante_sesion_v1';
 const PRESENTACION_DESCARGADA='ss_presentacion_descargada_v1';
 function presentacionDescargada(){try{return sessionStorage.getItem(PRESENTACION_DESCARGADA)===userId;}catch{return false;}}
const CACHE='ss_portal_tramites_v1';
const LEGACY='ss_ui_avance_v3';
const USERS={
 '24660001':{name:'Ana Sofía Ramírez',nip:'1234',approved:190,total:250,period:2,activity:11,hours:160,exp:'EXP-001'},
 '24660002':{name:'Luis Herrera',nip:'2345',approved:150,total:250,period:0,activity:1,hours:0,exp:'EXP-002',stage:'no_elegible'},
 '24660003':{name:'Mariana Torres',nip:'3456',approved:175,total:250,period:0,activity:2,hours:0,exp:'EXP-003'}
};
let userId=null,screen='inicio',chosen=null,bimestreAbierto=null,notice='',messages=[],sending=false,syncing=false,lastSync=0,pendingUploads=new Set(),uploading=false;
// Nunca mostrar datos iniciales de USERS como si fueran el expediente oficial.
let profileReady=false,profileLoadError='';
const clone=v=>JSON.parse(JSON.stringify(v));
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=v=>String(v??'').trim().toUpperCase();
function getStore(){try{return JSON.parse(localStorage.getItem(CACHE)||'{}')}catch{return {}}}
const store=getStore();
function save(){try{localStorage.setItem(CACHE,JSON.stringify(store))}catch{}}
function profile(){return USERS[userId]}
function state(){if(!store[userId])store[userId]={docs:{},updated:null,events:{}};return store[userId]}
function eligible(){const u=profile();return Boolean(u&&Number(u.total)>0&&Number(u.approved)/Number(u.total)>=.70&&u.stage!=='no_elegible')}
function status(d){return state().docs[d.id]?.estado||'PENDIENTE'}
function docRecord(d){return state().docs[d.id]||null}
function completed(d){return ['VALIDADO_TECNICAMENTE','ACEPTADO'].includes(status(d))}
function issued(d){return ['EMITIDO','ACEPTADO','DISPONIBLE','ENTREGADO'].includes(status(d))}
function stepDocs(id){return DOCS.filter(d=>d.paso===id)}
function hasAll(id){return stepDocs(id).length>0 && stepDocs(id).every(d=>d.accion==='generated'?issued(d):completed(d))}
function latestPeriod(){
 const u=profile();if(!u)return 0;
 const e=String(u.stage||'').trim().toLowerCase();
 if(/^bimestre[123]$/.test(e))return Number(e.slice(-1));
 if(['registro','presentacion','aceptacion'].includes(e))return 0;
 if(['cierre','constancia'].includes(e))return 3;
 return Math.max(0,Math.min(3,Number(u.period)||0));
}
function currentStep(){
 if(!eligible())return 'no_elegible';
 const u=profile();
 const etapa=String(u?.stage||'').trim().toLowerCase();
 if(['registro','presentacion','aceptacion','bimestre1','bimestre2','bimestre3','cierre','constancia'].includes(etapa))return etapa;
 // Respaldo solo antes de obtener el primer perfil de WF-01.
 const per=latestPeriod();
 if(per>=1)return `bimestre${per}`;
 const act=Number(u?.activity)||1;
 if(act>=15)return 'constancia';
 if(act>=12)return 'cierre';
 if(act>=5)return 'aceptacion';
 if(act>=3)return 'presentacion';
 return 'registro';
}
function currentStepName(){if(!eligible())return 'No apto para iniciar';return PASOS.find(p=>p.id===currentStep())?.nombre||'Registro'}
function previousStep(id){return PASOS.findIndex(x=>x.id===id)}
function historical(id){
 const a=PASOS.findIndex(x=>x.id===currentStep());
 const b=PASOS.findIndex(x=>x.id===id);
 return a>=0&&b>=0&&b<a;
}
function stepInfo(id){
 const docs=stepDocs(id),total=docs.length;
 const ready=docs.filter(d=>d.accion==='generated'?issued(d):completed(d)).length;
 const a=PASOS.findIndex(x=>x.id===currentStep());
 const b=PASOS.findIndex(x=>x.id===id);
 const hist=b>=0&&a>=0&&b<a;
 const unlocked=Boolean(eligible()&&a>=0&&b>=0&&b<=a);
 const number=/^bimestre[123]$/.test(id)?Number(id.slice(-1)):0;
 return {id,docs,ready,total,done:total>0&&ready===total,unlocked,hist,number};
}
function nextStep(){
 if(!eligible())return 'Debes cumplir el requisito académico antes de iniciar el Servicio Social.';
 const etapa=currentStep();
 const info={
  registro:'Completa la solicitud, carta compromiso, carta de asignación y plan de trabajo.',
  presentacion:'Consulta la carta de presentación emitida por Vinculación. Descárgala cuando esté disponible y entrégala a tu instancia receptora.',
  aceptacion:'Solicita la carta de aceptación a la instancia receptora y súbela al portal.',
  cierre:'Completa el reporte final, la evaluación de actividades y la carta de terminación. El cierre requiere verificar horas y duración.',
  constancia:'Consulta si Vinculación ya emitió y autorizó tu constancia de terminación.'
 };
 if(info[etapa])return info[etapa];
 if(/^bimestre[123]$/.test(etapa)){
  const numero=Number(etapa.slice(-1)),s=stepInfo(etapa);
  return s.done?`Los tres documentos del bimestre ${numero} pasaron la comprobación documental. Consulta el siguiente trámite habilitado.`:
   `Estás en el bimestre ${numero}. Tienes ${s.ready} de ${s.total} documentos comprobados. Consulta los pendientes y sus observaciones.`;
 }
 return 'Consulta tu expediente.';
}
function badge(value){const names={ACEPTADO:['Aceptado','green'],VALIDADO_TECNICAMENTE:['Validado técnicamente','green'],OBSERVADO:['Con observaciones','red'],DOCUMENTO_INCORRECTO:['Documento incorrecto','red'],REVISION_REQUERIDA:['Revisión requerida','yellow'],EN_REVISION:['En revisión','yellow'],EMITIDO:['Emitido','blue'],DISPONIBLE:['Disponible','blue'],ENTREGADO:['Entregado','blue'],DESCARTADO:['Descartado','gray'],PENDIENTE:['Pendiente','gray']};const [name,cls]=names[norm(value)]||names.PENDIENTE;return `<span class="pill ${cls}">${name}</span>`}
function render(){if(!userId){renderLogin();return;}if(!profileReady){renderProfileLoading();return;}const views={inicio:home,documentos:documents,avance:progress,avisos:alerts,asistente:assistant,subir:upload};root.innerHTML=`<div class="app"><header class="head"><div class="head-inner"><div class="brand"><div class="emblem" aria-hidden="true">SS</div><div><b>Servicio Social</b><small>TecNM Campus Matehuala</small></div></div><div class="head-right"><span>${safe(profile().name.split(' ')[0])}</span><button id="logout">Salir ↗</button></div></div></header><nav class="tabs"><div class="tabs-inner">${nav().map(tab).join('')}</div></nav><main class="container">${notice?`<div class="notice">${safe(notice)}</div>`:''}${(views[screen]||home)()}</main><button class="fab" data-page="asistente" aria-label="Abrir asistente">✦</button><nav class="bottom-nav">${nav().map(x=>tab(x,true)).join('')}</nav></div>`;
 const lg=root.querySelector('#logout');if(lg)lg.onclick=()=>{userId=null;profileReady=false;profileLoadError='';sessionStorage.removeItem(SESSION);render()};
 root.querySelectorAll('[data-page]').forEach(el=>el.onclick=()=>go(el.dataset.page));
 root.querySelectorAll('[data-download]').forEach(el=>el.onclick=()=>downloadFormat(el.dataset.download));
 root.querySelectorAll('[data-generated]').forEach(el=>el.onclick=()=>downloadIssued(el.dataset.generated));
 root.querySelectorAll('[data-upload]').forEach(el=>el.onclick=()=>go('subir',el.dataset.upload));
 root.querySelectorAll('[data-step]').forEach(el=>el.onclick=()=>{bimestreAbierto=el.dataset.step;go('avance')});
 root.querySelectorAll('[data-continue]').forEach(el=>el.onclick=()=>advance(el.dataset.continue));
 root.querySelectorAll('[data-ask]').forEach(el=>el.onclick=()=>{const q=el.dataset.ask;go('asistente');ask(q)});
 root.querySelectorAll('[data-telegram]').forEach(el=>el.onclick=()=>{void vincularTelegram(el)});
 let refresh=root.querySelector('#refreshDocuments');if(refresh)refresh.onclick=()=>refreshStatus(true);
 let cf=root.querySelector('#chatForm');if(cf)cf.onsubmit=e=>{e.preventDefault();ask(root.querySelector('#question').value)};
 let form=root.querySelector('#uploadform');if(form)wireUpload(form);
}
const ICONS={inicio:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',documentos:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',avance:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',avisos:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>'};
function nav(){return [['inicio','Inicio'],['documentos','Documentos'],['avance','Mi ruta'],['avisos','Avisos']]}
function navIcon(id){return `<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[id]||''}</svg>`}
function tab(x,mobile=false){return `<button class="nav-tab ${mobile?'nav-mobile':''} ${screen===x[0]?'active':''}" data-page="${x[0]}" aria-label="${x[1]}" aria-current="${screen===x[0]?'page':'false'}">${navIcon(x[0])}<span>${x[1]}</span></button>`}
function go(p,id){screen=p;chosen=id||null;notice='';render();window.scrollTo(0,0);if(p==='documentos'||p==='inicio'||p==='avance')silentRefresh()}
function renderProfileLoading(){
 const error=profileLoadError;
 root.innerHTML=`<div class="auth"><div class="auth-card" role="status" aria-live="polite">
   <div class="brand"><div class="emblem">SS</div><div><b>Servicio Social</b><small>TecNM Campus Matehuala</small></div></div>
   <h1>${error?'No pudimos consultar tu expediente':'Consultando tu expediente'}</h1>
   <p>${error?'No mostraremos una etapa sin confirmar los datos de tu expediente.':'Obteniendo tu etapa, documentos y horas desde el expediente actualizado.'}</p>
   ${error?`<div class="warning" style="margin:14px 0">${safe(error)}</div>`:`<div class="progress" style="margin:18px 0"><span style="width:38%;animation:loadBar 1.4s ease-in-out infinite alternate"></span></div>`}
   <div class="buttons section"><button type="button" class="btn primary" id="retryProfile" ${syncing?'disabled':''}>${syncing?'Consultando…':error?'Reintentar consulta':'Consultar expediente'}</button><button type="button" class="btn" id="exitProfile">Salir</button></div>
  </div></div>`;
 const retry=root.querySelector('#retryProfile');if(retry)retry.onclick=()=>refreshStatus(true);
 const exit=root.querySelector('#exitProfile');if(exit)exit.onclick=()=>{userId=null;profileReady=false;profileLoadError='';sessionStorage.removeItem(SESSION);render()};
}
function renderLogin(){root.innerHTML=`<div class="auth"><div class="auth-card"><div class="brand"><div class="emblem">SS</div><div><b>Servicio Social</b><small>TecNM Campus Matehuala</small></div></div><h1>Iniciar sesión</h1><p>Consulta y completa tus trámites</p><form id="login"><div class="field"><label for="ctl">Número de control</label><input id="ctl" inputmode="numeric" maxlength="8" autocomplete="username" required></div><div class="field"><label for="nip">NIP de cuatro dígitos</label><input id="nip" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" required></div><button class="btn primary full" type="submit">Iniciar sesión →</button><div id="loginError" aria-live="polite"></div></form></div></div>`;root.querySelector('#login').onsubmit=async e=>{e.preventDefault();const c=root.querySelector('#ctl').value.trim(),n=root.querySelector('#nip').value.trim();if(!USERS[c]||USERS[c].nip!==n){root.querySelector('#loginError').innerHTML='<p class="error">Número de control o NIP incorrecto.</p>';return;}try{const r=await fetch('/api/demo-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({control:c,nip:n})});const p=await r.json();if(!r.ok||!p.ok)throw new Error(p.error||'No se pudo iniciar sesión');}catch(err){root.querySelector('#loginError').innerHTML='<p class="error">'+safe(err.message)+'</p>';return;}userId=c;profileReady=false;profileLoadError='';sessionStorage.setItem(SESSION,c);screen='inicio';messages=[];render();refreshStatus(false)}}
function home(){
 if(!eligible()){
  const u=profile();
  const aprobados=Number(u.approved)||0,totales=Number(u.total)||0;
  const porcentaje=totales>0?Math.round(aprobados/totales*10000)/100:0;
  const faltantes=Math.max(0,Math.ceil(totales*.70)-aprobados);
  const primero=String(u.name||'Estudiante').split(' ')[0];
  return `<section class="hero"><p class="eyebrow">Situación académica</p><h1>¡Hola, ${safe(primero)}!</h1><p>Consulta los requisitos para comenzar tu Servicio Social.</p></section>
  <article class="card"><div class="row"><h2>Estado de elegibilidad</h2><span class="pill red">No apto</span></div>
  <div class="warning"><strong>No apto para iniciar el Servicio Social</strong><p>No cumples todavía el mínimo del 70% de créditos aprobados.</p></div>
  <div class="section"><div class="progress-label"><strong>${porcentaje}% de créditos aprobados</strong><span>Mínimo: 70%</span></div><div class="progress"><span style="width:${Math.min(100,Math.max(0,porcentaje))}%"></span></div><p class="muted small">${aprobados} de ${totales} créditos aprobados.${totales>0?` Te faltan al menos ${faltantes} créditos para alcanzar el requisito.`:' Consulta con tu institución los créditos registrados.'}</p></div>
  <p class="muted section">La entrega de documentos seguirá deshabilitada hasta que se verifique tu elegibilidad.</p><div class="buttons section"><button class="btn primary" data-page="asistente">✦ Consultar al asistente</button></div></article>`;
 }
 const period=latestPeriod(),s=stepInfo(currentStep()),name=profile().name.split(' ')[0],hours=profile().hours;return `<section class="hero"><p class="eyebrow">Mi Servicio Social</p><h1>¡Hola, ${safe(name)}!</h1><p>Tu asistente te acompaña con los formatos, las entregas y el siguiente paso de cada trámite.</p><div class="buttons section"><button class="btn primary" data-page="documentos">Ver mis documentos</button><button class="btn" data-page="asistente">✦ Preguntar al asistente</button></div></section><div class="two"><article class="card"><h2>Tu entrega actual</h2><div class="status-hero">${safe(currentStepName())}</div><p class="muted small">${s.ready} de ${s.total} documentos validados documentalmente</p><div class="progress"><span style="width:${s.total?s.ready/s.total*100:0}%"></span></div></article><article class="card"><h2>Horas acreditadas</h2><div class="progress-label"><strong>${hours} / 500 horas</strong><span>${Math.round(hours/500*100)}%</span></div><div class="progress"><span style="width:${Math.min(100,hours/500*100)}%"></span></div><p class="muted small">El total acreditado se obtiene del expediente, no de un registro manual.</p></article></div><div class="two section"><article class="card"><h2>¿Qué sigue?</h2><p>${safe(nextStep())}</p><button class="btn primary" data-page="avance">Ver mi ruta →</button></article><article class="card"><h2>Asistente de IA</h2><p>Consulta qué entregar y revisa las observaciones del documento recibido.</p><button class="btn" data-ask="¿Qué documentos me faltan realmente según mi expediente?">Consultar pendientes</button></article></div>`}
function rowDocument(d){const rec=docRecord(d),st=rec?.estado||'PENDIENTE',p=stepInfo(d.paso),allowed=p.unlocked,completedOrWaiting=['VALIDADO_TECNICAMENTE','ACEPTADO','EN_REVISION','REVISION_REQUERIDA','EMITIDO','DISPONIBLE'].includes(st);let actions=[];
 if(d.accion==='generated'){
   if(issued(d))actions.push(`<button class="btn" data-generated="${d.id}">↓ Generar y descargar PDF</button>`);
   else actions.push(`<span class="muted small">Todavía no hay una emisión registrada en el expediente.</span>`);
 }else{
   if(d.archivo)actions.push(`<button class="btn" data-download="${d.id}">↓ Descargar formato</button>`);
   if(allowed && (!completedOrWaiting||st==='OBSERVADO'||st==='DOCUMENTO_INCORRECTO'||st==='DESCARTADO'))actions.push(`<button class="btn primary" data-upload="${d.id}">↑ Subir documento</button>`);
   else if(allowed&&completed(d))actions.push(`<span class="muted small">Documento registrado correctamente. No necesitas volver a subirlo.</span>`);
 }
 return `<div class="docentry ${allowed?'':'dimmed'}"><div class="row" style="gap:12px;align-items:start"><div><div class="docentry-title">▤ ${safe(d.nombre)}</div><div class="muted small">${safe(d.emisor)} · ${safe(d.codigo)}</div></div>${badge(st)}</div><p class="muted small">${safe(d.instruccion)}</p>${rec?.observaciones&&['OBSERVADO','REVISION_REQUERIDA'].includes(st)?`<div class="soft">${safe(rec.observaciones).slice(0,450)}</div>`:''}<div class="buttons">${actions.join('')}</div></div>`}
function documents(){
 if(!eligible())return `<div class="row page-intro"><div><p class="eyebrow">Situación académica</p><h1 class="heading">Mis documentos</h1></div></div><article class="card"><h2>Entrega no habilitada</h2><div class="warning">No apto para iniciar el Servicio Social: todavía no cumples el mínimo del 70% de créditos aprobados.</div><p class="section muted">Cuando se verifique que cumples el requisito, podrás comenzar el registro y entregar documentos.</p><button class="btn primary" data-page="asistente">Consultar al asistente</button></article>`;
 const id=currentStep(),paso=PASOS.find(p=>p.id===id),s=stepInfo(id);
 return `<div class="row page-intro"><div><p class="eyebrow">Entrega habilitada</p><h1 class="heading">${safe(paso.nombre)}</h1><p class="lead">${safe(paso.detalle)} Solo aparecen los archivos correspondientes a tu trámite actual.</p></div><button class="btn" id="refreshDocuments">↻ Actualizar estados</button></div><article class="card current-docs"><div class="row current-docs-head"><div><strong>${s.ready} de ${s.total} documentos revisados</strong><p class="muted small">${s.done?'Se completaron las comprobaciones documentales de este trámite.':'Cada archivo se comprueba por separado; las observaciones aparecerán en el asistente.'}</p></div>${s.done?badge('VALIDADO_TECNICAMENTE'):`<span class="pill blue">${s.ready}/${s.total}</span>`}</div><div class="progress"><span style="width:${s.total?Math.round(100*s.ready/s.total):0}%"></span></div><div class="doc-list">${s.docs.map(rowDocument).join('')}</div>${id==='presentacion'?'<div class="buttons section"><button class="btn primary" data-generated="presentacion">↓ Generar y descargar carta de presentación</button></div>':''}${id==='presentacion'&&(presentacionDescargada()||s.done)?'<div class="buttons section"><button class="btn" data-continue="presentacion">Siguiente → Carta de aceptación</button></div>':''}${s.docs.length?'':'<p class="muted">Todavía no hay archivos disponibles para esta actividad.</p>'}</article><p class="under-content"><button class="text-link" data-page="avance">Consultar mi ruta completa</button> · Las entregas anteriores permanecen registradas en tu expediente.</p>`;
}
function progress(){
 if(!eligible())return `<h1 class="heading">Mi ruta de trámites</h1><article class="card"><div class="row"><h2>Servicio Social no habilitado</h2><span class="pill red">No apto</span></div><p class="muted">Las etapas de Servicio Social se habilitarán cuando cumplas el requisito mínimo de créditos y se confirme tu elegibilidad.</p><button class="btn primary" data-page="asistente">Consultar al asistente</button></article>`;
 const current=currentStep(),pos=PASOS.findIndex(x=>x.id===current);
 return `<div class="row page-intro"><div><h1 class="heading">Mi ruta de trámites</h1><p class="lead">Consulta tu recorrido y lo que ya quedó registrado. Los archivos a entregar están únicamente en Documentos.</p></div></div><article class="card route-card"><div class="route-list">${PASOS.map((p,i)=>{const s=stepInfo(p.id),isCurrent=p.id===current,isPast=i<pos;let flag=isCurrent?'<span class="pill blue">Actual</span>':s.done?badge('VALIDADO_TECNICAMENTE'):isPast?'<span class="pill gray">Etapa anterior</span>':'<span class="pill gray">Próximamente</span>';let hint=isCurrent?`${s.ready} de ${s.total} documentos registrados satisfactoriamente`:s.done?'Archivos registrados y validados técnicamente':isPast?'Consulta el historial del expediente para confirmar archivos anteriores':'Se habilitará cuando corresponda';return `<div class="route-step ${isCurrent?'route-current':''} ${isPast?'route-past':''}"><div class="route-number">${s.done?'✓':i+1}</div><div class="route-content"><div class="row"><strong>${safe(p.nombre)}</strong>${flag}</div><p class="muted small">${safe(p.detalle)}</p><p class="route-hint">${safe(hint)}</p></div></div>`}).join('')}</div></article><article class="card section compact-summary"><div class="row"><div><h2>Trámite actual: ${safe(currentStepName())}</h2><p class="muted small">Revisa tus archivos y sus observaciones.</p></div><button class="btn primary" data-page="documentos">Ir a documentos</button></div></article>`;
}
function alerts(){return `<h1 class="heading">Avisos y recordatorios</h1><p class="lead">Consulta tu siguiente trámite y la opción de vincular notificaciones.</p><div class="two"><article class="card"><h2>Próxima acción</h2><div class="warning">${safe(nextStep())}</div><button class="btn" data-page="avance">Ver mi ruta</button></article><article class="card"><h2>Telegram</h2><p class="muted small">Vincula tu Telegram para recibir avisos de documentos, cambios de etapa y comunicados.</p><button class="btn" data-telegram="1">Vincular Telegram</button></article></div>`}
function assistant(){if(messages.length===0)messages.push({role:'assistant',text:`Hola, ${profile().name.split(' ')[0]}. Soy tu asistente para completar los trámites. ${nextStep()}`});return `<h1 class="heading">Asistente de Servicio Social</h1><p class="lead">Orientación según tus documentos y tu periodo registrado.</p><div class="two"><article class="card chat-card"><h2>✦ ¿En qué puedo ayudarte?</h2><div class="chat-chips">${['¿Qué documentos me faltan?','¿Cuál es mi siguiente paso?','¿Cómo se contabilizan mis horas?'].map(q=>`<button class="btn" data-ask="${safe(q)}">${safe(q)}</button>`).join('')}</div><div class="chat-list" id="chatList">${messages.map(m=>`<div class="bubble ${m.role}" style="white-space:pre-wrap">${safe(m.text)}</div>`).join('')}</div><form id="chatForm" class="chat-form"><input id="question" placeholder="Escribe tu pregunta..." autocomplete="off"><button class="btn primary" type="submit">➤</button></form></article><article class="card"><h2>Tu situación actual</h2><p>${safe(nextStep())}</p><p class="muted small">Las observaciones técnicas vienen de WF-02 y los estados de WF-01. Una firma visible no demuestra su autenticidad.</p><button class="btn" data-page="documentos">Ver mis documentos</button></article></div>`}
function upload(){if(!eligible())return `<h1 class="heading">Subir documento</h1><article class="card"><div class="warning">No apto para iniciar el Servicio Social. La subida de documentos no está habilitada.</div><button class="btn section" data-page="inicio">Volver al inicio</button></article>`;const choices=DOCS.filter(d=>d.paso===currentStep()&&(d.accion==='upload'||d.accion==='external')&&!['ACEPTADO','VALIDADO_TECNICAMENTE','EN_REVISION','REVISION_REQUERIDA'].includes(status(d)));const selected=choices.find(x=>x.id===chosen)||choices[0];return `<h1 class="heading">Subir documento</h1><p class="lead">Selecciona el documento correcto. La IA revisará el PDF y mostrará sus observaciones.</p><article class="card form-card"><form id="uploadform"><div class="field"><label for="docSel">Tipo de documento</label><select id="docSel" required>${choices.map(d=>`<option value="${d.id}" ${selected?.id===d.id?'selected':''}>${safe(d.nombre)}</option>`).join('')}</select></div><p class="soft">${safe(selected?.instruccion||'No hay documentos habilitados para entrega.')}</p><div class="drop section"><div class="file-icon">⇧</div><p>Selecciona un archivo PDF</p><input class="file-input" id="fileInput" type="file" accept=".pdf,application/pdf"><button class="btn" id="choose" type="button">Elegir archivo</button><div id="fileName" class="filename"></div><p class="muted small">PDF · Máximo 4 MB</p></div><div class="buttons section"><button class="btn" type="button" data-page="documentos">Cancelar</button><button class="btn primary" type="submit" ${choices.length?'':'disabled'}>Enviar a revisión</button></div><div id="upMessage" aria-live="polite"></div></form></article>`}
function wireUpload(f){
 const input=root.querySelector('#fileInput'),select=root.querySelector('#docSel');
 root.querySelector('#choose').onclick=()=>input.click();
 input.onchange=()=>root.querySelector('#fileName').textContent=input.files[0]?.name||'';
 select.onchange=()=>{chosen=select.value;render()};
 f.onsubmit=e=>{e.preventDefault();if(uploading)return;
  const t=root.querySelector('#upMessage'),file=input.files[0],type=select.value;
  if(!file){t.innerHTML='<p class="error">Selecciona un PDF.</p>';return;}
  if(file.size>4*1024*1024||(!file.name.toLowerCase().endsWith('.pdf')&&file.type!=='application/pdf')){t.innerHTML='<p class="error">Solo PDF de hasta 4 MB.</p>';return;}
  try{const uploadId=crypto.randomUUID();const name=DOCS.find(d=>d.id===type)?.nombre||'documento';
   const message={role:'assistant',text:`Enviando «${name}»… Estoy confirmando su recepción. En cuanto se registre, comprobaré sus observaciones.`,uploadId,phase:'sending'};
   messages.push(message);uploading=true;go('asistente');render();
   const form=new FormData();form.append('file',file);form.append('type',type);form.append('control',userId);form.append('upload_id',uploadId);
   void (async()=>{let confirmed=false;
     try{const r=await fetch('/api/upload',{method:'POST',body:form});const p=await r.json().catch(()=>({}));
       if(!r.ok||!p.ok)throw new Error(p.error||'No se confirmó la recepción.');
       confirmed=true;message.phase='processing';message.text=`Recibí «${name}». El archivo está registrado y la validación continuará en segundo plano. Puedes preguntarme cualquier cosa mientras verifico el resultado.`;
       state().docs[type]={...(state().docs[type]||{}),estado:'EN_REVISION',documento_id:uploadId};save();render();
     }catch(err){message.phase='checking';message.text=`No pude confirmar todavía la recepción de «${name}» (${err.message}). Consultaré el expediente por el identificador de esta entrega. No vuelvas a subirlo hasta comprobar el resultado.`;render();}
     finally{uploading=false;void poll(uploadId,{confirmed,type,name,message});}
   })();
  }catch(err){t.innerHTML=`<p class="error">${safe(err.message)}</p>`;uploading=false;}
 };
}
async function vincularTelegram(button){
 if(!userId||!profileReady){notice='Primero consulta tu expediente.';render();return;}
 if(button){button.disabled=true;button.textContent='Generando enlace…';}
 try{
  
  // Navegar directamente a Telegram al recibir el enlace.
  const r=await fetch('/api/telegram-link',{
   method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({control:userId})
  });
  const p=await r.json().catch(()=>({}));
  if(!r.ok||p.ok!==true||!/^https:\/\/t\.me\/[A-Za-z0-9_]+\?start=[A-Za-z0-9_-]+$/.test(String(p.url||'')))
   throw new Error(p.error||'No se pudo preparar el enlace de Telegram.');
  window.location.assign(p.url);
 }catch(err){
  notice='Telegram: '+(err.message||'No se pudo conectar.');
  render();
 }finally{if(button&&button.isConnected){button.disabled=false;button.textContent='Vincular Telegram';}}
}

async function assistantRequest(q,mode='chat'){const r=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({control:userId,question:q,mode})});const p=await r.json().catch(()=>({}));if(!r.ok){throw new Error(p.error||`Error ${r.status}`)}if(p.perfil)sync(p.perfil);return p}
function sync(perfil){if(String(perfil.control||'')!==userId)return;let u=profile();
 const etapa=String(perfil.etapa_portal||'').trim().toLowerCase();
 const etapas=['no_elegible','registro','presentacion','aceptacion','bimestre1','bimestre2','bimestre3','cierre','constancia'];
 if(!etapas.includes(etapa))return;
 u.stage=etapa;
for(const [from,to] of [['creditos_aprobados','approved'],['creditos_totales','total'],['actividad_actual','activity'],['periodo_habilitado','period'],['horas_acreditadas','hours']]){if(perfil[from]!==null&&perfil[from]!==undefined&&perfil[from]!==''&&Number.isFinite(Number(perfil[from])))u[to]=Number(perfil[from])}
 const mine=state();let updates=new Map();const history=Array.isArray(perfil.entregas_recientes)?perfil.entregas_recientes:[];for(let i=0;i<history.length;i++){let d=history[i];if(!d||!DOCS.some(x=>x.id===d.tipo_id))continue;if(d.expediente_id&&perfil.expediente_id&&String(d.expediente_id)!==String(perfil.expediente_id))continue;let id=d.tipo_id,ver=Number(d.version||0),row=Number(d.row_number||i);let old=updates.get(id);if(!old||ver>old.version||(ver===old.version&&row>old.row))updates.set(id,{...d,version:ver,row});}
 for(const [id,d] of updates)mine.docs[id]={...mine.docs[id],estado:norm(d.estado),documento_id:d.documento_id||'',version:d.version||0,observaciones:d.observaciones||'',archivo_drive_id:d.archivo_drive_id||''};
 if(perfil.estados_documentos&&typeof perfil.estados_documentos==='object')for(const [id,v] of Object.entries(perfil.estados_documentos)){if(!DOCS.some(d=>d.id===id)||updates.has(id))continue;const s=typeof v==='object'?v.estado:v;mine.docs[id]={...mine.docs[id],estado:norm(s)}}
 mine.updated=new Date().toISOString();save();profileReady=true;profileLoadError='';}
async function refreshStatus(manual){
 if(!userId||syncing)return;
 const targetUser=userId;
 syncing=true;
 if(!profileReady){profileLoadError='';render();}
 try{
   const response=await assistantRequest('Consulta de estado','status');
   if(userId!==targetUser)return;
   if(!response.perfil||!profileReady){
     throw new Error('WF-01 no devolvió una etapa_portal válida para este expediente.');
   }
   lastSync=Date.now();
   if(manual)notice='Estados consultados en Google Sheets.';
 }catch(err){
   if(userId!==targetUser)return;
   if(!profileReady)profileLoadError=err.message;
   else if(manual)notice='No se pudieron consultar los estados: '+err.message;
 }finally{
   syncing=false;
   if(userId===targetUser)render();
 }
}
function silentRefresh(){
 if(!userId||syncing||Date.now()-lastSync<20000)return;
 // No pedir una clave mediante un diálogo inesperado en cada apertura.

 refreshStatus(false);
}
function estadoDeterminista(){
 if(!eligible())return `Según los créditos registrados, no cumples todavía el mínimo del 70% para iniciar Servicio Social. Actualmente tienes ${profile().approved} de ${profile().total} créditos aprobados. No necesitas subir documentos por ahora.`;
 const p=latestPeriod(),id=currentStep(),s=stepInfo(id);
 const completados=s.docs.filter(completed).map(d=>d.nombre),faltantes=s.docs.filter(d=>!completed(d)).map(d=>`${d.nombre} (${status(d).toLowerCase().replaceAll('_',' ')})`);
 return `Según tu expediente actual estás en «${currentStepName()}» y tienes ${profile().hours} horas acreditadas.\n\n`+
 (completados.length?'Ya registrados y validados documentalmente:\n'+completados.map(n=>'• '+n).join('\n')+'\n\n':'')+
 (faltantes.length?'Por completar o corregir:\n'+faltantes.map(n=>'• '+n).join('\n')+'\n\n':'No faltan documentos del paquete actual.\n\n')+
 'Siguiente paso: '+nextStep()+ '\n\nLa validación técnica no equivale a aprobación institucional.';
}
function esConsultaEstado(q){const t=q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return /que.*(falta|hacer|sigue)|siguiente paso|documentos.*(falta|pendiente)|estado.*documentos|mis documentos/.test(t)}
async function ask(q){q=String(q||'').trim();if(!q||sending)return;messages.push({role:'user',text:q},{role:'assistant',text:'Consultando tu expediente...'});sending=true;render();try{if(esConsultaEstado(q)){const p=await assistantRequest('Consulta de estado','status');if(!p.perfil)throw new Error('No recibí el expediente actualizado de WF-01.');messages[messages.length-1]={role:'assistant',text:estadoDeterminista()};}else{const p=await assistantRequest(q,'chat');messages[messages.length-1]={role:'assistant',text:String(p.reply||'Sin respuesta del asistente.')};}}catch(err){messages[messages.length-1]={role:'assistant',text:err.message};}finally{sending=false;render();const list=root.querySelector('#chatList');if(list)list.scrollTop=list.scrollHeight}}
async function poll(uploadId,{confirmed=false,type='',name='documento',message=null}={}){
 if(pendingUploads.has(uploadId))return;
 pendingUploads.add(uploadId);
 let found=false,failures=0;
 for(let i=0;i<12;i++){
   await new Promise(r=>setTimeout(r,i<4?6000:9000));
   if(!userId)break;
   try{
     const p=await assistantRequest('Consulta de estado','status');
     const list=Array.isArray(p.perfil?.entregas_recientes)?p.perfil.entregas_recientes:[];
     const d=list.find(x=>String(x.documento_id)===uploadId);
     if(!d)continue;
     found=true;
     const estado=norm(d.estado);
     if(estado==='EN_REVISION'||estado==='PENDIENTE'||estado==='REVISION_REQUERIDA'){
       if(message)message.text=estado==='REVISION_REQUERIDA'&&d.observaciones?`El análisis necesita una comprobación adicional:

${d.observaciones}`:`El documento «${name}» fue recibido y permanece en revisión. Consultaré otra vez para ver si terminó.`;
       if(i===0||i===5)render();
       continue;
     }
     if(message){message.text=d.observaciones||`El documento «${name}» terminó con estado: ${estado}.`;message.phase='done';delete message.uploadId;}
     render();break;
   }catch(err){failures++;if(failures===3&&message){message.text=`No puedo consultar el estado en este momento. La entrega ${uploadId} puede revisarse más tarde desde tu expediente. Evita repetir la subida sin confirmar primero.`;render();}}
 }
 if(!found&&message){message.text=confirmed?`La entrega «${name}» fue recibida, pero todavía no aparece en la consulta del expediente. Pulsa «Actualizar estados» más tarde o pregunta por ella.`:`No fue posible verificar que «${name}» haya sido recibido. Revisa la ejecución de WF-02 y DOCUMENTOS antes de enviarlo otra vez. Identificador: ${uploadId}`;render();}
 pendingUploads.delete(uploadId);
}
async function downloadFormat(id){const d=DOCS.find(x=>x.id===id);if(!d||!d.archivo)return;let ok=false;for(const filename of [d.archivo,...(d.alternativas||[])]){try{const r=await fetch('formatos/'+encodeURIComponent(filename),{cache:'no-store'});if(!r.ok)continue;const blob=await r.blob();if(!blob.size)continue;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);ok=true;break;}catch{}}if(!ok){notice='No encontré el formato en la carpeta formatos. Verifica el nombre del archivo.';render()}}
async function downloadIssued(id){
  if(!['presentacion','constancia'].includes(id))return;
  if(id==='presentacion'&&currentStep()!=='presentacion'){
    notice='La carta de presentación solo se genera en su etapa.';render();return;
  }
  if(id==='constancia'&&currentStep()!=='constancia'){
    notice='La constancia todavía no está habilitada.';render();return;
  }
  notice='Generando PDF. No pulses nuevamente mientras se prepara…';render();
  try{
    const r=await fetch('/api/documento-emitido',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tipo:id,control:userId})});
    if(!r.ok){const p=await r.json().catch(()=>({}));throw new Error(p.error||'WF-06 no devolvió el documento.');}
    const blob=await r.blob();if(!blob.size||!blob.type.includes('pdf'))throw new Error('El servidor no devolvió un PDF válido.');
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=id+'_'+userId+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);
    if(id==='presentacion'){try{sessionStorage.setItem(PRESENTACION_DESCARGADA,userId);}catch{}}
    notice='PDF generado y guardado en Drive. Revisa tus descargas.';
  }catch(err){notice=err.message;}
  render();
}
async function advance(id){const s=stepInfo(id);if(id==='presentacion'&&currentStep()!=='presentacion'){notice='Esta acción solo está disponible en Carta de presentación.';render();return;}if(!s.done&&!(id==='presentacion'&&presentacionDescargada())){notice='Todavía faltan documentos por validar en este trámite.';render();return;}const messages={presentacion:'Confirma únicamente que entregaste la carta a la instancia receptora.',bimestre1:'Solicitar apertura del segundo bimestre. No sustituye la confirmación de fechas.',bimestre2:'Solicitar apertura del tercer bimestre. No sustituye la confirmación de fechas.',bimestre3:'Solicitar habilitación del cierre. Se deben comprobar las horas y la duración.'};if(!confirm(messages[id]||'¿Continuar?'))return;try{const r=await fetch('/api/avance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({control:userId,accion:id})});const p=await r.json().catch(()=>({}));if(!r.ok||!p.ok)throw new Error(p.error||'No se confirmó el avance.');notice=p.mensaje||'Solicitud registrada. Se actualizará cuando se confirmen las condiciones.';await refreshStatus(false);}catch(err){notice='No fue posible avanzar: '+err.message+'. Para activar este botón conecta la automatización de avance.';}render()}
try{const c=sessionStorage.getItem(SESSION);if(USERS[c])userId=c}catch{}
render();if(userId)silentRefresh();
})();
