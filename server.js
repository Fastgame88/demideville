const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const zlib = require('zlib');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DB_PATH = path.join(ROOT, 'data', 'db.json');
const UPLOAD_DIR = path.join(PUBLIC, 'uploads');

let DB_CACHE = null;
let DB_CACHE_MTIME = -1;

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, packed = '') {
  try {
    const [salt, saved] = packed.split(':');
    if (!salt || !saved) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(saved, 'hex'));
  } catch { return false; }
}
function id() { return crypto.randomUUID(); }
function now() { return new Date().toISOString(); }
function defaultDb() {
  return {
    settings: {
      brand: 'DEMI DEVILLE', heroTitle: 'DEMI DEVILLE',
      heroDesktop: '/assets/images/hero.jpg', heroMobile: '/assets/images/hero-mobile.jpg', loginArt: '/assets/images/login-art.png', homeOverlayOpacity: 35,
      aboutHtml: 'About <mark>DEMI DEVILLE</mark> is a <strong>PIONEERING DESIGN STUDIO BASED</strong> in Paris, specializing in fashion, spatial design, and visual direction.<br><em>Established by Augustine</em> Oh & Jude Lee, the <strong>studio redefines traditional</strong> design frameworks through methods of deconstruction, expansion, and reduction. <strong>By merging</strong> high fashion with a <strong>progressive design</strong> philosophy, DEMI DEVILLE delivers innovative, high-quality work that challenges visual conventions. <strong>The studio collaborates with a wide range of celebrities,</strong> artists, and brands, offering fresh design experiences that resonate with forward-thinking audiences around the world.',
      contact: 'contact@demideville.example', instagram: 'https://instagram.com/', supportText: 'SUPPORT',
      supportButtonTextEn:'SUPPORT', supportButtonTextRu:'ПОДДЕРЖКА',
      supportTitleEn:'START A CHAT', supportTitleRu:'НАЧАТЬ ЧАТ',
      supportGreetingEn:'Thanks for stopping by! How can I help you?', supportGreetingRu:'Спасибо, что заглянули! Чем я могу помочь?',
      supportEmailPlaceholderEn:'YOUR EMAIL', supportEmailPlaceholderRu:'ВАША ПОЧТА',
      supportMessagePlaceholderEn:'HOW CAN WE HELP?', supportMessagePlaceholderRu:'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',
      supportSendTextEn:'SEND', supportSendTextRu:'ОТПРАВИТЬ',
      supportButtonBackground:'#050505', supportButtonColor:'#ffffff', supportWindowBackground:'#ffffff',
      supportFieldBackground:'#000000', supportFieldColor:'#ffffff', supportButtonFont:'Arial, Helvetica, sans-serif', supportContentFont:'Arial, Helvetica, sans-serif',
      contactTitleEn:'CONTACT', contactTitleRu:'КОНТАКТЫ', contactTextEn:'Contact DEMI DEVILLE for orders, collaborations and client support.', contactTextRu:'Свяжитесь с DEMI DEVILLE по вопросам заказов, сотрудничества и поддержки.', contactPhone:'', contactAddressEn:'Paris, France', contactAddressRu:'Париж, Франция',
      baseFont: 'Arial, Helvetica, sans-serif', displayFont: 'Arial Black, Arial, Helvetica, sans-serif', condensedFont: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
      baseFontSize: 16, shopPageSize: 8, shipping: 30, currency: '$',
      paymentMethods: [
        {id:'paypal',labelEn:'PayPal',labelRu:'PayPal',enabled:true},
        {id:'applepay',labelEn:'ApplePay',labelRu:'ApplePay',enabled:true},
        {id:'googlepay',labelEn:'GooglePay',labelRu:'GooglePay',enabled:true},
        {id:'crypto',labelEn:'Crypto payment',labelRu:'Оплата криптовалютой',enabled:true},
        {id:'card',labelEn:'Card payment',labelRu:'Оплата картой',enabled:true}
      ],
      shopCategories: [
        { id:'jackets-coats', slug:'jackets-coats', labelEn:'JACKETS & COATS', labelRu:'КУРТКИ И ПАЛЬТО', enabled:true, showInMenu:true },
        { id:'jeans-pants-shorts', slug:'jeans-pants-shorts', labelEn:'JEANS, PANTS & SHORTS', labelRu:'ДЖИНСЫ, БРЮКИ И ШОРТЫ', enabled:true, showInMenu:true },
        { id:'tops', slug:'tops', labelEn:'TOPS', labelRu:'ВЕРХ', enabled:true, showInMenu:true },
        { id:'bags-accessories', slug:'bags-accessories', labelEn:'BAGS & ACCESSORIES', labelRu:'СУМКИ И АКСЕССУАРЫ', enabled:true, showInMenu:true }
      ]
    },
    products: [
      { id:'invitation-tshirt', name:'Invitation T-Shirt - Black', price:55, image:'/assets/images/product-tshirt.jpg', description:'Black invitation graphic T-shirt.', fabric:'Cotton blend', sizes:['XS','S','M','L','XL'], active:true, sort:1 },
      { id:'human-uniform', name:'Human Uniform Longsleeve Black&White', price:90, image:'/assets/images/product-longsleeve.jpg', description:'Human Uniform long sleeve with striped sleeves and graphic details.', fabric:'Cotton jersey', sizes:['XS','S','M','L','XL'], active:true, sort:2 },
      { id:'lobby-hoody', name:'Lobby Hoody Black&White', price:140, image:'/assets/images/product-hoodie.jpg', description:'Oversized black and white lobby hoodie.', fabric:'Heavy cotton fleece', sizes:['S','M','L','XL'], active:true, sort:3 },
      { id:'inside-jeans', name:'Inside Jeans- Black Black', price:140, image:'/assets/images/product-jeans.jpg', description:'Black jeans with contrast inside-out pocket details.', fabric:'Denim', sizes:['XS','S','M','L','XL'], active:true, sort:4 }
    ],
    gallery: [{ id:'gallery-1', image:'/assets/images/gallery.jpg', caption:'Always up to date: unsigned1', sort:1, active:true }],
    sections: [], users: [], sessions: [], orders: [], coupons: []
  };
}
function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = defaultDb();
    db.users.push({ id:id(), name:'Administrator', email:'admin@demideville.local', passwordHash:hashPassword('Admin123!'), role:'admin', newsletter:false, createdAt:now() });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    DB_CACHE=db; DB_CACHE_MTIME=fs.statSync(DB_PATH).mtimeMs;
    return db;
  }
  const mtime=fs.statSync(DB_PATH).mtimeMs;
  if(DB_CACHE && DB_CACHE_MTIME===mtime)return DB_CACHE;
  DB_CACHE=JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); DB_CACHE_MTIME=mtime;
  return DB_CACHE;
}
function saveDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  DB_CACHE=db;
  try{DB_CACHE_MTIME=fs.statSync(DB_PATH).mtimeMs}catch{DB_CACHE_MTIME=-1}
}
function sanitizeUser(u) { return { id:u.id, name:u.name, email:u.email, role:u.role, newsletter:!!u.newsletter, createdAt:u.createdAt }; }
function normalizeCouponCode(value){return String(value||'').trim().toUpperCase().replace(/\s+/g,'').slice(0,32)}
function sanitizeCoupon(c){return {id:c.id,code:c.code,userId:c.userId,percent:Number(c.percent)||0,active:c.active!==false,createdAt:c.createdAt||'',note:String(c.note||'')}}
function couponsOf(db,userId){return (Array.isArray(db.coupons)?db.coupons:[]).filter(c=>String(c.userId)===String(userId)&&c.active!==false).map(sanitizeCoupon)}
function subtotalForItems(db,items){let subtotal=0;for(const x of (Array.isArray(items)?items:[])){const prod=db.products.find(q=>String(q.id)===String(x.productId)&&q.active!==false);if(!prod)continue;const qty=Math.max(1,Math.min(99,Math.floor(Number(x.qty)||1)));subtotal+=(Number(prod.price)||0)*qty}return subtotal}
function couponForUser(db,user,code){const normalized=normalizeCouponCode(code);if(!normalized)return null;const list=Array.isArray(db.coupons)?db.coupons:[];return list.find(c=>c.active!==false&&normalizeCouponCode(c.code)===normalized&&user&&String(c.userId)===String(user.id))||null}
function tokenFrom(req) { const h=req.headers.authorization||''; return h.startsWith('Bearer ')?h.slice(7):(req.headers['x-session-token']||''); }
function currentUser(req, db) {
  const token = tokenFrom(req); if (!token) return null;
  const s=db.sessions.find(x=>x.token===token && new Date(x.expiresAt)>new Date());
  return s ? db.users.find(u=>u.id===s.userId)||null : null;
}
function productImages(product) {
  const out=[];
  for (const value of (Array.isArray(product?.images)?product.images:[])) {
    const url=String(value||'').trim(); if(url&&!out.includes(url)) out.push(url);
  }
  const primary=String(product?.image||'').trim(); if(primary&&!out.includes(primary)) out.unshift(primary);
  return out;
}
function productVariants(product) {
  if (Array.isArray(product?.variants) && product.variants.length) {
    return product.variants.map(v=>({size:String(v?.size||'').trim(),stock:Math.max(0,Math.floor(Number(v?.stock)||0))})).filter(v=>v.size);
  }
  return (Array.isArray(product?.sizes)?product.sizes:[]).map(size=>({size:String(size||'').trim(),stock:null})).filter(v=>v.size);
}
function publicProduct(product) {
  const out={...product};
  out.images=productImages(product);
  if(out.images.length)out.image=out.images[0];
  const variants=productVariants(product);
  out.variants=variants;
  out.sizes=variants.filter(v=>v.stock===null||v.stock>0).map(v=>v.size);
  return out;
}
function publicSite(db) { return { settings:db.settings, products:db.products.filter(p=>p.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)).map(publicProduct), gallery:db.gallery.filter(g=>g.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)), sections:db.sections.filter(s=>s.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)) }; }
function sendJson(res,status,obj){const b=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b)}
function sendPublicSite(req,res,db){
  const body=Buffer.from(JSON.stringify(publicSite(db)));
  const etag=`"${crypto.createHash('sha1').update(body).digest('hex')}"`;
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache, must-revalidate','ETag':etag,'Vary':'Accept-Encoding'};
  if(req.headers['if-none-match']===etag){res.writeHead(304,headers);return res.end()}
  const accepts=String(req.headers['accept-encoding']||'');
  if(body.length>1024&&/\bgzip\b/.test(accepts)){
    const compressed=zlib.gzipSync(body,{level:6});headers['Content-Encoding']='gzip';headers['Content-Length']=compressed.length;res.writeHead(200,headers);return res.end(compressed)
  }
  headers['Content-Length']=body.length;res.writeHead(200,headers);res.end(body)
}
function readJson(req){return new Promise((resolve,reject)=>{let size=0,parts=[];req.on('data',c=>{size+=c.length;if(size>30*1024*1024){reject(new Error('Body too large'));req.destroy();return}parts.push(c)});req.on('end',()=>{if(!parts.length)return resolve({});try{resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)})}
function needUser(req,res,admin=false){const db=loadDb(),user=currentUser(req,db);if(!user){sendJson(res,401,{error:'Unauthorized'});return null}if(admin&&user.role!=='admin'){sendJson(res,403,{error:'Admin only'});return null}return {db,user}}

async function handleApi(req,res,u){
  const p=u.pathname, m=req.method;
  if(m==='GET'&&p==='/api/site') return sendPublicSite(req,res,loadDb());
  if(m==='GET'&&p.startsWith('/api/products/')){const pid=decodeURIComponent(p.slice('/api/products/'.length)),prod=loadDb().products.find(x=>x.id===pid&&x.active!==false);return prod?sendJson(res,200,publicProduct(prod)):sendJson(res,404,{error:'Product not found'});}
  if(m==='POST'&&p==='/api/auth/register'){
    const b=await readJson(req), name=String(b.name||'').trim(), email=String(b.email||'').trim().toLowerCase(), password=String(b.password||'');
    if(name.length<2||!email.includes('@')||password.length<6)return sendJson(res,400,{error:'Enter a valid name, email and password (6+ characters).'});
    const db=loadDb(); if(db.users.some(x=>x.email.toLowerCase()===email))return sendJson(res,409,{error:'Email already registered.'});
    const user={id:id(),name,email,passwordHash:hashPassword(password),role:'customer',newsletter:!!b.newsletter,createdAt:now()};db.users.push(user);const token=crypto.randomBytes(32).toString('hex');db.sessions.push({token,userId:user.id,expiresAt:new Date(Date.now()+7*86400000).toISOString()});saveDb(db);return sendJson(res,200,{token,user:sanitizeUser(user)});
  }
  if(m==='POST'&&p==='/api/auth/login'){
    const b=await readJson(req),db=loadDb(),email=String(b.email||'').trim().toLowerCase(),user=db.users.find(x=>x.email.toLowerCase()===email);if(!user||!verifyPassword(String(b.password||''),user.passwordHash))return sendJson(res,401,{error:'Wrong email or password.'});const token=crypto.randomBytes(32).toString('hex');db.sessions=db.sessions.filter(s=>new Date(s.expiresAt)>new Date());db.sessions.push({token,userId:user.id,expiresAt:new Date(Date.now()+7*86400000).toISOString()});saveDb(db);return sendJson(res,200,{token,user:sanitizeUser(user)});
  }
  if(m==='GET'&&p==='/api/auth/me'){const a=needUser(req,res);if(!a)return;return sendJson(res,200,{user:sanitizeUser(a.user)});}
  if(m==='GET'&&p==='/api/account'){
    const a=needUser(req,res);if(!a)return;
    const orders=(Array.isArray(a.db.orders)?a.db.orders:[]).filter(o=>String(o.userId)===String(a.user.id));
    return sendJson(res,200,{user:sanitizeUser(a.user),orders,coupons:couponsOf(a.db,a.user.id)});
  }
  if(m==='POST'&&p==='/api/coupons/validate'){
    const a=needUser(req,res);if(!a)return;const b=await readJson(req);const coupon=couponForUser(a.db,a.user,b.code);
    if(!coupon)return sendJson(res,404,{error:'Coupon is not available for this account.'});
    const subtotal=subtotalForItems(a.db,b.items);const percent=Math.max(1,Math.min(95,Math.floor(Number(coupon.percent)||0)));const discount=Math.round(subtotal*percent)/100;
    return sendJson(res,200,{ok:true,code:coupon.code,percent,discount,subtotal});
  }
  if(m==='POST'&&p==='/api/auth/logout'){const db=loadDb(),token=tokenFrom(req);db.sessions=db.sessions.filter(s=>s.token!==token);saveDb(db);return sendJson(res,200,{ok:true});}
  if(m==='POST'&&p==='/api/support'){
    const b=await readJson(req), email=String(b.email||'').trim().toLowerCase(), message=String(b.message||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<2||message.length>5000)return sendJson(res,400,{error:'Enter a valid email and message.'});
    const db=loadDb();
    if(!Array.isArray(db.supportMessages)) db.supportMessages=[];
    const request={id:id(),email,message,lang:String(b.lang||'en').slice(0,8),status:'new',createdAt:now()};
    db.supportMessages.unshift(request);
    saveDb(db);
    return sendJson(res,200,{ok:true,id:request.id});
  }
  if(m==='POST'&&p==='/api/orders'){
    const b=await readJson(req),db=loadDb(),user=currentUser(req,db);
    if(!Array.isArray(b.items)||!b.items.length)return sendJson(res,400,{error:'Cart is empty.'});
    let subtotal=0;const items=[];const reservations=[];
    for(const x of b.items){
      const prod=db.products.find(q=>String(q.id)===String(x.productId)&&q.active!==false);if(!prod)continue;
      const qty=Math.max(1,Math.min(99,Math.floor(Number(x.qty)||1)));const size=String(x.size||'').trim();
      const variants=productVariants(prod);
      if(Array.isArray(prod.variants)&&prod.variants.length){
        const variant=variants.find(v=>v.size.toUpperCase()===size.toUpperCase());
        if(!variant||variant.stock<=0)return sendJson(res,409,{error:`Size ${size||'—'} is out of stock for ${prod.name}.`});
        if(qty>variant.stock)return sendJson(res,409,{error:`Only ${variant.stock} item(s) left for ${prod.name}, size ${variant.size}.`});
        reservations.push({prod,size:variant.size,qty});
      }
      subtotal+=(Number(prod.price)||0)*qty;
      const images=productImages(prod);
      items.push({productId:prod.id,name:prod.name,nameRu:prod.nameRu||'',price:Number(prod.price)||0,qty,size,image:images[0]||prod.image||''});
    }
    if(!items.length)return sendJson(res,400,{error:'Cart is empty.'});
    let coupon=null,discount=0,couponCode='';
    if(String(b.couponCode||'').trim()){
      if(!user)return sendJson(res,401,{error:'Log in to use this coupon.'});
      coupon=couponForUser(db,user,b.couponCode);if(!coupon)return sendJson(res,400,{error:'Coupon is not available for this account.'});
      const percent=Math.max(1,Math.min(95,Math.floor(Number(coupon.percent)||0)));discount=Math.round(subtotal*percent)/100;couponCode=coupon.code;
    }
    for(const r of reservations){
      const raw=(r.prod.variants||[]).find(v=>String(v?.size||'').trim().toUpperCase()===String(r.size).trim().toUpperCase());
      if(raw)raw.stock=Math.max(0,Math.floor(Number(raw.stock)||0)-r.qty);
      r.prod.sizes=(r.prod.variants||[]).filter(v=>Number(v?.stock)>0).map(v=>String(v.size));
    }
    const shipping=Number(db.settings.shipping||0);const total=Math.max(0,subtotal-discount+shipping);
    const order={id:id(),number:`DD-${String(Date.now()).slice(-8)}`,userId:user?.id||null,email:b.email||user?.email||'',customer:b.customer||{},items,subtotal,discount,couponCode,shipping,total,paymentMethod:b.paymentMethod||'Card payment',status:'new',createdAt:now()};
    db.orders.unshift(order);saveDb(db);return sendJson(res,200,{ok:true,order});
  }
  if(m==='GET'&&p==='/api/admin/state'){const a=needUser(req,res,true);if(!a)return;return sendJson(res,200,{settings:a.db.settings,products:a.db.products,gallery:a.db.gallery,sections:a.db.sections,orders:a.db.orders,supportMessages:Array.isArray(a.db.supportMessages)?a.db.supportMessages:[],users:a.db.users.map(sanitizeUser),coupons:(Array.isArray(a.db.coupons)?a.db.coupons:[]).map(sanitizeCoupon)});}
  if(m==='PUT'&&p==='/api/admin/settings'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);if(b.shopPageSize!=null)b.shopPageSize=Math.max(1,Math.min(8,Math.floor(Number(b.shopPageSize)||8)));a.db.settings={...a.db.settings,...b};saveDb(a.db);return sendJson(res,200,a.db.settings);}
  if(m==='POST'&&p==='/api/admin/upload'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req),match=String(b.dataUrl||'').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);if(!match)return sendJson(res,400,{error:'Invalid image data'});const ext=(match[1].split('/')[1]||'png').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,''),safe=String(b.filename||'image').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/\.[^.]+$/,'').slice(0,60)||'image',name=`${Date.now()}-${safe}.${ext}`;fs.mkdirSync(UPLOAD_DIR,{recursive:true});fs.writeFileSync(path.join(UPLOAD_DIR,name),Buffer.from(match[2],'base64'));return sendJson(res,200,{url:`/uploads/${name}`});}
  if(m==='POST'&&p==='/api/admin/change-password'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);if(String(b.newPassword||'').length<8)return sendJson(res,400,{error:'New password must be at least 8 characters.'});if(!verifyPassword(String(b.currentPassword||''),a.user.passwordHash))return sendJson(res,400,{error:'Current password is wrong.'});a.user.passwordHash=hashPassword(b.newPassword);saveDb(a.db);return sendJson(res,200,{ok:true});}
  const crud=p.match(/^\/api\/admin\/(products|gallery|sections)(?:\/([^/]+))?$/);
  if(crud){
    const a=needUser(req,res,true);if(!a)return;const collection=crud[1],objId=crud[2]?decodeURIComponent(crud[2]):null;
    if(m==='POST'&&!objId){
      const b=await readJson(req),obj={...b,id:b.id||id()};
      if(collection==='products'){
        if(a.db.products.some(x=>String(x.id)===String(obj.id)))return sendJson(res,409,{error:'Product ID already exists'});
        obj.images=productImages(obj);obj.image=obj.images[0]||String(obj.image||'');
        if(Array.isArray(obj.variants))obj.sizes=productVariants(obj).filter(v=>v.stock===null||v.stock>0).map(v=>v.size);
      }
      a.db[collection].push(obj);saveDb(a.db);return sendJson(res,200,obj)
    }
    if(m==='PUT'&&objId){
      const b=await readJson(req),idx=a.db[collection].findIndex(x=>String(x.id)===String(objId));if(idx<0)return sendJson(res,404,{error:'Not found'});
      const next={...a.db[collection][idx],...b,id:objId};
      if(collection==='products'){
        next.images=productImages(next);next.image=next.images[0]||String(next.image||'');
        if(Array.isArray(next.variants))next.sizes=productVariants(next).filter(v=>v.stock===null||v.stock>0).map(v=>v.size);
      }
      a.db[collection][idx]=next;saveDb(a.db);return sendJson(res,200,next)
    }
    if(m==='DELETE'&&objId){a.db[collection]=a.db[collection].filter(x=>String(x.id)!==String(objId));saveDb(a.db);return sendJson(res,200,{ok:true})}
  }
  if(m==='POST'&&p==='/api/admin/coupons'){
    const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);const user=a.db.users.find(u=>String(u.id)===String(b.userId)&&u.role!=='admin');
    if(!user)return sendJson(res,404,{error:'Client not found'});const code=normalizeCouponCode(b.code||`DEMI${Math.random().toString(36).slice(2,8)}`);const percent=Math.max(1,Math.min(95,Math.floor(Number(b.percent)||0)));
    if(!code||!percent)return sendJson(res,400,{error:'Enter coupon code and discount percent'});if(!Array.isArray(a.db.coupons))a.db.coupons=[];
    if(a.db.coupons.some(c=>normalizeCouponCode(c.code)===code))return sendJson(res,409,{error:'Coupon code already exists'});
    const coupon={id:id(),code,userId:user.id,percent,active:true,note:String(b.note||''),createdAt:now()};a.db.coupons.unshift(coupon);saveDb(a.db);return sendJson(res,200,sanitizeCoupon(coupon));
  }
  const cm=p.match(/^\/api\/admin\/coupons\/([^/]+)$/);
  if(cm&&m==='DELETE'){const a=needUser(req,res,true);if(!a)return;const cid=decodeURIComponent(cm[1]);if(!Array.isArray(a.db.coupons))a.db.coupons=[];a.db.coupons=a.db.coupons.filter(c=>String(c.id)!==String(cid));saveDb(a.db);return sendJson(res,200,{ok:true})}
  if(cm&&m==='PUT'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);const c=(a.db.coupons||[]).find(x=>String(x.id)===String(decodeURIComponent(cm[1])));if(!c)return sendJson(res,404,{error:'Coupon not found'});if(b.percent!=null)c.percent=Math.max(1,Math.min(95,Math.floor(Number(b.percent)||0)));if(b.active!=null)c.active=!!b.active;if(b.note!=null)c.note=String(b.note||'');saveDb(a.db);return sendJson(res,200,sanitizeCoupon(c))}
  const om=p.match(/^\/api\/admin\/orders\/([^/]+)$/);if(om&&m==='PUT'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req),o=a.db.orders.find(x=>x.id===decodeURIComponent(om[1]));if(!o)return sendJson(res,404,{error:'Order not found'});Object.assign(o,b);saveDb(a.db);return sendJson(res,200,o)}
  return sendJson(res,404,{error:'Not found'});
}

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'};
const TEXT_EXT=new Set(['.html','.css','.js','.json','.svg']);
function serveStatic(req,res,u){
  let rel=decodeURIComponent(u.pathname);if(rel==='/')rel='/index.html';if(rel==='/admin')rel='/admin/index.html';if(!path.extname(rel))rel += '.html';
  const file=path.normalize(path.join(PUBLIC,rel));if(!file.startsWith(PUBLIC)){res.writeHead(403);return res.end('Forbidden')}
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){
      const nf=path.join(PUBLIC,'404.html');const b=fs.readFileSync(nf);
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Length':b.length});return res.end(b)
    }
    const ext=path.extname(file).toLowerCase();
    const etag=`W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers={'Content-Type':MIME[ext]||'application/octet-stream','ETag':etag,'Last-Modified':st.mtime.toUTCString()};
    if(ext==='.html')headers['Cache-Control']='no-cache, must-revalidate';
    else if(['.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','.woff','.woff2','.ttf'].includes(ext))headers['Cache-Control']='public, max-age=2592000, immutable';
    else headers['Cache-Control']='public, max-age=604800';
    if(req.headers['if-none-match']===etag){res.writeHead(304,headers);return res.end()}
    if(req.method==='HEAD'){headers['Content-Length']=st.size;res.writeHead(200,headers);return res.end()}
    const accepts=String(req.headers['accept-encoding']||'');
    if(TEXT_EXT.has(ext)&&st.size>1024&&/\bgzip\b/.test(accepts)){
      headers['Content-Encoding']='gzip';headers['Vary']='Accept-Encoding';res.writeHead(200,headers);
      return fs.createReadStream(file).pipe(zlib.createGzip({level:6})).pipe(res);
    }
    headers['Content-Length']=st.size;res.writeHead(200,headers);fs.createReadStream(file).pipe(res)
  });
}

const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/'))return await handleApi(req,res,u);return serveStatic(req,res,u)}catch(e){console.error(e);if(!res.headersSent)sendJson(res,500,{error:'Server error'});else res.end()}});
server.listen(PORT,()=>console.log(`DEMI DEVILLE running: http://localhost:${PORT}`));
