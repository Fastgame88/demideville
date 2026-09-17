(async()=>{
  const site=await SITE;
  const s=site.settings||{};
  const currentUser=window.ddCurrentUser?await window.ddCurrentUser():null;
  const menuConfig=window.ddGetMenuConfig?window.ddGetMenuConfig(s):{groups:[],mobileLinks:[]};
  if(currentUser){const loginGroup=(menuConfig.groups||[]).find(g=>g.id==='login');if(loginGroup){loginGroup.labelEn='ACCOUNT';loginGroup.labelRu='АККАУНТ';loginGroup.href='/account.html';loginGroup.items=(loginGroup.items||[]).map(item=>item.id==='register'?{...item,enabled:false}:item.id==='account'?{...item,href:'/account.html',showMobile:true}:item)}}
  window.ddApplyMenuRuntimeStyles?.(s);
  window.ddApplySupportRuntimeStyles?.(s);
  const clampPct=(value,fallback=35)=>{const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,n)):fallback};
  const legacyOverlay=clampPct(s.homeOverlayOpacity,35);
  const desktopOverlay=clampPct(s.homeDesktopOverlayOpacity,legacyOverlay);
  const mobileOverlay=clampPct(s.homeMobileOverlayOpacity,legacyOverlay);
  document.documentElement.style.setProperty('--home-overlay-opacity',String(mobileOverlay/100));
  document.documentElement.style.setProperty('--home-desktop-overlay-opacity',String(desktopOverlay/100));
  document.documentElement.style.setProperty('--home-mobile-overlay-opacity',String(mobileOverlay/100));
  const page=document.querySelector('.home');
  const desktopFont=String(s.homeDesktopFont||'').trim();
  const mobileFont=String(s.homeMobileFont||'').trim();
  if(desktopFont&&page){page.style.setProperty('--home-desktop-font',desktopFont);page.classList.add('home-font-desktop-custom')}
  if(mobileFont&&page){page.style.setProperty('--home-mobile-font',mobileFont);page.classList.add('home-font-mobile-custom')}

  const hero=$('#heroImage');
  const title=$('#heroTitle');
  const mobileBrand=$('#mobileBrand');
  const supportOpen=$('#supportOpen');
  const supportLayer=$('#supportLayer');
  const supportWindow=$('.support-window');
  const supportClose=$('#supportClose');
  const supportForm=$('#supportForm');
  const supportSenderEmail=$('#supportSenderEmail');
  const supportMessage=$('#supportMessage');
  const supportSubmit=$('#supportSubmit');
  const supportFormStatus=$('#supportFormStatus');
  if(currentUser?.email&&supportSenderEmail)supportSenderEmail.value=currentUser.email;
  const mobileMenu=$('#homeMobileMenu');
  const menuOpen=$('#homeMenuOpen');
  const langToggle=$('#langToggle');

  const brand=s.heroTitle||s.brand||'DEMI DEVILLE';
  if(title){
    title.textContent=brand;title.classList.add('reference-brand');title.tabIndex=0;title.setAttribute('role','link');
    title.addEventListener('click',()=>location.reload());
    title.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();location.reload()}});
  }
  if(mobileBrand)mobileBrand.textContent=s.brand||'DEMI DEVILLE';

  const desktopHero=s.heroDesktop||'/assets/images/hero.jpg';
  const mobileHero=s.heroMobile||'/assets/images/hero-mobile.jpg';
  const syncHero=()=>{if(!hero)return;const next=window.matchMedia('(max-width:900px)').matches?mobileHero:desktopHero;if(hero.getAttribute('src')!==next)hero.setAttribute('src',next)};
  syncHero();addEventListener('resize',syncHero,{passive:true});

  const enSupport=window.ddSupportCopy?.(s,'en')||{},ruSupport=window.ddSupportCopy?.(s,'ru')||{};
  const dict={
    en:{support:enSupport.button||'SUPPORT',sendMessage:enSupport.title||'START A CHAT',startChat:enSupport.title||'START A CHAT',greeting:enSupport.greeting||'Thanks for stopping by! How can I help you?',yourEmail:enSupport.email||'YOUR EMAIL',yourMessage:enSupport.message||'HOW CAN WE HELP?',send:enSupport.send||'SEND',sending:'SENDING…',sent:'THANK YOU. YOUR MESSAGE HAS BEEN SENT.',sendError:'PLEASE CHECK YOUR EMAIL AND MESSAGE.'},
    ru:{support:ruSupport.button||'ПОДДЕРЖКА',sendMessage:ruSupport.title||'НАЧАТЬ ЧАТ',startChat:ruSupport.title||'НАЧАТЬ ЧАТ',greeting:ruSupport.greeting||'Спасибо, что заглянули! Чем я могу помочь?',yourEmail:ruSupport.email||'ВАША ПОЧТА',yourMessage:ruSupport.message||'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',send:ruSupport.send||'ОТПРАВИТЬ',sending:'ОТПРАВКА…',sent:'СПАСИБО. СООБЩЕНИЕ ОТПРАВЛЕНО.',sendError:'ПРОВЕРЬТЕ ПОЧТУ И ТЕКСТ СООБЩЕНИЯ.'}
  };
  let lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('demi-lang')||((navigator.language||'').toLowerCase().startsWith('ru')?'ru':'en');
  if(!dict[lang])lang='en';

  function homeMenuItem(item,className=''){
    if(!item||item.enabled===false)return'';
    const text=window.ddMenuLabel?window.ddMenuLabel(item,lang):(lang==='ru'?(item.labelRu||item.labelEn):(item.labelEn||item.labelRu));
    return `<a${className?` class="${esc(className)}"`:''} href="${esc(item.href||'#')}">${esc(text)}</a>`;
  }
  function renderMenus(){
    const homeLinks=document.querySelector('.home-links');
    if(homeLinks){
      homeLinks.innerHTML=(menuConfig.groups||[]).filter(g=>g.enabled!==false).map((group,index)=>{
        const groupClass=group.id==='shop'?'shop-nav-item':group.id==='login'?'login-nav-item':`menu-group-${index+1}`;
        const flyoutClass=group.id==='shop'?'shop-flyout':group.id==='login'?'login-flyout':'';
        const items=(group.items||[]).filter(x=>x.enabled!==false).map(item=>`${item.separatorBefore?'<span class="login-flyout-gap" aria-hidden="true"></span>':''}${homeMenuItem(item)}`).join('');
        return `<div class="home-nav-item ${groupClass}">${homeMenuItem(group,'home-nav-main')}<div class="home-flyout ${flyoutClass}" aria-label="Menu">${items}</div></div>`;
      }).join('');
    }
    if(mobileMenu&&window.ddBuildMobileMenuHtml)mobileMenu.innerHTML=window.ddBuildMobileMenuHtml(menuConfig,lang);
  }
  function applyLang(){
    document.documentElement.lang=lang;
    renderMenus();
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(dict[lang][k])el.textContent=dict[lang][k]});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(dict[lang][k])el.placeholder=dict[lang][k]});
    if(menuOpen)menuOpen.textContent=lang==='ru'?'МЕНЮ':'MENU';
    if(langToggle)langToggle.textContent=lang==='en'?'EN / RU':'RU / EN';
    localStorage.setItem('demi-lang',lang);
  }
  applyLang();

  const setMenu=open=>{if(!mobileMenu)return;mobileMenu.classList.toggle('open',open);mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('mobile-menu-open',open)};
  menuOpen?.addEventListener('click',()=>setMenu(!mobileMenu?.classList.contains('open')));
  document.addEventListener('pointerdown',e=>{if(!mobileMenu?.classList.contains('open'))return;if(mobileMenu.contains(e.target)||menuOpen?.contains(e.target))return;setMenu(false)});
  langToggle?.addEventListener('click',()=>{lang=lang==='en'?'ru':'en';applyLang();bindDesktopFlyouts()});

  let boundFlyouts=[];
  function bindDesktopFlyouts(){
    boundFlyouts.forEach(({el,type,fn})=>el.removeEventListener(type,fn));boundFlyouts=[];
    const desktopNavItems=[...document.querySelectorAll('.home-nav-item')];
    desktopNavItems.forEach(item=>{
      const open=()=>{desktopNavItems.forEach(x=>x!==item&&x.classList.remove('is-open'));item.classList.add('is-open')};
      const close=()=>item.classList.remove('is-open');
      const bind=(el,type,fn)=>{if(!el)return;el.addEventListener(type,fn);boundFlyouts.push({el,type,fn})};
      bind(item,'mouseenter',open);bind(item,'mouseleave',close);bind(item.querySelector('.home-nav-main'),'focus',open);
      const focusout=e=>{if(!item.contains(e.relatedTarget))close()};bind(item,'focusout',focusout);
    });
  }
  bindDesktopFlyouts();

  let hideTimer=0;
  const setSupport=open=>{clearTimeout(hideTimer);supportLayer?.classList.toggle('open',open);supportLayer?.setAttribute('aria-hidden',String(!open))};
  const delayedClose=()=>{clearTimeout(hideTimer);hideTimer=setTimeout(()=>setSupport(false),380)};
  supportOpen?.addEventListener('mouseenter',()=>setSupport(true));supportOpen?.addEventListener('focus',()=>setSupport(true));supportOpen?.addEventListener('mouseleave',delayedClose);supportOpen?.addEventListener('click',()=>setSupport(true));
  supportWindow?.addEventListener('mouseenter',()=>clearTimeout(hideTimer));supportWindow?.addEventListener('mouseleave',delayedClose);
  supportClose?.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();clearTimeout(hideTimer);setSupport(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){setMenu(false);setSupport(false)}});

  supportForm?.addEventListener('submit',async e=>{
    e.preventDefault();const email=String(supportSenderEmail?.value||'').trim();const message=String(supportMessage?.value||'').trim();const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);supportFormStatus?.classList.remove('error');
    if(!validEmail||message.length<2){if(supportFormStatus){supportFormStatus.textContent=dict[lang].sendError;supportFormStatus.classList.add('error')}return}
    if(supportSubmit){supportSubmit.disabled=true;supportSubmit.textContent=dict[lang].sending}
    try{const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({email,message,lang})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Support request failed');if(supportFormStatus)supportFormStatus.textContent=dict[lang].sent;supportForm.reset();if(currentUser?.email&&supportSenderEmail)supportSenderEmail.value=currentUser.email}
    catch(err){if(supportFormStatus){supportFormStatus.textContent=dict[lang].sendError;supportFormStatus.classList.add('error')}}
    finally{if(supportSubmit){supportSubmit.disabled=false;supportSubmit.textContent=dict[lang].send}}
  });
})();
