(async()=>{
  await renderChrome();
  const site=await SITE;
  const loginArt=$('#loginArt');
  const customLoginBackground=window.ddResolvedPageBackground?window.ddResolvedPageBackground(site.settings||{},'login'):'';
  if(loginArt){
    const bundledLoginArt='/assets/images/login-art.png';
    loginArt.alt='';
    loginArt.hidden=true;
    if(!customLoginBackground){
      const configuredLoginArt=String(site.settings?.loginArt||bundledLoginArt).trim()||bundledLoginArt;
      let usingFallback=configuredLoginArt===bundledLoginArt;
      const reveal=()=>{
        loginArt.hidden=false;
      };
      loginArt.addEventListener('load',reveal,{once:true});
      loginArt.addEventListener('error',()=>{
        /* Keep the configured URL untouched in settings. If that file is temporarily
           unavailable, render the bundled artwork instead of flashing a broken image. */
        if(!usingFallback){
          usingFallback=true;
          loginArt.src=bundledLoginArt;
        }else{
          loginArt.hidden=true;
        }
      });
      loginArt.src=configuredLoginArt;
      if(loginArt.complete&&loginArt.naturalWidth)reveal();
    }
  }

  // Never expose or prefill the administrator credentials on the customer page.
  const clearAdminAutofill=()=>{
    [$('#registerForm'),$('#loginForm')].forEach(form=>{
      if(!form)return;const email=form.querySelector('input[type=email]'),password=form.querySelector('input[type=password]');
      if(String(email?.value||'').trim().toLowerCase()==='admin@demideville.local'){email.value='';if(password)password.value=''}
    });
  };
  clearAdminAutofill();
  setTimeout(clearAdminAutofill,120);
  setTimeout(clearAdminAutofill,700);

  /* Header and support are provided by renderChrome() in common.js. */

  const canvas=$('#loginCanvas');
  const fitLoginCanvas=()=>{
    if(!canvas)return;
    if(window.innerWidth<=900){
      canvas.style.removeProperty('--login-scale-x');
      canvas.style.removeProperty('--login-scale-y');
      return;
    }
    // Stretch the finished 1098×616 LOGIN reference plane exactly to the
    // browser edges. This keeps the existing composition untouched while
    // removing every outer gap on desktop.
    const scaleX=window.innerWidth/1098;
    const scaleY=window.innerHeight/616;
    canvas.style.setProperty('--login-scale-x',String(scaleX));
    canvas.style.setProperty('--login-scale-y',String(scaleY));
  };
  fitLoginCanvas();
  window.addEventListener('resize',fitLoginCanvas,{passive:true});



  /* Header and support are provided by renderChrome() in common.js. */

  const msg=$('#authMessage');
  const show=(t,ok=false)=>{
    msg.textContent=t;
    msg.classList.add('show');
    msg.style.color=ok?'#065c24':'#8a0808';
  };
  const storeToken=(token,remember)=>{
    localStorage.removeItem('dd_token');
    sessionStorage.removeItem('dd_token');
    (remember?localStorage:sessionStorage).setItem('dd_token',token);
  };

  try{
    if(getToken()){
      const r=await fetch('/api/auth/me',{headers:authHeaders()});
      if(r.ok){
        const {user}=await r.json();
        showUser(user);
      }else{
        localStorage.removeItem('dd_token');
        sessionStorage.removeItem('dd_token');
      }
    }
  }catch{}

  $('#registerForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=new FormData(e.target);
    const body={
      name:f.get('name'),
      email:f.get('email'),
      password:f.get('password'),
      newsletter:!!f.get('newsletter')
    };
    const r=await fetch('/api/auth/register',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const d=await r.json();
    if(!r.ok)return show(d.error||'Registration failed');
    storeToken(d.token,!!f.get('remember'));
    show('Account created.',true);
    showUser(d.user);
  });

  $('#loginForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const f=new FormData(e.target);
    const r=await fetch('/api/auth/login',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:f.get('email'),password:f.get('password')})
    });
    const d=await r.json();
    if(!r.ok)return show(d.error||'Login failed');
    storeToken(d.token,!!f.get('remember'));
    show('Logged in.',true);
    showUser(d.user);
  });

  function showUser(user){
    $('.auth-stack').style.display='none';
    const p=$('#userPanel');
    p.style.display='block';
    p.innerHTML=`<h2>${esc(user.name)}</h2><p>${esc(user.email)}</p><p><a class="btn-black" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="${user.role==='admin'?'/admin':'/account.html'}">${user.role==='admin'?'OPEN ADMIN PANEL':'OPEN ACCOUNT'}</a></p><button class="btn-black" id="logoutBtn">Logout</button>`;
    $('#logoutBtn').onclick=async()=>{
      await fetch('/api/auth/logout',{method:'POST',headers:authHeaders()});
      localStorage.removeItem('dd_token');
      sessionStorage.removeItem('dd_token');
      location.reload();
    };
  }
})();

/* LOGIN proportional fit correction — additive only.
   The old canvas-fit code above is intentionally preserved. This final pass
   scales only the artwork/forms uniformly while header and SUPPORT stay at
   the SHOP/reference size. */
(()=>{
  const wrap=document.querySelector('.login-page .login-wrap');
  const canvas=document.querySelector('.login-page .login-canvas');
  if(!wrap||!canvas)return;
  const fitLoginContentUniformly=()=>{
    if(window.innerWidth<=900){
      wrap.style.removeProperty('--login-content-scale');
      return;
    }
    const scale=Math.min(window.innerWidth/1098,window.innerHeight/616);
    wrap.style.setProperty('--login-content-scale',String(scale));
  };
  fitLoginContentUniformly();
  window.addEventListener('resize',fitLoginContentUniformly,{passive:true});
})();

/* LOGIN exact reference scale — additive final correction.
   Preserve the 1098×616 design and scale it uniformly from viewport width.
   Height is intentionally NOT used for fitting; a shorter viewport crops the
   lower part instead of shrinking the entire design or creating a bottom gap. */
(()=>{
  const canvas=document.querySelector('.login-page .login-canvas');
  if(!canvas)return;
  const fitLoginReferenceFromWidth=()=>{
    if(window.innerWidth<=900){
      canvas.style.removeProperty('--login-screen-scale');
      return;
    }
    canvas.style.setProperty('--login-screen-scale',String(window.innerWidth/1098));
  };
  fitLoginReferenceFromWidth();
  window.addEventListener('resize',fitLoginReferenceFromWidth,{passive:true});
})();
