(async()=>{
  await renderChrome();
  const site=await SITE;
  /* Header and support are provided by renderChrome() in common.js. */

  const lang=document.documentElement.lang==='ru'?'ru':'en';
  const defaultEn='About <strong>DEMI DEVILLE</strong> is a <em>PIONEERING DESIGN STUDIO BASED</em> in Paris, specializing in fashion, spatial design, and visual direction. <em>Established by Augustine</em> Oh &amp; Jude Lee, the <strong>studio redefines traditional</strong> design frameworks through methods of deconstruction, expansion, and reduction. <strong>By merging</strong> high fashion with a <strong>progressive design</strong> philosophy, DEMI DEVILLE delivers innovative, high-quality work that challenges visual conventions. <strong>The studio collaborates with a wide range of celebrities,</strong> artists, and brands, offering fresh design experiences that resonate with forward-thinking audiences around the world.';
  const defaultRu='DEMI DEVILLE — новаторская студия дизайна из Парижа. Мы работаем с модой, пространством и визуальным стилем. Основатели студии, Огюстин О и Джуд Ли, по-новому смотрят на привычные правила дизайна: разбирают формы, расширяют возможности и убирают лишнее. Мы объединяем высокую моду с современным подходом, создаём качественные проекты и сотрудничаем с артистами, брендами и творческими людьми по всему миру.';
  const customEn=String(site.settings?.aboutHtmlEn||'').trim();
  const customRu=String(site.settings?.aboutHtmlRu||'').trim();
  const hasCustom=!!(customEn||customRu||site.settings?.aboutBaseFont);
  if(hasCustom){
    const canvas=document.querySelector('.about-design-canvas');
    const art=document.querySelector('.about-copy-art');const mobile=document.querySelector('.about-copy-mobile');const ru=document.querySelector('.about-copy-ru');
    if(art)art.hidden=true;if(mobile)mobile.hidden=true;if(ru)ru.hidden=true;
    let rich=document.querySelector('.about-rich-content');
    if(!rich){rich=document.createElement('div');rich.className='about-rich-content';canvas?.appendChild(rich)}
    rich.innerHTML=lang==='ru'?(customRu||defaultRu):(customEn||site.settings?.aboutHtml||defaultEn);
    if(site.settings?.aboutBaseFont)rich.style.fontFamily=site.settings.aboutBaseFont;
    document.body.classList.add('about-rich-mode');
  }


  /* Use the exact same 1920×1080 chrome scaling as LOGIN. */
  const fitChrome=()=>{
    if(window.innerWidth<=900){
      document.body.style.removeProperty('--gallery-header-scale-x');
      document.body.style.removeProperty('--gallery-header-scale-y');
      return;
    }
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    const sx=window.innerWidth/1920;
    const sy=h/1080;
    const s=Math.min(sx,sy);
    document.body.style.setProperty('--gallery-header-scale-x',String(sx));
    document.body.style.setProperty('--gallery-header-scale-y',String(sy));
  };
  fitChrome();
  window.addEventListener('resize',fitChrome,{passive:true});
  window.visualViewport?.addEventListener('resize',fitChrome,{passive:true});
})();
