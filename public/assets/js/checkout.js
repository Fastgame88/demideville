(async()=>{
  await renderChrome();
  const site=await SITE;
  const curr=site.settings?.currency||'$';
  const byId=Object.fromEntries((site.products||[]).map(p=>[String(p.id),p]));
  const cart=cartGet().filter(x=>byId[String(x.productId)]);
  const list=$('#orderList');
  let pay='Card payment';

  const preferredCheckoutImage=p=>{
    const known={
      'invitation-tshirt':'/assets/images/product-tshirt-ref.png',
      'human-uniform':'/assets/images/product-longsleeve-ref.png',
      'lobby-hoody':'/assets/images/product-hoodie-ref.png',
      'inside-jeans':'/assets/images/product-jeans-ref.png'
    };
    return (window.ddProductImages?.(p)||[])[0]||known[p.id]||p.image;
  };
  const productName=p=>window.ddProductText?window.ddProductText(p,'name'):(p?.name||'');

  $$('.pay-chip').forEach(b=>b.onclick=()=>{
    $$('.pay-chip').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    pay=b.dataset.pay;
  });

  function draw(){
    list.innerHTML=cart.map(x=>{
      const p=byId[String(x.productId)];
      const qty=Math.max(1,Number(x.qty)||1);
      return `<div class="order-line">
        <div class="order-thumb">
          <img src="${esc(preferredCheckoutImage(p))}" alt="${esc(productName(p))}">
          <div class="order-qty-stack"><b class="qty-badge">${qty}</b><span class="size-badge">${esc(x.size||'')}</span></div>
        </div>
        <div class="order-meta"><div>${esc(productName(p))}</div><div>${money(p.price,curr)}</div></div>
      </div>`;
    }).join('');

    const sub=cart.reduce((a,x)=>a+(Number(byId[String(x.productId)]?.price)||0)*(Number(x.qty)||1),0);
    const ship=Number(site.settings?.shipping||30);
    $('#subtotal').textContent=money(sub,curr);
    $('#shipping').textContent=money(ship,curr);
    $('#grandTotal').textContent=money(sub+ship,curr);
    const mobileTotal=$('#mobileOrderTotal');
    if(mobileTotal)mobileTotal.textContent=money(sub+ship,curr);
  }
  draw();

  $('#mobileOrderToggle')?.addEventListener('click',e=>{
    const open=document.body.classList.toggle('mobile-order-open');
    e.currentTarget.setAttribute('aria-expanded',String(open));
  });

  $('#discountApply')?.addEventListener('click',e=>e.preventDefault());

  $('#checkoutForm').addEventListener('submit',async e=>{
    e.preventDefault();
    if(!cart.length)return alert(window.ddTranslate?.('Your bag is empty.')||'Your bag is empty.');
    const f=new FormData(e.target);
    const body={
      email:f.get('email'),
      paymentMethod:pay,
      items:cart,
      customer:{
        country:f.get('country'),
        firstName:f.get('firstName'),
        lastName:f.get('lastName'),
        address:f.get('address'),
        apartment:f.get('apartment'),
        postalCode:f.get('postalCode'),
        city:f.get('city'),
        phone:f.get('phone')
      }
    };
    const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)return alert(window.ddTranslate?.(d.error||'Could not create order')||d.error||'Could not create order');
    cartSet([]);
    const s=$('#orderSuccess');
    s.innerHTML=`Order <strong>${esc(d.order?.number||'')}</strong> created.`;
    s.classList.add('show');
    e.target.querySelector('button[type=submit]').disabled=true;
  });

  /* Header and support are provided by renderChrome() in common.js. */

  /* Preserve the exact 1920×1080 composition. Scale from viewport width only.
     This removes the previous side letterboxing caused by fitting to viewport height.
     If the browser is shorter than the scaled 1080 canvas, the document scrolls vertically
     instead of shrinking / overlapping the design. */
  const fitCheckout=()=>{
    if(window.innerWidth<=900){
      document.body.style.removeProperty('--checkout-scale');
      document.body.style.removeProperty('--checkout-stage-height');
      return;
    }
    const viewportWidth=document.documentElement.clientWidth||window.innerWidth;
    const s=viewportWidth/1920;
    document.body.style.setProperty('--checkout-scale',String(s));
    document.body.style.setProperty('--checkout-stage-height',`${1080*s}px`);
  };
  fitCheckout();
  window.addEventListener('resize',fitCheckout,{passive:true});
  window.visualViewport?.addEventListener('resize',fitCheckout,{passive:true});
})();
