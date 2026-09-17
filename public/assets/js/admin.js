let token=localStorage.getItem('dd_token')||'';
let settings={};
const $=(s,r=document)=>r.querySelector(s);

const authHeaders=()=>({'Authorization':`Bearer ${token}`});
function showNotice(message,type='ok',target='#globalNotice'){
  const el=$(target);if(!el)return;
  el.textContent=message;el.className=`notice show ${type}`;
  clearTimeout(el._timer);el._timer=setTimeout(()=>{el.className='notice'},2800);
}
async function api(url,opt={}){
  opt.headers={...(opt.headers||{}),...authHeaders()};
  if(opt.body&&!opt.headers['Content-Type'])opt.headers['Content-Type']='application/json';
  const r=await fetch(url,opt);const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(data.error||'Помилка запиту');return data;
}
function clampPercent(value,fallback=35){
  const n=Number(value);return Number.isFinite(n)?Math.max(0,Math.min(100,Math.round(n))):fallback;
}
function cssImage(url){return url?`url(${JSON.stringify(String(url))})`:'none'}
function setBusy(busy){
  document.querySelectorAll('.primary-btn').forEach(b=>{if(b.id==='saveTop'||b.type==='submit'){b.disabled=busy}});
}
function showLogin(message=''){
  $('#adminView').hidden=true;$('#loginView').style.display='grid';
  if(message)showNotice(message,'error','#loginNotice');
}
async function boot(){
  if(!token)return showLogin();
  try{
    const me=await api('/api/auth/me');
    if(me.user.role!=='admin')throw new Error('Доступ тільки для адміністратора');
    $('#adminUser').textContent=me.user.email;
    $('#loginView').style.display='none';$('#adminView').hidden=false;
    const state=await api('/api/admin/state');settings=state.settings||{};fillForm();
  }catch(e){token='';localStorage.removeItem('dd_token');showLogin(e.message)}
}
$('#adminLogin').addEventListener('submit',async e=>{
  e.preventDefault();
  const f=new FormData(e.currentTarget);
  try{
    const r=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:f.get('email'),password:f.get('password')})});
    const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Не вдалося увійти');
    if(data.user?.role!=='admin')throw new Error('Цей акаунт не є адміністратором');
    token=data.token;localStorage.setItem('dd_token',token);await boot();
  }catch(err){showNotice(err.message,'error','#loginNotice')}
});
$('#adminLogout').addEventListener('click',async()=>{
  try{await api('/api/auth/logout',{method:'POST'})}catch{}
  token='';localStorage.removeItem('dd_token');location.reload();
});
function fillForm(){
  const desktopOverlay=clampPercent(settings.homeDesktopOverlayOpacity,clampPercent(settings.homeOverlayOpacity,35));
  const mobileOverlay=clampPercent(settings.homeMobileOverlayOpacity,clampPercent(settings.homeOverlayOpacity,35));
  $('#heroDesktop').value=settings.heroDesktop||'/assets/images/hero.jpg';
  $('#heroMobile').value=settings.heroMobile||'/assets/images/hero-mobile.jpg';
  $('#homeDesktopOverlayOpacity').value=desktopOverlay;$('#desktopOverlayRange').value=desktopOverlay;
  $('#homeMobileOverlayOpacity').value=mobileOverlay;$('#mobileOverlayRange').value=mobileOverlay;
  selectValue($('#homeDesktopFont'),settings.homeDesktopFont||'');
  selectValue($('#homeMobileFont'),settings.homeMobileFont||'');
  updatePreview();
}
function selectValue(select,value){
  const exists=[...select.options].some(o=>o.value===value);select.value=exists?value:'';
}
function updatePreview(){
  const dImg=$('#heroDesktop').value.trim();const mImg=$('#heroMobile').value.trim();
  $('#desktopPreview').style.backgroundImage=cssImage(dImg);
  $('#mobilePreview').style.backgroundImage=cssImage(mImg);
  const d=clampPercent($('#homeDesktopOverlayOpacity').value,35);const m=clampPercent($('#homeMobileOverlayOpacity').value,35);
  $('#desktopPreviewOverlay').style.background=`rgba(0,0,0,${d/100})`;
  $('#mobilePreviewOverlay').style.background=`rgba(0,0,0,${m/100})`;
  const df=$('#homeDesktopFont').value;const mf=$('#homeMobileFont').value;
  $('#desktopPreview').style.fontFamily=df||'';$('#desktopFontSample').style.fontFamily=df||'';
  $('#mobilePreview').style.fontFamily=mf||'';$('#mobileFontSample').style.fontFamily=mf||'';
}
function syncRange(rangeId,numberId){
  const range=$(rangeId),num=$(numberId);
  range.addEventListener('input',()=>{num.value=range.value;updatePreview()});
  num.addEventListener('input',()=>{const v=clampPercent(num.value,35);range.value=v;updatePreview()});
}
syncRange('#desktopOverlayRange','#homeDesktopOverlayOpacity');
syncRange('#mobileOverlayRange','#homeMobileOverlayOpacity');
['#heroDesktop','#heroMobile','#homeDesktopFont','#homeMobileFont'].forEach(id=>$(id).addEventListener('input',updatePreview));

async function uploadImage(file,targetName){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const out=await api('/api/admin/upload',{method:'POST',body:JSON.stringify({dataUrl,filename:file.name})});
  const input=$(`#${targetName}`);input.value=out.url;updatePreview();
}
document.querySelectorAll('[data-upload-target]').forEach(input=>{
  input.addEventListener('change',async()=>{
    const file=input.files?.[0];if(!file)return;
    try{input.disabled=true;await uploadImage(file,input.dataset.uploadTarget);showNotice('Фон завантажено. Натисніть «Зберегти», щоб застосувати.')}catch(e){showNotice(e.message,'error')}finally{input.disabled=false;input.value=''}
  });
});
function payload(){
  const desktop=clampPercent($('#homeDesktopOverlayOpacity').value,35);
  const mobile=clampPercent($('#homeMobileOverlayOpacity').value,35);
  return {
    heroDesktop:$('#heroDesktop').value.trim()||'/assets/images/hero.jpg',
    heroMobile:$('#heroMobile').value.trim()||'/assets/images/hero-mobile.jpg',
    homeDesktopOverlayOpacity:desktop,
    homeMobileOverlayOpacity:mobile,
    homeDesktopFont:$('#homeDesktopFont').value,
    homeMobileFont:$('#homeMobileFont').value,
    homeOverlayOpacity:mobile
  };
}
async function save(){
  try{
    setBusy(true);settings=await api('/api/admin/settings',{method:'PUT',body:JSON.stringify(payload())});
    fillForm();showNotice('Зміни головної сторінки збережено.');
  }catch(e){showNotice(e.message,'error')}finally{setBusy(false)}
}
$('#homeSettingsForm').addEventListener('submit',async e=>{e.preventDefault();await save()});
$('#saveTop').addEventListener('click',save);
boot();
