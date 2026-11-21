(() => {
  'use strict';
  const ROOT = document.getElementById('app');
  const KEY = 'tecnm_portal_estudiante_ui_v2';
  const SESSION_KEY = 'tecnm_estudiante_sesion_v1';
  const USERS = {
    '24660001': {name:'Ana Sofía Ramírez', nip:'1234', approved:190, total:250, phase:2},
    '24660002': {name:'Luis Herrera', nip:'2345', approved:150, total:250, phase:-1},
    '24660003': {name:'Mariana Torres', nip:'3456', approved:175, total:250, phase:0}
  };
  const PHASES = ['Registro', 'Aceptación', 'Seguimiento', 'Terminación'];
  const DOCUMENTS = [
    {id:'solicitud',title:'Solicitud de Servicio Social',phase:0,detail:'Formato de solicitud inicial'},
    {id:'plan',title:'Plan de trabajo',phase:0,detail:'Actividades y periodos'},
    {id:'presentacion',title:'Carta de presentación',phase:0,detail:'Documento institucional de presentación'},
    {id:'aceptacion',title:'Carta de aceptación',phase:1,detail:'Aceptación de instancia receptora'},
    {id:'reporte1',title:'Reporte bimestral 1',phase:2,detail:'Primer periodo de seguimiento'},
    {id:'reporte2',title:'Reporte bimestral 2',phase:2,detail:'Segundo periodo de seguimiento',locked:true},
    {id:'reporte3',title:'Reporte bimestral 3',phase:2,detail:'Tercer periodo de seguimiento',locked:true},
    {id:'evaluacion',title:'Evaluación final',phase:3,detail:'Etapa de terminación'}
  ];
  const FIXED = {
    solicitud:{state:'ACEPTADO',name:'Solicitud de Servicio Social',version:1,date:'2026-09-02'},
    plan:{state:'ACEPTADO',name:'Plan de trabajo',version:1,date:'2026-09-05'},
    presentacion:{state:'ACEPTADO',name:'Carta de presentación',version:1,date:'2026-09-06'},
    aceptacion:{state:'ACEPTADO',name:'Carta de aceptación',version:1,date:'2026-09-08'},
    reporte1:{state:'OBSERVADO',name:'Reporte bimestral 1',version:1,date:'2026-10-10',note:'Revisa el total de horas y los requisitos del formato.'}
  };
  const SEED_REPORTS = [{id:'reporte1',hours:180,state:'OBSERVADO'}];
  let db=restore(),control=restoreSession(),view='inicio',selected=null,chat=[{role:'assistant',text:'Hola. Puedo orientarte sobre documentos, etapas y horas del Servicio Social. ¿Qué necesitas consultar?'}],flash='';
  function restore(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}}
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch{}}
  function restoreSession(){try{const id=sessionStorage.getItem(SESSION_KEY);return id&&Object.prototype.hasOwnProperty.call(USERS,id)?id:null}catch{return null}}
  function saveSession(id){try{if(id)sessionStorage.setItem(SESSION_KEY,id);else sessionStorage.removeItem(SESSION_KEY)}catch{}}
  function html(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function user(){return USERS[control]}
  function eligible(){return !!user() && user().approved*10>=user().total*7}
  function record(){if(!db[control])db[control]={docs:control==='24660001'?JSON.parse(JSON.stringify(FIXED)):{},reports:control==='24660001'?JSON.parse(JSON.stringify(SEED_REPORTS)):[]};return db[control]}
  function docStatus(id){return record().docs[id]?.state||'PENDIENTE'}
  function canUpload(d){return eligible() && d.phase===user().phase && !d.locked && docStatus(d.id)!=='ACEPTADO'}
  function hours(){return record().reports.filter(r=>r.state==='ACEPTADO').reduce((sum,r)=>sum+Number(r.hours||0),0)}
  function badge(state){const config={ACEPTADO:['Aceptado','green'],PENDIENTE:['Pendiente','gray'],OBSERVADO:['Con observaciones','red'],EN_REVISION:['En revisión','yellow'],BLOQUEADO:['No disponible','gray']};const [text,css]=config[state]||config.PENDIENTE;return `<span class="pill ${css}">${text}</span>`}
  function brand(){return `<div class="brand"><div class="emblem" aria-hidden="true">T</div><div><b>TecNM · Servicio Social</b><small>Campus Matehuala</small></div></div>`}
  function renderLogin(){
    ROOT.innerHTML=`<div class="auth"><div class="auth-card">${brand()}<h1>Iniciar sesión</h1><p>Accede a tu expediente de Servicio Social</p><form id="login" novalidate><div class="field"><label for="login-control">Número de control</label><input id="login-control" type="text" inputmode="numeric" autocomplete="username" maxlength="8" pattern="[0-9]{8}" placeholder="Número de control" required></div><div class="field"><label for="login-password">NIP de 4 dígitos</label><input id="login-password" type="password" inputmode="numeric" autocomplete="current-password" maxlength="4" pattern="[0-9]{4}" placeholder="Ingresa tu NIP" required></div><button class="btn primary full" type="submit">Iniciar sesión →</button><div id="auth-error" role="alert" aria-live="polite"></div></form><div class="soft">Acceso para estudiantes del Servicio Social.</div></div></div>`;
    const form=document.getElementById('login');
    const idInput=document.getElementById('login-control');
    const nipInput=document.getElementById('login-password');
    const error=document.getElementById('auth-error');
    const showError=message=>{error.className='error';error.textContent=message;};
    idInput.addEventListener('input',()=>{idInput.value=idInput.value.replace(/\D/g,'').slice(0,8);error.textContent='';error.className='';});
    nipInput.addEventListener('input',()=>{nipInput.value=nipInput.value.replace(/\D/g,'').slice(0,4);error.textContent='';error.className='';});
    form.addEventListener('submit',e=>{
      e.preventDefault();
      const id=idInput.value.trim(), nip=nipInput.value.trim();
      if(!/^\d{8}$/.test(id)){showError('El número de control debe contener 8 dígitos.');idInput.focus();return;}
      if(!/^\d{4}$/.test(nip)){showError('El NIP debe contener exactamente 4 dígitos.');nipInput.focus();return;}
      if(!USERS[id]||USERS[id].nip!==nip){showError('Número de control o NIP incorrecto.');nipInput.focus();return;}
      control=id;
      saveSession(id);
      view='inicio';flash='';
      window.__selectedDoc=null;
      render();
    });
  }
  const NAV=[['inicio','⌂','Inicio'],['documentos','▤','Documentos'],['horas','◷','Horas'],['avisos','♧','Avisos']];
  function navItem([key,ico,label],mobile=false){return `<button type="button" class="${mobile?'':'tab '}${view===key?'active':''}" data-view="${key}">${mobile?`<span>${ico}</span>${label}`:`<span style="font-size:19px">${ico}</span>${label}`}</button>`}
  function render(){if(!control){renderLogin();return}const name=user().name.split(' ')[0];const pages={inicio:home,documentos:documents,subir:upload,horas:hoursPage,avisos:notices,asistente:assistant};const content=(pages[view]||home)();ROOT.innerHTML=`<div class="app"><header class="head"><div class="head-inner">${brand()}<div class="head-right"><span>${html(name)}</span><button id="logout">Cerrar sesión ↗</button></div></div></header><nav class="tabs"><div class="tabs-inner">${NAV.map(v=>navItem(v)).join('')}</div></nav><main class="container">${flash?`<div class="${flash.type==='error'?'error':'success'}" role="status">${html(flash.text)}</div>`:''}${content}</main><button class="fab" data-view="asistente" aria-label="Abrir asistente" title="Asistente">✦</button><nav class="bottom-nav">${NAV.map(v=>navItem(v,true)).join('')}</nav></div>`;
    document.getElementById('logout').onclick=()=>{control=null;saveSession(null);flash='';render()};document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>go(b.dataset.view));document.querySelectorAll('[data-upload]').forEach(b=>b.onclick=()=>{const id=b.dataset.upload;if(id)go('subir',id)});document.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>sendChat(b.dataset.question));connectUpload();connectChat();
  }
  function go(next,doc){view=next;selected=null;flash='';if(doc)window.__selectedDoc=doc;render();window.scrollTo({top:0,behavior:'instant'})}
  function home(){const u=user(),h=hours(),pct=Math.min(100,Math.round(h/500*100));const first=DOCUMENTS.find(d=>canUpload(d));return `<div class="hero"><h1>¡Bienvenida${u.name.startsWith('Luis')?'o':''}, ${html(u.name.split(' ')[0])}!</h1><p>Da seguimiento a tu Servicio Social y encuentra lo que necesitas en un solo lugar.</p></div><div class="two"><article class="card"><h2>♧ Estado de elegibilidad</h2><div class="status-hero ${eligible()?'':'off'}">${eligible()?'✓ Elegible':'◷ Créditos insuficientes'}</div><p class="muted small">${eligible()?'Cumples el requisito académico para continuar con el procedimiento.':'Aún no alcanzas el porcentaje requerido para iniciar el Servicio Social.'}</p></article><article class="card"><h2>◷ Progreso de horas</h2><div class="progress-label"><strong>${h} / 500 horas</strong><span>${pct}%</span></div><div class="progress"><span style="width:${pct}%"></span></div><p class="muted small">Se contabilizan únicamente las horas de reportes aceptados.</p></article></div><div class="two section"><article class="card"><h2>▤ Etapa del procedimiento</h2><div class="steps">${PHASES.map((x,i)=>`<div class="step ${i<u.phase?'past':i===u.phase?'current':''}">${html(x)}</div>`).join('')}</div><p class="muted small">${eligible()?`Etapa actual: ${html(PHASES[u.phase])}.`:'El procedimiento se habilitará cuando cumplas la elegibilidad.'}</p></article><article class="card"><h2>↗ Acciones rápidas</h2><div class="buttons"><button class="btn primary" data-view="${first?'subir':'documentos'}" ${!eligible()?'disabled':''}>↑ ${first?'Subir documento':'Ver documentos'}</button><button class="btn" data-view="documentos">▤ Mi expediente</button></div></article></div><div class="card section"><h2>♧ Avisos importantes</h2>${eligible()?`<div class="warning">${first?`Tienes pendiente: <strong>${html(first.title)}</strong>. Consulta el formato y realiza tu entrega.`:'Consulta tus documentos para revisar el estado de tu expediente.'}</div>`:'<div class="warning">Aún no puedes iniciar el Servicio Social. Consulta el porcentaje de créditos registrados.</div>'}</div>`}
  function documents(){return `<div class="row"><div><h1 class="heading">Mi expediente</h1><p class="lead">Consulta documentos, formatos y estados según la etapa de tu Servicio Social.</p></div><button class="btn primary" data-view="subir" ${!eligible()?'disabled':''}>↑ Subir PDF</button></div><article class="card"><h2>Documentos del procedimiento</h2><div class="list">${DOCUMENTS.map(d=>{const state=docStatus(d.id),fmt=window.SS_FORMATOS?.[d.id],allowed=canUpload(d),available=d.phase<=user().phase&&eligible();return `<div class="doc"><div class="doc-name"><span class="docicon">▤</span><div><strong>${html(d.title)}</strong><div class="muted small" style="font-weight:450;margin-top:5px">${html(d.detail)}</div></div></div><div class="doc-date muted small">${state==='PENDIENTE'?'Sin entrega':html(record().docs[d.id]?.date||'')}</div><div class="doc-status">${badge(available?state:'BLOQUEADO')}</div><div class="doc-actions buttons"><button class="btn" data-format="${d.id}" ${!fmt?'disabled':''}>↓ Formato</button><button class="btn ${allowed?'primary':''}" data-upload="${d.id}" ${!allowed?'disabled':''}>${state==='OBSERVADO'?'Corregir':'Subir'}</button></div></div>`}).join('')}</div></article><p class="footer-note">Los requisitos y fechas se organizan de acuerdo con la etapa registrada para cada expediente.</p>`}
  function upload(){const options=DOCUMENTS.filter(canUpload),chosen=options.find(d=>d.id===window.__selectedDoc)||options[0];return `<h1 class="heading">Subir documento</h1><p class="lead">Selecciona el documento correspondiente a tu etapa y adjunta el archivo PDF.</p><article class="card form-card">${!eligible()?'<div class="warning">La entrega de documentos se habilitará cuando cumplas los requisitos académicos.</div>':options.length===0?'<div class="soft">Por el momento no tienes documentos habilitados para una nueva entrega.</div>':`<form id="upload-form"><div class="field"><label for="type">Tipo de documento</label><select id="type" required>${options.map(d=>`<option value="${d.id}" ${d.id===chosen.id?'selected':''}>${html(d.title)}</option>`).join('')}</select></div><div class="drop" id="drop"><div class="file-icon">☁</div><h2 style="margin:6px 0 8px;font-size:16px">Selecciona tu archivo PDF</h2><p class="help">Puedes arrastrarlo aquí o elegirlo desde tu dispositivo.</p><button class="btn" type="button" id="pick">▤ Seleccionar archivo</button><input class="file-input" type="file" id="file" accept=".pdf,application/pdf" aria-label="Seleccionar archivo PDF"><div class="filename" id="filename">Ningún archivo seleccionado</div></div><p class="help">Formato admitido: PDF · Tamaño máximo: 5 MiB.</p><div class="buttons"><button class="btn primary" type="submit">↑ Enviar documento</button><button class="btn" type="button" data-view="documentos">Cancelar</button></div><div id="upload-result" role="status"></div></form>`}</article>`}
  function hoursPage(){const h=hours(),pct=Math.min(100,Math.round(h/500*100));return `<h1 class="heading">Horas y avance</h1><p class="lead">Consulta el progreso registrado a partir de reportes bimestrales aceptados.</p><div class="two"><article class="card"><h2>◷ Horas acumuladas</h2><div class="progress-label"><strong style="font-size:22px">${h} / 500 horas</strong><span>${pct}%</span></div><div class="progress"><span style="width:${pct}%"></span></div><p class="muted small">Las horas observadas o pendientes no se contabilizan.</p></article><article class="card"><h2>▤ Etapa actual</h2><div class="status-hero ${eligible()?'':'off'}">${eligible()?html(PHASES[user().phase]):'No elegible'}</div><p class="muted small">Los requisitos de documentación y duración se comprueban por separado.</p></article></div><article class="card section"><h2>Reportes bimestrales</h2>${['reporte1','reporte2','reporte3'].map((id,i)=>{const r=record().reports.find(x=>x.id===id);return `<div class="tile"><div><strong>Reporte bimestral ${i+1}</strong><small>${r?`${r.hours} horas declaradas`: 'Sin horas registradas'}</small></div>${badge(r?.state||'PENDIENTE')}</div>`}).join('')}</article>`}
  function notices(){return `<h1 class="heading">Avisos y recordatorios</h1><p class="lead">Consulta observaciones y mantente informado sobre las próximas entregas.</p><div class="two"><article class="card"><h2>♧ Mis avisos</h2><div class="notice">! <div><strong>${eligible()?'Documentación pendiente':'Elegibilidad pendiente'}</strong>${eligible()?'Revisa el expediente para conocer los documentos habilitados.':'Se requiere cumplir el porcentaje académico correspondiente.'}</div></div><div class="tile"><div><strong>Fechas de entrega</strong><small>Consulta el calendario de tu convocatoria.</small></div>${badge('PENDIENTE')}</div></article><article class="card"><h2>✈ Recordatorios por Telegram</h2><p class="muted small">Recibe avisos breves sobre fechas y observaciones. Los documentos se gestionan en el portal web.</p><button class="btn primary" disabled>Vincular Telegram</button><p class="help">La vinculación se habilitará al configurar el servicio de mensajería.</p></article></div>`}
  function assistant(){return `<h1 class="heading">Asistente del Servicio Social</h1><p class="lead">Consulta información sobre documentos, horas y etapas del procedimiento.</p><div class="two"><article class="card chat-card"><h2>✦ Asistente</h2><div class="chat-chips"><button class="btn" data-question="¿Qué documentos necesito?">Documentos</button><button class="btn" data-question="¿Cómo se suman mis horas?">Horas</button><button class="btn" data-question="¿Cómo subo un PDF?">Entregas</button></div><div class="chat-list" id="chat-list" aria-live="polite">${chat.map(m=>`<div class="bubble ${m.role}">${html(m.text)}</div>`).join('')}</div><form class="chat-form" id="chat-form"><label for="chat-input" class="sr-only">Pregunta</label><input id="chat-input" maxlength="400" placeholder="Escribe tu pregunta..." required><button class="btn primary">Enviar</button></form></article><article class="card"><h2>Acciones relacionadas</h2><div class="stack"><button class="btn" data-view="documentos">▤ Consultar documentos</button><button class="btn" data-view="horas">◷ Consultar horas</button><button class="btn" data-view="avisos">♧ Revisar avisos</button></div></article></div>`}
  function answer(q){const s=q.toLowerCase();if(s.includes('hora'))return 'Las horas se contabilizan a partir de los reportes bimestrales aceptados. Consulta el detalle en Horas.';if(s.includes('document')||s.includes('formato')||s.includes('falta'))return 'En Documentos encontrarás la lista de formatos y estados. Solo puedes subir los archivos habilitados para tu etapa.';if(s.includes('subir')||s.includes('pdf')||s.includes('entreg'))return 'Abre Documentos, elige un documento habilitado y presiona Subir. Después selecciona el PDF desde tu dispositivo.';if(s.includes('telegram')||s.includes('aviso'))return 'Los avisos se consultan en la sección Avisos. La vinculación con Telegram se habilitará desde esa sección.';return 'Puedo orientarte sobre documentos, horarios, entregas y etapas. Selecciona una de las consultas sugeridas para comenzar.'}
  function sendChat(s){if(!s.trim())return;chat.push({role:'user',text:s.trim()},{role:'assistant',text:answer(s)});render();const list=document.getElementById('chat-list');if(list)list.scrollTop=list.scrollHeight}
  function connectChat(){const f=document.getElementById('chat-form');if(f)f.onsubmit=e=>{e.preventDefault();sendChat(document.getElementById('chat-input').value)}}
  async function fileLooksLikePdf(blob){const bytes=new Uint8Array(await blob.slice(0,5).arrayBuffer());return bytes.length===5&&String.fromCharCode(...bytes)==='%PDF-'}
  function connectUpload(){document.querySelectorAll('[data-format]').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.format,url=window.SS_FORMATOS?.[id];
      if(!url||!/^\.\/formatos\/[a-zA-Z0-9_.-]+\.pdf$/i.test(url))return;
      const filename=url.split('/').pop();
      const trigger=(href)=>{const a=document.createElement('a');a.href=href;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove()};
      // Cuando se abre index.html directamente desde una carpeta, fetch(file://) suele estar bloqueado.
      // El atributo download y los encabezados del alojamiento evitan abrir el visor de PDF.
      if(location.protocol==='file:'){trigger(url);return}
      const label=b.textContent;b.disabled=true;b.textContent='Preparando descarga...';
      try{
        const response=await fetch(url,{cache:'no-store'});
        if(!response.ok)throw new Error('El formato todavía no está disponible para descargar.');
        const blob=await response.blob();
        if(!blob.size||!await fileLooksLikePdf(blob))throw new Error('El archivo disponible no es un PDF válido.');
        const objectUrl=URL.createObjectURL(blob);
        trigger(objectUrl);
        setTimeout(()=>URL.revokeObjectURL(objectUrl),60000);
      }catch(error){
        const notice=document.createElement('div');notice.className='error message';notice.setAttribute('role','alert');notice.textContent=error.message||'No se pudo descargar el formato.';
        const container=b.closest('.card')||document.querySelector('main');container?.prepend(notice);
      }finally{b.disabled=false;b.textContent=label}
    });
    const picker=document.getElementById('file'),pick=document.getElementById('pick'),drop=document.getElementById('drop'),form=document.getElementById('upload-form');if(!picker||!form)return;
    pick.onclick=()=>picker.click();const choose=f=>{selected=f||null;document.getElementById('filename').textContent=selected?selected.name:'Ningún archivo seleccionado'};picker.onchange=()=>choose(picker.files[0]);
    for(const ev of ['dragover','dragenter'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('drag')});for(const ev of ['dragleave','drop'])drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('drag')});drop.addEventListener('drop',e=>choose(e.dataTransfer.files[0]));
    form.onsubmit=async e=>{e.preventDefault();const id=document.getElementById('type').value,result=document.getElementById('upload-result'),d=DOCUMENTS.find(x=>x.id===id);
      if(!d||!canUpload(d)){result.className='error message';result.textContent='Este documento no está habilitado para la etapa actual.';return}
      if(!selected){result.className='error message';result.textContent='Selecciona un archivo PDF para continuar.';return}
      if(!selected.name.toLowerCase().endsWith('.pdf')||selected.size===0||selected.size>5*1024*1024){result.className='error message';result.textContent='Selecciona un archivo PDF no vacío de máximo 5 MiB.';return}
      result.className='soft message';result.textContent='Enviando documento...';const body=new FormData();body.append('file',selected);body.append('documentType',id);body.append('studentId',control);
      try{const response=await fetch('/api/upload',{method:'POST',body,credentials:'same-origin'});const json=await response.json().catch(()=>({}));if(!response.ok)throw new Error(json.error||'No fue posible completar la entrega.');result.className='success message';result.textContent='El documento se recibió correctamente.';selected=null;picker.value='';document.getElementById('filename').textContent='Ningún archivo seleccionado';}catch(ex){result.className='error message';result.textContent=ex.message||'Servicio no disponible. Intenta más tarde.'}
    };
  }
  // Los valores de muestra nunca son una prueba de identidad. El backend deberá controlar permisos y estados.
  render();
})();
