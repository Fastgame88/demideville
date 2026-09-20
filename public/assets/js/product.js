(async()=>{
  await renderChrome();
  const site=await SITE;
  const lang=document.documentElement.lang==='ru'?'ru':'en';

  const id=new URLSearchParams(location.search).get('id');
  const p=id?(site.products||[]).find(x=>String(x.id)===String(id)):site.products?.[0];
  if(!p){$('#productPage').innerHTML=`<p>${lang==='ru'?'Товар не найден.':'Product not found.'}</p>`;return}

  const curr=site.settings?.currency||'$';
  const text=field=>window.ddProductText?window.ddProductText(p,field):(lang==='ru'&&p[`${field}Ru`]?p[`${field}Ru`]:p[field])||'';
  const productImageMap={
    '/assets/images/product-tshirt.jpg':'/assets/images/product-tshirt-ref.png',
    '/assets/images/product-longsleeve.jpg':'/assets/images/product-longsleeve-detail.png',
    '/assets/images/product-hoodie.jpg':'/assets/images/product-hoodie-ref.png',
    '/assets/images/product-jeans.jpg':'/assets/images/product-jeans-ref.png'
  };
  const images=(window.ddProductImages?.(p)||[p.image].filter(Boolean)).filter(Boolean);
  const displayImage=url=>productImageMap[url]||url;
  let mainMedia=$('#productImage');
  let activeImage=0;
  const visualMedia=$('.product-visual');

  const setMainMedia=url=>{
    const mediaUrl=displayImage(url||'');
    const wantsVideo=window.ddIsVideo?.(mediaUrl);
    if(wantsVideo&&mainMedia?.tagName!=='VIDEO'){
      const video=document.createElement('video');video.id='productImage';video.setAttribute('aria-label',text('name'));video.controls=true;video.playsInline=true;video.preload='metadata';mainMedia.replaceWith(video);mainMedia=video;
    }else if(!wantsVideo&&mainMedia?.tagName!=='IMG'){
      const img=document.createElement('img');img.id='productImage';img.alt=text('name');img.decoding='async';mainMedia.replaceWith(img);mainMedia=img;
    }
    if(mainMedia){mainMedia.src=mediaUrl;if(mainMedia.tagName==='IMG'){mainMedia.alt=text('name');mainMedia.decoding='async';mainMedia.fetchPriority='high'}else mainMedia.load()}
  };
  setMainMedia(images[0]||p.image||'');
  $('#productName').innerHTML=`<span class="product-title-shape">${esc(text('name'))}</span>`;
  const priceLabel=window.ddProductPriceLabel?window.ddProductPriceLabel(p,curr,lang):money(p.price,curr);
  $('#productPrice').innerHTML=priceLabel?`<span class="product-price-shape">${esc(priceLabel)}</span>`:'';
  $('#productPrice').hidden=!priceLabel;
  $('#fabricText').textContent=text('fabric')||'—';
  $('#detailsText').textContent=text('description')||'—';

  let gallery=null;
  if(images.length>1){
    gallery=document.createElement('div');gallery.className='product-customer-gallery';
    gallery.innerHTML=`<div class="product-customer-thumbs">${images.map((url,i)=>{const shown=displayImage(url);return `<button class="product-customer-thumb${i===0?' is-active':''}" type="button" data-product-image="${i}" aria-label="${lang==='ru'?'Фото':'Image'} ${i+1}">${window.ddIsVideo?.(shown)?`<video src="${esc(shown)}" muted playsinline preload="metadata"></video>`:`<img src="${esc(shown)}" alt="" ${i<4?'loading="eager"':'loading="lazy"'} decoding="async">`}</button>`}).join('')}</div>`;
    visualMedia.appendChild(gallery);
    const showImage=index=>{
      activeImage=(index+images.length)%images.length;
      setMainMedia(images[activeImage]);
      $$('[data-product-image]',gallery).forEach((btn,i)=>btn.classList.toggle('is-active',i===activeImage));
      const active=$(`[data-product-image="${activeImage}"]`,gallery);active?.scrollIntoView({block:'nearest',inline:'nearest'});
    };
    gallery.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const thumb=e.target.closest('[data-product-image]');if(thumb)return showImage(Number(thumb.dataset.productImage))});
  }

  // Click-to-zoom for product photos. It is added as an overlay, so the original product layout is untouched.
  const zoomLayer=document.createElement('div');zoomLayer.className='dd-product-zoom';zoomLayer.setAttribute('aria-hidden','true');zoomLayer.innerHTML=`<button class="dd-product-zoom-close" type="button" aria-label="${lang==='ru'?'Закрыть':'Close'}">×</button><img class="dd-product-zoom-image" alt="${esc(text('name'))}">`;
  document.body.appendChild(zoomLayer);
  const zoomImg=$('.dd-product-zoom-image',zoomLayer),zoomClose=$('.dd-product-zoom-close',zoomLayer);let zoomScale=1,zoomX=0,zoomY=0,lastPointer=null,touches=new Map(),lastDistance=0;
  const applyZoom=()=>{zoomImg.style.transform=`translate3d(${zoomX}px,${zoomY}px,0) scale(${zoomScale})`};
  const resetZoom=()=>{zoomScale=1;zoomX=0;zoomY=0;lastPointer=null;touches.clear();lastDistance=0;applyZoom()};
  const openZoom=()=>{if(!mainMedia||mainMedia.tagName!=='IMG'||!mainMedia.src)return;zoomImg.src=mainMedia.src;resetZoom();zoomLayer.classList.add('open');zoomLayer.setAttribute('aria-hidden','false');document.body.classList.add('dd-zoom-open')};
  const closeZoom=()=>{zoomLayer.classList.remove('open');zoomLayer.setAttribute('aria-hidden','true');document.body.classList.remove('dd-zoom-open');resetZoom()};
  visualMedia.addEventListener('click',e=>{if(e.target===mainMedia&&mainMedia.tagName==='IMG')openZoom()});
  zoomClose.addEventListener('click',closeZoom);zoomLayer.addEventListener('click',e=>{if(e.target===zoomLayer)closeZoom()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&zoomLayer.classList.contains('open'))closeZoom()});
  zoomLayer.addEventListener('wheel',e=>{if(!zoomLayer.classList.contains('open'))return;e.preventDefault();zoomScale=Math.max(1,Math.min(5,zoomScale*(e.deltaY<0?1.14:.88)));if(zoomScale===1){zoomX=0;zoomY=0}applyZoom()},{passive:false});
  zoomImg.addEventListener('dblclick',()=>{zoomScale=zoomScale>1?1:2.5;if(zoomScale===1){zoomX=0;zoomY=0}applyZoom()});
  zoomImg.addEventListener('pointerdown',e=>{zoomImg.setPointerCapture?.(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPointer={x:e.clientX,y:e.clientY}});
  zoomImg.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...touches.values()];if(pts.length>=2){const dist=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y);if(lastDistance)zoomScale=Math.max(1,Math.min(5,zoomScale*dist/lastDistance));lastDistance=dist;applyZoom();return}if(zoomScale>1&&lastPointer){zoomX+=e.clientX-lastPointer.x;zoomY+=e.clientY-lastPointer.y;applyZoom()}lastPointer={x:e.clientX,y:e.clientY}});
  for(const ev of ['pointerup','pointercancel'])zoomImg.addEventListener(ev,e=>{touches.delete(e.pointerId);lastPointer=null;if(touches.size<2)lastDistance=0});

  /* Preserve the PSD Benzin typography when the local font is installed. */
  const fontActuallyAvailable=name=>{try{const c=document.createElement('canvas');const ctx=c.getContext('2d');const sample='WWMM001122AABB';ctx.font='32px Arial';const fallback=ctx.measureText(sample).width;ctx.font=`32px "${name}", Arial`;return Math.abs(ctx.measureText(sample).width-fallback)>.5}catch{return false}};
  const hasBenzin=fontActuallyAvailable('Benzin Medium')&&fontActuallyAvailable('Benzin Regular');document.body.classList.toggle('product-benzin-fallback',!hasBenzin);
  $$('.field-label,.acc-trigger').forEach(el=>{if(el.querySelector('.product-medium-shape'))return;const t=el.textContent;el.textContent='';const span=document.createElement('span');span.className='product-medium-shape';span.textContent=t;el.append(span)});

  const sel=$('#sizeSelect');const sizePicker=$('#sizePicker');const sizeToggle=$('#sizeToggle');const sizeMenu=$('#sizeMenu');
  const purchasable=window.ddProductPurchasable?window.ddProductPurchasable(p):true;
  const normalizedVariants=window.ddProductVariants?.(p)||[];
  const fallbackVariants=!normalizedVariants.length&&Array.isArray(p.sizes)?p.sizes.map(size=>({size:String(size||'').trim(),stock:null})).filter(v=>v.size):[];
  const variants=(normalizedVariants.length?normalizedVariants:fallbackVariants).filter(v=>v.stock===null||v.stock===undefined||Number(v.stock)>0);
  const sizes=[...new Set(variants.map(v=>String(v.size||'').trim()).filter(Boolean))];
  sel.innerHTML='<option value=""></option>'+sizes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  sizeMenu.innerHTML=sizes.map((x,i)=>`<button class="size-option" type="button" role="option" data-size="${esc(x)}"><span class="size-option-content"><span class="size-option-index">${i+1}</span><span class="size-option-value">( ${esc(x)} )</span></span></button>`).join('');
  sizeToggle.textContent=sizes.length?(lang==='ru'?'Выберите размер':'Select your size'):(lang==='ru'?'Нет в наличии':'Out of stock');
  if(!purchasable){sizePicker.hidden=true;const fieldLabel=$('.field-label');if(fieldLabel)fieldLabel.hidden=true;$('#addToBag').hidden=true;$('#buyNow').hidden=true}
  else if(!sizes.length){sizeToggle.disabled=true;$('#addToBag').disabled=true;$('#buyNow').disabled=true;$('#addToBag').textContent=lang==='ru'?'Нет в наличии':'Out of stock';$('#buyNow').textContent=lang==='ru'?'Нет в наличии':'Out of stock'}

  const setSizeMenu=open=>{if(!sizes.length)return;sizePicker.classList.toggle('open',open);sizeToggle.setAttribute('aria-expanded',String(open));sizeMenu.setAttribute('aria-hidden',String(!open));requestAnimationFrame(syncProductHeight)};
  sizeToggle.addEventListener('click',()=>setSizeMenu(!sizePicker.classList.contains('open')));
  sizeMenu.addEventListener('click',e=>{const b=e.target.closest('.size-option');if(!b)return;const value=b.dataset.size||'';sel.value=value;sizeToggle.textContent=value|| (lang==='ru'?'Выберите размер':'Select your size');$$('.size-option',sizeMenu).forEach(x=>x.classList.toggle('selected',x===b));setSizeMenu(false)});
  document.addEventListener('click',e=>{if(!e.target.closest('#sizePicker'))setSizeMenu(false)});

  function chosen(){if(!sel.value){setSizeMenu(true);showToast(lang==='ru'?'Выберите размер':'Select a size');return false}return true}
  function stockAllowsOneMore(){
    const stock=window.ddProductStock?window.ddProductStock(p,sel.value):Infinity;if(!Number.isFinite(stock))return true;
    const inCart=cartGet().filter(x=>String(x.productId)===String(p.id)&&normalizeCartSize(x.size)===normalizeCartSize(sel.value)).reduce((a,x)=>a+(Number(x.qty)||1),0);
    return inCart<stock;
  }
  function showToast(message){
    let toast=document.getElementById('productAddedToast');
    if(!toast){toast=document.createElement('div');toast.id='productAddedToast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');Object.assign(toast.style,{position:'fixed',top:'82px',right:'22px',zIndex:'1200',minWidth:'220px',maxWidth:'360px',padding:'15px 22px',background:'#000',color:'#fff',fontFamily:'"Arial Narrow", Arial, sans-serif',fontSize:'15px',fontWeight:'500',lineHeight:'1.2',letterSpacing:'.2px',textAlign:'center',boxSizing:'border-box',pointerEvents:'none',opacity:'0',transform:'translateX(calc(100% + 40px))',transition:'transform 260ms ease, opacity 220ms ease'});document.body.appendChild(toast)}
    toast.textContent=message|| (lang==='ru'?'Товар добавлен в корзину':'Added to cart');clearTimeout(showToast.hideTimer);toast.style.opacity='0';toast.style.transform='translateX(calc(100% + 40px))';requestAnimationFrame(()=>requestAnimationFrame(()=>{toast.style.opacity='1';toast.style.transform='translateX(0)'}));showToast.hideTimer=setTimeout(()=>{toast.style.opacity='0';toast.style.transform='translateX(calc(100% + 40px))'},2200);
  }
  function addOne(){if(!purchasable||!chosen())return false;if(!stockAllowsOneMore()){showToast(lang==='ru'?'Больше этого размера нет в наличии':'No more stock in this size');return false}addToCart(p.id,sel.value,1);return true}

  const addToBagBtn=$('#addToBag');if(addToBagBtn){addToBagBtn.onclick=null;addToBagBtn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(!addOne())return false;showToast();return false},true)}
  const buyNowBtn=$('#buyNow');if(buyNowBtn){buyNowBtn.onclick=null;buyNowBtn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(!addOne())return false;location.href='/checkout.html';return false},true)}

  $$('.acc-item').forEach(item=>{item.classList.remove('open');const trigger=$('.acc-trigger',item);trigger?.setAttribute('aria-expanded','false');trigger?.addEventListener('click',()=>{const open=!item.classList.contains('open');item.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));requestAnimationFrame(syncProductHeight)})});

  const shell=$('#productPageShell');const page=$('#productPage');const info=$('.product-info');const visual=$('.product-visual');
  function syncProductHeight(){if(window.innerWidth<=900){shell?.style.removeProperty('height');page?.style.removeProperty('height');return}const sy=Number(getComputedStyle(document.body).getPropertyValue('--product-scale-y'))||1;const infoBottom=(info?.offsetTop||0)+(info?.offsetHeight||0)+85;const visualBottom=(visual?.offsetTop||0)+(visual?.offsetHeight||0)+70;const canvasHeight=Math.max(1080,infoBottom,visualBottom);if(page)page.style.height=`${canvasHeight}px`;if(shell)shell.style.height=`${Math.ceil(canvasHeight*sy)}px`}
  const fitPage=()=>{if(window.innerWidth<=900){document.body.style.removeProperty('--gallery-header-scale-x');document.body.style.removeProperty('--gallery-header-scale-y');document.body.style.removeProperty('--product-scale-x');document.body.style.removeProperty('--product-scale-y');document.body.style.removeProperty('--product-inverse-scale');document.body.style.removeProperty('--product-visual-left');document.body.style.removeProperty('--product-visual-top');document.body.style.removeProperty('--product-info-left');document.body.style.removeProperty('--product-info-top');syncProductHeight();return}/* Keep PRODUCT media and copy at fixed physical sizes while the master canvas scales. The image stays centered in the left half; the info panel follows it with a fixed visual gap instead of drifting to the far right. */const scale=Math.max(.01,window.innerWidth/1920),inverse=1/scale,mediaW=543;const visualLeftPx=Math.max(24,window.innerWidth*.25-mediaW/2),visualTopPx=185;const compact=window.innerWidth<1250,infoGapPx=compact?48:110,infoLeftPx=visualLeftPx+mediaW+infoGapPx,infoTopPx=230;document.body.style.setProperty('--gallery-header-scale-x',String(scale));document.body.style.setProperty('--gallery-header-scale-y',String(scale));document.body.style.setProperty('--product-scale-x',String(scale));document.body.style.setProperty('--product-scale-y',String(scale));document.body.style.setProperty('--product-inverse-scale',String(inverse));document.body.style.setProperty('--product-visual-left',`${visualLeftPx/scale}px`);document.body.style.setProperty('--product-visual-top',`${visualTopPx/scale}px`);document.body.style.setProperty('--product-info-left',`${infoLeftPx/scale}px`);document.body.style.setProperty('--product-info-top',`${infoTopPx/scale}px`);requestAnimationFrame(syncProductHeight)};
  let fitFrame=0;
  const scheduleFitPage=()=>{if(fitFrame)return;fitFrame=requestAnimationFrame(()=>{fitFrame=0;fitPage()})};
  fitPage();window.addEventListener('resize',scheduleFitPage,{passive:true});window.visualViewport?.addEventListener('resize',scheduleFitPage,{passive:true});
})();
