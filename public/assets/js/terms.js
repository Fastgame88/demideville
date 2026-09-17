(async()=>{
  await renderChrome();
  const site=await SITE;
  const sync=()=>{
    const ru=document.documentElement.lang==='ru';
    document.querySelectorAll('.legal-en').forEach(el=>el.classList.toggle('is-hidden',ru));
    document.querySelectorAll('.legal-ru').forEach(el=>el.classList.toggle('is-hidden',!ru));
  };
  const contact=String(site?.settings?.contact||'').trim();
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
  sync();
  new MutationObserver(()=>{sync();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
