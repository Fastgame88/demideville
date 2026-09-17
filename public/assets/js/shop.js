(async()=>{
  await renderChrome();
  const site=await SITE;
  const grid=$('#productGrid');
  const pagination=$('#shopPagination');
  const indicator=$('.shop-page-indicator');
  const curr=site.settings?.currency||'$';
  const PAGE_SIZE=Math.max(1,Math.min(100,Math.floor(Number(site.settings?.shopPageSize)||10)));
  const lang=document.documentElement.lang==='ru'?'ru':'en';

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
  const legacyCategories={
    'invitation-tshirt':['tops'],
    'human-uniform':['tops'],
    'lobby-hoody':['jackets-coats'],
    'inside-jeans':['jeans-pants-shorts']
  };
  const defaultCategories=[
    {slug:'jackets-coats',enabled:true},{slug:'jeans-pants-shorts',enabled:true},{slug:'tops',enabled:true},{slug:'bags-accessories',enabled:true}
  ];
  const categories=(Array.isArray(site.settings?.shopCategories)&&site.settings.shopCategories.length?site.settings.shopCategories:defaultCategories).filter(c=>c&&c.enabled!==false);
  const params=new URLSearchParams(location.search);
  const requestedCategory=String(params.get('category')||'').trim();
  const activeCategory=categories.some(c=>String(c.slug||c.id)===requestedCategory)?requestedCategory:'';
  const categoriesOf=p=>Array.isArray(p.categories)&&p.categories.length?p.categories.map(String):(legacyCategories[String(p.id)]||[]);
  const allProducts=(site.products||[]).filter(p=>p.active!==false);
  const products=activeCategory?allProducts.filter(p=>categoriesOf(p).includes(activeCategory)):allProducts;
  const pageCount=Math.max(1,Math.ceil(products.length/PAGE_SIZE));
  const fromUrl=Math.max(1,Number(params.get('page'))||1);
  let currentPage=Math.min(fromUrl,pageCount);

  function localized(p,field){
    if(window.ddProductText)return window.ddProductText(p,field);
    if(lang==='ru'&&String(p?.[`${field}Ru`]||'').trim())return String(p[`${field}Ru`]);
    return String(p?.[field]||'');
  }
  function productCopy(p){
    let name=localized(p,'name');
    let detail=money(p.price,curr);
    /* Keep the historical English formatting only for the original EN artwork. */
    if(lang!=='ru'){
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
    }
    return {name,detail};
  }

  function renderProducts(){
    const start=(currentPage-1)*PAGE_SIZE;
    const pageItems=products.slice(start,start+PAGE_SIZE);
    grid.classList.toggle('many-products',pageItems.length>4);
    grid.dataset.count=String(pageItems.length);

    /* Adapt card density to the amount of products shown on this page.
       The footer stays pinned to the bottom; low-count pages use larger
       product artwork instead of leaving a large unused field. */
    const count=Math.max(1,pageItems.length);
    const desktopColumns=count<=5?count:Math.min(5,Math.ceil(count/2));
    const desktopRows=Math.max(1,Math.ceil(count/desktopColumns));
    const desktopMedia=count===1?500:count===2?440:count===3?390:count<=5?340:desktopRows===2?295:255;
    grid.style.setProperty('--shop-columns',String(desktopColumns));
    grid.style.setProperty('--shop-rows',String(desktopRows));
    grid.style.setProperty('--shop-media-size',`${desktopMedia}px`);

    if(!pageItems.length){
      grid.innerHTML=`<p class="shop-empty">${lang==='ru'?'В этом разделе пока нет товаров.':'No products in this category yet.'}</p>`;
      return;
    }

    grid.innerHTML=pageItems.map((p,i)=>{
      const ref=reference[p.id];
      const primary=(window.ddProductImages?.(p)||[])[0]||p.image||'';
      /* For one or two products use the real source image so the card can scale up
         without inheriting transparent padding from the old reference artwork. */
      const useReference=lang!=='ru'&&ref&&primary===ref.image&&pageItems.length>2;
      const art=useReference?ref.art:primary;
      const copy=productCopy(p);
      const referenceCopy=(useReference&&ref.label)?`<span class="product-reference-copy" aria-hidden="true">
          <img class="product-reference-label" src="${esc(ref.label)}" alt="">
          ${ref.detail?`<img class="product-reference-detail" src="${esc(ref.detail)}" alt="">`:''}
        </span>`:'';
      return `<a class="product-card product-card-${i+1}${referenceCopy?' has-reference-copy':''}" href="/product.html?id=${encodeURIComponent(p.id)}">
        <span class="media"><img class="product-art" src="${esc(art)}" alt="${esc(copy.name)}"></span>
        ${referenceCopy}
        <span class="product-live-copy">
          <span class="product-name">${esc(copy.name)}</span>
          <span class="product-price">${esc(copy.detail)}</span>
        </span>
      </a>`;
    }).join('');
  }

  function pageUrl(page){
    const next=new URLSearchParams();
    if(activeCategory)next.set('category',activeCategory);
    if(page>1)next.set('page',String(page));
    const q=next.toString();return `${location.pathname}${q?`?${q}`:''}`;
  }
  function renderPagination(){
    const footer=pagination?.closest('.shop-footer');
    pagination?.classList.remove('is-hidden');
    footer?.classList.toggle('is-single-page',pageCount<=1);
    pagination.innerHTML=Array.from({length:pageCount},(_,i)=>{
      const page=i+1;
      return `<button class="shop-page-number${page===currentPage?' is-active':''}" type="button" data-shop-page="${page}" aria-label="Page ${page}" aria-current="${page===currentPage?'page':'false'}">${page}</button>`;
    }).join('');

    $$('[data-shop-page]',pagination).forEach(btn=>{
      btn.addEventListener('click',()=>{
        const next=Number(btn.dataset.shopPage)||1;
        if(next===currentPage)return;
        currentPage=next;
        history.replaceState(null,'',pageUrl(currentPage));
        renderProducts();renderPagination();
        window.scrollTo({top:0,behavior:'smooth'});
      });
    });
    requestAnimationFrame(moveIndicator);
  }
  function moveIndicator(){
    const active=$('.shop-page-number.is-active',pagination);
    if(!indicator||!active){if(indicator)indicator.style.opacity='0';return}
    indicator.style.opacity='1';
    const x=pagination.offsetLeft+active.offsetLeft+(active.offsetWidth-indicator.offsetWidth)/2;
    indicator.style.transform=`translateX(${x}px)`;
  }

  renderProducts();renderPagination();

  const canvas=$('#shopCanvas');const stage=$('#shopStage');
  function fitCanvas(){
    if(!canvas||!stage)return;
    if(innerWidth<=900){canvas.style.removeProperty('--shop-scale');canvas.style.removeProperty('--shop-scale-x');canvas.style.removeProperty('--shop-scale-y');return}
    const h=(window.visualViewport&&window.visualViewport.height)||innerHeight;
    const scale=Math.min(innerWidth/1920,h/1080);const scaleX=innerWidth/1920;const scaleY=h/1080;
    canvas.style.setProperty('--shop-scale',String(scale));canvas.style.setProperty('--shop-scale-x',String(scaleX));canvas.style.setProperty('--shop-scale-y',String(scaleY));canvas.style.setProperty('--shop-inverse-scale',String(1/scale));requestAnimationFrame(moveIndicator);
  }
  fitCanvas();addEventListener('resize',fitCanvas,{passive:true});window.visualViewport?.addEventListener('resize',fitCanvas,{passive:true});
})();
