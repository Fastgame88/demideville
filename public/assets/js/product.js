(async()=>{
  await renderChrome();
  const site=await SITE;
  const lang=document.documentElement.lang==='ru'?'ru':'en';
  const id=new URLSearchParams(location.search).get('id');
  const p=id?(site.products||[]).find(x=>String(x.id)===String(id)):site.products?.[0];
  if(!p){$('#productPage').innerHTML=`<p>${lang==='ru'?'Товар не найден.':'Product not found.'}</p>`;return}

  const curr=site.settings?.currency||'$';
  const text=field=>window.ddProductText?window.ddProductText(p,field):(lang==='ru'&&p[`${field}Ru`]?p[`${field}Ru`]:p[field])||'';
  const images=(window.ddProductImages?.(p)||[p.image].filter(Boolean)).filter(Boolean);
  const mediaHost=$('#productMediaHost');
  const thumbHost=$('#productThumbs');
  let active=0;

  function renderMain(){
    const url=images[active]||p.image||'';
    const isVideo=window.ddIsVideo?.(url);
    mediaHost.innerHTML=isVideo
      ? `<video class="product-main-media" src="${esc(url)}" controls playsinline preload="metadata"></video>`
      : `<img class="product-main-media product-main-image" src="${esc(url)}" alt="${esc(text('name'))}" decoding="async" fetchpriority="high">`;
    thumbHost.innerHTML=images.length>1?images.map((url,i)=>`<button class="product-customer-thumb${i===active?' is-active':''}" type="button" data-product-image="${i}" aria-label="${lang==='ru'?'Фото':'Image'} ${i+1}">${window.ddIsVideo?.(url)?`<video src="${esc(url)}" muted playsinline preload="metadata"></video>`:`<img src="${esc(url)}" alt="" loading="lazy" decoding="async">`}</button>`).join(''):'';
    mediaHost.querySelector('.product-main-image')?.addEventListener('click',()=>openZoom(url));
  }
  thumbHost.addEventListener('click',e=>{const b=e.target.closest('[data-product-image]');if(!b)return;active=Number(b.dataset.productImage)||0;renderMain()});
  renderMain();

  $('#productName').innerHTML=`<span class="product-title-shape">${esc(text('name'))}</span>`;
  const priceLabel=window.ddProductPriceLabel?window.ddProductPriceLabel(p,curr,lang):money(p.price,curr);
  $('#productPrice').innerHTML=priceLabel?`<span class="product-price-shape">${esc(priceLabel)}</span>`:'';
  $('#productPrice').hidden=!priceLabel;
  $('#fabricText').textContent=text('fabric')||'—';
  $('#detailsText').textContent=text('description')||'—';

  const purchasable=window.ddProductPurchasable?window.ddProductPurchasable(p):true;
  const sel=$('#sizeSelect'),sizePicker=$('#sizePicker'),sizeToggle=$('#sizeToggle'),sizeMenu=$('#sizeMenu');
  const variants=(window.ddProductVariants?.(p)||[]).filter(v=>v.stock===null||v.stock>0);
  const sizes=variants.map(v=>String(v.size));
  sel.innerHTML='<option value=""></option>'+sizes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  sizeMenu.innerHTML=sizes.map((x,i)=>`<button class="size-option" type="button" role="option" data-size="${esc(x)}"><span class="size-option-content"><span class="size-option-index">${i+1}</span><span class="size-option-value">( ${esc(x)} )</span></span></button>`).join('');
  sizeToggle.textContent=sizes.length?(lang==='ru'?'Выберите размер':'Select your size'):(lang==='ru'?'Нет в наличии':'Out of stock');

  const addToBagBtn=$('#addToBag'),buyNowBtn=$('#buyNow');
  if(!purchasable){
    sizePicker.hidden=true;$('.field-label')?.setAttribute('hidden','');
    addToBagBtn.hidden=true;buyNowBtn.hidden=true;
  }else if(!sizes.length){
    sizeToggle.disabled=true;addToBagBtn.disabled=true;buyNowBtn.disabled=true;
    addToBagBtn.textContent=lang==='ru'?'Нет в наличии':'Out of stock';buyNowBtn.textContent=addToBagBtn.textContent;
  }

  const setSizeMenu=open=>{if(!sizes.length)return;sizePicker.classList.toggle('open',open);sizeToggle.setAttribute('aria-expanded',String(open));sizeMenu.setAttribute('aria-hidden',String(!open))};
  sizeToggle.addEventListener('click',()=>setSizeMenu(!sizePicker.classList.contains('open')));
  sizeMenu.addEventListener('click',e=>{const b=e.target.closest('.size-option');if(!b)return;sel.value=b.dataset.size||'';sizeToggle.textContent=sel.value|| (lang==='ru'?'Выберите размер':'Select your size');$$('.size-option',sizeMenu).forEach(x=>x.classList.toggle('selected',x===b));setSizeMenu(false)});
  document.addEventListener('click',e=>{if(!e.target.closest('#sizePicker'))setSizeMenu(false)});

  function chosen(){if(!sel.value){setSizeMenu(true);return false}return true}
  function stockAllowsOneMore(){const stock=window.ddProductStock?window.ddProductStock(p,sel.value):Infinity;if(!Number.isFinite(stock))return true;const inCart=cartGet().filter(x=>String(x.productId)===String(p.id)&&normalizeCartSize(x.size)===normalizeCartSize(sel.value)).reduce((a,x)=>a+(Number(x.qty)||1),0);return inCart<stock}
  function showToast(message){let toast=$('#productAddedToast');if(!toast){toast=document.createElement('div');toast.id='productAddedToast';toast.className='product-toast';document.body.appendChild(toast)}toast.textContent=message|| (lang==='ru'?'Товар добавлен в корзину':'Added to cart');toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1800)}
  function addOne(){if(!purchasable||!chosen())return false;if(!stockAllowsOneMore()){showToast(lang==='ru'?'Больше этого размера нет в наличии':'No more stock in this size');return false}addToCart(p.id,sel.value,1);return true}
  addToBagBtn?.addEventListener('click',e=>{e.preventDefault();if(addOne())showToast()});
  buyNowBtn?.addEventListener('click',e=>{e.preventDefault();if(addOne())location.href='/checkout.html'});

  $$('.acc-item').forEach(item=>{item.classList.remove('open');const trigger=$('.acc-trigger',item);trigger?.setAttribute('aria-expanded','false');trigger?.addEventListener('click',()=>{const open=!item.classList.contains('open');item.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open))})});

  const zoomLayer=$('#productZoom');const zoomImg=$('#productZoomImage');let scale=1,tx=0,ty=0,pointers=new Map(),lastDist=0;
  function applyZoom(){zoomImg.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`}
  function openZoom(url){if(window.ddIsVideo?.(url))return;scale=1;tx=0;ty=0;zoomImg.src=url;applyZoom();zoomLayer.classList.add('open');zoomLayer.setAttribute('aria-hidden','false');document.body.classList.add('zoom-open')}
  function closeZoom(){zoomLayer.classList.remove('open');zoomLayer.setAttribute('aria-hidden','true');document.body.classList.remove('zoom-open');pointers.clear();lastDist=0}
  $('#productZoomClose')?.addEventListener('click',closeZoom);zoomLayer?.addEventListener('click',e=>{if(e.target===zoomLayer)closeZoom()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeZoom()});
  zoomLayer?.addEventListener('wheel',e=>{e.preventDefault();scale=Math.max(1,Math.min(5,scale*(e.deltaY<0?1.12:.9)));if(scale===1){tx=0;ty=0}applyZoom()},{passive:false});
  zoomImg?.addEventListener('pointerdown',e=>{zoomImg.setPointerCapture?.(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY})});
  zoomImg?.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const old=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const arr=[...pointers.values()];if(arr.length===1&&scale>1){tx+=e.clientX-old.x;ty+=e.clientY-old.y;applyZoom()}else if(arr.length>=2){const d=Math.hypot(arr[0].x-arr[1].x,arr[0].y-arr[1].y);if(lastDist)scale=Math.max(1,Math.min(5,scale*d/lastDist));lastDist=d;applyZoom()}});
  ['pointerup','pointercancel'].forEach(ev=>zoomImg?.addEventListener(ev,e=>{pointers.delete(e.pointerId);if(pointers.size<2)lastDist=0}));
})();
