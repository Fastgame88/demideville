(async()=>{
  await renderChrome();
  const site=await SITE;
  const curr=site.settings?.currency||'$';
  const byId=Object.fromEntries((site.products||[]).map(p=>[String(p.id),p]));
  const cart=cartGet().filter(x=>byId[String(x.productId)]);
  const list=$('#orderList');
  const DEFAULT_PAYMENT_METHODS=[{id:'paypal',labelEn:'PayPal',labelRu:'PayPal',enabled:true},{id:'applepay',labelEn:'ApplePay',labelRu:'ApplePay',enabled:true},{id:'googlepay',labelEn:'GooglePay',labelRu:'GooglePay',enabled:true},{id:'crypto',labelEn:'Crypto payment',labelRu:'Оплата криптовалютой',enabled:true},{id:'card',labelEn:'Card payment',labelRu:'Оплата картой',enabled:true}];
  const configured=Array.isArray(site.settings?.paymentMethods)&&site.settings.paymentMethods.length?site.settings.paymentMethods:DEFAULT_PAYMENT_METHODS;
  const paymentMethods=configured.filter(m=>m&&m.enabled!==false).map((m,i)=>({id:String(m.id||`payment-${i+1}`),labelEn:String(m.labelEn||m.label||`Payment ${i+1}`),labelRu:String(m.labelRu||m.labelEn||m.label||`Оплата ${i+1}`)}));
  if(!paymentMethods.length)paymentMethods.push(DEFAULT_PAYMENT_METHODS[4]);
  let pay=paymentMethods[0].id;
  let appliedCoupon=null;
  let discountAmount=0;
  const currentUser=window.ddCurrentUser?await window.ddCurrentUser():null;
  if(currentUser?.email){const emailInput=document.querySelector('#checkoutForm [name=email]');if(emailInput)emailInput.value=currentUser.email}

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

  const payBox=$('#paymentMethods');
  const payLabel=m=>document.documentElement.lang==='ru'?(m.labelRu||m.labelEn):(m.labelEn||m.labelRu);
  if(payBox){
    payBox.classList.add(`pay-count-${Math.min(paymentMethods.length,12)}`);
    const rows=Math.max(1,Math.ceil(paymentMethods.length/3));
    payBox.style.setProperty('--pay-rows',String(rows));
    payBox.style.setProperty('--pay-form-top',`${20+rows*54}px`);
    payBox.innerHTML=paymentMethods.map((m,i)=>{
      const row=Math.floor(i/3),start=row*3,count=Math.min(3,paymentMethods.length-start),index=i-start;
      const gap=9,width=(535-gap*(count-1))/count,left=index*(width+gap);
      return `<button type="button" class="pay-chip${i===0?' active':''}" data-pay="${esc(m.id)}" style="--pay-left:${left}px;--pay-top:${row*54}px;--pay-width:${width}px">${esc(payLabel(m))}</button>`;
    }).join('');
  }
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
    const discountRow=$('#discountRow'),discountValue=$('#discountValue');
    if(discountRow)discountRow.hidden=!(discountAmount>0);if(discountValue)discountValue.textContent=discountAmount>0?`−${money(discountAmount,curr)}`:'';
    const total=Math.max(0,sub-discountAmount+ship);
    $('#grandTotal').textContent=money(total,curr);
    const mobileTotal=$('#mobileOrderTotal');
    if(mobileTotal)mobileTotal.textContent=money(total,curr);
  }
  draw();

  $('#mobileOrderToggle')?.addEventListener('click',e=>{
    const open=document.body.classList.toggle('mobile-order-open');
    e.currentTarget.setAttribute('aria-expanded',String(open));
  });

  $('#discountApply')?.addEventListener('click',async e=>{
    e.preventDefault();const code=String($('#discountCode')?.value||'').trim();const status=$('#discountStatus');
    if(status){status.textContent='';status.classList.remove('error','ok')}
    if(!code){appliedCoupon=null;discountAmount=0;draw();return}
    try{
      const r=await fetch('/api/coupons/validate',{method:'POST',headers:{'Content-Type':'application/json',...authHeaders()},body:JSON.stringify({code,items:cart})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Coupon is not valid');
      appliedCoupon=d.code;discountAmount=Number(d.discount)||0;if(status){status.textContent=`${d.code}: −${Number(d.percent)||0}%`;status.classList.add('ok')}draw();
    }catch(err){appliedCoupon=null;discountAmount=0;if(status){status.textContent=err.message;status.classList.add('error')}draw()}
  });

  $('#checkoutForm').addEventListener('submit',async e=>{
    e.preventDefault();
    if(!cart.length)return alert(window.ddTranslate?.('Your bag is empty.')||'Your bag is empty.');
    const f=new FormData(e.target);
    const body={
      email:f.get('email'),
      paymentMethod:pay,
      couponCode:appliedCoupon||'',
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
