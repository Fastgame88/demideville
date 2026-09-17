(async()=>{
  await renderChrome();
  const site=await SITE;
  const grid=$('#productGrid');
  const pagination=$('#shopPagination');
  const indicator=$('.shop-page-indicator');
  const curr=site.settings?.currency||'$';
  const PAGE_SIZE=10;

  /* On the SHOP page the DEMI DEVILLE title returns to the home page. */
  $$('#desktopHeader .brand, #mobileHeader .brand').forEach(brand=>{
    brand.setAttribute('href','/');
    brand.addEventListener('click',e=>{e.preventDefault();location.href='/';});
  });

  const reference={
    'invitation-tshirt':{image:'/assets/images/product-tshirt.jpg',art:'/assets/images/product-tshirt-ref.png',label:'/assets/images/shop-label-invitation.png',detail:'/assets/images/shop-price-invitation.png'},
    'human-uniform':{image:'/assets/images/product-longsleeve.jpg',art:'/assets/images/product-longsleeve-ref.png',label:'/assets/images/shop-label-human.png',detail:'/assets/images/shop-detail-human.png'},
    'lobby-hoody':{image:'/assets/images/product-hoodie.jpg',art:'/assets/images/product-hoodie-ref.png',label:'/assets/images/shop-label-lobby.png',detail:'/assets/images/shop-detail-lobby.png'},
    'inside-jeans':{image:'/assets/images/product-jeans.jpg',art:'/assets/images/product-jeans-ref.png',label:'/assets/images/shop-label-jeans.png',detail:'/assets/images/shop-detail-jeans.png'}
  };

  const products=(site.products||[]).filter(p=>p.active!==false);
  const pageCount=Math.max(1,Math.ceil(products.length/PAGE_SIZE));
  const fromUrl=Math.max(1,Number(new URLSearchParams(location.search).get('page'))||1);
  let currentPage=Math.min(fromUrl,pageCount);

  function productCopy(p){
    let name=String(p.name||'');
    let detail=money(p.price,curr);
    if(/Black&White$/i.test(name)){
      name=name.replace(/\s*Black&White$/i,'');
      detail=`Black&White - ${money(p.price,curr)}`;
    }else if(/\sBlack Black$/i.test(name)){
      name=name.replace(/\s*Black Black$/i,'');
      detail=`Black - ${money(p.price,curr)}`;
    }else if(/\sBlack$/i.test(name)){
      name=name.replace(/\s*Black$/i,'');
      detail=`Black - ${money(p.price,curr)}`;
    }
    return {name,detail};
  }

  function renderProducts(){
    const start=(currentPage-1)*PAGE_SIZE;
    const pageItems=products.slice(start,start+PAGE_SIZE);
    grid.classList.toggle('many-products',pageItems.length>4);
    grid.dataset.count=String(pageItems.length);
    grid.style.setProperty('--shop-columns',String(Math.min(5,Math.max(1,pageItems.length))));

    if(!pageItems.length){
      grid.innerHTML='<p class="shop-empty">No products yet.</p>';
      return;
    }

    grid.innerHTML=pageItems.map((p,i)=>{
      const ref=reference[p.id];
      const art=(ref && p.image===ref.image)?ref.art:p.image;
      const copy=productCopy(p);
      const referenceCopy=(ref && p.image===ref.image && ref.label)?`<span class="product-reference-copy" aria-hidden="true">
          <img class="product-reference-label" src="${esc(ref.label)}" alt="">
          ${ref.detail?`<img class="product-reference-detail" src="${esc(ref.detail)}" alt="">`:''}
        </span>`:'';
      return `<a class="product-card product-card-${i+1}${referenceCopy?' has-reference-copy':''}" href="/product.html?id=${encodeURIComponent(p.id)}">
        <span class="media"><img class="product-art" src="${esc(art)}" alt="${esc(p.name)}"></span>
        ${referenceCopy}
        <span class="product-live-copy">
          <span class="product-name">${esc(copy.name)}</span>
          <span class="product-price">${esc(copy.detail)}</span>
        </span>
      </a>`;
    }).join('');
  }

  function renderPagination(){
    const footer=pagination?.closest('.shop-footer');
    pagination?.classList.remove('is-hidden');
    footer?.classList.remove('is-single-page');
    pagination.innerHTML=Array.from({length:pageCount},(_,i)=>{
      const page=i+1;
      return `<button class="shop-page-number${page===currentPage?' is-active':''}" type="button" data-shop-page="${page}" aria-label="Page ${page}" aria-current="${page===currentPage?'page':'false'}">${page}</button>`;
    }).join('');

    $$('[data-shop-page]',pagination).forEach(btn=>{
      btn.addEventListener('click',()=>{
        const next=Number(btn.dataset.shopPage)||1;
        if(next===currentPage) return;
        currentPage=next;
        history.replaceState(null,'',`${location.pathname}${currentPage>1?`?page=${currentPage}`:''}`);
        renderProducts();
        renderPagination();
      });
    });
    requestAnimationFrame(moveIndicator);
  }

  function moveIndicator(){
    const active=$('.shop-page-number.is-active',pagination);
    if(!indicator || !active){
      if(indicator) indicator.style.opacity='0';
      return;
    }
    indicator.style.opacity='1';
    const x=pagination.offsetLeft+active.offsetLeft+(active.offsetWidth-indicator.offsetWidth)/2;
    indicator.style.transform=`translateX(${x}px)`;
  }

  renderProducts();
  renderPagination();

  /* Header and support are provided by renderChrome() in common.js. */

  const canvas=$('#shopCanvas');
  const stage=$('#shopStage');
  function fitCanvas(){
    if(!canvas||!stage) return;
    if(innerWidth<=900){
      canvas.style.removeProperty('--shop-scale');
      canvas.style.removeProperty('--shop-scale-x');
      canvas.style.removeProperty('--shop-scale-y');
      return;
    }
    const h=(window.visualViewport&&window.visualViewport.height)||innerHeight;
    const scale=Math.min(innerWidth/1920,h/1080);
    /* Keep the old uniform scale variables for compatibility, but fit the
       SHOP canvas to both viewport edges so no unused strip remains. */
    const scaleX=innerWidth/1920;
    const scaleY=h/1080;
    canvas.style.setProperty('--shop-scale',String(scale));
    canvas.style.setProperty('--shop-scale-x',String(scaleX));
    canvas.style.setProperty('--shop-scale-y',String(scaleY));
    canvas.style.setProperty('--shop-inverse-scale',String(1/scale));

    requestAnimationFrame(moveIndicator);
  }
  fitCanvas();
  addEventListener('resize',fitCanvas,{passive:true});
  window.visualViewport?.addEventListener('resize',fitCanvas,{passive:true});
})();
