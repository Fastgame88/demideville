(async()=>{
  await renderChrome();
  const site=await SITE;

  const id=new URLSearchParams(location.search).get('id');
  const p=(site.products||[]).find(x=>x.id===id)||site.products?.[0];
  if(!p){
    $('#productPage').innerHTML='<p>Product not found.</p>';
    return;
  }

  const curr=site.settings?.currency||'$';
  const productImageMap={
    '/assets/images/product-tshirt.jpg':'/assets/images/product-tshirt-ref.png',
    '/assets/images/product-longsleeve.jpg':'/assets/images/product-longsleeve-detail.png',
    '/assets/images/product-hoodie.jpg':'/assets/images/product-hoodie-ref.png',
    '/assets/images/product-jeans.jpg':'/assets/images/product-jeans-ref.png'
  };
  $('#productImage').src=productImageMap[p.image]||p.image;
  $('#productImage').alt=p.name;
  $('#productName').innerHTML=`<span class="product-title-shape">${esc(p.name)}</span>`;
  $('#productPrice').innerHTML=`<span class="product-price-shape">${esc(money(p.price,curr))}</span>`;
  $('#fabricText').textContent=p.fabric||'—';
  $('#detailsText').textContent=p.description||'—';

  /* Preserve the PSD Benzin typography when the local font is installed.
     If it is not available, shape only the live text (not the controls) to
     keep the reference proportions without shipping font files. */
  const fontActuallyAvailable=name=>{
    try{
      const c=document.createElement('canvas');
      const ctx=c.getContext('2d');
      const sample='WWMM001122AABB';
      ctx.font='32px Arial';
      const fallback=ctx.measureText(sample).width;
      ctx.font=`32px "${name}", Arial`;
      return Math.abs(ctx.measureText(sample).width-fallback)>.5;
    }catch{return false}
  };
  const hasBenzin=fontActuallyAvailable('Benzin Medium')&&fontActuallyAvailable('Benzin Regular');
  document.body.classList.toggle('product-benzin-fallback',!hasBenzin);
  $$('.field-label,.acc-trigger').forEach(el=>{
    if(el.querySelector('.product-medium-shape'))return;
    const text=el.textContent;
    el.textContent='';
    const span=document.createElement('span');
    span.className='product-medium-shape';
    span.textContent=text;
    el.append(span);
  });

  /* Exact custom size picker from the supplied PSD. */
  const sel=$('#sizeSelect');
  const sizePicker=$('#sizePicker');
  const sizeToggle=$('#sizeToggle');
  const sizeMenu=$('#sizeMenu');
  const sizes=(p.sizes||[]).map(String);
  sel.innerHTML='<option value=""></option>'+sizes.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
  sizeMenu.innerHTML=sizes.map((x,i)=>`<button class="size-option" type="button" role="option" data-size="${esc(x)}"><span class="size-option-content"><span class="size-option-index">${i+1}</span><span class="size-option-value">( ${esc(x)} )</span></span></button>`).join('');

  const setSizeMenu=open=>{
    sizePicker.classList.toggle('open',open);
    sizeToggle.setAttribute('aria-expanded',String(open));
    sizeMenu.setAttribute('aria-hidden',String(!open));
    requestAnimationFrame(syncProductHeight);
  };
  sizeToggle.addEventListener('click',()=>setSizeMenu(!sizePicker.classList.contains('open')));
  sizeMenu.addEventListener('click',e=>{
    const b=e.target.closest('.size-option');
    if(!b)return;
    const value=b.dataset.size||'';
    sel.value=value;
    sizeToggle.textContent=value||'Select your size';
    $$('.size-option',sizeMenu).forEach(x=>x.classList.toggle('selected',x===b));
    setSizeMenu(false);
  });
  document.addEventListener('click',e=>{
    if(!e.target.closest('#sizePicker')) setSizeMenu(false);
  });

  function chosen(){
    if(!sel.value){
      setSizeMenu(true);
      return false;
    }
    return true;
  }
  function showAddedToCartToast(){
    let toast=document.getElementById('productAddedToast');
    if(!toast){
      toast=document.createElement('div');
      toast.id='productAddedToast';
      toast.setAttribute('role','status');
      toast.setAttribute('aria-live','polite');

      Object.assign(toast.style,{
        position:'fixed',
        top:'82px',
        right:'22px',
        zIndex:'1200',
        minWidth:'220px',
        maxWidth:'360px',
        padding:'15px 22px',
        background:'#000',
        color:'#fff',
        fontFamily:'"Arial Narrow", Arial, sans-serif',
        fontSize:'15px',
        fontWeight:'500',
        lineHeight:'1.2',
        letterSpacing:'.2px',
        textAlign:'center',
        boxSizing:'border-box',
        pointerEvents:'none',
        opacity:'0',
        transform:'translateX(calc(100% + 40px))',
        transition:'transform 260ms ease, opacity 220ms ease'
      });

      document.body.appendChild(toast);
    }

    const storedLang=localStorage.getItem('demi-lang');
    const lang=storedLang==='ru'
      ? 'ru'
      : storedLang==='en'
        ? 'en'
        : ((navigator.language||'').toLowerCase().startsWith('ru')?'ru':'en');

    toast.textContent=lang==='ru'
      ? 'Товар добавлен в корзину'
      : 'Added to cart';

    clearTimeout(showAddedToCartToast.hideTimer);
    toast.style.opacity='0';
    toast.style.transform='translateX(calc(100% + 40px))';

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        toast.style.opacity='1';
        toast.style.transform='translateX(0)';
      });
    });

    showAddedToCartToast.hideTimer=setTimeout(()=>{
      toast.style.opacity='0';
      toast.style.transform='translateX(calc(100% + 40px))';
    },2200);
  }

  const addToBagBtn=$('#addToBag');
  if(addToBagBtn){
    addToBagBtn.onclick=null;

    addToBagBtn.addEventListener('click',(event)=>{
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if(!chosen()) return false;

      addToCart(p.id,sel.value,1);
      showAddedToCartToast();
      return false;
    },true);
  }
  $('#buyNow').onclick=()=>{
    if(chosen()){
      addToCart(p.id,sel.value,1);
      location.href='/checkout.html';
    }
  };

  /* All information sections are closed by default and can be opened independently. */
  $$('.acc-item').forEach(item=>{
    item.classList.remove('open');
    const trigger=$('.acc-trigger',item);
    trigger?.setAttribute('aria-expanded','false');
    trigger?.addEventListener('click',()=>{
      const open=!item.classList.contains('open');
      item.classList.toggle('open',open);
      trigger.setAttribute('aria-expanded',String(open));
      requestAnimationFrame(syncProductHeight);
    });
  });

  /* Header and support are provided by renderChrome() in common.js. */

  /* The PSD is 1920×1080. Scale the whole product canvas exactly like the internal header.
     When accordions grow, extend only the document height so the black scrollbar appears. */
  const shell=$('#productPageShell');
  const page=$('#productPage');
  const info=$('.product-info');
  const visual=$('.product-visual');

  function syncProductHeight(){
    if(window.innerWidth<=900){
      shell?.style.removeProperty('height');
      page?.style.removeProperty('height');
      return;
    }
    const sy=Number(getComputedStyle(document.body).getPropertyValue('--product-scale-y'))||1;
    const infoBottom=(info?.offsetTop||0)+(info?.offsetHeight||0)+85;
    const visualBottom=(visual?.offsetTop||0)+(visual?.offsetHeight||0)+70;
    const canvasHeight=Math.max(1080,infoBottom,visualBottom);
    if(page) page.style.height=`${canvasHeight}px`;
    if(shell) shell.style.height=`${Math.ceil(canvasHeight*sy)}px`;
  }

  const fitPage=()=>{
    if(window.innerWidth<=900){
      document.body.style.removeProperty('--gallery-header-scale-x');
      document.body.style.removeProperty('--gallery-header-scale-y');
      document.body.style.removeProperty('--product-scale-x');
      document.body.style.removeProperty('--product-scale-y');
      syncProductHeight();
      return;
    }
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    const sx=window.innerWidth/1920;
    const sy=h/1080;
    const s=Math.min(sx,sy);
    document.body.style.setProperty('--gallery-header-scale-x',String(sx));
    document.body.style.setProperty('--gallery-header-scale-y',String(sy));
    document.body.style.setProperty('--product-scale-x',String(sx));
    document.body.style.setProperty('--product-scale-y',String(sy));
    requestAnimationFrame(syncProductHeight);
  };
  fitPage();
  window.addEventListener('resize',fitPage,{passive:true});
  window.visualViewport?.addEventListener('resize',fitPage,{passive:true});
})();
