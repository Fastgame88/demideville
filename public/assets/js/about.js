(async()=>{
  await renderChrome();
  const site=await SITE;
  const settings=site.settings||{};
  const lang=document.documentElement.lang==='ru'?'ru':'en';
  const extra=$('#aboutExtraContent'),textEl=$('#aboutExtraText'),mediaEl=$('#aboutExtraMedia');
  const extraText=String(lang==='ru'?(settings.aboutExtraTextRu||settings.aboutExtraTextEn||''):(settings.aboutExtraTextEn||settings.aboutExtraTextRu||'')).trim();
  const extraMedia=String(settings.aboutExtraMedia||'').trim();
  if(extra&&(extraText||extraMedia)){
    document.body.classList.add('about-has-extra');
    extra.hidden=false;
    extra.style.setProperty('--about-extra-font',settings.aboutExtraFont||'inherit');
    extra.style.setProperty('--about-extra-size-desktop',`${Math.max(10,Math.min(80,Number(settings.aboutExtraFontSizeDesktop)||24))}px`);
    extra.style.setProperty('--about-extra-size-mobile',`${Math.max(10,Math.min(48,Number(settings.aboutExtraFontSizeMobile)||18))}px`);
    if(textEl){textEl.textContent=extraText;textEl.hidden=!extraText}
    if(mediaEl&&extraMedia){
      mediaEl.hidden=false;
      mediaEl.innerHTML=window.ddIsVideo?.(extraMedia)?`<video src="${esc(extraMedia)}" autoplay muted loop playsinline preload="metadata"></video>`:`<img src="${esc(extraMedia)}" alt="DEMI DEVILLE About" loading="lazy" decoding="async">`;
    }
  }
  /* Preserve the approved ABOUT desktop/mobile artwork and its original scale.
     Extra admin content is a separate block below it and never overlays the artwork. */
  const fitChrome=()=>{
    if(window.innerWidth<=900){
      document.body.style.removeProperty('--gallery-header-scale-x');
      document.body.style.removeProperty('--gallery-header-scale-y');
      return;
    }
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    const sx=window.innerWidth/1920;
    const sy=h/1080;
    document.body.style.setProperty('--gallery-header-scale-x',String(sx));
    document.body.style.setProperty('--gallery-header-scale-y',String(sy));
  };
  fitChrome();
  window.addEventListener('resize',fitChrome,{passive:true});
  window.visualViewport?.addEventListener('resize',fitChrome,{passive:true});
})();
