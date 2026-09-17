(async()=>{
  await renderChrome();
  const site=await SITE;
  const curr=site.settings?.currency||'$';
  const byId=Object.fromEntries((site.products||[]).map(p=>[p.id,p]));
  let cart=cartGet();
  const box=$('#cartItems');

  // Merge legacy duplicate cart rows only when BOTH product and size match.
  // Different sizes of the same product remain separate cards.
  function mergeSameCartItems(items){
    const merged=[];
    const indexByKey=new Map();
    for(const raw of (items||[])){
      if(!raw||!raw.productId) continue;
      const productId=String(raw.productId??'').trim();
      const size=normalizeCartSize(raw.size);
      const qty=Math.max(1,Math.floor(Number(raw.qty)||1));
      const key=`${productId}\u0000${size}`;
      if(indexByKey.has(key)){
        merged[indexByKey.get(key)].qty+=qty;
      }else{
        indexByKey.set(key,merged.length);
        merged.push({...raw,productId,size,qty});
      }
    }
    return merged;
  }

  const preferredCartImage=p=>{
    const known={
      'invitation-tshirt':'/assets/images/product-tshirt-ref.png',
      'human-uniform':'/assets/images/product-longsleeve-ref.png',
      'lobby-hoody':'/assets/images/product-hoodie-ref.png',
      'inside-jeans':'/assets/images/product-jeans-ref.png'
    };
    return (window.ddProductImages?.(p)||[])[0]||known[p.id]||p.image;
  };
  const productName=p=>window.ddProductText?window.ddProductText(p,'name'):(p?.name||'');
  const maxStock=(p,size)=>window.ddProductStock?window.ddProductStock(p,size):Infinity;

  function draw(){
    cart=mergeSameCartItems(cart).filter(x=>{
      const p=byId[x.productId];if(!p)return false;const stock=maxStock(p,x.size);if(stock<=0)return false;if(Number.isFinite(stock))x.qty=Math.max(1,Math.min(Math.floor(stock),Number(x.qty)||1));return true;
    });
    cartSet(cart);
    document.body.classList.toggle('cart-is-empty',!cart.length);
    if(!cart.length){
      box.innerHTML=`<div class="empty-cart">${document.documentElement.lang==='ru'?'Ваша корзина пуста.':'Your bag is empty.'}</div>`;
      $('#cartTotal').textContent=money(0,curr);
      return;
    }
    box.innerHTML=cart.map((x,i)=>{
      const p=byId[x.productId];
      const qty=Math.max(1,Number(x.qty)||1);
      return `<article class="cart-card" data-cart-index="${i}">
        <button class="cart-card-remove" type="button" data-cart-remove="${i}" aria-label="Remove item">×</button>
        <div class="cart-card-media"><img src="${esc(preferredCartImage(p))}" alt="${esc(productName(p))}"></div>
        <div class="cart-card-copy">
          <div class="cart-card-name">${esc(productName(p))}</div>
          <div class="cart-card-price">${money(p.price,curr)}</div>
          <div class="cart-card-size">${esc(x.size||'')}</div>
          <div class="cart-card-quantity">
            <button class="cart-qty-btn" type="button" data-cart-dec="${i}" aria-label="Decrease quantity">−</button>
            <input class="cart-qty-input" data-cart-qty="${i}" type="number" min="1" max="99" value="${qty}" aria-label="Quantity">
            <button class="cart-qty-btn" type="button" data-cart-inc="${i}" aria-label="Increase quantity">+</button>
          </div>
          ${qty>1?`<div class="cart-card-qty">×${qty}</div>`:''}
        </div>
      </article>`;
    }).join('');
    const total=cart.reduce((a,x)=>a+(byId[x.productId]?.price||0)*(Number(x.qty)||1),0);
    $('#cartTotal').textContent=money(total,curr);

    $$('[data-cart-inc]',box).forEach(btn=>{
      btn.onclick=()=>{
        const i=Number(btn.dataset.cartInc);
        if(!cart[i]) return;
        const p=byId[cart[i].productId],stock=maxStock(p,cart[i].size),limit=Number.isFinite(stock)?Math.min(99,stock):99;
        cart[i].qty=Math.min(limit,(Number(cart[i].qty)||1)+1);
        cartSet(cart);draw();
      };
    });
    $$('[data-cart-dec]',box).forEach(btn=>{
      btn.onclick=()=>{
        const i=Number(btn.dataset.cartDec);
        if(!cart[i]) return;
        cart[i].qty=Math.max(1,(Number(cart[i].qty)||1)-1);
        cartSet(cart);
        draw();
      };
    });
    $$('[data-cart-qty]',box).forEach(input=>{
      input.onchange=()=>{
        const i=Number(input.dataset.cartQty);
        if(!cart[i]) return;
        const p=byId[cart[i].productId],stock=maxStock(p,cart[i].size),limit=Number.isFinite(stock)?Math.min(99,stock):99;
        cart[i].qty=Math.max(1,Math.min(limit,Math.floor(Number(input.value)||1)));
        cartSet(cart);draw();
      };
    });
    $$('[data-cart-remove]',box).forEach(btn=>{
      btn.onclick=()=>{
        const i=Number(btn.dataset.cartRemove);
        if(!cart[i]) return;
        cart.splice(i,1);
        cartSet(cart);
        draw();
      };
    });
  }
  draw();
  $('#checkoutButton').onclick=()=>{if(cart.length)location.href='/checkout.html'};

  /* Header and support are provided by renderChrome() in common.js. */

  /* 1920×1080 reference canvas. */
  const fitCart=()=>{
    if(window.innerWidth<=900){
      document.body.style.removeProperty('--gallery-header-scale-x');
      document.body.style.removeProperty('--gallery-header-scale-y');
      document.body.style.removeProperty('--cart-scale-x');
      document.body.style.removeProperty('--cart-scale-y');
      return;
    }
    const h=(window.visualViewport&&window.visualViewport.height)||window.innerHeight;
    const sx=window.innerWidth/1920;
    const sy=h/1080;
    const s=Math.min(sx,sy);
    document.body.style.setProperty('--gallery-header-scale-x',String(sx));
    document.body.style.setProperty('--gallery-header-scale-y',String(sy));
    document.body.style.setProperty('--cart-scale-x',String(sx));
    document.body.style.setProperty('--cart-scale-y',String(sy));
  };
  fitCart();
  window.addEventListener('resize',fitCart,{passive:true});
  window.visualViewport?.addEventListener('resize',fitCart,{passive:true});
})();
