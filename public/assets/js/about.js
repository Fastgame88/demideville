(async()=>{
  await renderChrome();
  /* ABOUT uses the original approved desktop/mobile artwork and copy only.
     The admin editor for ABOUT is intentionally disabled. */
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
