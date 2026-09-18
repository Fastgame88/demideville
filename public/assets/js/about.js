(async()=>{
  await renderChrome();
  const site=await SITE;
  const settings=site.settings||{};
  const lang=document.documentElement.lang==='ru'?'ru':'en';

  const DEFAULT_DESKTOP='/assets/images/about-copy-psd.png';
  const DEFAULT_MOBILE='/assets/images/about-mobile-approved.jpg';
  const desktopMain=String(settings.aboutMainMediaDesktop||DEFAULT_DESKTOP).trim()||DEFAULT_DESKTOP;
  const mobileMain=String(settings.aboutMainMediaMobile||DEFAULT_MOBILE).trim()||DEFAULT_MOBILE;

  function replaceMainMedia(selector,url,alt){
    const current=document.querySelector(selector);if(!current||!url)return;
    const wantsVideo=window.ddIsVideo?.(url);
    if(wantsVideo&&current.tagName!=='VIDEO'){
      const video=document.createElement('video');video.className=current.className;video.autoplay=true;video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-label',alt);current.replaceWith(video);video.src=url;video.play().catch(()=>{});return;
    }
    if(!wantsVideo&&current.tagName!=='IMG'){
      const img=document.createElement('img');img.className=current.className;img.alt=alt;img.decoding='async';current.replaceWith(img);img.src=url;return;
    }
    current.src=url;
  }
  window.ddWarmMedia?.(desktopMain);window.ddWarmMedia?.(mobileMain);
  replaceMainMedia('.about-copy-art',desktopMain,'DEMI DEVILLE About');
  replaceMainMedia('.about-mobile-approved',mobileMain,'DEMI DEVILLE About');

  function plainToHtml(value){
    const div=document.createElement('div');div.textContent=String(value||'');return div.innerHTML.replace(/\n/g,'<br>');
  }
  function sanitizeRichHtml(html){
    const tpl=document.createElement('template');tpl.innerHTML=String(html||'');
    const allowed=new Set(['DIV','P','BR','STRONG','B','EM','I','U','SPAN','FONT','H2','H3','H4','BLOCKQUOTE']);
    const allowedStyles=new Set(['font-family','font-size','color','background-color','text-align','font-weight','font-style','text-decoration']);
    [...tpl.content.querySelectorAll('*')].forEach(el=>{
      if(!allowed.has(el.tagName)){el.replaceWith(document.createTextNode(el.textContent||''));return}
      [...el.attributes].forEach(attr=>{
        const n=attr.name.toLowerCase();
        if(n==='style'){
          const parts=String(attr.value||'').split(';').map(x=>x.trim()).filter(Boolean).map(part=>{
            const idx=part.indexOf(':');if(idx<1)return'';const prop=part.slice(0,idx).trim().toLowerCase(),val=part.slice(idx+1).trim();
            if(!allowedStyles.has(prop)||/[<>]/.test(val))return'';return`${prop}:${val}`;
          }).filter(Boolean);if(parts.length)el.setAttribute('style',parts.join(';'));else el.removeAttribute('style');return;
        }
        if(el.tagName==='FONT'&&['face','size','color'].includes(n)){if(/[<>]/.test(attr.value))el.removeAttribute(attr.name);return}
        el.removeAttribute(attr.name);
      });
    });
    return tpl.innerHTML;
  }

  const extra=$('#aboutExtraContent'),textEl=$('#aboutExtraText'),mediaEl=$('#aboutExtraMedia');
  const richEn=String(settings.aboutExtraHtmlEn||'').trim(),richRu=String(settings.aboutExtraHtmlRu||'').trim();
  const richRaw=lang==='ru'?(richRu||richEn):(richEn||richRu);
  const legacyEn=String(settings.aboutExtraTextEn||'').trim(),legacyRu=String(settings.aboutExtraTextRu||'').trim();
  const legacyText=lang==='ru'?(legacyRu||legacyEn):(legacyEn||legacyRu);
  const richHtml=sanitizeRichHtml(richRaw||plainToHtml(legacyText));
  const extraMedia=String(settings.aboutExtraMedia||'').trim();
  if(extra&&(richHtml||extraMedia)){
    // Keep the approved ABOUT canvas untouched. Extra content is detached from the
    // fixed canvas and placed after it, so saving text can never hide/replace it.
    const wrap=document.querySelector('.about-wrap');if(wrap?.parentNode&&extra.parentNode===wrap)wrap.insertAdjacentElement('afterend',extra);
    document.body.classList.add('about-has-extra');extra.hidden=false;
    extra.style.setProperty('--about-extra-font',settings.aboutExtraFont||'inherit');
    extra.style.setProperty('--about-extra-size-desktop',`${Math.max(10,Math.min(80,Number(settings.aboutExtraFontSizeDesktop)||24))}px`);
    extra.style.setProperty('--about-extra-size-mobile',`${Math.max(10,Math.min(48,Number(settings.aboutExtraFontSizeMobile)||18))}px`);
    if(textEl){textEl.innerHTML=richHtml;textEl.hidden=!richHtml}
    if(mediaEl&&extraMedia){
      mediaEl.hidden=false;
      window.ddWarmMedia?.(extraMedia);
      mediaEl.innerHTML=window.ddIsVideo?.(extraMedia)?`<video src="${esc(extraMedia)}" autoplay muted loop playsinline preload="auto"></video>`:`<img src="${esc(extraMedia)}" alt="DEMI DEVILLE About additional media" loading="lazy" decoding="async">`;
    }

    // Desktop ABOUT uses a fixed 1920x1080 artwork canvas. Position the editable
    // content immediately below the *visible rendered artwork* instead of a full
    // extra viewport, so saved text is visible as soon as the user scrolls below
    // the existing ABOUT image. This does not resize or move the approved artwork.
    const placeExtraBelowMain=()=>{
      if(window.innerWidth<=900){extra.style.removeProperty('margin-top');return}
      const candidates=[document.querySelector('.about-copy-art'),document.querySelector('.about-copy-ru')].filter(Boolean);
      const main=candidates.find(el=>{const cs=getComputedStyle(el),r=el.getBoundingClientRect();return cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0});
      if(!main)return;
      const r=main.getBoundingClientRect();
      extra.style.setProperty('margin-top',`${Math.max(0,Math.ceil(r.bottom+24))}px`,'important');
    };
    requestAnimationFrame(placeExtraBelowMain);
    window.addEventListener('resize',placeExtraBelowMain,{passive:true});
    window.visualViewport?.addEventListener('resize',placeExtraBelowMain,{passive:true});
  }

  const fitChrome=()=>{
    if(window.innerWidth<=900){document.body.style.removeProperty('--gallery-header-scale-x');document.body.style.removeProperty('--gallery-header-scale-y');return}
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    document.body.style.setProperty('--gallery-header-scale-x',String(window.innerWidth/1920));
    document.body.style.setProperty('--gallery-header-scale-y',String(h/1080));
  };
  fitChrome();window.addEventListener('resize',fitChrome,{passive:true});window.visualViewport?.addEventListener('resize',fitChrome,{passive:true});
})();
