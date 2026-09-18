(async()=>{
  await renderChrome();
  const site=await SITE,s=site.settings||{},lang=document.documentElement.lang==='ru'?'ru':'en';
  const copy=$('#aboutCopy'),media=$('#aboutMedia');
  const html=lang==='ru'?(s.aboutHtmlRu||'DEMI DEVILLE — новаторская студия дизайна из Парижа.'):(s.aboutHtml||'About <mark>DEMI DEVILLE</mark> is a pioneering design studio based in Paris.');
  copy.innerHTML=html;
  if(s.aboutFont)copy.style.fontFamily=s.aboutFont;
  document.body.style.setProperty('--about-desktop-size',`${Math.max(12,Math.min(90,Number(s.aboutFontSizeDesktop)||36))}px`);
  document.body.style.setProperty('--about-mobile-size',`${Math.max(10,Math.min(60,Number(s.aboutFontSizeMobile)||24))}px`);
  const url=String(s.aboutImage||'').trim();
  if(url){media.innerHTML=window.ddIsVideo?.(url)?`<video src="${esc(url)}" autoplay muted loop playsinline preload="metadata"></video>`:`<img src="${esc(url)}" alt="DEMI DEVILLE" loading="eager" decoding="async">`;}else media.hidden=true;
})();
