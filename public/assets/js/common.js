const SITE = fetch('/api/site').then(r=>r.json()).catch(()=>({settings:{},products:[],gallery:[],sections:[]}));
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const esc = v => String(v??'').replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
function money(v,s='$'){ return `${Number(v||0).toFixed(Number(v)%1?2:0)}${s}`; }
function ddIsVideo(url=''){return /\.(?:mp4|webm|mov|m4v)(?:[?#].*)?$/i.test(String(url||''))}
function ddMediaHtml(url,{className='',alt='',eager=false,muted=true,loop=true,controls=false}={}){
  const src=esc(url||'');if(!src)return'';
  if(ddIsVideo(url))return `<video class="${esc(className)}" src="${src}" ${muted?'muted ':''}${loop?'loop ':''}playsinline ${eager?'autoplay preload="auto"':`preload="none" data-dd-autoplay="${muted&&loop?'1':'0'}"`} ${controls?'controls ':''}aria-label="${esc(alt)}"></video>`;
  return `<img class="${esc(className)}" src="${src}" alt="${esc(alt)}" loading="${eager?'eager':'lazy'}" ${eager?'fetchpriority="high"':'fetchpriority="low"'} decoding="async">`;
}
function ddActivateLazyVideos(root=document){
  const videos=[...root.querySelectorAll('video[data-dd-autoplay="1"]')];if(!videos.length)return;
  if(!('IntersectionObserver' in window)){videos.forEach(v=>v.play().catch(()=>{}));return}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const v=entry.target;if(entry.isIntersecting){v.play().catch(()=>{})}else{v.pause()}}),{rootMargin:'180px 0px',threshold:.05});
  videos.forEach(v=>observer.observe(v));
}
function ddProductPriceLabel(product,currency='$',lang=(document.documentElement.lang==='ru'?'ru':'en')){
  const mode=String(product?.priceMode||'number');
  if(mode==='hidden')return'';
  if(mode==='text')return String(lang==='ru'?(product?.priceTextRu||product?.priceText||''):(product?.priceText||product?.priceTextRu||''));
  return money(product?.price,currency);
}
function ddProductPurchasable(product){const mode=String(product?.priceMode||'number');return product?.purchasable!==false&&mode!=='hidden'&&Number.isFinite(Number(product?.price))}
window.ddIsVideo=ddIsVideo;window.ddMediaHtml=ddMediaHtml;window.ddActivateLazyVideos=ddActivateLazyVideos;window.ddProductPriceLabel=ddProductPriceLabel;window.ddProductPurchasable=ddProductPurchasable;

const DD_WARMED_MEDIA=new Set();
const DD_WARM_MEDIA_NODES=[];
function ddWarmMedia(url=''){
  const src=String(url||'').trim();if(!src||DD_WARMED_MEDIA.has(src))return;DD_WARMED_MEDIA.add(src);
  if(ddIsVideo(src)){
    const video=document.createElement('video');video.preload='auto';video.muted=true;video.playsInline=true;video.src=src;video.load();DD_WARM_MEDIA_NODES.push(video);
  }else{
    const link=document.createElement('link');link.rel='preload';link.as='image';link.href=src;document.head.appendChild(link);
    const img=new Image();img.decoding='async';img.src=src;DD_WARM_MEDIA_NODES.push(img);
  }
}
window.ddWarmMedia=ddWarmMedia;


function ddPageBackgroundKey(){
  const p=location.pathname.toLowerCase();
  if(p==='/'||p.endsWith('/index.html'))return'home';
  if(p.includes('/product'))return'product';
  if(p.includes('/shop'))return'shop';
  if(p.includes('/gallery'))return'gallery';
  if(p.includes('/about'))return'about';
  if(p.includes('/login'))return'login';
  if(p.includes('/cart'))return'cart';
  if(p.includes('/checkout'))return'checkout';
  if(p.includes('/account'))return'account';
  if(p.includes('/contact'))return'contact';
  if(p.includes('/terms'))return'terms';
  if(p.includes('/privacy'))return'privacy';
  return'';
}
function ddApplyPageBackground(settings={}){
  const key=ddPageBackgroundKey();
  // HOME uses the same media as its hero so the existing composition is not re-scaled.
  if(!key||key==='home')return;
  const backgrounds=settings.pageBackgrounds&&typeof settings.pageBackgrounds==='object'?settings.pageBackgrounds:{};
  const url=String(backgrounds[key]||'').trim();
  if(url)ddWarmMedia(url);
  document.getElementById('ddPageBackground')?.remove();
  document.body.classList.toggle('dd-custom-page-bg',!!url);
  if(!url)return;
  let style=document.getElementById('dd-page-background-style');
  if(!style){style=document.createElement('style');style.id='dd-page-background-style';document.head.appendChild(style)}
  style.textContent=`
    html{background:#fff!important}
    body.dd-custom-page-bg{background:transparent!important}
    body.dd-custom-page-bg>main{position:relative;z-index:1;background-color:transparent!important}
    body.dd-custom-page-bg .page,body.dd-custom-page-bg .shop-wrap,body.dd-custom-page-bg .product-page,body.dd-custom-page-bg .gallery-wrap,body.dd-custom-page-bg .about-wrap,body.dd-custom-page-bg .login-wrap,body.dd-custom-page-bg .cart-wrap,body.dd-custom-page-bg .checkout-wrap,body.dd-custom-page-bg .legal-page{background-color:transparent!important}
    body.product-detail-page.dd-custom-page-bg #productPage.product-page{background:transparent!important}
    #ddPageBackground{position:fixed;inset:0;width:100vw;height:100dvh;object-fit:cover;object-position:center;z-index:0;pointer-events:none;user-select:none}
  `;
  const media=ddIsVideo(url)?document.createElement('video'):document.createElement('img');
  media.id='ddPageBackground';media.src=url;media.setAttribute('aria-hidden','true');
  if(media.tagName==='VIDEO'){media.autoplay=true;media.muted=true;media.loop=true;media.playsInline=true;media.preload='auto'}
  else{media.alt='';media.decoding='async'}
  document.body.prepend(media);if(media.tagName==='VIDEO')media.play().catch(()=>{});
}
window.ddPageBackgroundKey=ddPageBackgroundKey;window.ddApplyPageBackground=ddApplyPageBackground;
SITE.then(site=>{
  const settings=site?.settings||{};
  const backgrounds=settings.pageBackgrounds&&typeof settings.pageBackgrounds==='object'?settings.pageBackgrounds:{};
  const key=ddPageBackgroundKey();
  if(key==='home'){
    const homeBg=String(backgrounds.home||'').trim();
    const hero=homeBg||(matchMedia('(max-width:900px)').matches?settings.heroMobile:settings.heroDesktop);
    ddWarmMedia(hero);
  }else if(key){
    ddWarmMedia(backgrounds[key]);
  }
  const warmSupport=()=>ddWarmMedia(settings.supportBackgroundImage||'/assets/images/support-cross-pattern.png');
  if('requestIdleCallback' in window)requestIdleCallback(warmSupport,{timeout:900});else setTimeout(warmSupport,450);
}).catch(()=>{});
function getToken(){return localStorage.getItem('dd_token')||sessionStorage.getItem('dd_token')||''}
function authHeaders(){const t=getToken(); return t?{'Authorization':`Bearer ${t}`}:{}}
let DD_CURRENT_USER_PROMISE=null;
function currentUserSafe(){
  if(!getToken())return Promise.resolve(null);
  if(!DD_CURRENT_USER_PROMISE)DD_CURRENT_USER_PROMISE=fetch('/api/auth/me',{headers:authHeaders()}).then(async r=>r.ok?(await r.json()).user:null).catch(()=>null);
  return DD_CURRENT_USER_PROMISE;
}
window.ddCurrentUser=currentUserSafe;
function storefrontLang(){return document.documentElement.lang==='ru'?'ru':'en'}
function productText(product,field){
  if(!product)return'';
  if(storefrontLang()==='ru'){
    const ru=product[`${field}Ru`];if(String(ru??'').trim())return String(ru);
  }
  return String(product[field]??'');
}
function productImagesList(product){
  const out=[];
  for(const value of (Array.isArray(product?.images)?product.images:[])){const url=String(value||'').trim();if(url&&!out.includes(url))out.push(url)}
  const primary=String(product?.image||'').trim();if(primary&&!out.includes(primary))out.unshift(primary);
  return out;
}
function productVariantList(product){
  if(Array.isArray(product?.variants)&&product.variants.length){
    return product.variants.map(v=>({size:String(v?.size||'').trim(),stock:Math.max(0,Math.floor(Number(v?.stock)||0))})).filter(v=>v.size);
  }
  return (Array.isArray(product?.sizes)?product.sizes:[]).map(size=>({size:String(size||'').trim(),stock:null})).filter(v=>v.size);
}
function productStock(product,size){
  const normalized=normalizeCartSize(size);const list=productVariantList(product);const hit=list.find(v=>normalizeCartSize(v.size)===normalized);
  if(!hit)return 0;return hit.stock===null?Infinity:hit.stock;
}
window.ddProductText=productText;window.ddProductImages=productImagesList;window.ddProductVariants=productVariantList;window.ddProductStock=productStock;

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
function cloneJson(value){return JSON.parse(JSON.stringify(value))}
function cleanMenuText(value,fallback=''){const s=String(value??'').trim();return s||fallback}
function normalizeMenuItem(raw={},fallback={},contact=''){
  const item={...fallback,...raw};
  item.id=cleanMenuText(item.id,fallback.id||`item-${Math.random().toString(36).slice(2,8)}`);
  item.labelEn=cleanMenuText(item.labelEn,fallback.labelEn||'MENU ITEM');
  item.labelRu=cleanMenuText(item.labelRu,fallback.labelRu||item.labelEn);
  item.href=cleanMenuText(item.href,fallback.href||'#').replace('{{contact}}',contact||'');
  item.enabled=item.enabled!==false;
  item.showMobile=item.showMobile!==false;
  item.separatorBefore=!!item.separatorBefore;
  return item;
}
function getMenuConfig(settings={}){
  const defaults=cloneJson(DEFAULT_MENU_CONFIG);
  const raw=settings.menuConfig&&typeof settings.menuConfig==='object'?settings.menuConfig:{};
  const contact=String(settings.contact||'contact@demideville.example');
  const sourceGroups=Array.isArray(raw.groups)?raw.groups:defaults.groups;
  const groups=sourceGroups.map((g,index)=>{
    const fb=defaults.groups[index]||{};
    const group={...fb,...g};
    group.id=cleanMenuText(group.id,fb.id||`group-${index+1}`);
    group.labelEn=cleanMenuText(group.labelEn,fb.labelEn||`MENU ${index+1}`);
    group.labelRu=cleanMenuText(group.labelRu,fb.labelRu||group.labelEn);
    group.href=cleanMenuText(group.href,fb.href||'#').replace('{{contact}}',contact);
    group.enabled=group.enabled!==false;
    group.mobileShowMain=group.mobileShowMain!==false;
    group.mobileDarkLabel=!!group.mobileDarkLabel;
    const fallbackItems=Array.isArray(fb.items)?fb.items:[];
    const sourceItems=Array.isArray(group.items)?group.items:fallbackItems;
    group.items=sourceItems.map((item,itemIndex)=>normalizeMenuItem(item,fallbackItems[itemIndex]||{},contact));
    return group;
  });
  const fallbackMobile=defaults.mobileLinks;
  const sourceMobile=Array.isArray(raw.mobileLinks)?raw.mobileLinks:fallbackMobile;
  const mobileLinks=sourceMobile.map((item,index)=>normalizeMenuItem(item,fallbackMobile[index]||{},contact));
  const categories=Array.isArray(settings.shopCategories)?settings.shopCategories.filter(c=>c&&c.enabled!==false&&c.showInMenu!==false):[];
  if(categories.length){
    const shop=groups.find(g=>g.id==='shop');
    if(shop){
      const keep=(shop.items||[]).filter(item=>!String(item.href||'').includes('/shop.html?category='));
      const allItem=keep.find(item=>String(item.href||'').replace(/\?.*$/,'')==='/shop.html')||normalizeMenuItem({id:'shop-all',labelEn:'SHOP ALL',labelRu:'ВСЕ ТОВАРЫ',href:'/shop.html',enabled:true,showMobile:true},{},contact);
      const other=keep.filter(item=>item!==allItem);
      const generated=categories.map((c,index)=>normalizeMenuItem({id:`category-${c.slug||c.id||index}`,labelEn:c.labelEn||c.name||c.slug,labelRu:c.labelRu||c.labelEn||c.name||c.slug,href:`/shop.html?category=${encodeURIComponent(c.slug||c.id||'')}`,enabled:true,showMobile:true},{},contact));
      shop.items=[allItem,...generated,...other];
    }
  }
  if(!mobileLinks.some(x=>x.id==='instagram'))mobileLinks.push(normalizeMenuItem({id:'instagram',labelEn:'INSTAGRAM',labelRu:'INSTAGRAM',href:settings.instagram||'#',enabled:!!settings.instagram},{},contact));
  if(!mobileLinks.some(x=>x.id==='contact'))mobileLinks.push(normalizeMenuItem({id:'contact',labelEn:'CONTACT',labelRu:'КОНТАКТЫ',href:'/contact.html',enabled:true},{},contact));
  return {groups,mobileLinks};
}
function menuLang(){return document.documentElement.lang==='ru'?'ru':'en'}
function menuLabel(item,lang=menuLang()){
  if(!item)return'';
  return lang==='ru'?cleanMenuText(item.labelRu,item.labelEn):cleanMenuText(item.labelEn,item.labelRu);
}
function menuItemHtml(item,lang,{className=''}={}){
  if(!item||item.enabled===false)return'';
  return `<a${className?` class="${esc(className)}"`:''} href="${esc(item.href||'#')}">${esc(menuLabel(item,lang))}</a>`;
}
function buildMobileMenuHtml(config,lang=menuLang()){
  const groups=(config?.groups||[]).filter(g=>g.enabled!==false);
  const chunks=[];
  groups.forEach((group,index)=>{
    if(index>0)chunks.push(`<span class="home-mobile-menu-gap mobile-menu-gap small" aria-hidden="true"></span>`);
    if(group.mobileShowMain){
      chunks.push(menuItemHtml(group,lang,{className:group.mobileDarkLabel?'menu-label-dark mobile-login-link':'menu-main-link'}));
    }
    for(const item of group.items||[]){
      if(item.enabled===false||item.showMobile===false)continue;
      chunks.push(menuItemHtml(item,lang));
    }
    if(index===0){
      chunks.push(`<span class="home-mobile-menu-gap mobile-menu-gap" aria-hidden="true"></span>`);
      for(const link of config.mobileLinks||[])if(link.enabled!==false)chunks.push(menuItemHtml(link,lang));
    }
  });
  if(!groups.length){
    for(const link of config.mobileLinks||[])if(link.enabled!==false)chunks.push(menuItemHtml(link,lang));
  }
  return `<nav class="home-mobile-menu-nav">${chunks.join('')}</nav>`;
}
function safeCssFont(value){return String(value||'').replace(/[{};<>]/g,'').trim()}
function safeCssColor(value,fallback='#000000'){
  const v=String(value||'').trim();return /^#[0-9a-f]{3,8}$/i.test(v)||/^(rgb|hsl)a?\([^;{}]+\)$/i.test(v)?v:fallback;
}
function supportConfig(settings={},lang=menuLang()){
  const pick=(en,ru,fallbackEn,fallbackRu)=>lang==='ru'?String(settings[ru]||fallbackRu):String(settings[en]||fallbackEn);
  return {
    buttonText:pick('supportButtonTextEn','supportButtonTextRu',settings.supportText||'SUPPORT','ПОДДЕРЖКА'),
    greeting:pick('supportGreetingEn','supportGreetingRu','Thanks for stopping by! How can I help you?','Спасибо, что заглянули! Чем я могу помочь?'),
    emailPlaceholder:pick('supportEmailPlaceholderEn','supportEmailPlaceholderRu','YOUR EMAIL','ВАША ПОЧТА'),
    messagePlaceholder:pick('supportMessagePlaceholderEn','supportMessagePlaceholderRu','HOW CAN WE HELP?','ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?'),
    send:pick('supportSendTextEn','supportSendTextRu','SEND','ОТПРАВИТЬ'),
    backgroundImage:String(settings.supportBackgroundImage||'/assets/images/support-cross-pattern.png'),
    buttonBg:safeCssColor(settings.supportButtonBg||'#000000','#000000'),buttonColor:safeCssColor(settings.supportButtonColor||'#ffffff','#ffffff'),
    fieldBg:safeCssColor(settings.supportFieldBg||'#000000','#000000'),fieldColor:safeCssColor(settings.supportFieldColor||'#ffffff','#ffffff'),
    buttonFont:safeCssFont(settings.supportButtonFont||''),windowFont:safeCssFont(settings.supportWindowFont||'')
  };
}
function applySupportRuntimeStyles(settings={}){
  const root=document.documentElement.style;
  const cfg=supportConfig(settings,'en');
  const bg=String(cfg.backgroundImage||'').replace(/["'\\()]/g,m=>'\\'+m);
  root.setProperty('--dd-support-button-bg',cfg.buttonBg);root.setProperty('--dd-support-button-color',cfg.buttonColor);
  root.setProperty('--dd-support-field-bg',cfg.fieldBg);root.setProperty('--dd-support-field-color',cfg.fieldColor);
  root.setProperty('--dd-support-bg-image',bg&&!ddIsVideo(cfg.backgroundImage)?`url("${bg}")`:'none');
  root.setProperty('--dd-support-button-font',cfg.buttonFont||'"Benzin Semibold","Benzin-Semibold","Arial Black",Arial,sans-serif');
  root.setProperty('--dd-support-window-font',cfg.windowFont||'"DD Oswald","Arial Narrow",Arial,sans-serif');
}
window.ddSupportConfig=supportConfig;window.ddApplySupportRuntimeStyles=applySupportRuntimeStyles;
function applyMenuRuntimeStyles(settings={}){
  let style=document.getElementById('dd-menu-runtime-style');
  if(!style){style=document.createElement('style');style.id='dd-menu-runtime-style';document.head.appendChild(style)}
  const df=safeCssFont(settings.menuDesktopFont||'');
  const mf=safeCssFont(settings.menuMobileFont||'');
  const ds=Math.max(0,Math.min(80,Number(settings.menuDesktopFontSize)||0));
  const ms=Math.max(0,Math.min(80,Number(settings.menuMobileFontSize)||0));
  const dw=Number(settings.menuDesktopFontWeight)>0?Math.max(100,Math.min(900,Number(settings.menuDesktopFontWeight))):0;
  const mw=Number(settings.menuMobileFontWeight)>0?Math.max(100,Math.min(900,Number(settings.menuMobileFontWeight))):0;
  const underlineRaw=String(settings.menuUnderlineColor||'').trim();
  const underline=underlineRaw?safeCssColor(underlineRaw,'currentColor'):'currentColor';
  const desktopCustom=!!(df||ds||Number(settings.menuDesktopFontWeight));
  document.documentElement.classList.toggle('dd-menu-desktop-custom',desktopCustom);
  style.textContent=`
    :root{--dd-menu-underline:${underline};}
    .home .home-flyout a,body.shared-chrome-page .shared-header-flyout a{position:relative;}
    .home .home-flyout a::after,body.shared-chrome-page .shared-header-flyout a::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--dd-menu-underline)!important;transform:scaleX(0);transform-origin:left center;transition:transform .22s cubic-bezier(.2,.8,.2,1);pointer-events:none;}
    .home .home-flyout a:hover::after,.home .home-flyout a:focus-visible::after,body.shared-chrome-page .shared-header-flyout a:hover::after,body.shared-chrome-page .shared-header-flyout a:focus-visible::after{transform:scaleX(1);}
    @media(min-width:901px){
      ${df?`.home .home-nav-main,.home .home-flyout a,body.shared-chrome-page .shared-header-flyout a,html.dd-menu-desktop-custom body.shared-chrome-page #desktopHeader .nav-side>a:not(.global-cart-icon){font-family:${df}!important;}`:''}
      ${ds?`.home .home-nav-main,.home .home-flyout a,body.shared-chrome-page .shared-header-flyout a,html.dd-menu-desktop-custom body.shared-chrome-page #desktopHeader .nav-side>a:not(.global-cart-icon){font-size:${ds}px!important;}`:''}
      ${dw?`.home .home-nav-main,.home .home-flyout a,body.shared-chrome-page .shared-header-flyout a,html.dd-menu-desktop-custom body.shared-chrome-page #desktopHeader .nav-side>a:not(.global-cart-icon){font-weight:${dw}!important;}`:''}
      html.dd-menu-desktop-custom body.shared-chrome-page #desktopHeader .nav-side>a:not(.global-cart-icon){background-image:none!important;color:#000!important;width:auto!important;height:auto!important;line-height:1.15!important;}
      html.dd-menu-desktop-custom body.shared-chrome-page #desktopHeader .nav-side{gap:34px!important;}
    }
    @media(max-width:900px){
      body.mobile-menu-open .home #homeMobileMenu .menu-label-dark,body.shared-chrome-page.mobile-menu-open #mobileMenu .menu-label-dark{color:#000!important;}
      ${mf?`.home #homeMenuOpen,.home #homeMobileMenu .home-mobile-menu-nav a,body.shared-chrome-page #mobileHeader .mobile-menu-btn,body.shared-chrome-page #mobileMenu .home-mobile-menu-nav a{font-family:${mf}!important;}`:''}
      ${ms?`.home #homeMobileMenu .home-mobile-menu-nav a,body.shared-chrome-page #mobileMenu .home-mobile-menu-nav a{font-size:${ms}px!important;}`:''}
      ${mw?`.home #homeMobileMenu .home-mobile-menu-nav a,body.shared-chrome-page #mobileMenu .home-mobile-menu-nav a{font-weight:${mw}!important;}`:''}
    }
  `;
}
window.ddGetMenuConfig=getMenuConfig;
window.ddMenuLabel=menuLabel;
window.ddBuildMobileMenuHtml=buildMobileMenuHtml;
window.ddApplyMenuRuntimeStyles=applyMenuRuntimeStyles;

function normalizeCartSize(v){
  return String(v??'').trim().replace(/\s+/g,' ').toUpperCase();
}
function normalizeCart(items){
  const merged=[];
  const byKey=new Map();
  for(const raw of (Array.isArray(items)?items:[])){
    if(!raw || raw.productId==null) continue;
    const productId=String(raw.productId).trim();
    const size=normalizeCartSize(raw.size);
    const qty=Math.max(1,Math.floor(Number(raw.qty)||1));
    const key=`${productId}\u0000${size}`;
    if(byKey.has(key)){
      merged[byKey.get(key)].qty+=qty;
    }else{
      byKey.set(key,merged.length);
      merged.push({...raw,productId,size,qty});
    }
  }
  return merged;
}
function cartGet(){
  try{
    const raw=JSON.parse(localStorage.getItem('dd_cart')||'[]');
    const normalized=normalizeCart(raw);
    if(JSON.stringify(raw)!==JSON.stringify(normalized)){
      localStorage.setItem('dd_cart',JSON.stringify(normalized));
    }
    return normalized;
  }catch{
    return [];
  }
}
function cartSet(c){
  const normalized=normalizeCart(c);
  localStorage.setItem('dd_cart',JSON.stringify(normalized));
  updateCartCount();
}
function updateCartCount(){
  const n=cartGet().reduce((a,x)=>a+(Number(x.qty)||1),0);
  $$('[data-cart-count]').forEach(el=>{
    if(el.closest('.global-cart-icon'))el.textContent='';
    else el.textContent=n?` (${n})`:'';
  });
  $$('.global-cart-icon, .mobile-cart').forEach(el=>{
    el.classList.toggle('has-items',n>0);
    el.setAttribute('aria-label',n?`Cart (${n})`:'Cart');
    el.setAttribute('aria-hidden',String(n===0));
    if(n===0)el.setAttribute('tabindex','-1');else el.removeAttribute('tabindex');
  });
}
async function renderChrome({home=false}={}){
  const site=await SITE,s=site.settings||{};
  const currentUser=await currentUserSafe();
  const menu=getMenuConfig(s),lang=menuLang();
  if(currentUser){
    const loginGroup=menu.groups.find(g=>g.id==='login');
    if(loginGroup){loginGroup.labelEn='ACCOUNT';loginGroup.labelRu='АККАУНТ';loginGroup.href='/account.html';loginGroup.items=(loginGroup.items||[]).map(item=>item.id==='register'?{...item,enabled:false}:item.id==='account'?{...item,href:'/account.html',showMobile:false}:item)}
  }
  applyMenuRuntimeStyles(s);
  applySupportRuntimeStyles(s);
  ddApplyPageBackground(s);
  document.documentElement.style.setProperty('--font',s.baseFont||'Arial, Helvetica, sans-serif');
  document.documentElement.style.setProperty('--display',s.displayFont||'Arial Black, Arial, sans-serif');
  document.documentElement.style.setProperty('--condensed',s.condensedFont||'Impact, Arial Narrow, sans-serif');
  document.documentElement.style.setProperty('--base-size',`${Number(s.baseFontSize||16)}px`);
  $$('[data-brand]').forEach(e=>e.textContent=s.brand||'DEMI DEVILLE');
  const shopGroup=menu.groups.find(g=>g.id==='shop'&&g.enabled!==false);
  const loginGroup=menu.groups.find(g=>g.id==='login'&&g.enabled!==false);
  const galleryLink=menu.mobileLinks.find(x=>x.id==='gallery');
  const aboutLink=menu.mobileLinks.find(x=>x.id==='about');
  const desktop=$('#desktopHeader');
  if(desktop&&!home){
    const desktopSections=(site.sections||[]).map(x=>`<a href="/section.html?slug=${encodeURIComponent(x.slug)}">${esc(x.title)}</a>`).join('');
    const cartCurrent=location.pathname.includes('cart')||location.pathname.includes('checkout');
    const shopAnchor=shopGroup?`<a class="menu-admin-shop" href="${esc(shopGroup.href||'/shop.html')}">${esc(menuLabel(shopGroup,lang)||'SHOP')}</a>`:'';
    const loginAnchor=loginGroup?`<a class="menu-admin-login" href="${esc(loginGroup.href||'/login.html')}">${esc(menuLabel(loginGroup,lang)||'LOGIN')}</a>`:'';
    const galleryAnchor=galleryLink&&galleryLink.enabled!==false?`<a href="${esc(galleryLink.href||'/gallery.html')}">${esc(menuLabel(galleryLink,lang)||'GALLERY')}</a>`:'';
    const aboutAnchor=aboutLink&&aboutLink.enabled!==false?`<a href="${esc(aboutLink.href||'/about.html')}">${esc(menuLabel(aboutLink,lang)||'ABOUT')}</a>`:'';
    desktop.innerHTML=`<div class="nav-side">${shopAnchor}${galleryAnchor}${aboutAnchor}${desktopSections}</div><a class="brand" data-brand href="/">${esc(s.brand||'DEMI DEVILLE')}</a><a class="cart-link global-cart-icon${cartCurrent?' cart-current':''}" href="/cart.html" aria-label="Cart"></a><div class="nav-side right"><a href="${esc(s.instagram||'#')}" target="_blank" rel="noreferrer">INSTAGRAM</a><a href="/contact.html">CONTACT</a>${loginAnchor}</div>`;
  }
  const mobile=$('#mobileHeader');
  if(mobile)mobile.classList.toggle('transparent',home),mobile.innerHTML=`<button class="mobile-menu-btn" aria-label="Menu">${lang==='ru'?'МЕНЮ':'MENU'}</button><a class="brand" href="/" data-brand>${esc(s.brand||'DEMI DEVILLE')}</a><a class="mobile-cart" href="/cart.html">${home?'':'🛒'}<span data-cart-count></span></a>`;
  const mm=$('#mobileMenu');
  if(mm){
    mm.innerHTML=buildMobileMenuHtml(menu,lang);
    const menuButton=$('.mobile-menu-btn');
    const setMobileMenu=open=>{mm.classList.toggle('open',open);mm.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('mobile-menu-open',open)};
    menuButton?.addEventListener('click',()=>setMobileMenu(!mm.classList.contains('open')));
    document.addEventListener('pointerdown',e=>{if(!mm.classList.contains('open'))return;if(mm.contains(e.target)||menuButton?.contains(e.target))return;setMobileMenu(false)});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setMobileMenu(false)});
  }
  updateCartCount();
  if(!home)mountSharedChrome(site,menu,currentUser);
}

function flyoutItemsHtml(items,lang){
  return (items||[]).filter(x=>x.enabled!==false).map(item=>`${item.separatorBefore?'<span class="shared-header-flyout-gap"></span>':''}${menuItemHtml(item,lang)}`).join('');
}
/* All storefront pages except the home page use one shared header and support shell. */
function mountSharedChrome(site,menu=getMenuConfig(site.settings||{}),currentUser=null){
  if(document.body.classList.contains('shared-chrome-page'))return;
  document.body.classList.add('shared-chrome-page');
  const lang=menuLang();
  const shopGroup=menu.groups.find(g=>g.id==='shop'&&g.enabled!==false);
  const loginGroup=menu.groups.find(g=>g.id==='login'&&g.enabled!==false);
  const header=$('#desktopHeader');
  if(header){
    if(header.parentElement!==document.body)document.body.appendChild(header);
    const left=document.createElement('div');left.className='shared-header-flyout shared-header-flyout-left';left.innerHTML=`<nav>${flyoutItemsHtml(shopGroup?.items||[],lang)}</nav>`;
    const right=document.createElement('div');right.className='shared-header-flyout shared-header-flyout-right';right.innerHTML=`<nav>${flyoutItemsHtml(loginGroup?.items||[],lang)}</nav>`;
    header.append(left,right);
    const triggers=[[header.querySelector('.menu-admin-shop'),left],[header.querySelector('.menu-admin-login'),right]];
    for(const [trigger,panel] of triggers){
      if(!trigger)continue;let timer=0;
      const open=()=>{clearTimeout(timer);for(const [other,flyout] of triggers){if(flyout!==panel){flyout.classList.remove('is-open');other?.classList.remove('is-flyout-active')}}trigger.classList.add('is-flyout-active');panel.classList.add('is-open')};
      const close=()=>{clearTimeout(timer);timer=setTimeout(()=>{panel.classList.remove('is-open');trigger.classList.remove('is-flyout-active')},110)};
      trigger.addEventListener('mouseenter',open);trigger.addEventListener('focus',open);trigger.addEventListener('mouseleave',close);trigger.addEventListener('blur',close);panel.addEventListener('mouseenter',open);panel.addEventListener('mouseleave',close);
    }
  }

  $$('#shopSupportOpen, #supportOpen, [data-support], #shopSupportLayer, #supportLayer').forEach(el=>el.remove());
  const tr=text=>window.ddTranslate?.(text)||text;
  const supportCfg=supportConfig(site.settings||{},lang);
  ddWarmMedia(supportCfg.backgroundImage);
  applySupportRuntimeStyles(site.settings||{});
  const shell=document.createElement('div');
  shell.className='shared-support-root';
  shell.innerHTML=`<button id="sharedSupportOpen" class="support-btn shared-support-button" type="button">${esc(supportCfg.buttonText)}</button>
    <div id="sharedSupportLayer" class="support-layer shared-support-layer" aria-hidden="true">
      <div class="support-window shared-support-window" role="dialog" aria-label="DEMI DEVILLE support">
        <button id="sharedSupportClose" class="support-close" type="button" aria-label="${tr('Close support')}">×</button>
        <div class="support-panel">
          <div class="support-brand">DEMI DEVILLE</div>
          <div class="support-chat-body support-email-body">
            ${ddIsVideo(supportCfg.backgroundImage)?`<video class="support-background-video" src="${esc(supportCfg.backgroundImage)}" autoplay muted loop playsinline preload="auto"></video>`:''}
            <div class="support-mobile-intro">${esc(supportCfg.greeting)}</div>
            <form id="sharedSupportForm" class="support-form" novalidate>
              <input id="sharedSupportEmail" class="support-form-input" name="email" type="email" autocomplete="email" required placeholder="${esc(supportCfg.emailPlaceholder)}">
              <textarea id="sharedSupportMessage" class="support-form-message" name="message" required placeholder="${esc(supportCfg.messagePlaceholder)}"></textarea>
              <button id="sharedSupportSubmit" class="support-form-submit" type="submit">${esc(supportCfg.send)}</button>
              <div id="sharedSupportStatus" class="support-form-status" aria-live="polite"></div>
            </form>
          </div>
        </div>
      </div>
    </div>`;
  document.body.append(...shell.childNodes);
  const button=$('#sharedSupportOpen'),layer=$('#sharedSupportLayer'),windowEl=$('.shared-support-window');
  const closeButton=$('#sharedSupportClose'),form=$('#sharedSupportForm');
  const submit=$('#sharedSupportSubmit'),status=$('#sharedSupportStatus');
  const supportEmail=$('#sharedSupportEmail');if(currentUser?.email&&supportEmail)supportEmail.value=currentUser.email;
  let timer=0;
  const setOpen=open=>{clearTimeout(timer);layer.classList.toggle('open',open);layer.setAttribute('aria-hidden',String(!open))};
  const delayedClose=()=>{clearTimeout(timer);timer=setTimeout(()=>setOpen(false),320)};
  button.addEventListener('mouseenter',()=>setOpen(true));button.addEventListener('focus',()=>setOpen(true));button.addEventListener('mouseleave',delayedClose);button.addEventListener('click',()=>setOpen(true));
  windowEl.addEventListener('mouseenter',()=>clearTimeout(timer));windowEl.addEventListener('mouseleave',delayedClose);closeButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setOpen(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  form.addEventListener('submit',async e=>{
    e.preventDefault();const email=$('#sharedSupportEmail').value.trim();const message=$('#sharedSupportMessage').value.trim();const error=tr('PLEASE CHECK YOUR EMAIL AND MESSAGE.');status.classList.remove('error');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<2){status.textContent=error;status.classList.add('error');return}
    submit.disabled=true;submit.textContent=tr('SENDING…');
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),25000);
    try{
      const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({email,message,lang:document.documentElement.lang==='ru'?'ru':'en'}),signal:controller.signal});
      const data=await r.json().catch(()=>({}));
      if(!r.ok){const detail=[data.error,data.debug?`DEBUG: ${data.debug}`:'',data.hint?`HINT: ${data.hint}`:''].filter(Boolean).join(' ');throw new Error(detail||'Support request failed')}
      status.textContent=tr('THANK YOU. YOUR MESSAGE HAS BEEN SENT.');form.reset();if(currentUser?.email&&supportEmail)supportEmail.value=currentUser.email;
    }catch(err){
      const prefix=document.documentElement.lang==='ru'?'ОШИБКА ОТПРАВКИ: ':'SEND ERROR: ';status.textContent=prefix+(err?.name==='AbortError'?'SMTP timeout. Проверьте SMTP настройки в Railway / GoDaddy.':(err?.message||error));status.classList.add('error');
    }finally{clearTimeout(timeout);submit.disabled=false;submit.textContent=supportCfg.send}
  });
  const fit=()=>{if(innerWidth<=900)return;const h=window.visualViewport?.height||innerHeight;const sx=innerWidth/1920,sy=h/1080,s=Math.min(sx,sy);document.body.style.setProperty('--shared-chrome-x',sx);document.body.style.setProperty('--shared-chrome-y',sy);document.body.style.setProperty('--shared-chrome-y-inverse',1/sy);document.body.style.setProperty('--shared-support-scale',s);document.body.style.setProperty('--shared-support-right',`${22*s}px`);document.body.style.setProperty('--shared-support-bottom',`${25*s}px`)};
  fit();addEventListener('resize',fit,{passive:true});window.visualViewport?.addEventListener('resize',fit,{passive:true});
}
function addToCart(productId,size,qty=1){
  const cart=cartGet();const pid=String(productId??'').trim();const normalizedSize=normalizeCartSize(size);const amount=Math.max(1,Math.floor(Number(qty)||1));
  const hit=cart.find(x=>String(x.productId)===pid&&normalizeCartSize(x.size)===normalizedSize);
  if(hit)hit.qty=(Number(hit.qty)||1)+amount;else cart.push({productId:pid,size:normalizedSize,qty:amount});cartSet(cart);
}
