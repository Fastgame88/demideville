(async()=>{
  await renderChrome();
  const site=await SITE;
  const lang=document.documentElement.lang==='ru'?'ru':'en';
  const items=(site.gallery||[]).filter(g=>g.active!==false).sort((a,b)=>(Number(a.sort)||0)-(Number(b.sort)||0));
  $('#galleryList').innerHTML=items.map(g=>{
    const caption=lang==='ru'?(g.captionRu||g.caption||''):(g.caption||'');
    const rotation=((Number(g.rotation)||0)%360+360)%360;
    const font=g.captionFont?`font-family:${esc(g.captionFont)};`:'';
    return `<figure class="gallery-item"><div class="gallery-media"><img src="${esc(g.image)}" alt="${esc(caption||'Gallery image')}" style="--gallery-rotation:${rotation}deg"></div><figcaption class="gallery-caption" style="${font}">${esc(caption)}</figcaption></figure>`;
  }).join('')||`<p>${lang==='ru'?'В галерее пока нет изображений.':'No gallery items.'}</p>`;

  const fitChrome=()=>{
    if(window.innerWidth<=900){document.body.style.removeProperty('--gallery-header-scale-x');document.body.style.removeProperty('--gallery-header-scale-y');return}
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    document.body.style.setProperty('--gallery-header-scale-x',String(window.innerWidth/1920));
    document.body.style.setProperty('--gallery-header-scale-y',String(h/1080));
  };
  fitChrome();window.addEventListener('resize',fitChrome,{passive:true});window.visualViewport?.addEventListener('resize',fitChrome,{passive:true});
})();
