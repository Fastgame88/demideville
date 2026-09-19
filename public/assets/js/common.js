const SITE = fetch('/api/site').then(r=>r.json()).then(site=>{prepareAdminRuntime(site);return site}).catch(()=>({settings:{},products:[],gallery:[],sections:[]}));
const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>[...root.querySelectorAll(s)];
const esc = v => String(v??'').replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[c]));
function money(v,s='$'){ return `${Number(v||0).toFixed(Number(v)%1?2:0)}${s}`; }
function getToken(){return localStorage.getItem('dd_token')||''}
function authHeaders(){const t=getToken(); return t?{'Authorization':`Bearer ${t}`}:{}}
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

  /* Keep numeric counts only where the UI explicitly uses a count.
     Desktop cart icon itself never renders "(7)" or any other text. */
  $$('[data-cart-count]').forEach(el=>{
    if(el.closest('.global-cart-icon')){
      el.textContent='';
    }else{
      el.textContent=n?` (${n})`:'';
    }
  });

  $$('.global-cart-icon').forEach(el=>{
    el.classList.toggle('has-items',n>0);
    el.setAttribute('aria-label',n?`Cart (${n})`:'Cart');
  });
}
async function renderChrome({home=false}={}){
  const site=await SITE, s=site.settings||{};
  document.documentElement.style.setProperty('--font',s.baseFont||'Arial, Helvetica, sans-serif');
  document.documentElement.style.setProperty('--display',s.displayFont||'Arial Black, Arial, sans-serif');
  document.documentElement.style.setProperty('--condensed',s.condensedFont||'Impact, Arial Narrow, sans-serif');
  document.documentElement.style.setProperty('--base-size',`${Number(s.baseFontSize||16)}px`);
  $$('[data-brand]').forEach(e=>e.textContent=s.brand||'DEMI DEVILLE');
  const desktop=$('#desktopHeader');
  if(desktop && !home){
    const cartCurrent=location.pathname.includes('cart')||location.pathname.includes('checkout');
    desktop.innerHTML=`<div class="nav-side"><a href="/shop.html">SHOP</a><a href="/gallery.html">GALLERY</a><a href="/about.html">ABOUT</a></div><a class="brand brand-image" href="/" aria-label="${esc(s.brand||'DEMI DEVILLE')}"></a><a class="cart-link global-cart-icon${cartCurrent?' cart-current':''}" href="/cart.html" aria-label="Cart"></a><div class="nav-side right"><a href="${esc(s.instagram||'#')}" target="_blank" rel="noreferrer">INSTAGRAM</a><a href="mailto:${esc(s.contact||'')}">CONTACT</a><a href="/login.html">LOGIN</a></div>`;
  }
  const mobile=$('#mobileHeader');
  if(mobile){mobile.classList.toggle('transparent',home);mobile.innerHTML=`<button class="mobile-menu-btn" aria-label="Menu">MENU</button><a class="brand" href="/" data-brand>${esc(s.brand||'DEMI DEVILLE')}</a><a class="mobile-cart" href="/cart.html">${home?'':'🛒'}<span data-cart-count></span></a>`;}
  const mm=$('#mobileMenu');
  if(mm){mm.innerHTML=`<div class="mobile-menu-top"><span class="brand">${esc(s.brand||'DEMI DEVILLE')}</span><button class="mobile-menu-close">×</button></div><nav><a href="/shop.html">SHOP</a><a href="/gallery.html">GALLERY</a><a href="/about.html">ABOUT</a></nav><div class="small-links"><a href="${esc(s.instagram||'#')}" target="_blank">INSTAGRAM</a><a href="mailto:${esc(s.contact||'')}">CONTACT</a><a href="/login.html">LOGIN / REGISTER</a><a href="/cart.html">BAG<span data-cart-count></span></a></div>`;$('.mobile-menu-btn')?.addEventListener('click',()=>mm.classList.add('open'));$('.mobile-menu-close',mm)?.addEventListener('click',()=>mm.classList.remove('open'));}
  $$('[data-support]').forEach(b=>{b.textContent=s.supportText||'SUPPORT';b.onclick=()=>{if(s.contact)location.href=`mailto:${s.contact}`}});
  updateCartCount();
}
function addToCart(productId,size,qty=1){
  const cart=cartGet();
  const pid=String(productId??'').trim();
  const normalizedSize=normalizeCartSize(size);
  const amount=Math.max(1,Math.floor(Number(qty)||1));
  const hit=cart.find(x=>String(x.productId)===pid && normalizeCartSize(x.size)===normalizedSize);
  if(hit) hit.qty=(Number(hit.qty)||1)+amount;
  else cart.push({productId:pid,size:normalizedSize,qty:amount});
  cartSet(cart);
}

/* =========================================================
   ADMIN / NO-CODE RUNTIME
   Applies page text, images, fonts, menus and payment methods.
   ========================================================= */
const DD_LOCAL_FONTS=new Set(['','Arial','Arial Narrow','Impact','Century Gothic','Benzin Regular','Benzin Medium','Benzin Semibold','DD Checkout Narrow','DD Oswald']);
const DD_LOADED_FONTS=new Set();
function ddLoadFont(name){
  name=String(name||'').trim();
  if(!name||DD_LOCAL_FONTS.has(name)||DD_LOADED_FONTS.has(name))return;
  DD_LOADED_FONTS.add(name);
  const link=document.createElement('link');link.rel='stylesheet';link.href=`https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g,'+')}&display=swap`;document.head.appendChild(link);
}
function ddImportant(el,prop,val){if(el&&val!==''&&val!=null)el.style.setProperty(prop,String(val),'important')}
function ddApplyStyle(el,pageCfg,item){
  const family=item?.fontFamily||pageCfg?.fontFamily||'';
  const size=item?.fontSize||pageCfg?.fontSize||'';
  const weight=item?.fontWeight||pageCfg?.fontWeight||'';
  if(family){ddLoadFont(family);ddImportant(el,'font-family',`"${family}", Arial, sans-serif`)}
  if(size)ddImportant(el,'font-size',`${Number(size)||size}px`);
  if(weight)ddImportant(el,'font-weight',weight);
}
function ddSetLabelText(el,value){
  if(!el)return;
  const input=el.querySelector('input');
  const current=[...el.childNodes].filter(n=>n!==input).map(n=>n.textContent||'').join('').trim();
  if(current===String(value??'').trim())return;
  [...el.childNodes].filter(n=>n!==input).forEach(n=>n.remove());
  el.appendChild(document.createTextNode(` ${value??''}`));
}
function ddElements(spec){const list=[...document.querySelectorAll(spec.selector)];return Number.isInteger(spec.index)?(list[spec.index]?[list[spec.index]]:[]):list}
function ddApplyNav(site){
  const n=site?.settings?.navEditor||{};
  const shopItems=Array.isArray(n.shopItems)&&n.shopItems.length?n.shopItems:[
    {label:n.shopAll||'SHOP ALL',href:'/shop.html'},
    {label:n.jackets||'JACKETS & COATS',href:'/shop.html?category=jackets-coats'},
    {label:n.jeans||'JEANS, PANTS & SHORTS',href:'/shop.html?category=jeans-pants-shorts'},
    {label:n.tops||'TOPS',href:'/shop.html?category=tops'},
    {label:n.bags||'BAGS & ACCESSORIES',href:'/shop.html?category=bags-accessories'}
  ];
  const loginItems=Array.isArray(n.loginItems)&&n.loginItems.length?n.loginItems:[
    {label:n.cart||'CART',href:'/cart.html'},
    {label:n.register||'REGISTER',href:'/login.html#register'},
    {label:n.account||'ACCOUNT',href:'/login.html'},
    {label:n.about||'ABOUT',href:'/about.html'},
    {label:n.services||'CLIENT SERVICES',href:`mailto:${site?.settings?.contact||''}`}
  ];

  const links=items=>items.map(x=>`<a href="${esc(x.href||'#')}">${esc(x.label||'')}</a>`).join('');
  const loginLinks=(gapClass='')=>{
    const first=loginItems.slice(0,3);
    const rest=loginItems.slice(3);
    const gap=rest.length?`<span class="${esc(gapClass)}" aria-hidden="true"></span>`:'';
    return `${links(first)}${gap}${links(rest)}`;
  };

  /* HOME flyouts do not contain a nested <nav>; update only their links. */
  document.querySelectorAll('.home .shop-flyout').forEach(panel=>{panel.innerHTML=links(shopItems)});
  document.querySelectorAll('.home .login-flyout').forEach(panel=>{panel.innerHTML=loginLinks('login-flyout-gap')});

  /* Internal-page flyouts MUST keep their <nav> wrapper. The page CSS positions
     that wrapper; replacing the whole panel is what previously broke LOGIN/SHOP. */
  const leftNavs=document.querySelectorAll([
    '.shop-header-flyout-left nav',
    '.login-header-flyout-left nav',
    '.gallery-header-flyout-left nav',
    '.checkout-header-flyout-left nav'
  ].join(','));
  leftNavs.forEach(nav=>{nav.innerHTML=links(shopItems)});

  const rightNavs=document.querySelectorAll([
    '.shop-header-flyout-right nav',
    '.login-header-flyout-right nav',
    '.gallery-header-flyout-right nav',
    '.checkout-header-flyout-right nav'
  ].join(','));
  rightNavs.forEach(nav=>{
    nav.innerHTML=loginLinks('shop-header-flyout-gap login-header-flyout-gap gallery-header-flyout-gap checkout-header-flyout-gap');
  });

  const mobileNav=document.querySelector('.home-mobile-menu-nav');
  if(mobileNav){
    mobileNav.innerHTML=`${links(shopItems)}<span class="home-mobile-menu-gap" aria-hidden="true"></span><a href="/gallery.html">${esc(n.gallery||'GALLERY')}</a><a href="/about.html">${esc(n.about||'ABOUT')}</a><span class="home-mobile-menu-gap small" aria-hidden="true"></span><span class="menu-label-dark">${esc(n.loginMain||'LOGIN')}</span>${links(loginItems)}`;
  }
}

function ddApplyPayments(site){
  if(!/checkout(?:\.html)?$/.test(location.pathname))return;
  const box=document.querySelector('.pay-methods');if(!box)return;
  const methods=Array.isArray(site?.settings?.paymentMethods)&&site.settings.paymentMethods.length?site.settings.paymentMethods:[{label:'PayPal'},{label:'ApplePay'},{label:'GooglePay'},{label:'Crypto payment'},{label:'Card payment'}];
  box.classList.toggle('admin-custom-payments',methods.length!==5);
  box.innerHTML=methods.map((m,i)=>`<button type="button" class="pay-chip${i===methods.length-1?' active':''}" data-pay="${esc(m.label)}">${esc(m.label)}</button>`).join('');
}
const DD_PAGE_MAP={
  home:{path:p=>p==='/'||p==='/index.html',root:'#homePage',fields:{heroLogo:{selector:'#heroTitle',mode:'backgroundImage'},heroDesktop:{selector:'#heroImage',mode:'desktopImage',settingKey:'heroDesktop'},heroMobile:{selector:'#heroImage',mode:'mobileImage',settingKey:'heroMobile'},supportText:{selector:'#supportOpen',mode:'text',settingKey:'supportText'}}},
  shop:{path:p=>p==='/shop.html'||p==='/shop',root:'.shop-page',fields:{termsText:{selector:'.shop-terms',mode:'text'},paginationStyle:{selector:'.shop-pagination,.shop-page-number,.shop-page-indicator',mode:'style'},shopPageSize:{selector:'.shop-pagination,.shop-page-number',mode:'style'},supportText:{selector:'#shopSupportOpen',mode:'text'}}},
  gallery:{path:p=>p==='/gallery.html'||p==='/gallery',root:'.gallery-page',fields:{emptyText:{selector:'#galleryList>p',mode:'text'},supportText:{selector:'#supportOpen',mode:'text'}}},
  about:{path:p=>p==='/about.html'||p==='/about',root:'.about-page',fields:{aboutText:{selector:'.about-design-canvas',mode:'aboutHtml'},supportText:{selector:'#supportOpen',mode:'text'}}},
  login:{path:p=>p==='/login.html'||p==='/login',root:'.login-page',fields:{loginArt:{selector:'#loginArt',mode:'image'},registerTitle:{selector:'.auth-title',index:0,mode:'text'},namePlaceholder:{selector:'#registerForm input[name="name"]',mode:'placeholder'},registerEmailPlaceholder:{selector:'#registerForm input[name="email"]',mode:'placeholder'},newsletterText:{selector:'#registerForm .check-row',index:0,mode:'labelText'},registerPasswordPlaceholder:{selector:'#registerForm input[name="password"]',mode:'placeholder'},registerRememberText:{selector:'#registerForm .check-row',index:1,mode:'labelText'},createAccount:{selector:'#registerForm .btn-black',mode:'text'},loginTitle:{selector:'.auth-title',index:1,mode:'text'},loginEmailPlaceholder:{selector:'#loginForm input[name="email"]',mode:'placeholder'},loginPasswordPlaceholder:{selector:'#loginForm input[name="password"]',mode:'placeholder'},loginRememberText:{selector:'#loginForm .check-row',index:0,mode:'labelText'},loginButton:{selector:'#loginForm .btn-black',mode:'text'},supportText:{selector:'#supportOpen',mode:'text'}}},
  product:{path:p=>p==='/product.html'||p==='/product',root:'.product-detail-page',fields:{sizeLabel:{selector:'.field-label',mode:'text'},selectSize:{selector:'#sizeToggle',mode:'text'},addToBag:{selector:'#addToBag',mode:'text'},buyNow:{selector:'#buyNow',mode:'text'},descriptionTitle:{selector:'[data-accordion="details"] .acc-trigger',mode:'text'},fabricTitle:{selector:'[data-accordion="fabric"] .acc-trigger',mode:'text'},sizeTitle:{selector:'[data-accordion="size"] .acc-trigger',mode:'text'},deliveryTitle:{selector:'[data-accordion="delivery"] .acc-trigger',mode:'text'},supportText:{selector:'#supportOpen',mode:'text'}}},
  cart:{path:p=>p==='/cart.html'||p==='/cart',root:'.cart-page',fields:{checkoutText:{selector:'#checkoutButton',mode:'text'},totalText:{selector:'.total-row span:first-child',mode:'text'},supportText:{selector:'#supportOpen',mode:'text'}}},
  checkout:{path:p=>p==='/checkout.html'||p==='/checkout',root:'.checkout-page',fields:{contactTitle:{selector:'.checkout-section-title',index:0,mode:'text'},deliveryTitle:{selector:'.checkout-section-title',index:1,mode:'text'},discountPlaceholder:{selector:'#discountCode',mode:'placeholder'},applyText:{selector:'#discountApply',mode:'text'},subtotalText:{selector:'.sum-row:not(.sum-total) span:first-child',index:0,mode:'text'},shippingText:{selector:'.sum-row:not(.sum-total) span:first-child',index:1,mode:'text'},totalText:{selector:'.sum-total span:first-child',mode:'text'},reviewText:{selector:'.review-btn',mode:'text'},supportText:{selector:'#supportOpen',mode:'text'}}}
};
function ddPageKey(){const p=location.pathname.replace(/\/+$/,'')||'/';return Object.keys(DD_PAGE_MAP).find(k=>DD_PAGE_MAP[k].path(p))||''}
function ddApplyAboutHtml(spec,item,pageCfg){const canvas=document.querySelector(spec.selector);if(!canvas)return;let editable=canvas.querySelector('.about-admin-copy');const value=String(item?.value||'').trim();const art=canvas.querySelector('.about-copy-art');if(!value){if(editable)editable.remove();if(art)art.style.removeProperty('display');return}if(!editable){editable=document.createElement('div');editable.className='about-copy about-admin-copy';canvas.appendChild(editable)}if(editable.innerHTML!==value)editable.innerHTML=value;if(art)art.style.setProperty('display','none','important');editable.style.setProperty('display','block','important');ddApplyStyle(editable,pageCfg,item);editable.hidden=item?.visible===false}
function ddInstallPageEditor(site){
  const key=ddPageKey();if(!key)return;const def=DD_PAGE_MAP[key],cfg=site?.settings?.pageEditor?.[key]||{};let raf=0,applying=false;
  const apply=()=>{if(applying)return;applying=true;try{
    ddApplyNav(site);ddApplyPayments(site);
    const root=document.querySelector(def.root)||document.body;
    const fontTargets=[root,...root.querySelectorAll('a,button,input,textarea,select,label,h1,h2,h3,h4,p,span,figcaption')].filter(node=>{if(node!==root&&(node.matches?.('#heroTitle,.home-nav-main,.home-flyout,.home-mobile-header,.home-mobile-menu-nav,#desktopHeader,#desktopHeader *,.brand,[data-brand]')||node.closest?.('#desktopHeader,.home-nav-item,.home-mobile-header,.home-mobile-menu')))return false;return !node.closest?.('.about-admin-copy')||node.classList?.contains('about-admin-copy')});
    fontTargets.forEach(node=>ddApplyStyle(node,cfg,{}));
    Object.entries(def.fields).forEach(([name,spec])=>{const raw=cfg.fields?.[name];if(!raw)return;const item=spec.settingKey&&site?.settings?.[spec.settingKey]!==undefined?{...raw,value:site.settings[spec.settingKey]}:raw;if(spec.mode==='aboutHtml'){ddApplyAboutHtml(spec,item,cfg);return}
      ddElements(spec).forEach(el=>{
        if(item.visible===false){el.dataset.pageEditorHidden='1';el.style.setProperty('display','none','important')}else if(el.dataset.pageEditorHidden==='1'){delete el.dataset.pageEditorHidden;el.style.removeProperty('display')}
        if(spec.mode==='text'&&item.value!==undefined&&el.textContent!==String(item.value))el.textContent=String(item.value);
        if(spec.mode==='placeholder'&&item.value!==undefined)el.setAttribute('placeholder',String(item.value));
        if(spec.mode==='labelText'&&item.value!==undefined)ddSetLabelText(el,String(item.value));
        if(spec.mode==='image'&&item.value&&el.getAttribute('src')!==String(item.value))el.setAttribute('src',String(item.value));
        if(spec.mode==='backgroundImage'&&item.value){el.classList.add('reference-brand');ddImportant(el,'background-image',`url("${String(item.value).replace(/"/g,'\\"')}")`)}
        if(spec.mode==='desktopImage'&&item.value&&!matchMedia('(max-width:900px)').matches&&el.getAttribute('src')!==String(item.value))el.setAttribute('src',String(item.value));
        if(spec.mode==='mobileImage'&&item.value&&matchMedia('(max-width:900px)').matches&&el.getAttribute('src')!==String(item.value))el.setAttribute('src',String(item.value));
        ddApplyStyle(el,cfg,item);
      })
    });
  }finally{applying=false}};
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(apply)};
  apply();const obs=new MutationObserver(schedule);obs.observe(document.documentElement,{subtree:true,childList:true,characterData:true});window.addEventListener('resize',schedule,{passive:true});setTimeout(apply,0);window.ddApplyPageEditor=apply;
}
function prepareAdminRuntime(site){
  if(!document.getElementById('ddAdminRuntimeCss')){const l=document.createElement('link');l.id='ddAdminRuntimeCss';l.rel='stylesheet';l.href='/assets/css/admin-runtime-overrides.css?v=20260917-header-brand-flyout-v3';document.head.appendChild(l)}
  const all=site?.settings?.pageEditor||{};Object.values(all).forEach(cfg=>{ddLoadFont(cfg?.fontFamily);Object.values(cfg?.fields||{}).forEach(x=>ddLoadFont(x?.fontFamily))});ddLoadFont(site?.settings?.navEditor?.mainFontFamily);ddLoadFont(site?.settings?.navEditor?.subFontFamily);
  ddApplyPayments(site);ddApplyNav(site);ddInstallPageEditor(site);
}
