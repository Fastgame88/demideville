(async()=>{
  const site=await SITE;
  const s=site.settings||{};
  const currentUser=window.ddCurrentUser?await window.ddCurrentUser():null;
  const menuConfig=window.ddGetMenuConfig?window.ddGetMenuConfig(s):{groups:[],mobileLinks:[]};
  if(currentUser){const loginGroup=(menuConfig.groups||[]).find(g=>g.id==='login');if(loginGroup){loginGroup.labelEn='ACCOUNT';loginGroup.labelRu='АККАУНТ';loginGroup.href='/account.html';loginGroup.items=(loginGroup.items||[]).map(item=>item.id==='register'?{...item,enabled:false}:item.id==='account'?{...item,href:'/account.html',showMobile:false}:item)}}
  window.ddApplyMenuRuntimeStyles?.(s);
  window.ddApplySupportRuntimeStyles?.(s);
  window.ddMountSharedSupport?.(site);
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
  const supportOpen=$('#sharedSupportOpen');
  const supportLayer=$('#sharedSupportLayer');
  const supportWindow=$('.shared-support-window');
  const supportClose=$('#sharedSupportClose');
  const supportGreeting=$('#sharedSupportGreeting');
  const mobileMenu=$('#homeMobileMenu');
  const menuOpen=$('#homeMenuOpen');
  const langToggle=$('#langToggle');

  const brand=s.heroTitle||s.brand||'DEMI DEVILLE';
  if(title){
    // The desktop brand is always the approved PNG artwork. Keeping the element empty
    // prevents a text flash before JavaScript finishes loading.
    title.textContent='';title.classList.add('reference-brand','home-brand-interactive');title.tabIndex=0;title.setAttribute('role','button');title.setAttribute('aria-label',brand);
    let reloadTimer=0;
    const shimmerAndReload=()=>{clearTimeout(reloadTimer);title.classList.remove('brand-flash');void title.offsetWidth;title.classList.add('brand-flash');reloadTimer=setTimeout(()=>location.reload(),300)};
    title.addEventListener('click',shimmerAndReload);
    title.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();shimmerAndReload()}});
  }
  if(mobileBrand)mobileBrand.textContent=s.brand||'DEMI DEVILLE';

  const pageBackgrounds=(s.pageBackgrounds&&typeof s.pageBackgrounds==='object')?s.pageBackgrounds:{};
  const homePageBg=String(pageBackgrounds.home||'').trim();
  const desktopHero=homePageBg||s.heroDesktop||'/assets/images/hero.jpg';
  const mobileHero=homePageBg||s.heroMobile||'/assets/images/hero-mobile.jpg';
  const syncHero=()=>{
    const next=window.matchMedia('(max-width:900px)').matches?mobileHero:desktopHero;
    window.ddWarmMedia?.(next);
    let current=document.querySelector('.home .hero-image');
    const wantsVideo=window.ddIsVideo?.(next);
    if(wantsVideo&&current?.tagName!=='VIDEO'){
      const video=document.createElement('video');video.id='heroImage';video.className='hero-image';video.autoplay=true;video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';current?.replaceWith(video);current=video;
    }else if(!wantsVideo&&current?.tagName!=='IMG'){
      const img=document.createElement('img');img.id='heroImage';img.className='hero-image';img.alt='DEMI DEVILLE editorial';img.decoding='async';current?.replaceWith(img);current=img;
    }
    if(current&&current.getAttribute('src')!==next){current.setAttribute('src',next);if(current.tagName==='VIDEO')current.play().catch(()=>{})}
  };
  syncHero();addEventListener('resize',syncHero,{passive:true});

  const dict={
    en:{support:'SUPPORT',sendMessage:'SEND A MESSAGE',greeting:'Thanks for stopping by! How can I help you?',yourEmail:'YOUR EMAIL',yourMessage:'HOW CAN WE HELP?',send:'SEND',sending:'SENDING…',sent:'THANK YOU. YOUR MESSAGE HAS BEEN SENT.',sendError:'PLEASE CHECK YOUR EMAIL AND MESSAGE.'},
    ru:{support:'ПОДДЕРЖКА',sendMessage:'ОТПРАВИТЬ СООБЩЕНИЕ',greeting:'Спасибо, что заглянули! Чем я могу помочь?',yourEmail:'ВАША ПОЧТА',yourMessage:'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',send:'ОТПРАВИТЬ',sending:'ОТПРАВКА…',sent:'СПАСИБО. СООБЩЕНИЕ ОТПРАВЛЕНО.',sendError:'ПРОВЕРЬТЕ ПОЧТУ И ТЕКСТ СООБЩЕНИЯ.'}
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
    const cfg=window.ddSupportConfig?window.ddSupportConfig(s,lang):{buttonText:dict[lang].support,greeting:dict[lang].greeting,emailPlaceholder:dict[lang].yourEmail,messagePlaceholder:dict[lang].yourMessage,send:dict[lang].send};
    if(supportOpen)supportOpen.textContent=cfg.buttonText;
    if(supportGreeting)supportGreeting.textContent=cfg.greeting;
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

  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

})();
