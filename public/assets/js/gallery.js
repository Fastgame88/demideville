(async()=>{
  await renderChrome();
  const site=await SITE;
  $('#galleryList').innerHTML=(site.gallery||[]).map(g=>`<figure class="gallery-item"><img src="${esc(g.image)}" alt="${esc(g.caption||'Gallery image')}"><figcaption class="gallery-caption">${esc(g.caption||'')}</figcaption></figure>`).join('')||'<p>No gallery items.</p>';

  /* Header and support are provided by renderChrome() in common.js. */

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
