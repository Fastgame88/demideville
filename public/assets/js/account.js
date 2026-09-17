(async()=>{
  await renderChrome();
  const ru=document.documentElement.lang==='ru';
  const site=await SITE,curr=site.settings?.currency||'$';
  if(!getToken()){location.href='/login.html';return}
  const r=await fetch('/api/account',{headers:authHeaders()});
  if(!r.ok){localStorage.removeItem('dd_token');sessionStorage.removeItem('dd_token');location.href='/login.html';return}
  const data=await r.json(),user=data.user||{},orders=Array.isArray(data.orders)?data.orders:[],coupons=Array.isArray(data.coupons)?data.coupons:[];
  $('.account-main> .account-heading-row h1').textContent=ru?'АККАУНТ':'ACCOUNT';
  $$('.account-section h2')[0].textContent=ru?'ПРОФИЛЬ':'PROFILE';$$('.account-section h2')[1].textContent=ru?'КУПОНЫ':'COUPONS';$$('.account-section h2')[2].textContent=ru?'ЗАКАЗЫ':'ORDERS';
  $('#accountProfile').innerHTML=`<div><span>${ru?'Имя':'Name'}</span><strong>${esc(user.name||'')}</strong></div><div><span>Email</span><strong>${esc(user.email||'')}</strong></div>`;
  $('#accountCoupons').innerHTML=coupons.length?coupons.map(c=>`<div class="account-coupon"><strong>${esc(c.code)}</strong><span>−${Number(c.percent)||0}%</span></div>`).join(''):`<p class="account-empty">${ru?'Активных купонов пока нет.':'No active coupons yet.'}</p>`;
  $('#accountOrders').innerHTML=orders.length?orders.map(o=>`<article class="account-order"><div class="account-order-head"><strong>${esc(o.number||'')}</strong><span>${esc(String(o.status||'new').toUpperCase())}</span></div><div class="account-order-meta"><span>${new Date(o.createdAt).toLocaleDateString()}</span><span>${money(o.total,curr)}</span>${o.couponCode?`<span>${ru?'Купон':'Coupon'}: ${esc(o.couponCode)}</span>`:''}</div><div class="account-order-items">${(o.items||[]).map(i=>`<span>${esc(i.nameRu&&ru?i.nameRu:i.name)} × ${Number(i.qty)||1}${i.size?` / ${esc(i.size)}`:''}</span>`).join('')}</div></article>`).join(''):`<p class="account-empty">${ru?'Заказов пока нет.':'No orders yet.'}</p>`;
  $('#accountLogout').textContent=ru?'ВЫЙТИ':'LOGOUT';$('#accountLogout').onclick=async()=>{await fetch('/api/auth/logout',{method:'POST',headers:authHeaders()}).catch(()=>{});localStorage.removeItem('dd_token');sessionStorage.removeItem('dd_token');location.href='/'};
})();
