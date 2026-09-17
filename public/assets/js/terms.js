(async()=>{
  await renderChrome();
  const sync=()=>{
    const ru=document.documentElement.lang==='ru';
    document.querySelector('.legal-en')?.classList.toggle('is-hidden',ru);
    document.querySelector('.legal-ru')?.classList.toggle('is-hidden',!ru);
  };
  sync();
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();
