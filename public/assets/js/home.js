(async()=>{
  const site=await SITE;
  const s=site.settings||{};
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
  const mobileMenu=$('#homeMobileMenu');
  const menuOpen=$('#homeMenuOpen');
  const langToggle=$('#langToggle');

  const brand=s.heroTitle||s.brand||'DEMI DEVILLE';
  if(title){
    title.textContent=brand;
    title.classList.add('reference-brand');
    title.tabIndex=0;
    title.setAttribute('role','link');
    title.addEventListener('click',()=>location.reload());
    title.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();location.reload();}});
  }
  if(mobileBrand) mobileBrand.textContent=s.brand||'DEMI DEVILLE';

  const desktopHero=s.heroDesktop||'/assets/images/hero.jpg';
  const mobileHero=s.heroMobile||'/assets/images/hero-mobile.jpg';
  const syncHero=()=>{
    if(!hero) return;
    const next=window.matchMedia('(max-width:900px)').matches?mobileHero:desktopHero;
    if(hero.getAttribute('src')!==next) hero.setAttribute('src',next);
  };
  syncHero(); addEventListener('resize',syncHero,{passive:true});

  const setMenu=(open)=>{
    if(!mobileMenu) return;
    mobileMenu.classList.toggle('open',open);
    mobileMenu.setAttribute('aria-hidden',String(!open));
    document.body.classList.toggle('mobile-menu-open',open);
  };
  menuOpen?.addEventListener('click',()=>setMenu(!mobileMenu?.classList.contains('open')));
  document.addEventListener('pointerdown',e=>{
    if(!mobileMenu?.classList.contains('open')) return;
    if(mobileMenu.contains(e.target)||menuOpen?.contains(e.target)) return;
    setMenu(false);
  });

  const contact=s.contact||'contact@demideville.example';
  const serviceEmailLink=document.getElementById('serviceEmailLink');
  if(serviceEmailLink) serviceEmailLink.href='mailto:'+contact;

  const dict={
    en:{shop:'SHOP',login:'LOGIN',shopAll:'SHOP ALL',jackets:'JACKETS & COATS',jeans:'JEANS, PANTS & SHORTS',tops:'TOPS',bags:'BAGS & ACCESSORIES',gallery:'GALLERY',cart:'CART',register:'REGISTER',account:'ACCOUNT',about:'ABOUT',services:'CLIENT SERVICES',support:'SUPPORT',sendMessage:'SEND A MESSAGE',startChat:'START A CHAT',greeting:'Thanks for stopping by! How can I help you?',yourEmail:'YOUR EMAIL',yourMessage:'HOW CAN WE HELP?',send:'SEND',sending:'SENDING…',sent:'THANK YOU. YOUR MESSAGE HAS BEEN SENT.',sendError:'PLEASE CHECK YOUR EMAIL AND MESSAGE.'},
    ru:{shop:'МАГАЗИН',login:'ВХОД',shopAll:'ВСЕ ТОВАРЫ',jackets:'КУРТКИ И ПАЛЬТО',jeans:'ДЖИНСЫ, БРЮКИ И ШОРТЫ',tops:'ТОПЫ',bags:'СУМКИ И АКСЕССУАРЫ',gallery:'ГАЛЕРЕЯ',cart:'КОРЗИНА',register:'РЕГИСТРАЦИЯ',account:'АККАУНТ',about:'О НАС',services:'КЛИЕНТСКИЙ СЕРВИС',support:'ПОДДЕРЖКА',sendMessage:'ОТПРАВИТЬ СООБЩЕНИЕ',startChat:'НАЧАТЬ ЧАТ',greeting:'Спасибо, что заглянули! Чем я могу помочь?',yourEmail:'ВАША ПОЧТА',yourMessage:'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',send:'ОТПРАВИТЬ',sending:'ОТПРАВКА…',sent:'СПАСИБО. СООБЩЕНИЕ ОТПРАВЛЕНО.',sendError:'ПРОВЕРЬТЕ ПОЧТУ И ТЕКСТ СООБЩЕНИЯ.'}
  };
  let lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('demi-lang')||((navigator.language||'').toLowerCase().startsWith('ru')?'ru':'en');
  if(!dict[lang]) lang='en';
  const applyLang=()=>{
    document.documentElement.lang=lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(dict[lang][k])el.textContent=dict[lang][k]});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(dict[lang][k])el.placeholder=dict[lang][k]});
    if(langToggle) langToggle.textContent=lang==='en'?'EN / RU':'RU / EN';
    localStorage.setItem('demi-lang',lang);
  };
  applyLang();
  langToggle?.addEventListener('click',()=>{lang=lang==='en'?'ru':'en';applyLang()});

  // Desktop flyouts: only the currently hovered/focused group is visible.
  const desktopNavItems=[...document.querySelectorAll('.home-nav-item')];
  desktopNavItems.forEach(item=>{
    const open=()=>{desktopNavItems.forEach(x=>x!==item&&x.classList.remove('is-open'));item.classList.add('is-open');};
    const close=()=>item.classList.remove('is-open');
    item.addEventListener('mouseenter',open);
    item.addEventListener('mouseleave',close);
    item.querySelector('.home-nav-main')?.addEventListener('focus',open);
    item.addEventListener('focusout',e=>{if(!item.contains(e.relatedTarget)) close();});
  });

  let hideTimer=0;
  const setSupport=open=>{
    clearTimeout(hideTimer);
    supportLayer?.classList.toggle('open',open);
    supportLayer?.setAttribute('aria-hidden',String(!open));
  };
  const delayedClose=()=>{clearTimeout(hideTimer);hideTimer=setTimeout(()=>setSupport(false),380)};
  supportOpen?.addEventListener('mouseenter',()=>setSupport(true));
  supportOpen?.addEventListener('focus',()=>setSupport(true));
  supportOpen?.addEventListener('mouseleave',delayedClose);
  supportOpen?.addEventListener('click',()=>setSupport(true));
  supportWindow?.addEventListener('mouseenter',()=>clearTimeout(hideTimer));
  supportWindow?.addEventListener('mouseleave',delayedClose);
  supportClose?.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(hideTimer);
    setSupport(false);
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){setMenu(false);setSupport(false)}
  });

  supportForm?.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=String(supportSenderEmail?.value||'').trim();
    const message=String(supportMessage?.value||'').trim();
    const validEmail=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    supportFormStatus?.classList.remove('error');
    if(!validEmail||message.length<2){
      if(supportFormStatus){supportFormStatus.textContent=dict[lang].sendError;supportFormStatus.classList.add('error');}
      return;
    }
    if(supportSubmit){supportSubmit.disabled=true;supportSubmit.textContent=dict[lang].sending;}
    try{
      const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,message,lang})});
      const data=await r.json().catch(()=>({}));
      if(!r.ok) throw new Error(data.error||'Support request failed');
      if(supportFormStatus) supportFormStatus.textContent=dict[lang].sent;
      supportForm.reset();
    }catch(err){
      if(supportFormStatus){supportFormStatus.textContent=dict[lang].sendError;supportFormStatus.classList.add('error');}
    }finally{
      if(supportSubmit){supportSubmit.disabled=false;supportSubmit.textContent=dict[lang].send;}
    }
  });
})();
