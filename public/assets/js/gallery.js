(async()=>{
  await renderChrome();
  const site=await SITE;
  const lang=document.documentElement.lang==='ru'?'ru':'en';
  const items=(site.gallery||[]).filter(g=>g.active!==false).sort((a,b)=>(Number(a.sort)||0)-(Number(b.sort)||0));
  $('#galleryList').innerHTML=items.map((g,i)=>{
    const caption=lang==='ru'?(g.captionRu||g.caption||''):(g.caption||'');
    const rotation=((Number(g.rotation)||0)%360+360)%360;
    const font=g.captionFont?`font-family:${esc(g.captionFont)};`:'';
    const url=g.media||g.image||'';
    const media=window.ddIsVideo?.(url)
      ? `<video src="${esc(url)}" muted loop playsinline ${i<2?'autoplay preload="metadata"':'preload="none" data-dd-autoplay="1"'} style="--gallery-rotation:${rotation}deg"></video>`
      : `<img src="${esc(url)}" alt="${esc(caption||'Gallery image')}" ${i<2?'loading="eager" fetchpriority="high"':'loading="lazy" fetchpriority="low"'} decoding="async" style="--gallery-rotation:${rotation}deg">`;
    return `<figure class="gallery-item"><div class="gallery-media">${media}</div><figcaption class="gallery-caption" style="${font}">${esc(caption)}</figcaption></figure>`;
  }).join('')||`<p>${lang==='ru'?'В галерее пока нет изображений.':'No gallery items.'}</p>`;
  window.ddActivateLazyVideos?.($('#galleryList'));
})();
