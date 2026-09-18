(async()=>{
  document.documentElement.classList.add('legal-root');
  await renderChrome();
  const site=await SITE;
  const sync=()=>{
    const ru=document.documentElement.lang==='ru';
    document.querySelectorAll('.legal-en').forEach(el=>el.classList.toggle('is-hidden',ru));
    document.querySelectorAll('.legal-ru').forEach(el=>el.classList.toggle('is-hidden',!ru));
  };
  const settings=site?.settings||{};
  const contact=String(settings.legalEmail||settings.contact||'').trim();
  document.querySelectorAll('[data-legal-email]').forEach(el=>{
    const usable=contact && !/\.example$/i.test(contact);
    if(usable){
      el.textContent=contact;
      if(el.tagName==='A')el.href=`mailto:${contact}`;
    }else{
      el.textContent=document.documentElement.lang==='ru'?'страница «Контакты»':'Contact page';
      if(el.tagName==='A')el.href='/contact.html';
    }
  });
  const seller={name:String(settings.sellerName||'').trim(),address:String(settings.sellerAddress||'').trim(),country:String(settings.sellerCountry||'').trim(),email:contact};
  document.querySelectorAll('[data-seller-details]').forEach(el=>{
    const ru=el.dataset.lang==='ru';const rows=[];
    if(seller.name)rows.push(`<div><strong>${ru?'Продавец':'Seller'}:</strong> ${esc(seller.name)}</div>`);
    if(seller.address)rows.push(`<div><strong>${ru?'Адрес':'Address'}:</strong> ${esc(seller.address)}</div>`);
    if(seller.country)rows.push(`<div><strong>${ru?'Страна':'Country'}:</strong> ${esc(seller.country)}</div>`);
    if(seller.email)rows.push(`<div><strong>Email:</strong> <a href="mailto:${esc(seller.email)}">${esc(seller.email)}</a></div>`);
    el.innerHTML=rows.join('');el.hidden=!rows.length;
  });
  sync();
  new MutationObserver(()=>{sync();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
