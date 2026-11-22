(()=>{
'use strict';
const ROOT=document.getElementById('app'), KEY='ss_ui_avance_v3',SESSION='tecnm_estudiante_sesion_v1';
const C=window.SS_CATALOGO,STAGES=C.stages,DOCS=C.documents;
const USERS={
'24660001':{name:'Ana Sofía Ramírez',nip:'1234',approved:190,total:250,activity:10,period:2,exp:'EXP-001',institution:'Centro Comunitario de Servicio Social',career:'Ingeniería en Sistemas Computacionales'},
'24660002':{name:'Luis Herrera',nip:'2345',approved:150,total:250,activity:1,period:0,exp:'EXP-002',institution:'',career:'Ingeniería en Sistemas Computacionales'},
'24660003':{name:'Mariana Torres',nip:'3456',approved:175,total:250,activity:2,period:0,exp:'EXP-003',institution:'',career:'Ingeniería Industrial'}};
const SEED={'24660001':{docs:{solicitud:'ACEPTADO',compromiso:'ACEPTADO',asignacion:'ACEPTADO',plan:'ACEPTADO',aceptacion:'ACEPTADO',reporte1:'ACEPTADO'},hours:160},'24660002':{docs:{},hours:0},'24660003':{docs:{},hours:0}};
const GROUPS=[{name:'Inicio y registro',start:1,end:3},{name:'Presentación y aceptación',start:4,end:7},{name:'Ejecución y seguimiento',start:8,end:11},{name:'Terminación',start:12,end:16}];
let control=readSession(),page='inicio',selected=null,activeGroup=null,flash='',chat=[],records=load();
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return {}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(records))}catch{}}
function readSession(){try{let c=sessionStorage.getItem(SESSION);return USERS[c]?c:null}catch{return null}}
function writeSession(c){try{if(c)sessionStorage.setItem(SESSION,c);else sessionStorage.removeItem(SESSION)}catch{}}
function u(){return USERS[control]}
function data(){if(!records[control])records[control]=JSON.parse(JSON.stringify(SEED[control]||{docs:{},hours:0}));return records[control]}
function good(){return u().approved*10>=u().total*7}
function step(){return good()?u().activity:1}
function groupFor(n){return GROUPS.find(g=>g.start<=n&&n<=g.end)||GROUPS[0]}
function docState(d){return data().docs[d.id]||'PENDIENTE'}
function stateBadge(s){const x={ACEPTADO:['Aceptado','green'],VALIDADO_TECNICAMENTE:['Validado técnicamente','green'],OBSERVADO:['Con observaciones','red'],REVISION_REQUERIDA:['Revisión requerida','yellow'],DOCUMENTO_INCORRECTO:['Documento incorrecto','red'],EN_REVISION:['En revisión','yellow'],PENDIENTE:['Pendiente','gray']};const z=x[s]||x.PENDIENTE;return `<span class="pill ${z[1]}">${z[0]}</span>`}
function docPeriod(d){const m=/^(?:reporte|eval|autoeval)([123])$/.exec(d.id);return m?Number(m[1]):Number(d.period||0)}
function canOffer(d){const p=docPeriod(d);return good() && step()>=d.start && step()<=d.finish && (!p||u().period===p)}
function canSubmit(d){return canOffer(d) && (d.action==='upload'||d.action==='external') && !['ACEPTADO','EN_REVISION','REVISION_REQUERIDA'].includes(docState(d))}
function nav(){return [['inicio','⌂','Inicio'],['documentos','▤','Documentos'],['avance','◷','Avance'],['avisos','♧','Avisos']]}
function brand(){return `<div class="brand"><div class="emblem" aria-hidden="true">T</div><div><b>TecNM · Servicio Social</b><small>Campus Matehuala</small></div></div>`}
function login(){ROOT.innerHTML=`<div class="auth"><div class="auth-card">${brand()}<h1>Iniciar sesión</h1><p>Accede a tu expediente de Servicio Social</p><form id="login" novalidate><div class="field"><label for="id">Número de control</label><input id="id" inputmode="numeric" maxlength="8" autocomplete="username" placeholder="Número de control" required></div><div class="field"><label for="nip">NIP de 4 dígitos</label><input id="nip" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="Ingresa tu NIP" required></div><button type="submit" class="btn primary full">Iniciar sesión →</button><div id="error" role="alert"></div></form></div></div>`;const form=document.querySelector('#login');for(let id of ['id','nip'])document.getElementById(id).addEventListener('input',e=>e.target.value=e.target.value.replace(/\D/g,'').slice(0,id==='nip'?4:8));form.onsubmit=e=>{e.preventDefault();let id=document.getElementById('id').value,nip=document.getElementById('nip').value;if(!/^\d{8}$/.test(id)||!/^\d{4}$/.test(nip)||!USERS[id]||USERS[id].nip!==nip){document.querySelector('#error').innerHTML='<div class="error">Número de control o NIP incorrecto.</div>';return;}control=id;writeSession(id);page='inicio';chat=[];render();refreshStatusSilent()}}
function goto(p,d){page=p;selected=d||null;flash='';render();refreshStatusSilent();window.scrollTo({top:0,behavior:'instant'})}
function buttonNav([k,ic,label],mobile){return `<button data-page="${k}" class="${mobile?'':'tab '}${page===k?'active':''}"><span>${ic}</span>${label}</button>`}
function render(){if(!control){login();return;}const content=({inicio:home,documentos:documents,avance:avance,avisos:avisos,asistente:assistant,subir:upload})[page]||home;ROOT.innerHTML=`<div class="app"><header class="head"><div class="head-inner">${brand()}<div class="head-right"><span>${esc(u().name.split(' ')[0])}</span><button id="logout">Cerrar sesión ↗</button></div></div></header><nav class="tabs"><div class="tabs-inner">${nav().map(x=>buttonNav(x,false)).join('')}</div></nav><main class="container">${flash?`<div class="notice">${esc(flash)}</div>`:''}${content()}</main><button class="fab" data-page="asistente" title="Abrir asistente" aria-label="Abrir asistente">✦</button><nav class="bottom-nav">${nav().map(x=>buttonNav(x,true)).join('')}</nav></div>`;document.querySelector('#logout').onclick=()=>{control=null;writeSession(null);render()};document.querySelectorAll('[data-page]').forEach(x=>x.onclick=()=>goto(x.dataset.page));document.querySelectorAll('[data-chat]').forEach(x=>x.onclick=()=>{let v=x.dataset.chat;goto('asistente');ask(v)});document.querySelectorAll('[data-doc]').forEach(x=>x.onclick=()=>goto('documentos',x.dataset.doc));document.querySelectorAll('[data-submitdoc]').forEach(x=>x.onclick=()=>goto('subir',x.dataset.submitdoc));document.querySelectorAll('[data-get]').forEach(x=>x.onclick=()=>download(x.dataset.get));document.querySelectorAll('[data-focus]').forEach(x=>x.onclick=()=>{activeGroup=+x.dataset.focus;render()});document.querySelectorAll('[data-telegram]').forEach(x=>x.onclick=()=>{flash='La vinculación de Telegram se habilitará desde el portal cuando el servicio esté configurado.';render()});attachChat();attachUpload();const refreshBtn=document.getElementById('refreshDocuments');if(refreshBtn)refreshBtn.onclick=refreshDocumentsNow;}
function currentAction(){const a=step();if(!good())return 'Necesitas reunir al menos el 70 % de créditos antes de iniciar el Servicio Social.';if(a===2)return 'Completa la solicitud, carta compromiso, carta de asignación y plan de trabajo.';if(a>=3&&a<=5)return 'Espera la carta de presentación de Vinculación y entrégala a la instancia receptora.';if(a===6||a===7)return 'Solicita a la instancia receptora la carta de aceptación firmada y sellada, y súbela al portal.';if(a>=8&&a<=11)return 'Prepara el reporte bimestral, evaluación y autoevaluación; solicita firmas a la instancia y entrégalos.';return STAGES[a-1].text;}
function nextDocs(){return DOCS.filter(x=>canOffer(x)&&(x.action==='upload'||x.action==='external')&&docState(x)!=='ACEPTADO')}
function home(){let h=data().hours,g=groupFor(step());return `<div class="hero"><p class="eyebrow">Tu ruta de Servicio Social</p><h1>¡Hola, ${esc(u().name.split(' ')[0])}!</h1><p>El asistente de IA te ayudará a completar tu Servicio Social, paso a paso, con documentos, fechas y orientación para cada actividad.</p><div class="buttons" style="margin-top:18px"><button class="btn primary" data-page="asistente">✦ Hablar con mi asistente</button><button class="btn" data-page="avance">Ver mi avance →</button></div></div><div class="two"><article class="card"><h2>◷ En qué etapa estás</h2><div class="status-hero">${esc(g.name)}</div><p class="muted small">Actividad ${step()} de 16 · ${esc(STAGES[step()-1].title)}</p></article><article class="card"><h2>♧ Elegibilidad y horas</h2><div class="row"><strong>${good()?'✓ Elegible':'◷ Aún no elegible'}</strong><span>${Math.round(u().approved/u().total*100)} % de créditos</span></div><div class="progress" style="margin:15px 0"><span style="width:${Math.min(100,data().hours/500*100)}%"></span></div><div class="row"><span class="muted small">Horas de reportes aceptados</span><strong>${h} / 500 h</strong></div></article></div><div class="two section"><article class="card"><h2>Tu siguiente paso</h2><p>${esc(currentAction())}</p><div class="buttons"><button class="btn primary" data-page="documentos">Ver documentos habilitados</button></div></article><article class="card"><h2>✦ Tu asistente te guía</h2><p class="muted small">Pregúntale qué hacer ahora, qué formato necesitas o a quién debes solicitar un documento.</p><div class="buttons"><button class="btn" data-chat="¿Qué tengo que hacer ahora?">¿Qué sigue?</button><button class="btn" data-chat="¿Qué documentos puedo entregar?">Mis documentos</button></div></article></div>`}
function labelAction(d){return d.action==='generated'?'Emite Vinculación':d.action==='external'?'Emite la instancia':d.action==='internal'?'Registro interno':'Lo prepara el estudiante'}
function documentCard(d){let on=canOffer(d),status=docState(d);const action=d.action==='generated'?`<span class="pill blue">Documento institucional</span>`:d.action==='external'?`<span class="pill blue">Solicitar a la instancia</span>`:d.action==='internal'?`<span class="pill gray">Interno</span>`:'';let buttons='';if(on){if(d.path)buttons+=`<button class="btn" data-get="${d.id}">↓ Descargar formato</button>`;if(canSubmit(d))buttons+=`<button class="btn primary" data-submitdoc="${d.id}">↑ Subir documento</button>`;if(d.action==='generated')buttons+=`<span class="muted small">Se habilitará al emitirse desde Vinculación.</span>`;}else buttons='<span class="muted small">Se habilitará en la etapa correspondiente.</span>';return `<div class="docentry ${on?'':'dimmed'}"><div class="row" style="gap:12px;align-items:start"><div><div class="docentry-title">▤ ${esc(d.name)}</div><div class="muted small">${esc(labelAction(d))} · ${esc(d.code)}</div></div>${on?stateBadge(status):'<span class="pill gray">No habilitado</span>'}</div><p class="muted small">${esc(d.tip)}</p><div class="buttons">${buttons}</div></div>`}
function documents(){let list=DOCS.filter(x=>x.required&&x.action!=='internal');let active=list.filter(canOffer),completed=list.filter(x=>!canOffer(x)&&['ACEPTADO','VALIDADO_TECNICAMENTE'].includes(docState(x))),later=list.filter(x=>!canOffer(x)&&!completed.includes(x));let generated=DOCS.filter(x=>x.action==='generated');return `<div class="row"><div><h1 class="heading">Documentos</h1><p class="lead">Consulta las entregas de tu etapa y el estado registrado en el expediente.</p></div><button class="btn" id="refreshDocuments" type="button">↻ Actualizar estados</button></div><div class="card"><h2>Documentos disponibles ahora</h2>${active.length?active.map(documentCard).join(''):'<p class="muted small">No hay entregas habilitadas para tu actividad actual.</p>'}</div>${completed.length?`<div class="card section"><h2>Documentos de etapas o bimestres anteriores</h2><p class="muted small">Estos son los estados registrados en tu expediente; validado técnicamente no equivale a autorización institucional.</p>${completed.map(documentCard).join('')}</div>`:''}<div class="card section"><h2>Documentos emitidos por Vinculación</h2><p class="muted small">La carta de presentación y la constancia se generan desde el área institucional. No debes elaborarlas ni subirlas por tu cuenta.</p>${generated.map(d=>`<div class="tile"><div><strong>${esc(d.name)}</strong><small>${esc(d.tip)}</small></div>${canOffer(d)?'<span class="pill yellow">Pendiente de emisión</span>':'<span class="pill gray">No disponible</span>'}</div>`).join('')}</div><details class="card section"><summary><strong>Ver documentos de otras etapas</strong></summary><p class="muted small">Puedes consultar requisitos futuros, pero no entregar documentos fuera de tu etapa.</p>${later.map(documentCard).join('')}</details>`}
function avance(){const a=step();return `<h1 class="heading">Mi avance</h1><p class="lead">El Servicio Social tiene 16 actividades agrupadas en cuatro momentos. Cada una tiene un responsable específico.</p><div class="four-moments">${GROUPS.map((g,i)=>`<button class="moment ${a>=g.start&&a<=g.end?'now':''}" data-focus="${i}"><span class="moment-num">${i+1}</span><strong>${g.name}</strong><small>${g.start}–${g.end}</small></button>`).join('')}</div><div class="card section"><h2>Las 16 actividades del procedimiento</h2><div class="activity-list">${STAGES.filter(s=>activeGroup===null||groupFor(s.num)===GROUPS[activeGroup]).map(s=>`<div class="activity ${s.num===a?'current':''}"><span class="activity-num">${s.num}</span><div><strong>${esc(s.title)}</strong><small>${esc(s.owner)} · ${s.num<a?'Actividad anterior':s.num===a?'Actividad actual':'Próxima actividad'}</small><p class="muted small">${esc(s.text)}</p></div></div>`).join('')}</div>${activeGroup!==null?'<button class="btn" id="showall">Ver las 16 actividades</button>':''}</div><div class="card section"><h2>Horas acreditadas</h2><div class="progress-label"><strong>${data().hours} / 500 horas</strong><span>${Math.round(data().hours/500*100)} %</span></div><div class="progress"><span style="width:${Math.min(100,data().hours/500*100)}%"></span></div><p class="muted small">Las horas corresponden a reportes aceptados y no pueden ser modificadas desde esta pantalla.</p></div>`}
function avisos(){return `<h1 class="heading">Avisos y recordatorios</h1><p class="lead">Mantente al corriente de tus documentos y próximas actividades.</p><div class="two"><article class="card"><h2>Próximas actividades</h2><div class="warning">${esc(currentAction())}</div><div class="tile"><div><strong>Tu etapa</strong><small>${esc(groupFor(step()).name)} · Actividad ${step()}</small></div><button class="btn" data-page="avance">Ver avance</button></div></article><article class="card"><h2>Notificaciones por Telegram</h2><p class="muted small">El asistente podrá enviarte recordatorios y avisos de documentos cuando vincules Telegram.</p><button class="btn primary" data-telegram="1">Vincular Telegram</button></article></div>`}
function assistant(){if(chat.length===0)chat.push({role:'assistant',text:`Hola, ${u().name.split(' ')[0]}. Te ayudaré a completar el Servicio Social paso a paso. ${currentAction()}`});return `<h1 class="heading">Asistente de Servicio Social</h1><p class="lead">Orientación para cada actividad, formatos y documentos que necesitas entregar.</p><div class="two"><article class="card chat-card"><h2>✦ ¿En qué puedo ayudarte?</h2><div class="chat-chips">${['¿Qué tengo que hacer ahora?','¿Quién emite la carta de aceptación?','¿Cómo registro mis horas?','¿Qué formatos puedo descargar?','¿Cómo vinculo Telegram?'].map(x=>`<button class="btn" data-chat="${esc(x)}">${esc(x)}</button>`).join('')}</div><div class="chat-list" id="chatList">${chat.map(m=>`<div class="bubble ${m.role}" style="white-space:pre-wrap">${esc(m.text)}</div>`).join('')}</div><form class="chat-form" id="chatForm"><input id="question" placeholder="Escribe tu pregunta…" autocomplete="off"><button class="btn primary" type="submit" aria-label="Enviar">➤</button></form></article><article class="card"><h2>Tu situación actual</h2><div class="tile"><div><strong>Actividad ${step()} de 16</strong><small>${esc(STAGES[step()-1].title)}</small></div><span class="pill blue">Actual</span></div><p class="muted small">${esc(currentAction())}</p><div class="buttons"><button class="btn primary" data-page="documentos">Abrir documentos</button><button class="btn" data-page="avance">Ver etapas</button></div><hr style="border:0;border-top:1px solid #e1eaf2;margin:22px 0"><h2>Cuando subas un archivo</h2><p class="muted small">El servicio documental lo enviará al análisis para identificar el tipo, revisar requisitos y devolverte observaciones. Los documentos recibidos se analizan en n8n. Si hay errores, te explicaré las observaciones cuando el resultado esté disponible.</p></article></div>`}
let sendingAI=false;
function syncFromSheet(perfil){
 if(!perfil || String(perfil.control)!==control)return;
 const user=u();
 const approved=Number(perfil.creditos_aprobados), total=Number(perfil.creditos_totales);
 const activity=Number(perfil.actividad_actual), period=Number(perfil.periodo_habilitado), hours=Number(perfil.horas_acreditadas);
 if(perfil.creditos_aprobados!==null&&perfil.creditos_aprobados!==undefined&&Number.isFinite(approved)&&approved>=0)user.approved=approved;
 if(Number.isFinite(total)&&total>0)user.total=total;
 if(Number.isInteger(activity)&&activity>=1&&activity<=16)user.activity=activity;
 if(Number.isInteger(period)&&period>=0&&period<=3)user.period=period;
 if(perfil.horas_acreditadas!==null&&perfil.horas_acreditadas!==undefined&&Number.isFinite(hours)&&hours>=0)data().hours=hours;
 const estadosPermitidos=new Set(['ACEPTADO','VALIDADO_TECNICAMENTE','OBSERVADO','REVISION_REQUERIDA','DOCUMENTO_INCORRECTO','EN_REVISION','PENDIENTE']);
 const docs=data().docs;
 // Utilizar el historial de entregas del MISMO expediente que WF-01 ya consultó.
 // Ante varias versiones, seleccionar la versión más reciente de cada tipo.
 if(Array.isArray(perfil.entregas_recientes)){
   const recientes={};
   perfil.entregas_recientes.forEach((d,index)=>{
     if(!d||!d.tipo_id)return;
     const id=String(d.tipo_id).trim();
     if(!DOCS.some(x=>x.id===id))return;
     const version=Number(d.version||0);
     const previous=recientes[id];
     if(!previous||version>previous.version||(version===previous.version&&index>previous.index)){
       recientes[id]={version,index,estado:String(d.estado||'').toUpperCase()};
     }
   });
   for(const [id,r] of Object.entries(recientes)){
     if(estadosPermitidos.has(r.estado))docs[id]=r.estado;
   }
 }
 // Aceptar tanto {reporte2:'ESTADO'} como {reporte2:{estado:'ESTADO'}}.
 if(perfil.estados_documentos&&typeof perfil.estados_documentos==='object'){
   for(const [id,value] of Object.entries(perfil.estados_documentos)){
     const estado=String(typeof value==='object'&&value!==null?value.estado:value).toUpperCase().trim();
     if(DOCS.some(d=>d.id===id)&&estadosPermitidos.has(estado))docs[id]=estado;
   }
 }
 save();
}
async function refreshDocumentsNow(){
 const button=document.getElementById('refreshDocuments');
 if(button){button.disabled=true;button.textContent='Actualizando…';}
 try{
   const result=await callAssistant('Consultar estado del expediente','status');
   if(!result.perfil)throw new Error('WF-01 no devolvió el perfil del expediente.');
   flash='Se consultaron los estados del expediente.';
 }catch(e){flash='No se pudieron actualizar los estados: '+String(e.message||'error de conexión');}
 render();
}

async function callAssistant(question,mode='chat'){
 let gate='';
 try{gate=sessionStorage.getItem('tecnm_ai_demo_key')||'';}catch{}
 if(!gate){
   gate=window.prompt('Ingresa la clave de acceso al asistente:')||'';
   if(!gate.trim())throw new Error('Necesitas la clave de acceso para utilizar el asistente.');
   try{sessionStorage.setItem('tecnm_ai_demo_key',gate.trim());}catch{}
 }
 const response=await fetch('/api/agent',{
  method:'POST',headers:{'Content-Type':'application/json','X-Demo-Access':gate.trim()},
  body:JSON.stringify({control,question,mode})
 });
 let payload={};try{payload=await response.json()}catch{}
 if(!response.ok){
   if(response.status===401){try{sessionStorage.removeItem('tecnm_ai_demo_key')}catch{}}
   throw new Error(payload.error||`El asistente no pudo responder (${response.status}).`);
 }
 if(payload.perfil)syncFromSheet(payload.perfil);
 return payload;
}
let lastStatusCheck=0,checkingStatus=false;
async function refreshStatusSilent(){
 if(!control||checkingStatus||Date.now()-lastStatusCheck<15000)return;
 let access='';try{access=sessionStorage.getItem('tecnm_ai_demo_key')||''}catch{}
 if(!access)return;
 checkingStatus=true;lastStatusCheck=Date.now();
 try{await callAssistant('Consulta de estado','status');render()}catch{}finally{checkingStatus=false}
}
async function ask(text){
 text=(text||'').trim();if(!text||sendingAI)return;
 sendingAI=true;chat.push({role:'user',text});chat.push({role:'assistant',text:'Consultando tu expediente…'});
 page='asistente';render();
 try{
   const result=await callAssistant(text,'chat');
   chat[chat.length-1]={role:'assistant',text:String(result.reply||'No se recibió respuesta del asistente.')};
 }catch(e){chat[chat.length-1]={role:'assistant',text:String(e.message||'No fue posible consultar el servicio.')};}
 finally{sendingAI=false;render();const el=document.getElementById('chatList');if(el)el.scrollTop=el.scrollHeight;}
}

function attachChat(){const f=document.getElementById('chatForm');if(f)f.onsubmit=e=>{e.preventDefault();ask(document.getElementById('question').value)};const all=document.getElementById('showall');if(all)all.onclick=()=>{activeGroup=null;render()}}
function upload(){let allowed=DOCS.filter(canSubmit);let d=allowed.find(x=>x.id===selected)||allowed[0];selected=d?.id||null;return `<h1 class="heading">Subir documento</h1><p class="lead">Adjunta solamente los documentos habilitados para tu actividad actual.</p><article class="card form-card"><form id="uploadform"><div class="field"><label for="docSel">Documento</label><select id="docSel" required>${allowed.map(x=>`<option value="${x.id}" ${d?.id===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="soft">${d?esc(d.tip):'No hay documentos disponibles para entregar en esta actividad.'}</div><div class="drop section" id="drop"><div class="file-icon">⇧</div><p>Selecciona tu archivo PDF</p><input class="file-input" id="fileInput" type="file" accept=".pdf,application/pdf"><button type="button" id="choose" class="btn">Seleccionar archivo</button><div class="filename" id="fileName"></div><p class="muted small">Máximo 4 MB · Formato PDF</p></div><div class="buttons section"><button class="btn" type="button" data-page="documentos">Cancelar</button><button class="btn primary" type="submit" ${allowed.length?'':'disabled'}>Enviar a revisión</button></div></form><div id="upMessage" aria-live="polite"></div></article>`}
function attachUpload(){const f=document.getElementById('uploadform');if(!f)return;let input=document.getElementById('fileInput'),select=document.getElementById('docSel'),choose=document.getElementById('choose');choose.onclick=()=>input.click();select.onchange=()=>{selected=select.value;render()};input.onchange=()=>document.getElementById('fileName').textContent=input.files[0]?.name||'';f.onsubmit=async e=>{e.preventDefault();const target=document.getElementById('upMessage');const file=input.files[0];if(!file){target.innerHTML='<div class="error">Selecciona un PDF.</div>';return;}if(file.size>4*1024*1024||(!file.name.toLowerCase().endsWith('.pdf')&&file.type!=='application/pdf')){target.innerHTML='<div class="error">Selecciona un PDF válido de hasta 4 MB.</div>';return;}let form=new FormData();form.append('file',file);form.append('type',select.value);form.append('control',control);target.innerHTML='<div class="notice">Enviando PDF…</div>';
let gate='';try{gate=sessionStorage.getItem('tecnm_ai_demo_key')||''}catch{}
if(!gate){gate=window.prompt('Ingresa la clave de acceso a los servicios de la demostración:')||'';if(!gate.trim()){target.innerHTML='<div class="error">Se necesita la clave de acceso.</div>';return;}try{sessionStorage.setItem('tecnm_ai_demo_key',gate.trim())}catch{}}
try{
 const response=await fetch('/api/upload',{method:'POST',headers:{'X-Demo-Access':gate.trim()},body:form});
 const result=await response.json().catch(()=>({error:'El servidor devolvió una respuesta inválida.'}));
 if(!response.ok||result.ok!==true){if(response.status===401)try{sessionStorage.removeItem('tecnm_ai_demo_key')}catch{};throw new Error(result.error||'No fue posible entregar el documento.')}
 // La recepción no es aprobación. Abrimos el chat y consultamos la entrega específica.
 const uploadId=String(result.upload_id||'');
 data().docs[select.value]='EN_REVISION';save();
 const title=DOCS.find(d=>d.id===select.value)?.name||'documento';
 const pendingMessage={role:'assistant',text:`Recibí tu archivo «${title}». Ahora voy a revisar si corresponde al formato solicitado y si contiene errores. Puedes seguir usando el asistente mientras termina el análisis.`,uploadId};
 chat.push(pendingMessage);
 page='asistente';selected=null;flash='';render();
 window.scrollTo({top:0,behavior:'instant'});
 const chatList=document.getElementById('chatList');if(chatList)chatList.scrollTop=chatList.scrollHeight;
 if(uploadId)pollDocumentResult(uploadId);
}catch(err){target.innerHTML=`<div class="error">${esc(err.message||'Error de conexión')}</div>`}}}

// Consulta solo la rama status de WF-01; no llama a Gemini en cada intento.
const uploadPolls=new Set();
async function pollDocumentResult(uploadId){
 if(uploadPolls.has(uploadId))return;
 uploadPolls.add(uploadId);
 const maxAttempts=12;
 for(let attempt=0;attempt<maxAttempts;attempt++){
  if(!control)break;
  if(attempt)await new Promise(resolve=>setTimeout(resolve,7000));
  try{
   const result=await callAssistant('Consultar estado del expediente','status');
   const history=Array.isArray(result.perfil?.entregas_recientes)?result.perfil.entregas_recientes:[];
   const document=history.find(d=>String(d.documento_id)===uploadId);
   if(!document)continue; // WF-01 podría no estar devolviendo entregas_recientes todavía.
   const status=String(document.estado||'').toUpperCase();
   if(['EN_REVISION','PENDIENTE',''].includes(status))continue;
   const observations=String(document.observaciones||'').trim();
   const labels={OBSERVADO:'Encontré observaciones',REVISION_REQUERIDA:'Es necesaria una verificación adicional',VALIDADO_TECNICAMENTE:'Documento validado técnicamente',ACEPTADO:'Documento aceptado según el registro',DOCUMENTO_INCORRECTO:'Documento incorrecto'};
   const message=(labels[status]||'El resultado del documento está disponible')+'.'+(observations?' '+observations:'')+
       (status==='OBSERVADO'?' Corrige el archivo y vuelve a enviarlo cuando corresponda.':'');
   const item=chat.find(m=>m.uploadId===uploadId);
   if(item){item.text=message;delete item.uploadId;}
   if(page==='asistente')render();
   uploadPolls.delete(uploadId);return;
  }catch(e){
   // Un error transitorio no debe borrar la confirmación de recepción.
  }
 }
 const item=chat.find(m=>m.uploadId===uploadId);
 if(item){item.text+=' El análisis puede continuar en segundo plano. Si no aparece el resultado, consulta más tarde el expediente o pregunta por tu documento.';delete item.uploadId;}
 if(page==='asistente')render();
 uploadPolls.delete(uploadId);
}

async function download(id){const d=DOCS.find(x=>x.id===id);if(!d||!canOffer(d)||!d.path)return;const tries=[d.path,d.fallback].filter(Boolean);let err='El formato todavía no está disponible.';for(const name of tries){try{let r=await fetch('formatos/'+name,{cache:'no-store'});if(!r.ok)continue;let b=await r.blob();if(!b.size)continue;let obj=URL.createObjectURL(b);let a=document.createElement('a');a.href=obj;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(obj),2000);return;}catch(e){err='No fue posible descargar el formato.'}}flash=err+' Comunícate con Vinculación para obtenerlo.';render()}
render();refreshStatusSilent();
})();