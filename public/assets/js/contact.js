(async()=>{
  await renderChrome();
  const site=await SITE,s=site.settings||{};
  const ru=document.documentElement.lang==='ru';
  const title=ru?(s.contactTitleRu||s.contactTitleEn||'КОНТАКТЫ'):(s.contactTitleEn||'CONTACT');
  const text=ru?(s.contactTextRu||s.contactTextEn||''):(s.contactTextEn||'');
  const address=ru?(s.contactAddressRu||s.contactAddressEn||''):(s.contactAddressEn||'');
  $('#contactTitle').textContent=title;$('#contactText').textContent=text;
  const email=String(s.contact||'').trim(),phone=String(s.contactPhone||'').trim(),instagram=String(s.instagram||'').trim();
  const emailEl=$('#contactEmail');emailEl.textContent=email||'—';emailEl.href=email?`mailto:${email}`:'#';
  const phoneEl=$('#contactPhone');phoneEl.textContent=phone;phoneEl.href=phone?`tel:${phone.replace(/[^+\d]/g,'')}`:'#';phoneEl.hidden=!phone;
  $('#contactAddress').textContent=address;
  const ig=$('#contactInstagram');ig.href=instagram||'#';ig.hidden=!instagram;
})();
