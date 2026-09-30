'use strict';
const guide = window.GUIDE_DATA;
const workspace = document.getElementById('workspace');
const snippets = new Map();
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="1"/><path d="M16 8V3H3v13h5"/></svg>';
const esc = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let copyId = 0;
let toastTimer;
let students = [
  {id:1,first_name:'Ana Torres',email:'ana@example.com',activo:true},
  {id:2,first_name:'Carlos Ruiz',email:'carlos@example.com',activo:true},
  {id:3,first_name:'Laura Díaz',email:'laura@example.com',activo:false}
];
let nextId = 4;
let editingId = null;

function highlight(code) {
  const pattern = /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\$[a-zA-Z_][\w]*|\b(?:async|function|const|let|await|return|throw|new|if|else|try|catch|for|of|true|false|null|require_once|echo|exit|SELECT|FROM|ORDER|BY|INSERT|INTO|VALUES|UPDATE|SET|WHERE|DELETE|RETURNING|CREATE|TABLE|PRIMARY|KEY|NOT|NULL|DEFAULT|INTEGER|BOOLEAN|VARCHAR|GENERATED|ALWAYS|AS|IDENTITY)\b|\b\d+\b)/g;
  let result = '', last = 0;
  for (const match of code.matchAll(pattern)) {
    result += esc(code.slice(last, match.index));
    const token = match[0];
    const type = /^(\/\/|--|\/\*|#)/.test(token) ? 'comment' : /^["']/.test(token) ? 'string' : /^\$/.test(token) ? 'variable' : /^\d/.test(token) ? 'number' : 'keyword';
    result += `<span class="token-${type}">${esc(token)}</span>`;
    last = match.index + token.length;
  }
  return result + esc(code.slice(last));
}
function codePanel(code, filename, language) {
  const id = 'snippet-' + (++copyId);
  snippets.set(id, code);
  return `<section class="code-panel" aria-label="Código ${esc(filename)}"><div class="code-header"><span class="code-file"><span class="code-lang">${esc(language)}</span>${esc(filename)}</span><button class="copy-button" data-copy="${id}" aria-label="Copiar ${esc(filename)}">${copyIcon}<span>Copiar</span></button></div><pre tabindex="0"><code>${highlight(code.trimEnd())}</code></pre></section>`;
}
function heading(label, title, subtitle, number) {
  return `<div class="eyebrow"><span class="method-label">${esc(label)}</span><span class="small-line"></span>GUÍA DE IMPLEMENTACIÓN</div><div class="title-row"><h1>${esc(title)}</h1><span class="chapter-number" aria-hidden="true">${esc(number)}</span></div><p class="subtitle">${esc(subtitle)}</p>`;
}
function methodPage(key) {
  const m = guide.methods[key];
  return `${heading(m.method, m.title, m.subtitle, m.number)}
    <div class="flow" aria-label="Flujo de la petición">
      <div class="flow-node"><span class="flow-icon">↗</span><div><strong>JavaScript</strong><small>fetch()</small></div></div><span class="flow-arrow">→</span>
      <div class="flow-node"><span class="flow-icon">{ }</span><div><strong>PHP</strong><small>PDO</small></div></div><span class="flow-arrow">→</span>
      <div class="flow-node"><span class="flow-icon">≡</span><div><strong>PostgreSQL</strong><small>${m.sql}</small></div></div>
      <div class="endpoint"><span>${m.method}</span> /${m.endpoint}</div>
    </div>
    <div class="section-head"><h2>Código listo para copiar</h2><button class="button secondary" data-copy-pair="${key}">${copyIcon} Copiar PHP + JS</button></div>
    <div class="code-pair">${codePanel(m.php,m.endpoint.split('/')[1],'PHP')}${codePanel(m.js,'frontend.js','JS')}</div>
    <p class="dependency">El PHP usa <a href="#setup">_helpers.php + conexion.php</a>. Copia esos archivos una vez. <span>·</span> JS: rutas desde la raíz del proyecto.</p>
    <section class="explanation"><div class="section-head"><h2>Cómo funciona</h2><span class="quiet">Del navegador a la base de datos</span></div>
    <div class="steps">${m.steps.map((s,i)=>`<div class="step"><span class="step-num">0${i+1}</span><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div>`).join('')}</div>
    <div class="memory"><span>PARA RECORDAR</span><code>${esc(m.remember)}</code></div></section>
    <div class="details-grid"><section class="detail-box"><h3>Detalle que evita errores</h3><p>${esc(m.tip)}</p><span class="response-meta">ENTRADA · ${esc(m.input)}</span></section><section class="detail-box"><h3>Respuesta esperada <span class="response-meta">${esc(m.output)}</span></h3><pre>${esc(m.response)}</pre></section></div>`;
}
function setupPage() {
  const s = guide.setup;
  const terminal = "$env:DB_HOST = '127.0.0.1'\n$env:DB_PORT = '5432'\n$env:DB_NAME = 'prueba_crud'\n$env:DB_USER = 'postgres'\n$env:DB_PASSWORD = 'TU_CLAVE_LOCAL'\nphp -S 127.0.0.1:8000";
  return `${heading('BASE','Preparar el proyecto.','Una conexión compartida y una tabla para practicar las cinco operaciones.','00')}
    <ol class="setup-steps"><li><strong>01 · Abre index.html</strong> para consultar la guía. Funciona sin servidor ni internet.</li><li><strong>02 · Crea prueba_crud en PostgreSQL</strong> y ejecuta database.sql en esa base desde pgAdmin o psql.</li><li><strong>03 · Activa pdo_pgsql en tu PHP</strong> y comprueba con <code>php -m</code> que el módulo aparece. También se usa mbstring para validar nombres.</li><li><strong>04 · Configura las variables de entorno</strong> y ejecuta PHP desde la carpeta pagina. Abre <code>http://127.0.0.1:8000</code>. Un servidor estático no ejecuta PHP.</li></ol>
    <div class="section-head"><h2>Conexión y estructura de datos</h2><span class="quiet">PHP 8.1+ · PostgreSQL 10+</span></div><div class="code-pair resource-codes">${codePanel(s.connection,'api/conexion.php','PHP')}${codePanel(s.sql,'database.sql','SQL')}</div>
    <p class="inline-note">El modelo agrega email y activo para mostrar la diferencia entre PUT y PATCH. Si tu tabla solo tiene first_name, adapta el SQL y las validaciones a tu esquema real.</p>
    <div class="single-code">${codePanel(terminal,'Terminal PowerShell, desde pagina','PS')}</div>
    <div class="section-head"><h2>Funciones compartidas</h2><span class="quiet">Requeridas por los endpoints</span></div><div class="single-code">${codePanel(s.helpers,'api/_helpers.php','PHP')}</div>
    <p class="inline-note">.env.example es una referencia. PHP no lo carga automáticamente. Las credenciales reales se configuran en tu entorno local y no se suben a Git.</p>
    <pre class="file-tree">pagina/\n├── index.html             ← esta guía\n├── assets/                ← diseño y ejemplos\n├── api/\n│   ├── _helpers.php       ← validación y respuestas\n│   ├── conexion.php       ← conexión PDO\n│   ├── listar.php         ← GET\n│   ├── guardar.php        ← POST\n│   ├── actualizar.php     ← PUT\n│   ├── modificar.php      ← PATCH\n│   └── eliminar.php       ← DELETE\n└── database.sql           ← tabla y datos ficticios</pre>
    <div class="sources"><a href="https://www.php.net/manual/en/pdo.prepare.php" target="_blank" rel="noopener noreferrer">PHP · PDO::prepare ↗</a><a href="https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch" target="_blank" rel="noopener noreferrer">MDN · fetch ↗</a><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PUT" target="_blank" rel="noopener noreferrer">MDN · PUT ↗</a><a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH" target="_blank" rel="noopener noreferrer">MDN · PATCH ↗</a></div>`;
}
function tablePage() {
  return `${heading('FRONTEND','Del JSON a la tabla.','Construye una fila por estudiante y vuelve a cargar los datos después de cada cambio.','06')}
    <div class="section-head"><h2>HTML + JavaScript</h2><a class="button secondary" href="#get">Copiar primero el GET ↗</a></div><div class="code-pair resource-codes">${codePanel(guide.table.html,'tabla.html','HTML')}${codePanel(guide.table.js,'tabla.js','JS')}</div>
    <div class="steps"><div class="step"><span class="step-num">01</span><h3>Identifica el tbody</h3><p>El id tabla-estudiantes permite encontrar el lugar donde se insertan las filas. El encabezado permanece.</p></div><div class="step"><span class="step-num">02</span><h3>Recorre el arreglo</h3><p>for...of crea un tr por estudiante y un td por valor. textContent muestra los nombres como texto.</p></div><div class="step"><span class="step-num">03</span><h3>Actualiza la vista</h3><p>replaceChildren() limpia las filas anteriores. Ejecuta cargarTabla() después de guardar, editar o eliminar.</p></div></div>
    <div class="memory"><span>PARA RECORDAR</span><code>fetch → response.json() → for...of → tr + td → tbody</code></div><p class="inline-note">Carga el script con defer o al final del body. Copia también listarEstudiantes() de GET. Bootstrap solo cambia la apariencia: no hace la petición ni crea las filas.</p><a class="button" href="#demo">Ver una tabla en acción →</a>`;
}
function demoPage() {
  return `${heading('PRÁCTICA','Prueba el recorrido.','Crea, edita, cambia el estado y elimina estudiantes para entender cada método.','07')}
    <div class="memory"><span>DEMO LOCAL</span><code>Datos ficticios en memoria · no llama a PHP ni PostgreSQL</code></div>
    <div class="demo-heading"><h2>Estudiantes</h2><button class="button secondary" id="reset-demo">Restablecer datos</button></div>
    <form class="demo-form" id="demo-form"><label>Nombre<input name="first_name" id="demo-name" required maxlength="80" placeholder="Ej. Diego Arias" autocomplete="off"></label><label>Correo<input name="email" id="demo-email" type="email" required maxlength="160" placeholder="diego@example.com" autocomplete="off"></label><button class="button" id="demo-submit" type="submit">Crear · POST</button><button class="button secondary" id="cancel-edit" type="button" hidden>Cancelar edición</button></form>
    <p class="demo-hint">Editar → PUT &nbsp; · &nbsp; Cambiar estado → PATCH &nbsp; · &nbsp; Eliminar → DELETE</p>
    <div class="table-wrapper"><table><thead><tr><th>ID</th><th>NOMBRE</th><th>CORREO</th><th>ESTADO</th><th>ACCIONES</th></tr></thead><tbody id="demo-body"></tbody></table></div>
    <div class="demo-log" id="demo-log" aria-live="polite"></div><p class="demo-hint">Los cambios se conservan al navegar por la guía. Al recargar el HTML, vuelven los datos iniciales.</p>`;
}
function errorsPage() {
  const errors = [
    ['Unexpected token < al leer JSON','PHP respondió HTML: puede ser una advertencia, una página 404 o un error del servidor. Mira la pestaña Network del navegador y el cuerpo de la respuesta. No imprimas HTML ni mensajes de depuración antes del JSON.'],
    ['$_POST está vacío con PUT, PATCH o DELETE','En estos ejemplos el cuerpo es JSON. Se lee con file_get_contents("php://input") y se decodifica con json_decode(). $_POST se usa para el POST con FormData.'],
    ['400 / 415 / 422: datos incorrectos','400 indica JSON inválido; 415, Content-Type incorrecto; 422, campos inválidos o faltantes. Envía activo como true o false, no como "true" o "false".'],
    ['404: no existe el estudiante o la ruta','Verifica la ruta api/archivo.php. Si PHP devuelve el JSON "Estudiante no encontrado", la ruta sí funciona, pero ese id no existe en la base.'],
    ['405: método no permitido','Cada endpoint espera su método. Abrir guardar.php desde la barra del navegador hace GET; para POST debes usar fetch() con method: "POST".'],
    ['500 / could not find driver','Revisa el registro del servidor, activa pdo_pgsql en el PHP que realmente ejecutas y reinícialo. Verifica DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASSWORD, y que PostgreSQL esté iniciado.'],
    ['La tabla no cambia después de guardar','Espera await guardarEstudiante(...), luego await cargarTabla(). Si llamas ambas funciones sin await, el GET puede ocurrir antes de terminar el INSERT.'],
    ['FormData no llega a PHP','No asignes manualmente Content-Type: multipart/form-data. El navegador agrega el boundary. Los nombres usados en append() deben coincidir con las claves de $_POST.'],
    ['fetch() no entra al catch en un error HTTP','fetch() puede resolver aunque el servidor responda 404 o 500. Comprueba response.ok y lanza un Error. El catch también captura problemas de red y JSON inválido.'],
    ['GitHub muestra la guía, pero no ejecuta PHP','GitHub guarda el código; GitHub Pages sirve archivos estáticos. La guía funciona allí, pero los endpoints PHP requieren un servidor PHP con PostgreSQL.'],
  ];
  return `${heading('AYUDA','Resolver rápido.','El síntoma, la causa probable y el siguiente paso para seguir con la prueba.','08')}<div class="error-list">${errors.map((e,i)=>`<details ${i===0?'open':''}><summary>${esc(e[0])}</summary><p>${esc(e[1])}</p></details>`).join('')}</div><div class="memory"><span>REVISA EN ESTE ORDEN</span><code>URL → método → cuerpo → respuesta → SQL</code></div>`;
}
function render() {
  const requested = location.hash.slice(1).toLowerCase();
  const key = [...Object.keys(guide.methods),'setup','table','demo','errors'].includes(requested) ? requested : 'get';
  snippets.clear();
  document.querySelectorAll('[data-page]').forEach(a => {
    const active = a.dataset.page === key;
    a.classList.toggle('active',active);
    if(active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });
  workspace.innerHTML = guide.methods[key] ? methodPage(key) : ({setup:setupPage,table:tablePage,demo:demoPage,errors:errorsPage})[key]();
  workspace.classList.remove('page-enter');
  void workspace.offsetWidth;
  workspace.classList.add('page-enter');
  document.title = `${guide.methods[key]?.method || {setup:'Conexión y SQL',table:'Tabla',demo:'Demo',errors:'Errores'}[key]} / CRUD Manual`;
  if(key === 'demo') { renderStudents(); bindDemo(); }
}
function showToast(message) {
  const el = document.getElementById('toast');
  clearTimeout(toastTimer);el.textContent = message;el.classList.add('visible');
  toastTimer = setTimeout(()=>el.classList.remove('visible'),2400);
}
async function copy(text,button) {
  let copied = false;
  try { if(navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); copied = true; } } catch (_) { /* Fallback para file://. */ }
  if(!copied) {
    const area = document.createElement('textarea');area.value = text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();
    copied = document.execCommand('copy');area.remove();button?.focus();
  }
  showToast(copied ? 'Código copiado al portapapeles' : 'Selecciona el código y usa Ctrl + C');
  if(copied && button?.classList.contains('copy-button')) { const span=button.querySelector('span');span.textContent='Copiado ✓';setTimeout(()=>{if(span.isConnected)span.textContent='Copiar';},1800); }
}
function renderStudents(method='GET',payload=null) {
  const body=document.getElementById('demo-body');if(!body)return;
  body.replaceChildren();
  if(!students.length) { const row=body.insertRow(), cell=row.insertCell();cell.colSpan=5;cell.textContent='No hay estudiantes. Crea el primero con el formulario.'; }
  students.forEach(s=>{
    const row=body.insertRow();
    [s.id,s.first_name,s.email].forEach(value=>{row.insertCell().textContent=value;});
    const state=document.createElement('span');state.className='state-label'+(s.activo?' on':'');state.textContent=s.activo?'● Activo':'○ Inactivo';row.insertCell().append(state);
    const actions=document.createElement('div');actions.className='row-actions';
    [['edit','Editar'],['toggle',s.activo?'Desactivar':'Activar'],['delete','Eliminar']].forEach(([action,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.action=action;b.dataset.id=s.id;b.setAttribute('aria-label',`${label} a ${s.first_name}`);actions.append(b);});
    row.insertCell().append(actions);
  });
  const status=method==='POST'?'201 Created':'200 OK';
  document.getElementById('demo-log').textContent=`SIMULACIÓN · ${method} → ${status}\n${payload ? 'Cuerpo: '+JSON.stringify(payload)+'\n' : ''}Tabla: ${students.length} estudiante${students.length===1?'':'s'} · Renderizado actualizado`;
}
function cancelEdit() { editingId=null;document.getElementById('demo-form').reset();document.getElementById('demo-submit').textContent='Crear · POST';document.getElementById('cancel-edit').hidden=true; }
function bindDemo() {
  document.getElementById('demo-form').addEventListener('submit',e=>{
    e.preventDefault();const name=document.getElementById('demo-name').value.trim();const email=document.getElementById('demo-email').value.trim();if(!name){showToast('Escribe un nombre');return;}
    let payload, method;
    if(editingId !== null){const s=students.find(x=>x.id===editingId);if(!s){cancelEdit();return;}s.first_name=name;s.email=email;payload={...s};method='PUT';}
    else{payload={id:nextId++,first_name:name,email,activo:true};students.push(payload);method='POST';}
    cancelEdit();renderStudents(method,payload);
  });
  document.getElementById('cancel-edit').addEventListener('click',cancelEdit);
  document.getElementById('reset-demo').addEventListener('click',()=>{students=[{id:1,first_name:'Ana Torres',email:'ana@example.com',activo:true},{id:2,first_name:'Carlos Ruiz',email:'carlos@example.com',activo:true},{id:3,first_name:'Laura Díaz',email:'laura@example.com',activo:false}];nextId=4;cancelEdit();renderStudents();showToast('Datos iniciales restaurados');});
  document.getElementById('demo-body').addEventListener('click',e=>{
    const b=e.target.closest('[data-action]');if(!b)return;const s=students.find(x=>x.id===Number(b.dataset.id));if(!s)return;
    if(b.dataset.action==='edit'){editingId=s.id;document.getElementById('demo-name').value=s.first_name;document.getElementById('demo-email').value=s.email;document.getElementById('demo-submit').textContent='Guardar cambios · PUT';document.getElementById('cancel-edit').hidden=false;document.getElementById('demo-name').focus();}
    if(b.dataset.action==='toggle'){s.activo=!s.activo;renderStudents('PATCH',{id:s.id,activo:s.activo});}
    if(b.dataset.action==='delete' && confirm(`¿Eliminar a ${s.first_name} de la demo?`)){students=students.filter(x=>x.id!==s.id);if(editingId===s.id)cancelEdit();renderStudents('DELETE',{id:s.id});}
  });
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-copy],[data-copy-pair]');if(!b)return;if(b.dataset.copy)copy(snippets.get(b.dataset.copy),b);else{const m=guide.methods[b.dataset.copyPair];copy(`// ARCHIVO PHP: ${m.endpoint}\n${m.php}\n\n// ARCHIVO JAVASCRIPT (guardar por separado):\n${m.js}`,b);}});
const search=document.getElementById('search');
search.addEventListener('input',()=>{
  const query=search.value.toLocaleLowerCase('es');let count=0;
  document.querySelectorAll('[data-page]').forEach(a=>{const m=guide.methods[a.dataset.page];const content=a.textContent+' '+(m?JSON.stringify(m):({setup:'conexión SQL base PDO helpers preparar',table:'tabla renderizar tbody frontend',demo:'demo práctica interactiva',errors:'error 400 404 405 415 422 500 JSON driver fetch'}[a.dataset.page]));a.hidden=!content.toLocaleLowerCase('es').includes(query);if(!a.hidden)count++;});
  document.getElementById('search-empty').hidden=count!==0;
});
document.addEventListener('keydown',e=>{if(e.key==='/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){e.preventDefault();search.focus();}if(e.key==='Escape' && document.activeElement===search){search.value='';search.dispatchEvent(new Event('input'));search.blur();}});
window.addEventListener('hashchange',()=>{render();window.scrollTo({top:0,behavior:'instant'});});
render();
