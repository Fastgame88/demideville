let token='';
let settings={};
let menuDraft={groups:[],mobileLinks:[]};
let adminState={};
let productsDraft=[];
let shopCategoriesDraft=[];
let currentAdminTab='home';
let galleryDraft=[];
let productImagesDraft=[];
let productSizesDraft=[];
let paymentMethodsDraft=[];
const DEFAULT_ABOUT_EN='About <strong>DEMI DEVILLE</strong> is a <em>PIONEERING DESIGN STUDIO BASED</em> in Paris, specializing in fashion, spatial design, and visual direction. <em>Established by Augustine</em> Oh &amp; Jude Lee, the <strong>studio redefines traditional</strong> design frameworks through methods of deconstruction, expansion, and reduction. <strong>By merging</strong> high fashion with a <strong>progressive design</strong> philosophy, DEMI DEVILLE delivers innovative, high-quality work that challenges visual conventions. <strong>The studio collaborates with a wide range of celebrities,</strong> artists, and brands, offering fresh design experiences that resonate with forward-thinking audiences around the world.';
const DEFAULT_ABOUT_RU='DEMI DEVILLE — новаторская студия дизайна из Парижа. Мы работаем с модой, пространством и визуальным стилем. Основатели студии, Огюстин О и Джуд Ли, по-новому смотрят на привычные правила дизайна: разбирают формы, расширяют возможности и убирают лишнее. Мы объединяем высокую моду с современным подходом, создаём качественные проекты и сотрудничаем с артистами, брендами и творческими людьми по всему миру.';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
const adminMoney=(v,s='$')=>`${Number(v||0).toFixed(Number(v)%1?2:0)}${s}`;
const mediaIsVideo=url=>/\.(mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(String(url||''));

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
const DEFAULT_SHOP_CATEGORIES=[
  {id:'jackets-coats',slug:'jackets-coats',labelEn:'JACKETS & COATS',labelRu:'КУРТКИ И ПАЛЬТО',enabled:true,showInMenu:true},
  {id:'jeans-pants-shorts',slug:'jeans-pants-shorts',labelEn:'JEANS, PANTS & SHORTS',labelRu:'ДЖИНСЫ, БРЮКИ И ШОРТЫ',enabled:true,showInMenu:true},
  {id:'tops',slug:'tops',labelEn:'TOPS',labelRu:'ВЕРХ',enabled:true,showInMenu:true},
  {id:'bags-accessories',slug:'bags-accessories',labelEn:'BAGS & ACCESSORIES',labelRu:'СУМКИ И АКСЕССУАРЫ',enabled:true,showInMenu:true}
];
const LEGACY_PRODUCT_CATEGORIES={
  'invitation-tshirt':['tops'],
  'human-uniform':['tops'],
  'lobby-hoody':['jackets-coats'],
  'inside-jeans':['jeans-pants-shorts']
};
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
      {id:'account',labelEn:'ACCOUNT',labelRu:'АККАУНТ',href:'/account.html',enabled:true,showMobile:false},
      {id:'about-login',labelEn:'ABOUT',labelRu:'О НАС',href:'/about.html',enabled:true,showMobile:false,separatorBefore:true},
      {id:'services',labelEn:'CLIENT SERVICES',labelRu:'КЛИЕНТСКИЙ СЕРВИС',href:'/contact.html',enabled:true,showMobile:false}
    ]}
  ],
  mobileLinks:[
    {id:'gallery',labelEn:'GALLERY',labelRu:'ГАЛЕРЕЯ',href:'/gallery.html',enabled:true},
    {id:'about',labelEn:'ABOUT',labelRu:'О НАС',href:'/about.html',enabled:true}
  ]
};
const DEFAULT_PAYMENT_METHODS=[
  {id:'paypal',labelEn:'PayPal',labelRu:'PayPal',enabled:true},
  {id:'applepay',labelEn:'ApplePay',labelRu:'ApplePay',enabled:true},
  {id:'googlepay',labelEn:'GooglePay',labelRu:'GooglePay',enabled:true},
  {id:'crypto',labelEn:'Crypto payment',labelRu:'Оплата криптовалютой',enabled:true},
  {id:'card',labelEn:'Card payment',labelRu:'Оплата картой',enabled:true}
];
const DEFAULT_COUNTRIES=['Albania','Andorra','Armenia','Austria','Azerbaijan','Belgium','Bosnia and Herzegovina','Bulgaria','Croatia','Cyprus','Czechia','Denmark','Estonia','Finland','France','Georgia','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kazakhstan','Kosovo','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Moldova','Monaco','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','San Marino','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Ukraine','United Kingdom','Vatican City'];
const PAGE_BACKGROUND_DEFS=[
  ['home','Главная'],['shop','SHOP'],['product','Карточка товара'],['gallery','Галерея'],['about','ABOUT'],['login','LOGIN / регистрация'],['cart','Корзина'],['checkout','Оплата'],['account','Аккаунт'],['contact','Контакты'],['terms','Terms & Conditions'],['privacy','Privacy Policy']
];
const RESPONSIVE_PAGE_BACKGROUND_KEYS=new Set(['shop','login','cart','checkout']);
const DEFAULT_SUPPORT_SETTINGS={
  supportButtonTextEn:'SUPPORT',supportButtonTextRu:'ПОДДЕРЖКА',
  supportGreetingEn:'Thanks for stopping by! How can I help you?',supportGreetingRu:'Спасибо, что заглянули! Чем я могу помочь?',
  supportEmailPlaceholderEn:'YOUR EMAIL',supportEmailPlaceholderRu:'ВАША ПОЧТА',
  supportMessagePlaceholderEn:'HOW CAN WE HELP?',supportMessagePlaceholderRu:'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',
  supportSendTextEn:'SEND',supportSendTextRu:'ОТПРАВИТЬ',
  supportBackgroundImage:'/assets/images/support-cross-pattern.png',supportButtonBg:'#000000',supportButtonColor:'#ffffff',
  supportFieldBg:'#000000',supportFieldColor:'#ffffff',supportButtonFont:'',supportWindowFont:''
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
function showLogin(message=''){const admin=$('#adminView'),login=$('#loginView');if(admin)admin.hidden=true;if(login){login.hidden=false;login.style.display='grid'}window.scrollTo(0,0);if(message)showNotice(message,'error','#loginNotice')}
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
    $('#adminUser').textContent=me.user.email;$('#loginView').hidden=true;$('#loginView').style.display='none';$('#adminView').hidden=false;window.scrollTo(0,0);
    const state=await api('/api/admin/state');adminState=state||{};settings=state.settings||{};productsDraft=Array.isArray(state.products)?state.products.map(clone):[];galleryDraft=Array.isArray(state.gallery)?state.gallery.map(clone):[];shopCategoriesDraft=normalizeShopCategories(settings.shopCategories);paymentMethodsDraft=normalizePaymentMethods(settings.paymentMethods);fillForm();fillShopEditor();fillGalleryEditor();fillAboutEditor();fillExternalEditors();fillSupportEditor();renderOrdersAdmin();renderClientsAdmin();renderPaymentEditor();renderPageBackgroundsEditor();switchAdminTab(currentAdminTab);
  }catch(e){token='';showLogin(e.message)}
}
$('#adminLogin').addEventListener('submit',async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  try{
    const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Не удалось войти');
    if(data.user?.role!=='admin')throw new Error('У этой учётной записи нет прав администратора');
    token=data.token;await boot();
  }catch(err){showNotice(err.message,'error','#loginNotice')}
});
$('#adminLogout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST'})}catch{}token='';location.reload()});

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
  const dImg=$('#heroDesktop').value.trim(),mImg=$('#heroMobile').value.trim();
  const applyPreviewMedia=(preview,url)=>{if(!preview)return;preview.querySelector('.admin-preview-video')?.remove();preview.style.backgroundImage=mediaIsVideo(url)?'none':cssImage(url);if(mediaIsVideo(url)){const v=document.createElement('video');v.className='admin-preview-video';v.src=url;v.autoplay=true;v.muted=true;v.loop=true;v.playsInline=true;v.preload='metadata';v.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none';preview.prepend(v);v.play().catch(()=>{})}};
  applyPreviewMedia($('#desktopPreview'),dImg);applyPreviewMedia($('#mobilePreview'),mImg);
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
$('#homeSettingsForm').addEventListener('submit',async e=>{e.preventDefault();await save()});
$('#saveTop').addEventListener('click',()=>currentAdminTab==='backgrounds'?savePageBackgrounds():currentAdminTab==='shop'?saveShopSettings():currentAdminTab==='gallery'?saveGallerySettings():currentAdminTab==='about'?saveAboutSettings():currentAdminTab==='instagram'?saveInstagramSettings():currentAdminTab==='contact'?saveContactSettings():currentAdminTab==='support'?saveSupportSettings():currentAdminTab==='payment'?savePaymentSettings():(currentAdminTab==='clients'||currentAdminTab==='orders')?Promise.resolve():save());

function slugify(value){
  return String(value||'').trim().toLowerCase()
    .replace(/[а-яё]/g,ch=>({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'}[ch]||''))
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
}
function normalizeShopCategories(raw){
  const source=Array.isArray(raw)&&raw.length?raw:DEFAULT_SHOP_CATEGORIES;
  const seen=new Set();
  return source.map((c,i)=>{
    let slug=slugify(c?.slug||c?.id||c?.labelEn||`category-${i+1}`)||`category-${i+1}`;
    const base=slug;let n=2;while(seen.has(slug))slug=`${base}-${n++}`;seen.add(slug);
    return {id:String(c?.id||slug),slug,labelEn:String(c?.labelEn||c?.name||slug).trim(),labelRu:String(c?.labelRu||c?.labelEn||c?.name||slug).trim(),enabled:c?.enabled!==false,showInMenu:c?.showInMenu!==false};
  });
}
function productCategoriesOf(p){
  if(Array.isArray(p?.categories)&&p.categories.length)return p.categories.map(String);
  return clone(LEGACY_PRODUCT_CATEGORIES[String(p?.id||'')]||[]);
}
function productImagesOf(p){
  const list=Array.isArray(p?.images)?p.images.filter(Boolean).map(String):[];
  if(p?.image&&!list.includes(String(p.image)))list.unshift(String(p.image));
  return [...new Set(list)];
}
function productSizesOf(p){
  if(Array.isArray(p?.variants)&&p.variants.length){
    return p.variants.map(v=>({size:String(v?.size||'').trim(),stock:Math.max(0,Math.floor(Number(v?.stock)||0))})).filter(v=>v.size);
  }
  return (Array.isArray(p?.sizes)?p.sizes:[]).map(size=>({size:String(size),stock:1}));
}
function fillShopEditor(){
  $('#shopPageSize').value=Math.max(1,Math.min(8,Number(settings.shopPageSize)||8));
  $('#shopLegalMobileFontSize').value=clampNumber(settings.shopLegalMobileFontSize,6,30,10);
  $('#shopLegalMobileBottom').value=clampNumber(settings.shopLegalMobileBottom,0,80,2);
  $('#shopLegalMobileOffsetX').value=clampNumber(settings.shopLegalMobileOffsetX,-120,120,0);
  renderShopCategories();
  renderProductsAdmin();
}
function switchAdminTab(tab){
  const allowed=['home','backgrounds','shop','gallery','about','instagram','contact','support','orders','clients','payment'];
  currentAdminTab=allowed.includes(tab)?tab:'home';
  $$('#adminView [data-admin-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.adminTab===currentAdminTab));
  $('#homeSettingsForm').hidden=currentAdminTab!=='home';
  $('#backgroundsEditor').hidden=currentAdminTab!=='backgrounds';
  $('#shopEditor').hidden=currentAdminTab!=='shop';
  $('#galleryEditor').hidden=currentAdminTab!=='gallery';
  $('#aboutEditor').hidden=currentAdminTab!=='about';
  $('#instagramEditor').hidden=currentAdminTab!=='instagram';
  $('#contactEditor').hidden=currentAdminTab!=='contact';
  $('#supportEditor').hidden=currentAdminTab!=='support';
  $('#ordersEditor').hidden=currentAdminTab!=='orders';
  $('#clientsEditor').hidden=currentAdminTab!=='clients';
  $('#paymentEditor').hidden=currentAdminTab!=='payment';
  const titles={home:'Главная страница',backgrounds:'Фоны страниц',shop:'SHOP',gallery:'Галерея',about:'ABOUT',instagram:'Instagram',contact:'Контакты',support:'Поддержка',orders:'Заказы',clients:'Клиенты',payment:'Оплата'};
  $('#workspaceTitle').textContent=titles[currentAdminTab]||'Главная страница';
  const saveTop=$('#saveTop');saveTop.hidden=currentAdminTab==='clients'||currentAdminTab==='orders';
  saveTop.textContent=currentAdminTab==='backgrounds'?'Сохранить фоны':currentAdminTab==='shop'?'Сохранить магазин':currentAdminTab==='gallery'?'Сохранить галерею':currentAdminTab==='about'?'Сохранить ABOUT':currentAdminTab==='instagram'?'Сохранить Instagram':currentAdminTab==='contact'?'Сохранить контакты':currentAdminTab==='support'?'Сохранить поддержку':currentAdminTab==='payment'?'Сохранить оплату':'Сохранить';
  if(currentAdminTab==='clients')renderClientsAdmin();
  if(currentAdminTab==='orders')renderOrdersAdmin();
  if(currentAdminTab==='support')updateSupportPreview();
  if(currentAdminTab==='backgrounds')renderPageBackgroundsEditor();
}
$$('[data-admin-tab]').forEach(btn=>btn.addEventListener('click',()=>switchAdminTab(btn.dataset.adminTab)));

function normalizedPageBackgrounds(){
  const raw=settings.pageBackgrounds&&typeof settings.pageBackgrounds==='object'?settings.pageBackgrounds:{};
  const out={};
  for(const [key] of PAGE_BACKGROUND_DEFS){
    const value=raw[key];
    if(RESPONSIVE_PAGE_BACKGROUND_KEYS.has(key)){
      if(value&&typeof value==='object'&&!Array.isArray(value))out[key]={desktop:String(value.desktop||'').trim(),mobile:String(value.mobile||'').trim()};
      else{const legacy=String(value||'').trim();out[key]={desktop:legacy,mobile:legacy}}
    }else out[key]=value&&typeof value==='object'&&!Array.isArray(value)?String(value.desktop||value.mobile||'').trim():String(value||'').trim();
  }
  return out;
}
function pageBackgroundInputSelector(key,device=''){
  return device?`[data-page-bg-key="${CSS.escape(key)}"][data-page-bg-device="${CSS.escape(device)}"]`:`[data-page-bg-key="${CSS.escape(key)}"]:not([data-page-bg-device])`;
}
function renderPageBackgroundsEditor(){
  const box=$('#pageBackgroundsEditor');if(!box)return;const current=normalizedPageBackgrounds();
  box.innerHTML=PAGE_BACKGROUND_DEFS.flatMap(([key,label])=>{
    if(!RESPONSIVE_PAGE_BACKGROUND_KEYS.has(key))return [`<div class="page-background-row" data-page-bg-row="${esc(key)}"><label class="field"><span>${esc(label)} — фон фото / видео</span><input data-page-bg-key="${esc(key)}" value="${esc(current[key])}" placeholder="Оставьте пустым для текущего фона"></label><label class="upload-btn page-bg-upload"><input type="file" data-page-bg-upload="${esc(key)}" accept="image/*,video/mp4,video/webm,video/quicktime"><span>Загрузить фото / видео</span></label><button class="secondary-btn small" type="button" data-page-bg-clear="${esc(key)}">Сбросить</button></div>`];
    return [['desktop','ПК'],['mobile','Телефон']].map(([device,deviceLabel])=>`<div class="page-background-row" data-page-bg-row="${esc(key)}-${device}"><label class="field"><span>${esc(label)} — ${deviceLabel}, фон фото / видео</span><input data-page-bg-key="${esc(key)}" data-page-bg-device="${device}" value="${esc(current[key][device])}" placeholder="Оставьте пустым для текущего фона"></label><label class="upload-btn page-bg-upload"><input type="file" data-page-bg-upload="${esc(key)}" data-page-bg-device="${device}" accept="image/*,video/mp4,video/webm,video/quicktime"><span>Загрузить фото / видео</span></label><button class="secondary-btn small" type="button" data-page-bg-clear="${esc(key)}" data-page-bg-device="${device}">Сбросить</button></div>`);
  }).join('');
}
$('#pageBackgroundsEditor')?.addEventListener('click',e=>{const btn=e.target.closest('[data-page-bg-clear]');if(!btn)return;const input=$(pageBackgroundInputSelector(btn.dataset.pageBgClear,btn.dataset.pageBgDevice||''));if(input)input.value=''});
$('#pageBackgroundsEditor')?.addEventListener('change',async e=>{
  const input=e.target.closest('[data-page-bg-upload]');if(!input)return;const file=input.files?.[0];if(!file)return;
  try{input.disabled=true;const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});const out=await api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});const target=$(pageBackgroundInputSelector(input.dataset.pageBgUpload,input.dataset.pageBgDevice||''));if(target)target.value=out.url;showNotice('Фон загружен. Нажмите «Сохранить фоны».')}catch(err){showNotice(err.message,'error')}finally{input.disabled=false;input.value=''}
});
async function savePageBackgrounds(){
  const pageBackgrounds={};PAGE_BACKGROUND_DEFS.forEach(([key])=>{
    if(RESPONSIVE_PAGE_BACKGROUND_KEYS.has(key)){
      pageBackgrounds[key]={desktop:String($(pageBackgroundInputSelector(key,'desktop'))?.value||'').trim(),mobile:String($(pageBackgroundInputSelector(key,'mobile'))?.value||'').trim()};
    }else pageBackgrounds[key]=String($(pageBackgroundInputSelector(key))?.value||'').trim();
  });
  try{setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify({pageBackgrounds})});renderPageBackgroundsEditor();showNotice('Фоны страниц сохранены.')}catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
$('#savePageBackgrounds')?.addEventListener('click',savePageBackgrounds);

function categoryField(label,value,field){return `<label class="field"><span>${esc(label)}</span><input data-category-field="${field}" value="${esc(value||'')}"></label>`}
function renderShopCategories(){
  const box=$('#shopCategoriesEditor');if(!box)return;
  box.innerHTML=shopCategoriesDraft.map((c,i)=>`<div class="category-row" data-category-index="${i}">
    ${categoryField('Название EN',c.labelEn,'labelEn')}
    ${categoryField('Название RU',c.labelRu,'labelRu')}
    ${categoryField('Slug',c.slug,'slug')}
    <label class="check-control"><input type="checkbox" data-category-field="enabled" ${c.enabled!==false?'checked':''}> Раздел включён</label>
    <label class="check-control"><input type="checkbox" data-category-field="showInMenu" ${c.showInMenu!==false?'checked':''}> В меню SHOP</label>
    <div class="category-link">/shop.html?category=${encodeURIComponent(c.slug)}</div>
    <button class="danger-link" type="button" data-delete-category>Удалить раздел</button>
  </div>`).join('');
  renderProductCategoryChecks();
}
$('#shopCategoriesEditor')?.addEventListener('input',e=>{
  const row=e.target.closest('[data-category-index]');const field=e.target.dataset.categoryField;if(!row||!field)return;
  const i=Number(row.dataset.categoryIndex);if(!shopCategoriesDraft[i])return;
  const value=e.target.type==='checkbox'?e.target.checked:e.target.value;
  if(field!=='slug')shopCategoriesDraft[i][field]=value;
  if(field==='slug'){
    const clean=slugify(value);const link=row.querySelector('.category-link');if(link)link.textContent=`/shop.html?category=${clean}`;
  }
  renderProductCategoryChecks();
});
$('#shopCategoriesEditor')?.addEventListener('change',e=>{
  const row=e.target.closest('[data-category-index]');const field=e.target.dataset.categoryField;if(!row||!field)return;
  const i=Number(row.dataset.categoryIndex);if(field==='slug'){
    const previous=shopCategoriesDraft[i].slug;const clean=slugify(e.target.value)||`category-${i+1}`;shopCategoriesDraft[i].slug=clean;shopCategoriesDraft[i].id=shopCategoriesDraft[i].id||clean;e.target.value=clean;
    if(previous!==clean)productsDraft.forEach(p=>{if(Array.isArray(p.categories))p.categories=p.categories.map(x=>x===previous?clean:x)});
    const link=row.querySelector('.category-link');if(link)link.textContent=`/shop.html?category=${clean}`;
  }
});
$('#shopCategoriesEditor')?.addEventListener('click',e=>{
  const btn=e.target.closest('[data-delete-category]');if(!btn)return;const row=btn.closest('[data-category-index]');if(!row)return;
  const i=Number(row.dataset.categoryIndex);const cat=shopCategoriesDraft[i];if(!cat)return;
  if(!confirm(`Удалить раздел «${cat.labelRu||cat.labelEn||cat.slug}»? Товары останутся, но будут удалены из этого раздела.`))return;
  const slug=cat.slug;shopCategoriesDraft.splice(i,1);productsDraft.forEach(p=>{if(Array.isArray(p.categories))p.categories=p.categories.filter(x=>x!==slug)});renderShopCategories();renderProductsAdmin();
});
$('#addShopCategory')?.addEventListener('click',()=>{
  const base='new-category';let slug=base,n=2;const used=new Set(shopCategoriesDraft.map(c=>c.slug));while(used.has(slug))slug=`${base}-${n++}`;
  shopCategoriesDraft.push({id:uid('category'),slug,labelEn:'NEW CATEGORY',labelRu:'НОВЫЙ РАЗДЕЛ',enabled:true,showInMenu:true});renderShopCategories();
  $('#shopCategoriesEditor')?.lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'});
});

function localizedProductName(p){return String(p?.nameRu||p?.name||'Без названия')}
function renderProductsAdmin(){
  const box=$('#productsAdminList');if(!box)return;
  const q=String($('#productAdminSearch')?.value||'').trim().toLowerCase();const onlyHidden=!!$('#showHiddenProducts')?.checked;
  const list=productsDraft.filter(p=>{
    if(onlyHidden&&p.active!==false)return false;
    if(!q)return true;
    return [p.id,p.name,p.nameRu].some(v=>String(v||'').toLowerCase().includes(q));
  }).sort((a,b)=>(Number(a.sort)||0)-(Number(b.sort)||0));
  if(!list.length){box.innerHTML='<div class="empty-admin-list">Товары не найдены.</div>';return}
  box.innerHTML=list.map(p=>{
    const images=productImagesOf(p),sizes=productSizesOf(p),stock=sizes.reduce((a,v)=>a+Math.max(0,Number(v.stock)||0),0),cats=productCategoriesOf(p);
    return `<article class="product-admin-row${p.active===false?' is-hidden-product':''}" data-product-id="${esc(p.id)}">
      <div class="product-admin-thumb">${images[0]?(mediaIsVideo(images[0])?`<video src="${esc(images[0])}" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:contain"></video>`:`<img src="${esc(images[0])}" alt="">`):'—'}</div>
      <div class="product-admin-copy">
        <div class="product-admin-name">${esc(p.name||'Без названия')}</div>
        <div class="product-admin-ru">${esc(p.nameRu||'RU не заполнено')}</div>
        <div class="product-admin-meta"><span>${esc(p.priceMode==='hidden'?'Цена скрыта':p.priceMode==='text'?(p.priceTextRu||p.priceText||'Текстовая цена'):`${String(p.price??0)}${settings.currency||'$'}`)}</span><span>${p.active===false?'Скрыт':'Показывается'}</span><span>Фото: ${images.length}</span><span>Остаток: ${stock}</span>${cats.slice(0,3).map(c=>`<b class="shop-category-pill">${esc(c)}</b>`).join('')}</div>
      </div>
      <div class="product-admin-actions"><label class="check-control compact"><input type="checkbox" data-toggle-product-active="${esc(p.id)}" ${p.active!==false?'checked':''}> Показывать</label><button class="secondary-btn small" type="button" data-edit-product="${esc(p.id)}">Редактировать</button></div>
    </article>`;
  }).join('');
}
$('#productAdminSearch')?.addEventListener('input',renderProductsAdmin);$('#showHiddenProducts')?.addEventListener('change',renderProductsAdmin);
$('#productsAdminList')?.addEventListener('click',e=>{const btn=e.target.closest('[data-edit-product]');if(btn)openProductModal(btn.dataset.editProduct)});
$('#productsAdminList')?.addEventListener('change',async e=>{const toggle=e.target.closest('[data-toggle-product-active]');if(!toggle)return;const id=toggle.dataset.toggleProductActive;const p=productsDraft.find(x=>String(x.id)===String(id));if(!p)return;const previous=p.active!==false;p.active=toggle.checked;try{const saved=await api(`/api/admin/products/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify({active:toggle.checked})});Object.assign(p,saved);renderProductsAdmin();showNotice(toggle.checked?'Товар показан на сайте.':'Товар скрыт с сайта.')}catch(err){p.active=previous;renderProductsAdmin();showNotice(err.message,'error')}});
$('#addProductAdmin')?.addEventListener('click',()=>openProductModal(''));

function renderProductCategoryChecks(){
  const box=$('#productCategoryChecks');if(!box)return;
  const selected=new Set((box.dataset.selected||'').split('|').filter(Boolean));
  box.innerHTML=shopCategoriesDraft.map(c=>`<label class="category-check-item"><input type="checkbox" value="${esc(c.slug)}" ${selected.has(c.slug)?'checked':''}> <span>${esc(c.labelRu||c.labelEn||c.slug)}</span></label>`).join('')||'<div class="section-note">Сначала добавьте хотя бы один раздел магазина.</div>';
}
function selectedProductCategories(){return $$('#productCategoryChecks input[type=checkbox]:checked').map(x=>x.value)}
function renderProductImages(){
  const box=$('#productImagesPreview');if(!box)return;
  box.innerHTML=productImagesDraft.map((url,i)=>`<div class="product-image-admin-card${i===0?' is-primary':''}" data-image-index="${i}">
    ${i===0?'<span class="image-primary-label">ОСНОВНОЕ</span>':''}${mediaIsVideo(url)?`<video src="${esc(url)}" muted loop autoplay playsinline style="display:block;width:100%;aspect-ratio:1/1.15;object-fit:contain;background:#fff;border-radius:7px"></video>`:`<img src="${esc(url)}" alt="">`}
    <div class="product-image-admin-actions"><button type="button" data-make-primary ${i===0?'disabled':''}>${i===0?'Основное':'Сделать главным'}</button><button class="image-remove" type="button" data-remove-image>×</button></div>
  </div>`).join('')||'<div class="empty-admin-list">Медиа ещё не добавлены.</div>';
}
$('#productImagesPreview')?.addEventListener('click',e=>{
  const card=e.target.closest('[data-image-index]');if(!card)return;const i=Number(card.dataset.imageIndex);
  if(e.target.closest('[data-remove-image]')){productImagesDraft.splice(i,1);renderProductImages()}
  if(e.target.closest('[data-make-primary]')){const [img]=productImagesDraft.splice(i,1);productImagesDraft.unshift(img);renderProductImages()}
});
function renderProductSizes(){
  const box=$('#productSizesEditor');if(!box)return;
  box.innerHTML=productSizesDraft.map((v,i)=>`<div class="size-stock-row" data-size-index="${i}">
    <label class="field"><span>Размер</span><input data-size-field="size" value="${esc(v.size)}" placeholder="S"></label>
    <label class="field"><span>Количество, шт.</span><input data-size-field="stock" type="number" min="0" step="1" value="${Math.max(0,Number(v.stock)||0)}"></label>
    <button class="danger-link" type="button" data-delete-size>Удалить</button>
  </div>`).join('')||'<div class="section-note">Размеры не добавлены.</div>';
}
$('#productSizesEditor')?.addEventListener('input',e=>{const row=e.target.closest('[data-size-index]');const f=e.target.dataset.sizeField;if(!row||!f)return;const i=Number(row.dataset.sizeIndex);productSizesDraft[i][f]=f==='stock'?Math.max(0,Math.floor(Number(e.target.value)||0)):e.target.value});
$('#productSizesEditor')?.addEventListener('click',e=>{if(!e.target.closest('[data-delete-size]'))return;const row=e.target.closest('[data-size-index]');productSizesDraft.splice(Number(row.dataset.sizeIndex),1);renderProductSizes()});
$('#addProductSize')?.addEventListener('click',()=>{productSizesDraft.push({size:'',stock:0});renderProductSizes();$('#productSizesEditor')?.lastElementChild?.querySelector('input')?.focus()});

function openProductModal(productId){
  const p=productId?productsDraft.find(x=>String(x.id)===String(productId)):null;
  $('#productModalTitle').textContent=p?'Редактирование товара':'Новый товар';
  $('#productOriginalId').value=p?.id||'';$('#productId').value=p?.id||'';$('#productId').readOnly=!!p;
  $('#productNameEn').value=p?.name||'';$('#productNameRu').value=p?.nameRu||'';$('#productPriceAdmin').value=Number(p?.price)||0;$('#productPriceMode').value=p?.priceMode||'number';$('#productPriceTextEn').value=p?.priceText||'';$('#productPriceTextRu').value=p?.priceTextRu||'';$('#productPurchasable').checked=p?.purchasable!==false;
  $('#productFabricEn').value=p?.fabric||'';$('#productFabricRu').value=p?.fabricRu||'';$('#productDescriptionEn').value=p?.description||'';$('#productDescriptionRu').value=p?.descriptionRu||'';
  $('#productSort').value=Number(p?.sort)||((productsDraft.length+1)*10);$('#productActive').checked=p?.active!==false;
  productImagesDraft=productImagesOf(p||{});productSizesDraft=productSizesOf(p||{});if(!productSizesDraft.length)productSizesDraft=[{size:'XS',stock:0},{size:'S',stock:0},{size:'M',stock:0},{size:'L',stock:0},{size:'XL',stock:0}];
  const cats=productCategoriesOf(p||{});$('#productCategoryChecks').dataset.selected=cats.join('|');renderProductCategoryChecks();renderProductImages();renderProductSizes();
  $('#deleteProductAdmin').hidden=!p;$('#productModal').hidden=false;document.body.style.overflow='hidden';
  if(!p)$('#productNameEn').focus();
}
function closeProductModal(){if($('#productModal'))$('#productModal').hidden=true;document.body.style.removeProperty('overflow')}
$$('[data-close-product-modal]').forEach(el=>el.addEventListener('click',closeProductModal));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#productModal')?.hidden)closeProductModal()});
$('#productNameEn')?.addEventListener('input',()=>{if(!$('#productOriginalId').value&&!$('#productId').value.trim())$('#productId').value=slugify($('#productNameEn').value)});

async function uploadProductFile(file){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const out=await api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});return out.url;
}
// Use a dedicated uploader for product images so no unrelated input is changed.
$('#productImagesUpload')?.replaceWith($('#productImagesUpload').cloneNode(true));
$('#productImagesUpload')?.addEventListener('change',async e=>{
  const files=[...(e.target.files||[])];if(!files.length)return;
  try{e.target.disabled=true;for(const file of files){productImagesDraft.push(await uploadProductFile(file))}renderProductImages();showNotice('Изображения загружены. Сохраните товар.')}catch(err){showNotice(err.message,'error')}finally{e.target.disabled=false;e.target.value=''}
});

function productPayloadFromForm(){
  const original=$('#productOriginalId').value.trim();
  const name=$('#productNameEn').value.trim();let pid=original||slugify($('#productId').value||name)||uid('product');
  const variants=productSizesDraft.map(v=>({size:String(v.size||'').trim(),stock:Math.max(0,Math.floor(Number(v.stock)||0))})).filter(v=>v.size);
  const sizes=variants.filter(v=>v.stock>0).map(v=>v.size);
  return {id:pid,name,nameRu:$('#productNameRu').value.trim(),price:Math.max(0,Number($('#productPriceAdmin').value)||0),priceMode:$('#productPriceMode').value||'number',priceText:$('#productPriceTextEn').value.trim(),priceTextRu:$('#productPriceTextRu').value.trim(),purchasable:$('#productPurchasable').checked,description:$('#productDescriptionEn').value.trim(),descriptionRu:$('#productDescriptionRu').value.trim(),fabric:$('#productFabricEn').value.trim(),fabricRu:$('#productFabricRu').value.trim(),image:productImagesDraft[0]||'',images:clone(productImagesDraft),categories:selectedProductCategories(),variants,sizes,active:$('#productActive').checked,sort:Math.max(0,Math.floor(Number($('#productSort').value)||0))};
}
$('#productEditorForm')?.addEventListener('submit',async e=>{
  e.preventDefault();const data=productPayloadFromForm();if(!data.name)return showNotice('Введите название товара на английском.','error');if(!data.image)return showNotice('Добавьте хотя бы одно изображение товара.','error');
  const original=$('#productOriginalId').value.trim();
  if(!original&&productsDraft.some(p=>String(p.id)===data.id))return showNotice('Товар с таким ID уже существует. Измените ID.','error');
  try{
    const saved=await api(original?`/api/admin/products/${encodeURIComponent(original)}`:'/api/admin/products',{method:original?'PUT':'POST',body:JSON.stringify(data)});
    const i=productsDraft.findIndex(p=>String(p.id)===String(original));if(i>=0)productsDraft[i]=saved;else productsDraft.push(saved);
    closeProductModal();renderProductsAdmin();showNotice('Товар сохранён.');
  }catch(err){showNotice(err.message,'error')}
});
$('#deleteProductAdmin')?.addEventListener('click',async()=>{
  const id=$('#productOriginalId').value.trim();if(!id)return;if(!confirm('Удалить товар без возможности восстановления?'))return;
  try{await api(`/api/admin/products/${encodeURIComponent(id)}`,{method:'DELETE'});productsDraft=productsDraft.filter(p=>String(p.id)!==id);closeProductModal();renderProductsAdmin();showNotice('Товар удалён.')}catch(err){showNotice(err.message,'error')}
});

async function saveShopSettings(){
  const normalized=normalizeShopCategories(shopCategoriesDraft);
  const slugs=normalized.map(c=>c.slug);if(new Set(slugs).size!==slugs.length)return showNotice('Slug разделов не должны повторяться.','error');
  try{
    setBusy(true);shopCategoriesDraft=normalized;const valid=new Set(shopCategoriesDraft.map(c=>c.slug));
    const payload={
      shopPageSize:Math.max(1,Math.min(8,Math.floor(Number($('#shopPageSize').value)||8))),
      shopLegalMobileFontSize:clampNumber($('#shopLegalMobileFontSize').value,6,30,10),
      shopLegalMobileBottom:clampNumber($('#shopLegalMobileBottom').value,0,80,2),
      shopLegalMobileOffsetX:clampNumber($('#shopLegalMobileOffsetX').value,-120,120,0),
      shopCategories:clone(shopCategoriesDraft)
    };
    settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(payload)});
    for(let i=0;i<productsDraft.length;i++){
      const p=productsDraft[i];if(!Array.isArray(p.categories))continue;const next=p.categories.filter(c=>valid.has(c));
      if(JSON.stringify(next)!==JSON.stringify(p.categories)){productsDraft[i]=await api(`/api/admin/products/${encodeURIComponent(p.id)}`,{method:'PUT',body:JSON.stringify({categories:next})})}
    }
    fillShopEditor();showNotice('Настройки Shop.html сохранены.');
  }catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
$('#saveShopSettings')?.addEventListener('click',saveShopSettings);
$('#shopPageSize')?.addEventListener('input',e=>{
  const n=Math.floor(Number(e.target.value)||1);
  if(n>8)e.target.value='8';
  if(n<1)e.target.value='1';
});
['#shopLegalMobileFontSize','#shopLegalMobileBottom','#shopLegalMobileOffsetX'].forEach(selector=>{
  $(selector)?.addEventListener('input',e=>{
    const limits=selector==='#shopLegalMobileFontSize'?[6,30,10]:selector==='#shopLegalMobileBottom'?[0,80,2]:[-120,120,0];
    e.target.value=String(clampNumber(e.target.value,limits[0],limits[1],limits[2]));
  });
});


function galleryFontOptions(current=''){
  return `<option value="">Текущий дизайн</option>`+FONT_OPTIONS.map(([name,value])=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(name)}</option>`).join('');
}
function galleryItemNormalized(item,index){
  const rotation=((Math.round(Number(item?.rotation)||0)%360)+360)%360;
  return {
    id:String(item?.id||uid('gallery')),
    image:String(item?.media||item?.image||''),media:String(item?.media||item?.image||''),
    caption:String(item?.caption||''),
    captionRu:String(item?.captionRu||''),
    captionFont:String(item?.captionFont||''),
    rotation:[0,90,180,270].includes(rotation)?rotation:0,
    active:item?.active!==false,
    sort:Number.isFinite(Number(item?.sort))?Number(item.sort):index+1
  };
}
function fillGalleryEditor(){
  galleryDraft=(Array.isArray(galleryDraft)?galleryDraft:[]).map(galleryItemNormalized).sort((a,b)=>(Number(a.sort)||0)-(Number(b.sort)||0));
  renderGalleryAdmin();
}
function renderGalleryAdmin(){
  const box=$('#galleryAdminList');if(!box)return;
  if(!galleryDraft.length){box.innerHTML='<div class="empty-admin-list">В галерее пока нет изображений.</div>';return}
  box.innerHTML=galleryDraft.map((g,i)=>`<article class="gallery-admin-item${g.active===false?' is-hidden-gallery':''}" data-gallery-index="${i}">
    <div class="gallery-admin-preview">${mediaIsVideo(g.media||g.image)?`<video src="${esc(g.media||g.image)}" muted loop autoplay playsinline style="width:100%;height:100%;object-fit:contain;transform:rotate(${Number(g.rotation)||0}deg)"></video>`:`<img src="${esc(g.media||g.image)}" alt="" style="transform:rotate(${Number(g.rotation)||0}deg)">`}</div>
    <div class="gallery-admin-fields">
      <label class="field"><span>Описание / подпись EN</span><textarea data-gallery-field="caption" rows="3">${esc(g.caption)}</textarea></label>
      <label class="field"><span>Описание / подпись RU</span><textarea data-gallery-field="captionRu" rows="3">${esc(g.captionRu)}</textarea></label>
      <div class="gallery-inline-fields">
        <label class="field"><span>Шрифт подписи</span><select data-gallery-field="captionFont">${galleryFontOptions(g.captionFont)}</select></label>
        <label class="field"><span>Порядок</span><input data-gallery-field="sort" type="number" min="0" step="1" value="${esc(g.sort)}"></label>
      </div>
      <label class="check-control"><input data-gallery-field="active" type="checkbox" ${g.active!==false?'checked':''}> Показывать на сайте</label>
    </div>
    <div class="gallery-admin-actions">
      <button class="secondary-btn small" type="button" data-gallery-action="rotate-left">↺ Повернуть влево</button>
      <button class="secondary-btn small" type="button" data-gallery-action="rotate-right">↻ Повернуть вправо</button>
      <button class="danger-btn" type="button" data-gallery-action="delete">Удалить</button>
    </div>
  </article>`).join('');
}
$('#galleryAdminList')?.addEventListener('input',e=>{
  const row=e.target.closest('[data-gallery-index]');const field=e.target.dataset.galleryField;if(!row||!field)return;
  const item=galleryDraft[Number(row.dataset.galleryIndex)];if(!item)return;
  item[field]=e.target.type==='checkbox'?e.target.checked:(field==='sort'?Number(e.target.value)||0:e.target.value);
});
$('#galleryAdminList')?.addEventListener('change',e=>{
  const row=e.target.closest('[data-gallery-index]');const field=e.target.dataset.galleryField;if(!row||!field)return;
  const item=galleryDraft[Number(row.dataset.galleryIndex)];if(!item)return;
  item[field]=e.target.type==='checkbox'?e.target.checked:(field==='sort'?Number(e.target.value)||0:e.target.value);
});
$('#galleryAdminList')?.addEventListener('click',e=>{
  const btn=e.target.closest('[data-gallery-action]');if(!btn)return;
  const row=btn.closest('[data-gallery-index]');const i=Number(row?.dataset.galleryIndex);const item=galleryDraft[i];if(!item)return;
  const action=btn.dataset.galleryAction;
  if(action==='delete'){
    if(!confirm('Удалить это изображение из галереи?'))return;
    galleryDraft.splice(i,1);renderGalleryAdmin();return;
  }
  if(action==='rotate-left')item.rotation=((Number(item.rotation)||0)+270)%360;
  if(action==='rotate-right')item.rotation=((Number(item.rotation)||0)+90)%360;
  renderGalleryAdmin();
});
async function uploadGalleryFile(file){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  return api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});
}
$('#galleryImagesUpload')?.addEventListener('change',async e=>{
  const files=[...(e.target.files||[])];if(!files.length)return;
  try{
    e.target.disabled=true;let nextSort=galleryDraft.reduce((m,x)=>Math.max(m,Number(x.sort)||0),0)+1;
    for(const file of files){const out=await uploadGalleryFile(file);galleryDraft.push(galleryItemNormalized({id:uid('gallery'),image:out.url,media:out.url,caption:'',captionRu:'',captionFont:'',rotation:0,active:true,sort:nextSort++},galleryDraft.length))}
    renderGalleryAdmin();showNotice('Фотографии загружены. Нажмите «Сохранить галерею».');
  }catch(err){showNotice(err.message,'error')}finally{e.target.disabled=false;e.target.value=''}
});
async function saveGallerySettings(){
  try{
    setBusy(true);
    const original=new Map((Array.isArray(adminState.gallery)?adminState.gallery:[]).map(x=>[String(x.id),x]));
    const saved=[];
    for(let i=0;i<galleryDraft.length;i++){
      const item=galleryItemNormalized(galleryDraft[i],i);
      if(!item.media&&!item.image)continue;item.image=item.media||item.image;
      const body=JSON.stringify(item);
      const result=original.has(String(item.id))
        ?await api(`/api/admin/gallery/${encodeURIComponent(item.id)}`,{method:'PUT',body})
        :await api('/api/admin/gallery',{method:'POST',body});
      saved.push(result);original.delete(String(item.id));
    }
    for(const id of original.keys())await api(`/api/admin/gallery/${encodeURIComponent(id)}`,{method:'DELETE'});
    galleryDraft=saved.map(clone);adminState.gallery=saved.map(clone);fillGalleryEditor();showNotice('Галерея сохранена.');
  }catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
$('#saveGallerySettings')?.addEventListener('click',saveGallerySettings);

function plainToRich(value){return esc(String(value||'')).replace(/\n/g,'<br>')}
function fillAboutEditor(){
  const set=(id,value)=>{const el=$(id);if(el)el.value=value??''};
  set('#aboutMainMediaDesktop',settings.aboutMainMediaDesktop||'/assets/images/about-copy-psd.png');
  set('#aboutMainMediaMobile',settings.aboutMainMediaMobile||'/assets/images/about-mobile-approved.jpg');
  const en=$('#aboutExtraHtmlEnEditor'),ru=$('#aboutExtraHtmlRuEditor');
  if(en)en.innerHTML=String(settings.aboutExtraHtmlEn||'').trim()||plainToRich(settings.aboutExtraTextEn||'');
  if(ru)ru.innerHTML=String(settings.aboutExtraHtmlRu||'').trim()||plainToRich(settings.aboutExtraTextRu||'');
  selectValue($('#aboutExtraFont'),settings.aboutExtraFont||'');set('#aboutExtraFontSizeDesktop',settings.aboutExtraFontSizeDesktop||24);set('#aboutExtraFontSizeMobile',settings.aboutExtraFontSizeMobile||18);set('#aboutExtraMedia',settings.aboutExtraMedia||'');
}
async function uploadAboutMedia(file,targetSelector,label){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});const out=await api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});const target=$(targetSelector);if(target)target.value=out.url;showNotice(`${label} загружено. Нажмите «Сохранить ABOUT».`);
}
[['#aboutMainMediaDesktopFile','#aboutMainMediaDesktop','Основное медиа ПК'],['#aboutMainMediaMobileFile','#aboutMainMediaMobile','Основное медиа телефона'],['#aboutExtraMediaFile','#aboutExtraMedia','Дополнительное медиа']].forEach(([fileId,targetId,label])=>{
  $(fileId)?.addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{e.target.disabled=true;await uploadAboutMedia(file,targetId,label)}catch(err){showNotice(err.message,'error')}finally{e.target.disabled=false;e.target.value=''}})
});
const richSelections={};
function rememberRichSelection(targetId){const target=$('#'+targetId),sel=window.getSelection();if(!target||!sel||!sel.rangeCount)return;const range=sel.getRangeAt(0);if(target.contains(range.commonAncestorContainer))richSelections[targetId]=range.cloneRange()}
function richExec(targetId,command,value=null){const target=$('#'+targetId);if(!target)return;target.focus();const saved=richSelections[targetId],sel=window.getSelection();if(saved&&sel){sel.removeAllRanges();sel.addRange(saved)}document.execCommand(command,false,value);rememberRichSelection(targetId)}
$$('.about-rich-editor').forEach(editor=>['keyup','mouseup','input'].forEach(eventName=>editor.addEventListener(eventName,()=>rememberRichSelection(editor.id))));
$$('.about-rich-toolbar').forEach(toolbar=>{
  const targetId=toolbar.dataset.richTarget;
  toolbar.addEventListener('mousedown',e=>{if(e.target.closest('button'))e.preventDefault()});
  toolbar.addEventListener('click',e=>{const btn=e.target.closest('[data-rich-cmd]');if(!btn)return;richExec(targetId,btn.dataset.richCmd)});
  toolbar.querySelector('[data-rich-font]')?.addEventListener('change',e=>{if(e.target.value)richExec(targetId,'fontName',e.target.value)});
  toolbar.querySelector('[data-rich-size]')?.addEventListener('change',e=>{if(e.target.value)richExec(targetId,'fontSize',e.target.value)});
  toolbar.querySelectorAll('[data-rich-color]').forEach(input=>input.addEventListener('input',e=>richExec(targetId,e.target.dataset.richColor,e.target.value)));
});
async function saveAboutSettings(){
  const enEditor=$('#aboutExtraHtmlEnEditor'),ruEditor=$('#aboutExtraHtmlRuEditor');
  const payload={aboutMainMediaDesktop:$('#aboutMainMediaDesktop')?.value.trim()||'/assets/images/about-copy-psd.png',aboutMainMediaMobile:$('#aboutMainMediaMobile')?.value.trim()||'/assets/images/about-mobile-approved.jpg',aboutExtraHtmlEn:enEditor?.innerHTML||'',aboutExtraHtmlRu:ruEditor?.innerHTML||'',aboutExtraTextEn:enEditor?.innerText||'',aboutExtraTextRu:ruEditor?.innerText||'',aboutExtraFont:$('#aboutExtraFont')?.value||'',aboutExtraFontSizeDesktop:clampNumber($('#aboutExtraFontSizeDesktop')?.value,10,80,24),aboutExtraFontSizeMobile:clampNumber($('#aboutExtraFontSizeMobile')?.value,10,48,18),aboutExtraMedia:$('#aboutExtraMedia')?.value.trim()||''};
  try{setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(payload)});fillAboutEditor();showNotice('ABOUT сохранён. Основное изображение остаётся первым, дополнительный контент идёт ниже.')}catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
$('#saveAboutSettings')?.addEventListener('click',saveAboutSettings);

function fillExternalEditors(){
  const set=(id,value)=>{const el=$(id);if(el)el.value=value||''};
  set('#instagramUrl',settings.instagram||'');
  set('#contactTitleEn',settings.contactTitleEn||'CONTACT');set('#contactTitleRu',settings.contactTitleRu||'КОНТАКТЫ');
  set('#contactTextEn',settings.contactTextEn||'');set('#contactTextRu',settings.contactTextRu||'');
  set('#contactEmailAdmin',settings.contact||'');set('#contactPhoneAdmin',settings.contactPhone||'');
  set('#contactAddressEn',settings.contactAddressEn||'');set('#contactAddressRu',settings.contactAddressRu||'');
}
async function saveInstagramSettings(){
  try{setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify({instagram:$('#instagramUrl').value.trim()})});fillExternalEditors();showNotice('Ссылка Instagram сохранена.')}catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
async function saveContactSettings(){
  try{setBusy(true);const payload={contactTitleEn:$('#contactTitleEn').value.trim(),contactTitleRu:$('#contactTitleRu').value.trim(),contactTextEn:$('#contactTextEn').value.trim(),contactTextRu:$('#contactTextRu').value.trim(),contact:$('#contactEmailAdmin').value.trim(),contactPhone:$('#contactPhoneAdmin').value.trim(),contactAddressEn:$('#contactAddressEn').value.trim(),contactAddressRu:$('#contactAddressRu').value.trim()};settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(payload)});fillExternalEditors();showNotice('Страница контактов сохранена.')}catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
function renderClientsAdmin(){
  const box=$('#clientsAdminList');if(!box)return;
  const users=(Array.isArray(adminState.users)?adminState.users:[]).filter(u=>u.role!=='admin');
  const orders=Array.isArray(adminState.orders)?adminState.orders:[];const coupons=Array.isArray(adminState.coupons)?adminState.coupons:[];
  if(!users.length){box.innerHTML='<div class="empty-admin-list">Зарегистрированных клиентов пока нет.</div>';return}
  box.innerHTML=users.map(user=>{
    const userOrders=orders.filter(o=>String(o.userId)===String(user.id));const userCoupons=coupons.filter(c=>String(c.userId)===String(user.id));
    const orderHtml=userOrders.length?userOrders.map(o=>`<div class="client-order-row"><strong>${esc(o.number||'')}</strong><span>${esc((o.items||[]).map(i=>`${i.name||i.nameRu||'Товар'} × ${Number(i.qty)||1}`).join(', '))}</span><span>${adminMoney(o.total,settings.currency||'$')}</span><span>${esc(o.status||'new')}</span></div>`).join(''):'<div class="client-empty">Заказов пока нет.</div>';
    const couponHtml=userCoupons.length?userCoupons.map(c=>`<div class="client-coupon-row" data-coupon-id="${esc(c.id)}"><span class="coupon-code-admin">${esc(c.code)}</span><span class="coupon-discount-admin">−${Number(c.percent)||0}%</span><button class="danger-link" type="button" data-delete-client-coupon>Удалить</button></div>`).join(''):'<div class="client-empty">Купонов нет.</div>';
    return `<article class="client-admin-card" data-client-id="${esc(user.id)}"><div class="client-admin-top"><div><div class="client-admin-name">${esc(user.name||'Без имени')}</div><div class="client-admin-email">${esc(user.email||'')}</div></div><div class="client-admin-created">${user.createdAt?new Date(user.createdAt).toLocaleDateString('ru-RU'):''}</div></div><div class="client-admin-columns"><section class="client-admin-block"><h4>Заказы (${userOrders.length})</h4>${orderHtml}</section><section class="client-admin-block"><h4>Купоны</h4><form class="client-coupon-form"><input name="code" placeholder="Код, например DEMI20" maxlength="32"><input name="percent" type="number" min="1" max="95" value="10" aria-label="Процент скидки"><button class="secondary-btn small" type="submit">+ Выдать купон</button></form><div class="client-coupon-list">${couponHtml}</div></section></div></article>`;
  }).join('');
}
$('#clientsAdminList')?.addEventListener('submit',async e=>{
  const form=e.target.closest('.client-coupon-form');if(!form)return;e.preventDefault();const card=form.closest('[data-client-id]');const f=new FormData(form);
  try{const coupon=await api('/api/admin/coupons',{method:'POST',body:JSON.stringify({userId:card.dataset.clientId,code:f.get('code'),percent:f.get('percent')})});adminState.coupons=Array.isArray(adminState.coupons)?adminState.coupons:[];adminState.coupons.unshift(coupon);renderClientsAdmin();showNotice('Купон выдан клиенту.')}catch(err){showNotice(err.message,'error')}
});
$('#clientsAdminList')?.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-delete-client-coupon]');if(!btn)return;const row=btn.closest('[data-coupon-id]');if(!row||!confirm('Удалить этот купон?'))return;
  try{await api(`/api/admin/coupons/${encodeURIComponent(row.dataset.couponId)}`,{method:'DELETE'});adminState.coupons=(adminState.coupons||[]).filter(c=>String(c.id)!==String(row.dataset.couponId));renderClientsAdmin();showNotice('Купон удалён.')}catch(err){showNotice(err.message,'error')}
});



function supportSetting(key){
  const value=settings?.[key];
  return value==null||value===''?DEFAULT_SUPPORT_SETTINGS[key]:value;
}
function fillSupportEditor(){
  const textIds=['supportButtonTextEn','supportButtonTextRu','supportGreetingEn','supportGreetingRu','supportBackgroundImage','supportButtonBg','supportButtonColor','supportFieldBg','supportFieldColor'];
  textIds.forEach(id=>{const el=$('#'+id);if(el)el.value=supportSetting(id)||''});
  selectValue($('#supportButtonFont'),settings.supportButtonFont||'');
  selectValue($('#supportWindowFont'),settings.supportWindowFont||'');
  updateSupportPreview();
}
function updateSupportPreview(){
  const g=id=>$('#'+id)?.value||'';
  const preview=$('#supportAdminPreview');if(!preview)return;
  const previewBody=preview.querySelector('.support-preview-body');
  if(previewBody){
    const bg=g('supportBackgroundImage')||DEFAULT_SUPPORT_SETTINGS.supportBackgroundImage;previewBody.querySelector('.support-preview-bg-video')?.remove();
    previewBody.style.backgroundImage=mediaIsVideo(bg)?'none':`url(${JSON.stringify(bg)})`;
    if(mediaIsVideo(bg)){const v=document.createElement('video');v.className='support-preview-bg-video';v.src=bg;v.autoplay=true;v.muted=true;v.loop=true;v.playsInline=true;v.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none';previewBody.style.position='relative';previewBody.prepend(v);[...previewBody.children].forEach(el=>{if(el!==v){el.style.position='relative';el.style.zIndex='1'}});}
  }
  preview.style.fontFamily=g('supportWindowFont')||'';
  const greeting=$('#supportPreviewGreeting'),email=$('#supportPreviewEmail'),btn=$('#supportPreviewButton');
  if(greeting){greeting.textContent=g('supportGreetingEn')||DEFAULT_SUPPORT_SETTINGS.supportGreetingEn;greeting.style.background=g('supportFieldBg')||'#000';greeting.style.color=g('supportFieldColor')||'#fff'}
  if(email){email.textContent='support@demideville.com';email.style.background=g('supportFieldBg')||'#000';email.style.color=g('supportFieldColor')||'#fff'}
  if(btn){btn.textContent=g('supportButtonTextEn')||DEFAULT_SUPPORT_SETTINGS.supportButtonTextEn;btn.style.background=g('supportButtonBg')||'#000';btn.style.color=g('supportButtonColor')||'#fff';btn.style.fontFamily=g('supportButtonFont')||''}
}
$('#supportEditor')?.addEventListener('input',e=>{if(e.target.matches('input,select'))updateSupportPreview()});
$('#supportEditor')?.addEventListener('change',e=>{if(e.target.matches('input,select'))updateSupportPreview()});
$('#supportBackgroundFile')?.addEventListener('change',async e=>{
  const file=e.target.files?.[0];if(!file)return;
  try{e.target.disabled=true;const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});const out=await api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});$('#supportBackgroundImage').value=out.url;updateSupportPreview();showNotice('Фон поддержки загружен.')}catch(err){showNotice(err.message,'error')}finally{e.target.disabled=false;e.target.value=''}
});
async function saveSupportSettings(){
  const ids=['supportButtonTextEn','supportButtonTextRu','supportGreetingEn','supportGreetingRu','supportBackgroundImage','supportButtonBg','supportButtonColor','supportFieldBg','supportFieldColor','supportButtonFont','supportWindowFont'];
  const payload={};ids.forEach(id=>{const el=$('#'+id);payload[id]=String(el?.value||'').trim()});
  payload.supportText=payload.supportButtonTextEn||'SUPPORT';
  try{setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(payload)});fillSupportEditor();showNotice('Настройки поддержки сохранены.')}catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
$('#saveSupportSettings')?.addEventListener('click',saveSupportSettings);

const ORDER_STATUSES=['new','processing','paid','shipped','completed','cancelled'];
function renderOrdersAdmin(){
  const box=$('#ordersAdminList');if(!box)return;
  const q=String($('#ordersSearch')?.value||'').trim().toLowerCase();const filter=String($('#ordersStatusFilter')?.value||'');
  let orders=Array.isArray(adminState.orders)?[...adminState.orders]:[];
  orders=orders.filter(o=>{if(filter&&String(o.status)!==filter)return false;if(!q)return true;const hay=[o.number,o.email,o.customer?.firstName,o.customer?.lastName,o.customer?.name].join(' ').toLowerCase();return hay.includes(q)});
  if(!orders.length){box.innerHTML='<div class="empty-admin-list">Заказов пока нет.</div>';return}
  box.innerHTML=orders.map(o=>{
    const customer=o.customer||{};const name=[customer.firstName,customer.lastName].filter(Boolean).join(' ')||customer.name||'';
    const items=(o.items||[]).map(i=>`<div class="order-item-admin"><span>${esc(i.nameRu||i.name||'Товар')}</span><span>${esc(i.size||'—')} × ${Number(i.qty)||1}</span><strong>${adminMoney((Number(i.price)||0)*(Number(i.qty)||1),settings.currency||'$')}</strong></div>`).join('');
    return `<article class="order-admin-card" data-order-id="${esc(o.id)}"><div class="order-admin-head"><div><strong>${esc(o.number||o.id)}</strong><div>${o.createdAt?new Date(o.createdAt).toLocaleString('ru-RU'):''}</div></div><div class="order-admin-total">${adminMoney(o.total,settings.currency||'$')}</div></div><div class="order-admin-meta"><span>${esc(name||'Без имени')}</span><span>${esc(o.email||'')}</span><span>${esc(customer.phone||'')}</span><span>${esc(o.paymentMethod||'')}</span>${o.couponCode?`<span>Купон: ${esc(o.couponCode)}</span>`:''}</div><div class="order-admin-items">${items||'<span>Нет товаров</span>'}</div><label class="field order-status-field"><span>Статус</span><select data-order-status>${ORDER_STATUSES.map(st=>`<option value="${st}" ${String(o.status||'new')===st?'selected':''}>${st}</option>`).join('')}</select></label></article>`;
  }).join('');
}
$('#ordersSearch')?.addEventListener('input',renderOrdersAdmin);
$('#ordersStatusFilter')?.addEventListener('change',renderOrdersAdmin);
$('#ordersAdminList')?.addEventListener('change',async e=>{
  const select=e.target.closest('[data-order-status]');if(!select)return;const card=select.closest('[data-order-id]');if(!card)return;
  const order=(adminState.orders||[]).find(o=>String(o.id)===String(card.dataset.orderId));const prev=order?.status||'new';
  try{const saved=await api(`/api/admin/orders/${encodeURIComponent(card.dataset.orderId)}`,{method:'PUT',body:JSON.stringify({status:select.value})});if(order)Object.assign(order,saved);showNotice('Статус заказа обновлён.')}catch(err){select.value=prev;showNotice(err.message,'error')}
});

function normalizePaymentMethods(raw){
  const src=Array.isArray(raw)&&raw.length?raw:DEFAULT_PAYMENT_METHODS;
  return src.map((m,i)=>({
    id:String(m?.id||uid('payment')).trim()||uid('payment'),
    labelEn:String(m?.labelEn||m?.label||`Payment ${i+1}`).trim(),
    labelRu:String(m?.labelRu||m?.labelEn||m?.label||`Оплата ${i+1}`).trim(),
    enabled:m?.enabled!==false
  }));
}
function renderPaymentEditor(){
  const countries=$('#checkoutCountriesList');if(countries){const source=Array.isArray(settings.checkoutCountries)&&settings.checkoutCountries.length?settings.checkoutCountries:[...DEFAULT_COUNTRIES,...(Array.isArray(settings.checkoutCountriesExtra)?settings.checkoutCountriesExtra:[])];countries.value=[...new Set(source.map(x=>String(x||'').trim()).filter(x=>x&&!/^(russia|belarus)$/i.test(x)))].join('\n')}
  const box=$('#paymentMethodsEditor');if(!box)return;
  if(!paymentMethodsDraft.length){box.innerHTML='<div class="empty-admin-list">Нет способов оплаты. Добавьте хотя бы один.</div>';return}
  box.innerHTML=paymentMethodsDraft.map((m,i)=>`<div class="payment-method-row" data-payment-index="${i}">
    <div class="payment-order">${i+1}</div>
    <label class="field"><span>Название EN</span><input data-payment-field="labelEn" value="${esc(m.labelEn)}"></label>
    <label class="field"><span>Название RU</span><input data-payment-field="labelRu" value="${esc(m.labelRu)}"></label>
    <label class="check-control payment-enabled"><input type="checkbox" data-payment-field="enabled" ${m.enabled!==false?'checked':''}> Показывать</label>
    <div class="payment-row-actions">
      <button class="secondary-btn small" type="button" data-payment-up ${i===0?'disabled':''}>↑</button>
      <button class="secondary-btn small" type="button" data-payment-down ${i===paymentMethodsDraft.length-1?'disabled':''}>↓</button>
      <button class="danger-link" type="button" data-payment-delete>Удалить</button>
    </div>
  </div>`).join('');
}
$('#paymentMethodsEditor')?.addEventListener('input',e=>{
  const row=e.target.closest('[data-payment-index]');const field=e.target.dataset.paymentField;if(!row||!field)return;
  const item=paymentMethodsDraft[Number(row.dataset.paymentIndex)];if(!item)return;
  item[field]=e.target.type==='checkbox'?e.target.checked:e.target.value;
});
$('#paymentMethodsEditor')?.addEventListener('click',e=>{
  const row=e.target.closest('[data-payment-index]');if(!row)return;const i=Number(row.dataset.paymentIndex);
  if(e.target.closest('[data-payment-delete]')){paymentMethodsDraft.splice(i,1);renderPaymentEditor();return}
  if(e.target.closest('[data-payment-up]')&&i>0){[paymentMethodsDraft[i-1],paymentMethodsDraft[i]]=[paymentMethodsDraft[i],paymentMethodsDraft[i-1]];renderPaymentEditor();return}
  if(e.target.closest('[data-payment-down]')&&i<paymentMethodsDraft.length-1){[paymentMethodsDraft[i+1],paymentMethodsDraft[i]]=[paymentMethodsDraft[i],paymentMethodsDraft[i+1]];renderPaymentEditor()}
});
$('#addPaymentMethod')?.addEventListener('click',()=>{paymentMethodsDraft.push({id:uid('payment'),labelEn:'New payment',labelRu:'Новый способ',enabled:true});renderPaymentEditor()});
async function savePaymentSettings(){
  const methods=normalizePaymentMethods(paymentMethodsDraft).filter(m=>m.labelEn||m.labelRu);
  if(!methods.length||!methods.some(m=>m.enabled!==false))return showNotice('Оставьте минимум один включённый способ оплаты.','error');
  const checkoutCountries=[...new Set(String($('#checkoutCountriesList')?.value||'').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!/^(russia|belarus)$/i.test(x)))];
  if(!checkoutCountries.length)return showNotice('Добавьте минимум одну страну доставки.','error');
  try{setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify({paymentMethods:methods,checkoutCountries,checkoutCountriesExtra:[]})});paymentMethodsDraft=normalizePaymentMethods(settings.paymentMethods);renderPaymentEditor();showNotice('Способы оплаты и страны сохранены.')}catch(err){showNotice(err.message,'error')}finally{setBusy(false)}
}
$('#savePaymentSettings')?.addEventListener('click',savePaymentSettings);

boot();
