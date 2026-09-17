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
  const images=window.ddProductImages?.(p)||[p.image].filter(Boolean);
  const displayImage=url=>productImageMap[url]||url;
  const mainImage=$('#productImage');
  mainImage.src=displayImage(images[0]||p.image||'');mainImage.alt=text('name');
  $('#productName').innerHTML=`<span class="product-title-shape">${esc(text('name'))}</span>`;
  $('#productPrice').innerHTML=`<span class="product-price-shape">${esc(money(p.price,curr))}</span>`;
  $('#fabricText').textContent=text('fabric')||'—';
  $('#detailsText').textContent=text('description')||'—';

  if(images.length>1){
    const visual=$('.product-visual');
    const thumbs=document.createElement('div');thumbs.className='product-customer-thumbs';
    thumbs.innerHTML=images.map((url,i)=>`<button class="product-customer-thumb${i===0?' is-active':''}" type="button" data-product-image="${i}" aria-label="${lang==='ru'?'Фото':'Image'} ${i+1}"><img src="${esc(displayImage(url))}" alt=""></button>`).join('');
    visual.appendChild(thumbs);
    thumbs.addEventListener('click',e=>{const btn=e.target.closest('[data-product-image]');if(!btn)return;const i=Number(btn.dataset.productImage);mainImage.src=displayImage(images[i]);$$('.product-customer-thumb',thumbs).forEach(x=>x.classList.toggle('is-active',x===btn))});
  }

  /* Preserve the PSD Benzin typography when the local font is installed. */
  const fontActuallyAvailable=name=>{try{const c=document.createElement('canvas');const ctx=c.getContext('2d');const sample='WWMM001122AABB';ctx.font='32px Arial';const fallback=ctx.measureText(sample).width;ctx.font=`32px "${name}", Arial`;return Math.abs(ctx.measureText(sample).width-fallback)>.5}catch{return false}};
  const hasBenzin=fontActuallyAvailable('Benzin Medium')&&fontActuallyAvailable('Benzin Regular');document.body.classList.toggle('product-benzin-fallback',!hasBenzin);
  $$('.field-label,.acc-trigger').forEach(el=>{if(el.querySelector('.product-medium-shape'))return;const t=el.textContent;el.textContent='';const span=document.createElement('span');span.className='product-medium-shape';span.textContent=t;el.append(span)});

  const sel=$('#sizeSelect');const sizePicker=$('#sizePicker');const sizeToggle=$('#sizeToggle');const sizeMenu=$('#sizeMenu');
  const variants=(window.ddProductVariants?.(p)||[]).filter(v=>v.stock===null||v.stock>0);
  const sizes=variants.map(v=>String(v.size));
  sel.innerHTML='<option value=""></option>'+sizes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  sizeMenu.innerHTML=sizes.map((x,i)=>`<button class="size-option" type="button" role="option" data-size="${esc(x)}"><span class="size-option-content"><span class="size-option-index">${i+1}</span><span class="size-option-value">( ${esc(x)} )</span></span></button>`).join('');
  sizeToggle.textContent=sizes.length?(lang==='ru'?'Выберите размер':'Select your size'):(lang==='ru'?'Нет в наличии':'Out of stock');
  if(!sizes.length){sizeToggle.disabled=true;$('#addToBag').disabled=true;$('#buyNow').disabled=true;$('#addToBag').textContent=lang==='ru'?'Нет в наличии':'Out of stock';$('#buyNow').textContent=lang==='ru'?'Нет в наличии':'Out of stock'}

  const setSizeMenu=open=>{if(!sizes.length)return;sizePicker.classList.toggle('open',open);sizeToggle.setAttribute('aria-expanded',String(open));sizeMenu.setAttribute('aria-hidden',String(!open));requestAnimationFrame(syncProductHeight)};
  sizeToggle.addEventListener('click',()=>setSizeMenu(!sizePicker.classList.contains('open')));
  sizeMenu.addEventListener('click',e=>{const b=e.target.closest('.size-option');if(!b)return;const value=b.dataset.size||'';sel.value=value;sizeToggle.textContent=value|| (lang==='ru'?'Выберите размер':'Select your size');$$('.size-option',sizeMenu).forEach(x=>x.classList.toggle('selected',x===b));setSizeMenu(false)});
  document.addEventListener('click',e=>{if(!e.target.closest('#sizePicker'))setSizeMenu(false)});

  function chosen(){if(!sel.value){setSizeMenu(true);return false}return true}
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
  function addOne(){if(!chosen())return false;if(!stockAllowsOneMore()){showToast(lang==='ru'?'Больше этого размера нет в наличии':'No more stock in this size');return false}addToCart(p.id,sel.value,1);return true}

  const addToBagBtn=$('#addToBag');if(addToBagBtn){addToBagBtn.onclick=null;addToBagBtn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(!addOne())return false;showToast();return false},true)}
  const buyNowBtn=$('#buyNow');if(buyNowBtn){buyNowBtn.onclick=null;buyNowBtn.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();if(!addOne())return false;location.href='/checkout.html';return false},true)}

  $$('.acc-item').forEach(item=>{item.classList.remove('open');const trigger=$('.acc-trigger',item);trigger?.setAttribute('aria-expanded','false');trigger?.addEventListener('click',()=>{const open=!item.classList.contains('open');item.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));requestAnimationFrame(syncProductHeight)})});

  const shell=$('#productPageShell');const page=$('#productPage');const info=$('.product-info');const visual=$('.product-visual');
  function syncProductHeight(){if(window.innerWidth<=900){shell?.style.removeProperty('height');page?.style.removeProperty('height');return}const sy=Number(getComputedStyle(document.body).getPropertyValue('--product-scale-y'))||1;const infoBottom=(info?.offsetTop||0)+(info?.offsetHeight||0)+85;const visualBottom=(visual?.offsetTop||0)+(visual?.offsetHeight||0)+70;const canvasHeight=Math.max(1080,infoBottom,visualBottom);if(page)page.style.height=`${canvasHeight}px`;if(shell)shell.style.height=`${Math.ceil(canvasHeight*sy)}px`}
  const fitPage=()=>{if(window.innerWidth<=900){document.body.style.removeProperty('--gallery-header-scale-x');document.body.style.removeProperty('--gallery-header-scale-y');document.body.style.removeProperty('--product-scale-x');document.body.style.removeProperty('--product-scale-y');syncProductHeight();return}const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;const sx=window.innerWidth/1920;const sy=h/1080;document.body.style.setProperty('--gallery-header-scale-x',String(sx));document.body.style.setProperty('--gallery-header-scale-y',String(sy));document.body.style.setProperty('--product-scale-x',String(sx));document.body.style.setProperty('--product-scale-y',String(sy));requestAnimationFrame(syncProductHeight)};
  fitPage();window.addEventListener('resize',fitPage,{passive:true});window.visualViewport?.addEventListener('resize',fitPage,{passive:true});
})();
