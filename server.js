const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DB_PATH = path.join(ROOT, 'data', 'db.json');
const UPLOAD_DIR = path.join(PUBLIC, 'uploads');

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
      baseFont: 'Arial, Helvetica, sans-serif', displayFont: 'Arial Black, Arial, Helvetica, sans-serif', condensedFont: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
      baseFontSize: 16, shopPageSize: 12, shipping: 30, currency: '$'
    },
    products: [
      { id:'invitation-tshirt', name:'Invitation T-Shirt - Black', price:55, image:'/assets/images/product-tshirt.jpg', description:'Black invitation graphic T-shirt.', fabric:'Cotton blend', sizes:['XS','S','M','L','XL'], active:true, sort:1 },
      { id:'human-uniform', name:'Human Uniform Longsleeve Black&White', price:90, image:'/assets/images/product-longsleeve.jpg', description:'Human Uniform long sleeve with striped sleeves and graphic details.', fabric:'Cotton jersey', sizes:['XS','S','M','L','XL'], active:true, sort:2 },
      { id:'lobby-hoody', name:'Lobby Hoody Black&White', price:140, image:'/assets/images/product-hoodie.jpg', description:'Oversized black and white lobby hoodie.', fabric:'Heavy cotton fleece', sizes:['S','M','L','XL'], active:true, sort:3 },
      { id:'inside-jeans', name:'Inside Jeans- Black Black', price:140, image:'/assets/images/product-jeans.jpg', description:'Black jeans with contrast inside-out pocket details.', fabric:'Denim', sizes:['XS','S','M','L','XL'], active:true, sort:4 }
    ],
    gallery: [{ id:'gallery-1', image:'/assets/images/gallery.jpg', caption:'Always up to date: unsigned1', sort:1, active:true }],
    sections: [], users: [], sessions: [], orders: []
  };
}
function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    const db = defaultDb();
    db.users.push({ id:id(), name:'Administrator', email:'admin@demideville.local', passwordHash:hashPassword('Admin123!'), role:'admin', newsletter:false, createdAt:now() });
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function saveDb(db) { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
function sanitizeUser(u) { return { id:u.id, name:u.name, email:u.email, role:u.role, newsletter:!!u.newsletter, createdAt:u.createdAt }; }
function tokenFrom(req) { const h=req.headers.authorization||''; return h.startsWith('Bearer ')?h.slice(7):(req.headers['x-session-token']||''); }
function currentUser(req, db) {
  const token = tokenFrom(req); if (!token) return null;
  const s=db.sessions.find(x=>x.token===token && new Date(x.expiresAt)>new Date());
  return s ? db.users.find(u=>u.id===s.userId)||null : null;
}
function publicSite(db) { return { settings:db.settings, products:db.products.filter(p=>p.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)), gallery:db.gallery.filter(g=>g.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)), sections:db.sections.filter(s=>s.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)) }; }
function sendJson(res,status,obj){const b=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b)}
function readJson(req){return new Promise((resolve,reject)=>{let size=0,parts=[];req.on('data',c=>{size+=c.length;if(size>30*1024*1024){reject(new Error('Body too large'));req.destroy();return}parts.push(c)});req.on('end',()=>{if(!parts.length)return resolve({});try{resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)})}
function needUser(req,res,admin=false){const db=loadDb(),user=currentUser(req,db);if(!user){sendJson(res,401,{error:'Unauthorized'});return null}if(admin&&user.role!=='admin'){sendJson(res,403,{error:'Admin only'});return null}return {db,user}}

async function handleApi(req,res,u){
  const p=u.pathname, m=req.method;
  if(m==='GET'&&p==='/api/site') return sendJson(res,200,publicSite(loadDb()));
  if(m==='GET'&&p.startsWith('/api/products/')){const pid=decodeURIComponent(p.slice('/api/products/'.length)),prod=loadDb().products.find(x=>x.id===pid&&x.active!==false);return prod?sendJson(res,200,prod):sendJson(res,404,{error:'Product not found'});}
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
    const b=await readJson(req),db=loadDb(),user=currentUser(req,db);if(!Array.isArray(b.items)||!b.items.length)return sendJson(res,400,{error:'Cart is empty.'});let subtotal=0,items=[];for(const x of b.items){const prod=db.products.find(q=>q.id===x.productId&&q.active!==false);if(!prod)continue;const qty=Math.max(1,Math.min(99,Number(x.qty)||1));subtotal+=prod.price*qty;items.push({productId:prod.id,name:prod.name,price:prod.price,qty,size:x.size||'',image:prod.image})}const order={id:id(),number:`DD-${String(Date.now()).slice(-8)}`,userId:user?.id||null,email:b.email||user?.email||'',customer:b.customer||{},items,subtotal,shipping:Number(db.settings.shipping||0),total:subtotal+Number(db.settings.shipping||0),paymentMethod:b.paymentMethod||'Card payment',status:'new',createdAt:now()};db.orders.unshift(order);saveDb(db);return sendJson(res,200,{ok:true,order});
  }
  if(m==='GET'&&p==='/api/admin/state'){const a=needUser(req,res,true);if(!a)return;return sendJson(res,200,{settings:a.db.settings,products:a.db.products,gallery:a.db.gallery,sections:a.db.sections,orders:a.db.orders,supportMessages:Array.isArray(a.db.supportMessages)?a.db.supportMessages:[],users:a.db.users.map(sanitizeUser)});}
  if(m==='PUT'&&p==='/api/admin/settings'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);a.db.settings={...a.db.settings,...b};saveDb(a.db);return sendJson(res,200,a.db.settings);}
  if(m==='POST'&&p==='/api/admin/upload'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req),match=String(b.dataUrl||'').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);if(!match)return sendJson(res,400,{error:'Invalid image data'});const ext=(match[1].split('/')[1]||'png').replace('jpeg','jpg').replace(/[^a-z0-9]/gi,''),safe=String(b.filename||'image').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/\.[^.]+$/,'').slice(0,60)||'image',name=`${Date.now()}-${safe}.${ext}`;fs.mkdirSync(UPLOAD_DIR,{recursive:true});fs.writeFileSync(path.join(UPLOAD_DIR,name),Buffer.from(match[2],'base64'));return sendJson(res,200,{url:`/uploads/${name}`});}
  if(m==='POST'&&p==='/api/admin/change-password'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);if(String(b.newPassword||'').length<8)return sendJson(res,400,{error:'New password must be at least 8 characters.'});if(!verifyPassword(String(b.currentPassword||''),a.user.passwordHash))return sendJson(res,400,{error:'Current password is wrong.'});a.user.passwordHash=hashPassword(b.newPassword);saveDb(a.db);return sendJson(res,200,{ok:true});}
  const crud=p.match(/^\/api\/admin\/(products|gallery|sections)(?:\/([^/]+))?$/);
  if(crud){const a=needUser(req,res,true);if(!a)return;const collection=crud[1],objId=crud[2]?decodeURIComponent(crud[2]):null;if(m==='POST'&&!objId){const b=await readJson(req),obj={...b,id:b.id||id()};a.db[collection].push(obj);saveDb(a.db);return sendJson(res,200,obj)}if(m==='PUT'&&objId){const b=await readJson(req),idx=a.db[collection].findIndex(x=>x.id===objId);if(idx<0)return sendJson(res,404,{error:'Not found'});a.db[collection][idx]={...a.db[collection][idx],...b,id:objId};saveDb(a.db);return sendJson(res,200,a.db[collection][idx])}if(m==='DELETE'&&objId){a.db[collection]=a.db[collection].filter(x=>x.id!==objId);saveDb(a.db);return sendJson(res,200,{ok:true})}}
  const om=p.match(/^\/api\/admin\/orders\/([^/]+)$/);if(om&&m==='PUT'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req),o=a.db.orders.find(x=>x.id===decodeURIComponent(om[1]));if(!o)return sendJson(res,404,{error:'Order not found'});Object.assign(o,b);saveDb(a.db);return sendJson(res,200,o)}
  return sendJson(res,404,{error:'Not found'});
}

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
function serveStatic(req,res,u){
  let rel=decodeURIComponent(u.pathname);if(rel==='/')rel='/index.html';if(rel==='/admin')rel='/admin/index.html';if(!path.extname(rel))rel += '.html';
  const file=path.normalize(path.join(PUBLIC,rel));if(!file.startsWith(PUBLIC)){res.writeHead(403);return res.end('Forbidden')}
  fs.stat(file,(err,st)=>{if(err||!st.isFile()){const nf=path.join(PUBLIC,'404.html');const b=fs.readFileSync(nf);res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});return res.end(b)}const ext=path.extname(file).toLowerCase();res.writeHead(200,{'Content-Type':MIME[ext]||'application/octet-stream','Cache-Control':ext==='.html'?'no-cache':'public, max-age=3600'});fs.createReadStream(file).pipe(res)});
}

const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/'))return await handleApi(req,res,u);return serveStatic(req,res,u)}catch(e){console.error(e);if(!res.headersSent)sendJson(res,500,{error:'Server error'});else res.end()}});
server.listen(PORT,()=>console.log(`DEMI DEVILLE running: http://localhost:${PORT}`));
