const SITE = fetch('/api/site').then(r=>r.json()).catch(()=>({settings:{},products:[],gallery:[],sections:[]}));
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

  $$('.global-cart-icon, .mobile-cart').forEach(el=>{
    el.classList.toggle('has-items',n>0);
    el.setAttribute('aria-label',n?`Cart (${n})`:'Cart');
    el.setAttribute('aria-hidden',String(n===0));
    if(n===0) el.setAttribute('tabindex','-1');
    else el.removeAttribute('tabindex');
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
    const desktopSections=(site.sections||[]).map(x=>`<a href="/section.html?slug=${encodeURIComponent(x.slug)}">${esc(x.title)}</a>`).join('');
    const cartCurrent=location.pathname.includes('cart')||location.pathname.includes('checkout');
    desktop.innerHTML=`<div class="nav-side"><a href="/shop.html">SHOP</a><a href="/gallery.html">GALLERY</a><a href="/about.html">ABOUT</a>${desktopSections}</div><a class="brand" data-brand href="/">${esc(s.brand||'DEMI DEVILLE')}</a><a class="cart-link global-cart-icon${cartCurrent?' cart-current':''}" href="/cart.html" aria-label="Cart"></a><div class="nav-side right"><a href="${esc(s.instagram||'#')}" target="_blank" rel="noreferrer">INSTAGRAM</a><a href="mailto:${esc(s.contact||'')}">CONTACT</a><a href="/login.html">LOGIN</a></div>`;
  }
  const mobile=$('#mobileHeader');
  if(mobile){mobile.classList.toggle('transparent',home);mobile.innerHTML=`<button class="mobile-menu-btn" aria-label="Menu">MENU</button><a class="brand" href="/" data-brand>${esc(s.brand||'DEMI DEVILLE')}</a><a class="mobile-cart" href="/cart.html">${home?'':'🛒'}<span data-cart-count></span></a>`;}
  const mm=$('#mobileMenu');
  if(mm){
    const tr=text=>window.ddTranslate?.(text)||text;
    mm.innerHTML=`<nav class="home-mobile-menu-nav"><a href="/shop.html">${esc(tr('SHOP ALL'))}</a><a href="/shop.html?category=jackets-coats">${esc(tr('JACKETS & COATS'))}</a><a href="/shop.html?category=jeans-pants-shorts">${esc(tr('JEANS, PANTS & SHORTS'))}</a><a href="/shop.html?category=tops">${esc(tr('TOPS'))}</a><a href="/shop.html?category=bags-accessories">${esc(tr('BAGS & ACCESSORIES'))}</a><span class="home-mobile-menu-gap mobile-menu-gap" aria-hidden="true"></span><a href="/gallery.html">${esc(tr('GALLERY'))}</a><a href="/about.html">${esc(tr('ABOUT'))}</a><span class="home-mobile-menu-gap mobile-menu-gap small" aria-hidden="true"></span><a class="menu-label-dark mobile-login-link" href="/login.html">${esc(tr('LOGIN'))}</a><a href="/cart.html">${esc(tr('CART'))}</a><a href="/login.html#register">${esc(tr('REGISTER'))}</a></nav>`;
    const menuButton=$('.mobile-menu-btn');
    const setMobileMenu=open=>{
      mm.classList.toggle('open',open);
      mm.setAttribute('aria-hidden',String(!open));
      document.body.classList.toggle('mobile-menu-open',open);
    };
    menuButton?.addEventListener('click',()=>setMobileMenu(!mm.classList.contains('open')));
    document.addEventListener('pointerdown',e=>{
      if(!mm.classList.contains('open')) return;
      if(mm.contains(e.target)||menuButton?.contains(e.target)) return;
      setMobileMenu(false);
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')setMobileMenu(false)});
  }
  updateCartCount();
  if(!home) mountSharedChrome(site);
}

/* All storefront pages except the home page use the SHOP header and SUPPORT.
   Keep their markup, scale, interactions and copy here so one change reaches
   SHOP, LOGIN, GALLERY, ABOUT, PRODUCT, CART, CHECKOUT and custom sections. */
function mountSharedChrome(site){
  if(document.body.classList.contains('shared-chrome-page'))return;
  document.body.classList.add('shared-chrome-page');
  const header=$('#desktopHeader');
  if(header){
    if(header.parentElement!==document.body)document.body.appendChild(header);
    const tr=text=>window.ddTranslate?.(text)||text;
    const left=document.createElement('div');
    left.className='shared-header-flyout shared-header-flyout-left';
    left.innerHTML=`<nav>
      <a href="/shop.html">${tr('SHOP ALL')}</a>
      <a href="/shop.html?category=jackets-coats">${tr('JACKETS & COATS')}</a>
      <a href="/shop.html?category=jeans-pants-shorts">${tr('JEANS, PANTS & SHORTS')}</a>
      <a href="/shop.html?category=tops">${tr('TOPS')}</a>
      <a href="/shop.html?category=bags-accessories">${tr('BAGS & ACCESSORIES')}</a>
    </nav>`;
    const right=document.createElement('div');
    right.className='shared-header-flyout shared-header-flyout-right';
    right.innerHTML=`<nav>
      <a href="/cart.html">${tr('CART')}</a>
      <a href="/login.html#register">${tr('REGISTER')}</a>
      <a href="/login.html">${tr('ACCOUNT')}</a>
      <span class="shared-header-flyout-gap"></span>
      <a href="/about.html">${tr('ABOUT')}</a>
      <a href="mailto:${esc(site.settings?.contact||'')}">${tr('CLIENT SERVICES')}</a>
    </nav>`;
    header.append(left,right);
    const triggers=[
      [header.querySelector('.nav-side:not(.right) a[href="/shop.html"]'),left],
      [header.querySelector('.nav-side.right a[href="/login.html"]'),right]
    ];
    for(const [trigger,panel] of triggers){
      if(!trigger)continue;
      let timer=0;
      const open=()=>{
        clearTimeout(timer);
        for(const [other,flyout] of triggers){
          if(flyout!==panel){flyout.classList.remove('is-open');other?.classList.remove('is-flyout-active')}
        }
        trigger.classList.add('is-flyout-active');
        panel.classList.add('is-open');
      };
      const close=()=>{
        clearTimeout(timer);
        timer=setTimeout(()=>{panel.classList.remove('is-open');trigger.classList.remove('is-flyout-active')},110);
      };
      trigger.addEventListener('mouseenter',open);
      trigger.addEventListener('focus',open);
      trigger.addEventListener('mouseleave',close);
      trigger.addEventListener('blur',close);
      panel.addEventListener('mouseenter',open);
      panel.addEventListener('mouseleave',close);
    }
  }

  // Remove old, page-specific shells. They no longer register page-specific
  // handlers; the single SHOP-sized shell below is the only active one.
  $$('#shopSupportOpen, #supportOpen, [data-support], #shopSupportLayer, #supportLayer').forEach(el=>el.remove());
  const tr=text=>window.ddTranslate?.(text)||text;
  const shell=document.createElement('div');
  shell.className='shared-support-root';
  shell.innerHTML=`<button id="sharedSupportOpen" class="support-btn shared-support-button" type="button">${tr('SUPPORT')}</button>
    <div id="sharedSupportLayer" class="support-layer shared-support-layer" aria-hidden="true">
      <div class="support-window shared-support-window" role="dialog" aria-label="DEMI DEVILLE support">
        <button id="sharedSupportClose" class="support-close" type="button" aria-label="${tr('Close support')}">×</button>
        <div class="support-panel">
          <div class="support-brand">DEMI DEVILLE</div>
          <div class="support-chat-body support-email-body">
            <div class="support-start support-form-heading"><span class="support-desktop-copy">${tr('SEND A MESSAGE')}</span><span class="support-mobile-copy">${tr('START A CHAT')}</span></div>
            <div class="support-mobile-intro">${tr('Thanks for stopping by! How can I help you?')}</div>
            <form id="sharedSupportForm" class="support-form" novalidate>
              <input id="sharedSupportEmail" class="support-form-input" name="email" type="email" autocomplete="email" required placeholder="${tr('YOUR EMAIL')}">
              <textarea id="sharedSupportMessage" class="support-form-message" name="message" required placeholder="${tr('HOW CAN WE HELP?')}"></textarea>
              <button id="sharedSupportSubmit" class="support-form-submit" type="submit">${tr('SEND')}</button>
              <div id="sharedSupportStatus" class="support-form-status" aria-live="polite"></div>
            </form>
          </div>
        </div>
      </div>
    </div>`;
  // A direct body child avoids the scaled or clipped canvases on inner pages.
  document.body.append(...shell.childNodes);
  const button=$('#sharedSupportOpen'), layer=$('#sharedSupportLayer'), windowEl=$('.shared-support-window');
  const closeButton=$('#sharedSupportClose'), form=$('#sharedSupportForm');
  const submit=$('#sharedSupportSubmit'), status=$('#sharedSupportStatus');
  let timer=0;
  const setOpen=open=>{
    clearTimeout(timer);
    layer.classList.toggle('open',open);
    layer.setAttribute('aria-hidden',String(!open));
  };
  const delayedClose=()=>{clearTimeout(timer);timer=setTimeout(()=>setOpen(false),320)};
  button.addEventListener('mouseenter',()=>setOpen(true));
  button.addEventListener('focus',()=>setOpen(true));
  button.addEventListener('mouseleave',delayedClose);
  button.addEventListener('click',()=>setOpen(true));
  windowEl.addEventListener('mouseenter',()=>clearTimeout(timer));
  windowEl.addEventListener('mouseleave',delayedClose);
  closeButton.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setOpen(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setOpen(false)});
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('#sharedSupportEmail').value.trim();
    const message=$('#sharedSupportMessage').value.trim();
    const error=tr('PLEASE CHECK YOUR EMAIL AND MESSAGE.');
    status.classList.remove('error');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<2){
      status.textContent=error;status.classList.add('error');return;
    }
    submit.disabled=true;submit.textContent=tr('SENDING…');
    try{
      const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,message,lang:document.documentElement.lang==='ru'?'ru':'en'})});
      if(!r.ok)throw new Error('Support request failed');
      status.textContent=tr('THANK YOU. YOUR MESSAGE HAS BEEN SENT.');
      form.reset();
    }catch{
      // Preserve SHOP's email fallback for older deployments without /api/support.
      const contact=site.settings?.contact||'';
      if(contact){
        location.href=`mailto:${encodeURIComponent(contact)}?reply-to=${encodeURIComponent(email)}&subject=${encodeURIComponent('DEMI DEVILLE support')}&body=${encodeURIComponent(`From: ${email}\n\n${message}`)}`;
        status.textContent=tr('THANK YOU. YOUR MESSAGE HAS BEEN SENT.');
      }else{
        status.textContent=error;status.classList.add('error');
      }
    }finally{submit.disabled=false;submit.textContent=tr('SEND')}
  });

  const fit=()=>{
    if(innerWidth<=900)return;
    const h=window.visualViewport?.height||innerHeight;
    const sx=innerWidth/1920,sy=h/1080,s=Math.min(sx,sy);
    document.body.style.setProperty('--shared-chrome-x',sx);
    document.body.style.setProperty('--shared-chrome-y',sy);
    document.body.style.setProperty('--shared-chrome-y-inverse',1/sy);
    document.body.style.setProperty('--shared-support-scale',s);
    document.body.style.setProperty('--shared-support-right',`${22*s}px`);
    document.body.style.setProperty('--shared-support-bottom',`${25*s}px`);
  };
  fit();
  addEventListener('resize',fit,{passive:true});
  window.visualViewport?.addEventListener('resize',fit,{passive:true});
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
