let token=localStorage.getItem('dd_token')||'';
let settings={};
let menuDraft={groups:[],mobileLinks:[]};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));

const FONT_OPTIONS=[
  ['Arial','Arial, Helvetica, sans-serif'],['Arial Black','"Arial Black", Arial, sans-serif'],['Arial Narrow','"Arial Narrow", Arial, sans-serif'],
  ['Helvetica','Helvetica, Arial, sans-serif'],['Verdana','Verdana, Geneva, sans-serif'],['Tahoma','Tahoma, Geneva, sans-serif'],
  ['Trebuchet MS','"Trebuchet MS", Arial, sans-serif'],['Segoe UI','"Segoe UI", Arial, sans-serif'],['Calibri','Calibri, Arial, sans-serif'],
  ['Candara','Candara, Arial, sans-serif'],['Corbel','Corbel, Arial, sans-serif'],['Century Gothic','"Century Gothic", Arial, sans-serif'],
  ['Franklin Gothic Medium','"Franklin Gothic Medium", Arial, sans-serif'],['Gill Sans','"Gill Sans", "Gill Sans MT", Arial, sans-serif'],['Futura','Futura, "Trebuchet MS", Arial, sans-serif'],
  ['Avenir','Avenir, "Segoe UI", Arial, sans-serif'],['Optima','Optima, "Segoe UI", Arial, sans-serif'],['Bahnschrift','Bahnschrift, "Arial Narrow", Arial, sans-serif'],
  ['Agency FB','"Agency FB", "Arial Narrow", Arial, sans-serif'],['Berlin Sans FB','"Berlin Sans FB", Arial, sans-serif'],['Eras ITC','"Eras ITC", Arial, sans-serif'],
  ['Impact','Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif'],['Haettenschweiler','Haettenschweiler, Impact, sans-serif'],['Oswald','"DD Oswald", Oswald, "Arial Narrow", Arial, sans-serif'],
  ['Benzin Regular','"Benzin Regular", "Benzin-Regular", "Century Gothic", Arial, sans-serif'],['Benzin Semibold','"Benzin Semibold", "Benzin-Semibold", "Arial Black", Arial, sans-serif'],
  ['Georgia','Georgia, "Times New Roman", serif'],['Times New Roman','"Times New Roman", Times, serif'],['Cambria','Cambria, Georgia, serif'],
  ['Constantia','Constantia, Georgia, serif'],['Garamond','Garamond, Georgia, serif'],['Palatino Linotype','"Palatino Linotype", Palatino, serif'],
  ['Book Antiqua','"Book Antiqua", Palatino, serif'],['Baskerville','Baskerville, Georgia, serif'],['Didot','Didot, Georgia, serif'],
  ['Bodoni MT','"Bodoni MT", Didot, serif'],['Bookman Old Style','"Bookman Old Style", Georgia, serif'],['Goudy Old Style','"Goudy Old Style", Georgia, serif'],
  ['High Tower Text','"High Tower Text", Georgia, serif'],['Perpetua','Perpetua, Georgia, serif'],['Footlight MT Light','"Footlight MT Light", Georgia, serif'],
  ['Imprint MT Shadow','"Imprint MT Shadow", Georgia, serif'],['Rockwell','Rockwell, "Courier New", serif'],['Copperplate Gothic','"Copperplate Gothic Light", Copperplate, serif'],
  ['Courier New','"Courier New", Courier, monospace'],['Lucida Console','"Lucida Console", Monaco, monospace'],['Lucida Sans Typewriter','"Lucida Sans Typewriter", "Lucida Console", monospace'],
  ['Consolas','Consolas, "Courier New", monospace'],['Cascadia Mono','"Cascadia Mono", Consolas, monospace'],['Monaco','Monaco, Consolas, monospace'],
  ['Lucida Sans Unicode','"Lucida Sans Unicode", "Lucida Grande", sans-serif'],['Lucida Bright','"Lucida Bright", Georgia, serif'],['Tw Cen MT','"Tw Cen MT", Arial, sans-serif'],
  ['Yu Gothic','"Yu Gothic", "Segoe UI", sans-serif'],['Meiryo','Meiryo, "Segoe UI", sans-serif'],['MS Gothic','"MS Gothic", monospace'],
  ['Comic Sans MS','"Comic Sans MS", cursive'],['Brush Script MT','"Brush Script MT", cursive'],['Segoe Script','"Segoe Script", cursive'],
  ['Segoe Print','"Segoe Print", cursive'],['Papyrus','Papyrus, fantasy'],['Copperplate','Copperplate, fantasy']
];
const DEFAULT_MENU_CONFIG={
  groups:[
    {id:'shop',labelEn:'SHOP',labelRu:'МАГАЗИН',href:'/shop.html',enabled:true,mobileShowMain:false,mobileDarkLabel:false,items:[
      {id:'shop-all',labelEn:'SHOP ALL',labelRu:'ВСЕ ТОВАРЫ',href:'/shop.html',enabled:true,showMobile:true},
      {id:'jackets',labelEn:'JACKETS & COATS',labelRu:'КУРТКИ И ПАЛЬТО',href:'/shop.html?category=jackets-coats',enabled:true,showMobile:true},
      {id:'jeans',labelEn:'JEANS, PANTS & SHORTS',labelRu:'ДЖИНСЫ, БРЮКИ И ШОРТЫ',href:'/shop.html?category=jeans-pants-shorts',enabled:true,showMobile:true},
      {id:'tops',labelEn:'TOPS',labelRu:'ВЕРХ',href:'/shop.html?category=tops',enabled:true,showMobile:true},
      {id:'bags',labelEn:'BAGS & ACCESSORIES',labelRu:'СУМКИ И АКСЕССУАРЫ',href:'/shop.html?category=bags-accessories',enabled:true,showMobile:true}
    ]},
    {id:'login',labelEn:'LOGIN',labelRu:'ВХОД',href:'/login.html',enabled:true,mobileShowMain:true,mobileDarkLabel:true,items:[
      {id:'cart',labelEn:'CART',labelRu:'КОРЗИНА',href:'/cart.html',enabled:true,showMobile:true},
      {id:'register',labelEn:'REGISTER',labelRu:'РЕГИСТРАЦИЯ',href:'/login.html#register',enabled:true,showMobile:true},
      {id:'account',labelEn:'ACCOUNT',labelRu:'АККАУНТ',href:'/login.html',enabled:true,showMobile:false},
      {id:'about-login',labelEn:'ABOUT',labelRu:'О НАС',href:'/about.html',enabled:true,showMobile:false,separatorBefore:true},
      {id:'services',labelEn:'CLIENT SERVICES',labelRu:'КЛИЕНТСКИЙ СЕРВИС',href:'mailto:{{contact}}',enabled:true,showMobile:false}
    ]}
  ],
  mobileLinks:[
    {id:'gallery',labelEn:'GALLERY',labelRu:'ГАЛЕРЕЯ',href:'/gallery.html',enabled:true},
    {id:'about',labelEn:'ABOUT',labelRu:'О НАС',href:'/about.html',enabled:true}
  ]
};
const clone=value=>JSON.parse(JSON.stringify(value));
const uid=prefix=>`${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;

const authHeaders=()=>({'Authorization':`Bearer ${token}`});
function showNotice(message,type='ok',target='#globalNotice'){
  const el=$(target);if(!el)return;el.textContent=message;el.className=`notice show ${type}`;
  clearTimeout(el._timer);el._timer=setTimeout(()=>{el.className='notice'},3200);
}
async function api(url,opt={}){
  opt.headers={...(opt.headers||{}),...authHeaders()};
  if(opt.body&&!opt.headers['Content-Type'])opt.headers['Content-Type']='application/json';
  const r=await fetch(url,opt);const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||'Не удалось выполнить запрос');return data;
}
function clampPercent(value,fallback=35){const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):fallback}
function clampNumber(value,min,max,fallback=0){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback}
function cssImage(url){return url?`url(${JSON.stringify(String(url))})`:'none'}
function setBusy(busy){$$('.primary-btn').forEach(b=>{if(b.id==='saveTop'||b.type==='submit')b.disabled=busy})}
function showLogin(message=''){ $('#adminView').hidden=true;$('#loginView').style.display='grid';if(message)showNotice(message,'error','#loginNotice') }
function populateFonts(){
  $$('.font-select').forEach(select=>{
    const current=select.value;select.innerHTML=`<option value="">${esc(select.dataset.defaultLabel||'Текущий дизайн')}</option>`+FONT_OPTIONS.map(([name,value])=>`<option value="${esc(value)}">${esc(name)}</option>`).join('');
    if(current)select.value=current;
  });
  $$('.weight-select').forEach(select=>{select.innerHTML=`<option value="">Текущий дизайн</option>${[100,200,300,400,500,600,700,800,900].map(v=>`<option value="${v}">${v}${v===400?' — обычный':''}${v===700?' — жирный':''}</option>`).join('')}`});
}
populateFonts();

async function boot(){
  if(!token)return showLogin();
  try{
    const me=await api('/api/auth/me');
    if(me.user.role!=='admin')throw new Error('Доступ разрешён только администратору');
    $('#adminUser').textContent=me.user.email;$('#loginView').style.display='none';$('#adminView').hidden=false;
    const state=await api('/api/admin/state');settings=state.settings||{};fillForm();
  }catch(e){token='';localStorage.removeItem('dd_token');showLogin(e.message)}
}
$('#adminLogin').addEventListener('submit',async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  try{
    const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Не удалось войти');
    if(data.user?.role!=='admin')throw new Error('У этой учётной записи нет прав администратора');
    token=data.token;localStorage.setItem('dd_token',token);await boot();
  }catch(err){showNotice(err.message,'error','#loginNotice')}
});
$('#adminLogout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'})}catch{}token='';localStorage.removeItem('dd_token');location.reload()});

function normalizeMenu(raw){
  const d=clone(DEFAULT_MENU_CONFIG);if(!raw||typeof raw!=='object')return d;
  return {
    groups:Array.isArray(raw.groups)?raw.groups.map((g,i)=>({...d.groups[i],...g,items:Array.isArray(g.items)?g.items.map((x,j)=>({...((d.groups[i]?.items||[])[j]||{}),...x})):clone(d.groups[i]?.items||[])})):d.groups,
    mobileLinks:Array.isArray(raw.mobileLinks)?raw.mobileLinks.map((x,i)=>({...d.mobileLinks[i],...x})):d.mobileLinks
  };
}
function selectValue(select,value){
  if(!select)return;const exists=[...select.options].some(o=>o.value===value);
  if(!exists&&value){const o=document.createElement('option');o.value=value;o.textContent=`Сохранённый шрифт: ${value}`;select.appendChild(o)}
  select.value=value||'';
}
function fillForm(){
  const desktopOverlay=clampPercent(settings.homeDesktopOverlayOpacity,clampPercent(settings.homeOverlayOpacity,35));
  const mobileOverlay=clampPercent(settings.homeMobileOverlayOpacity,clampPercent(settings.homeOverlayOpacity,35));
  $('#heroDesktop').value=settings.heroDesktop||'/assets/images/hero.jpg';$('#heroMobile').value=settings.heroMobile||'/assets/images/hero-mobile.jpg';
  $('#homeDesktopOverlayOpacity').value=desktopOverlay;$('#desktopOverlayRange').value=desktopOverlay;$('#homeMobileOverlayOpacity').value=mobileOverlay;$('#mobileOverlayRange').value=mobileOverlay;
  selectValue($('#homeDesktopFont'),settings.homeDesktopFont||'');selectValue($('#homeMobileFont'),settings.homeMobileFont||'');
  selectValue($('#menuDesktopFont'),settings.menuDesktopFont||'');selectValue($('#menuMobileFont'),settings.menuMobileFont||'');
  $('#menuDesktopFontSize').value=settings.menuDesktopFontSize||'';$('#menuMobileFontSize').value=settings.menuMobileFontSize||'';
  selectValue($('#menuDesktopFontWeight'),settings.menuDesktopFontWeight?String(settings.menuDesktopFontWeight):'');selectValue($('#menuMobileFontWeight'),settings.menuMobileFontWeight?String(settings.menuMobileFontWeight):'');
  const color=/^#[0-9a-f]{6}$/i.test(String(settings.menuUnderlineColor||''))?settings.menuUnderlineColor:'#ffffff';$('#menuUnderlineColor').value=color;$('#menuUnderlineColorText').value=color;
  menuDraft=normalizeMenu(settings.menuConfig);renderMenuEditor();updatePreview();
}
function updatePreview(){
  const dImg=$('#heroDesktop').value.trim(),mImg=$('#heroMobile').value.trim();$('#desktopPreview').style.backgroundImage=cssImage(dImg);$('#mobilePreview').style.backgroundImage=cssImage(mImg);
  const d=clampPercent($('#homeDesktopOverlayOpacity').value,35),m=clampPercent($('#homeMobileOverlayOpacity').value,35);$('#desktopPreviewOverlay').style.background=`rgba(0,0,0,${d/100})`;$('#mobilePreviewOverlay').style.background=`rgba(0,0,0,${m/100})`;
  const df=$('#homeDesktopFont').value,mf=$('#homeMobileFont').value;$('#desktopPreview').style.fontFamily=df||'';$('#desktopFontSample').style.fontFamily=df||'';$('#mobilePreview').style.fontFamily=mf||'';$('#mobileFontSample').style.fontFamily=mf||'';
  const shop=menuDraft.groups.find(g=>g.id==='shop')||menuDraft.groups[0],login=menuDraft.groups.find(g=>g.id==='login')||menuDraft.groups[1];
  const labels=$$('#desktopPreview .preview-menu span');if(labels[0])labels[0].textContent=shop?.labelEn||'SHOP';if(labels[1])labels[1].textContent=login?.labelEn||'LOGIN';
}
function syncRange(rangeId,numberId){const range=$(rangeId),num=$(numberId);range.addEventListener('input',()=>{num.value=range.value;updatePreview()});num.addEventListener('input',()=>{const v=clampPercent(num.value,35);range.value=v;updatePreview()})}
syncRange('#desktopOverlayRange','#homeDesktopOverlayOpacity');syncRange('#mobileOverlayRange','#homeMobileOverlayOpacity');
['#heroDesktop','#heroMobile','#homeDesktopFont','#homeMobileFont'].forEach(id=>$(id).addEventListener('input',updatePreview));

async function uploadImage(file,targetName){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const out=await api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});const input=$(`#${targetName}`);input.value=out.url;updatePreview();
}
$$('[data-upload-target]').forEach(input=>input.addEventListener('change',async()=>{
  const file=input.files?.[0];if(!file)return;
  try{input.disabled=true;await uploadImage(file,input.dataset.uploadTarget);showNotice('Фон загружен. Нажмите «Сохранить», чтобы применить изменения.')}catch(e){showNotice(e.message,'error')}finally{input.disabled=false;input.value=''}
}));

function inputField(label,value,attrs=''){return `<label class="field"><span>${esc(label)}</span><input ${attrs} value="${esc(value||'')}"></label>`}
function renderMenuEditor(){
  const groups=$('#menuGroupsEditor');
  groups.innerHTML=menuDraft.groups.map((g,gi)=>`<article class="menu-group-card" data-group-index="${gi}">
    <div class="menu-group-top"><strong>Основной пункт ${gi+1}</strong><button class="danger-link" type="button" data-action="delete-group">Удалить основной пункт</button></div>
    <div class="menu-group-fields">
      ${inputField('Название EN',g.labelEn,'data-field="labelEn"')}${inputField('Название RU',g.labelRu,'data-field="labelRu"')}${inputField('Ссылка',g.href,'data-field="href"')}
    </div>
    <div class="check-grid">
      <label class="check-control"><input type="checkbox" data-field="enabled" ${g.enabled!==false?'checked':''}> Показывать пункт</label>
      <label class="check-control"><input type="checkbox" data-field="mobileShowMain" ${g.mobileShowMain?'checked':''}> Показывать название основного пункта на телефоне</label>
    </div>
    <div class="subitems-head"><strong>Подпункты</strong><button class="secondary-btn small" type="button" data-action="add-subitem">+ Добавить подпункт</button></div>
    <div class="subitems-list">${(g.items||[]).map((item,ii)=>renderSubitem(item,ii)).join('')}</div>
  </article>`).join('');
  $('#mobileLinksEditor').innerHTML=menuDraft.mobileLinks.map((item,i)=>`<div class="mobile-link-row" data-mobile-index="${i}">
    ${inputField('Название EN',item.labelEn,'data-field="labelEn"')}${inputField('Название RU',item.labelRu,'data-field="labelRu"')}${inputField('Ссылка',item.href,'data-field="href"')}
    <label class="check-control compact"><input type="checkbox" data-field="enabled" ${item.enabled!==false?'checked':''}> Показывать</label>
    <button class="danger-link" type="button" data-action="delete-mobile-link">Удалить</button>
  </div>`).join('');
  updatePreview();
}
function renderSubitem(item,ii){return `<div class="subitem-row" data-item-index="${ii}">
  ${inputField('Название EN',item.labelEn,'data-field="labelEn"')}${inputField('Название RU',item.labelRu,'data-field="labelRu"')}${inputField('Ссылка',item.href,'data-field="href"')}
  <div class="subitem-checks"><label class="check-control compact"><input type="checkbox" data-field="enabled" ${item.enabled!==false?'checked':''}> Показывать</label><label class="check-control compact"><input type="checkbox" data-field="showMobile" ${item.showMobile!==false?'checked':''}> На телефоне</label><label class="check-control compact"><input type="checkbox" data-field="separatorBefore" ${item.separatorBefore?'checked':''}> Отступ перед пунктом</label></div>
  <button class="danger-link" type="button" data-action="delete-subitem">Удалить</button>
</div>`}
function updateDraftFromInput(target){
  const groupCard=target.closest('[data-group-index]'),mobileRow=target.closest('[data-mobile-index]');const field=target.dataset.field;if(!field)return;
  const value=target.type==='checkbox'?target.checked:target.value;
  if(groupCard){const gi=Number(groupCard.dataset.groupIndex),itemRow=target.closest('[data-item-index]');if(itemRow){const ii=Number(itemRow.dataset.itemIndex);menuDraft.groups[gi].items[ii][field]=value}else menuDraft.groups[gi][field]=value}
  else if(mobileRow){menuDraft.mobileLinks[Number(mobileRow.dataset.mobileIndex)][field]=value}
  updatePreview();
}
$('#menuGroupsEditor').addEventListener('input',e=>updateDraftFromInput(e.target));$('#menuGroupsEditor').addEventListener('change',e=>updateDraftFromInput(e.target));
$('#mobileLinksEditor').addEventListener('input',e=>updateDraftFromInput(e.target));$('#mobileLinksEditor').addEventListener('change',e=>updateDraftFromInput(e.target));
$('#menuGroupsEditor').addEventListener('click',e=>{
  const action=e.target.dataset.action;if(!action)return;const card=e.target.closest('[data-group-index]');if(!card)return;const gi=Number(card.dataset.groupIndex);
  if(action==='delete-group'){if(!confirm('Удалить этот основной пункт вместе со всеми подпунктами?'))return;menuDraft.groups.splice(gi,1);renderMenuEditor()}
  if(action==='add-subitem'){menuDraft.groups[gi].items=menuDraft.groups[gi].items||[];menuDraft.groups[gi].items.push({id:uid('item'),labelEn:'NEW ITEM',labelRu:'НОВЫЙ ПУНКТ',href:'#',enabled:true,showMobile:true});renderMenuEditor()}
  if(action==='delete-subitem'){const row=e.target.closest('[data-item-index]');if(!row)return;menuDraft.groups[gi].items.splice(Number(row.dataset.itemIndex),1);renderMenuEditor()}
});
$('#mobileLinksEditor').addEventListener('click',e=>{if(e.target.dataset.action!=='delete-mobile-link')return;const row=e.target.closest('[data-mobile-index]');if(!row)return;menuDraft.mobileLinks.splice(Number(row.dataset.mobileIndex),1);renderMenuEditor()});
$('#addMenuGroup').addEventListener('click',()=>{menuDraft.groups.push({id:uid('group'),labelEn:'MENU',labelRu:'МЕНЮ',href:'#',enabled:true,mobileShowMain:true,mobileDarkLabel:false,items:[]});renderMenuEditor()});
$('#addMobileLink').addEventListener('click',()=>{menuDraft.mobileLinks.push({id:uid('link'),labelEn:'NEW LINK',labelRu:'НОВЫЙ ПУНКТ',href:'#',enabled:true});renderMenuEditor()});

$('#menuUnderlineColor').addEventListener('input',()=>{$('#menuUnderlineColorText').value=$('#menuUnderlineColor').value});
$('#menuUnderlineColorText').addEventListener('input',()=>{const v=$('#menuUnderlineColorText').value.trim();if(/^#[0-9a-f]{6}$/i.test(v))$('#menuUnderlineColor').value=v});

function payload(){
  const desktop=clampPercent($('#homeDesktopOverlayOpacity').value,35),mobile=clampPercent($('#homeMobileOverlayOpacity').value,35);
  const menuDesktopSize=$('#menuDesktopFontSize').value?clampNumber($('#menuDesktopFontSize').value,8,80,0):0;
  const menuMobileSize=$('#menuMobileFontSize').value?clampNumber($('#menuMobileFontSize').value,8,80,0):0;
  const color=$('#menuUnderlineColorText').value.trim();
  return {
    heroDesktop:$('#heroDesktop').value.trim()||'/assets/images/hero.jpg',heroMobile:$('#heroMobile').value.trim()||'/assets/images/hero-mobile.jpg',
    homeDesktopOverlayOpacity:desktop,homeMobileOverlayOpacity:mobile,homeDesktopFont:$('#homeDesktopFont').value,homeMobileFont:$('#homeMobileFont').value,homeOverlayOpacity:mobile,
    menuDesktopFont:$('#menuDesktopFont').value,menuMobileFont:$('#menuMobileFont').value,menuDesktopFontSize:menuDesktopSize,menuMobileFontSize:menuMobileSize,
    menuDesktopFontWeight:$('#menuDesktopFontWeight').value?Number($('#menuDesktopFontWeight').value):0,menuMobileFontWeight:$('#menuMobileFontWeight').value?Number($('#menuMobileFontWeight').value):0,
    menuUnderlineColor:/^#[0-9a-f]{6}$/i.test(color)?color:'#ffffff',menuConfig:clone(menuDraft)
  };
}
async function save(){
  try{setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(payload())});fillForm();showNotice('Изменения сохранены.')}catch(e){showNotice(e.message,'error')}finally{setBusy(false)}
}
$('#homeSettingsForm').addEventListener('submit',async e=>{e.preventDefault();await save()});$('#saveTop').addEventListener('click',save);
boot();
