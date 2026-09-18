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
const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(PUBLIC, 'uploads');
const DATABASE_URL = String(process.env.DATABASE_URL || '').trim();
const USE_POSTGRES = !!DATABASE_URL;
let PG_POOL = null;
let DB_SAVE_QUEUE = Promise.resolve();
const DEFAULT_CHECKOUT_COUNTRIES=['Albania','Andorra','Armenia','Austria','Azerbaijan','Belgium','Bosnia and Herzegovina','Bulgaria','Croatia','Cyprus','Czechia','Denmark','Estonia','Finland','France','Georgia','Germany','Greece','Hungary','Iceland','Ireland','Italy','Kazakhstan','Kosovo','Latvia','Liechtenstein','Lithuania','Luxembourg','Malta','Moldova','Monaco','Montenegro','Netherlands','North Macedonia','Norway','Poland','Portugal','Romania','San Marino','Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey','Ukraine','United Kingdom','Vatican City'];

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
      supportGreetingEn:'Thanks for stopping by! How can I help you?', supportGreetingRu:'Спасибо, что заглянули! Чем я могу помочь?',
      supportEmailPlaceholderEn:'YOUR EMAIL', supportEmailPlaceholderRu:'ВАША ПОЧТА', supportMessagePlaceholderEn:'HOW CAN WE HELP?', supportMessagePlaceholderRu:'ЧЕМ МЫ МОЖЕМ ПОМОЧЬ?',
      supportSendTextEn:'SEND', supportSendTextRu:'ОТПРАВИТЬ', supportBackgroundImage:'/assets/images/support-cross-pattern.png',
      supportButtonBg:'#000000', supportButtonColor:'#ffffff', supportFieldBg:'#000000', supportFieldColor:'#ffffff', supportButtonFont:'', supportWindowFont:'',
      contactTitleEn:'CONTACT', contactTitleRu:'КОНТАКТЫ', contactTextEn:'Contact DEMI DEVILLE for orders, collaborations and client support.', contactTextRu:'Свяжитесь с DEMI DEVILLE по вопросам заказов, сотрудничества и поддержки.', contactPhone:'', contactAddressEn:'Paris, France', contactAddressRu:'Париж, Франция',
      baseFont: 'Arial, Helvetica, sans-serif', displayFont: 'Arial Black, Arial, Helvetica, sans-serif', condensedFont: 'Impact, Haettenschweiler, Arial Narrow Bold, sans-serif',
      baseFontSize: 16, shopPageSize: 8, shipping: 30, currency: '$',
      aboutMainMediaDesktop:'/assets/images/about-copy-psd.png', aboutMainMediaMobile:'/assets/images/about-mobile-approved.jpg', aboutExtraHtmlEn:'', aboutExtraHtmlRu:'',
      aboutExtraTextEn:'', aboutExtraTextRu:'', aboutExtraFont:'', aboutExtraFontSizeDesktop:24, aboutExtraFontSizeMobile:18, aboutExtraMedia:'',
      checkoutCountries:[...DEFAULT_CHECKOUT_COUNTRIES], checkoutCountriesExtra:[], pageBackgrounds:{}, mailFrom:'', supportTo:'', newsletterSubjectEn:'DEMI DEVILLE', newsletterSubjectRu:'DEMI DEVILLE',
      sellerName:'BOHDAN DROBOT ALEKSANDROVICH', sellerAddress:'', sellerCountry:'', legalEmail:'',

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
function ensureDbShape(db) {
  const base=defaultDb();
  db=db&&typeof db==='object'?db:{};
  db.settings={...base.settings,...(db.settings||{})};
  for(const key of ['products','gallery','sections','users','sessions','orders','coupons','supportMessages']){
    if(!Array.isArray(db[key]))db[key]=[];
  }
  db.settings.shopPageSize=Math.max(1,Math.min(8,Math.floor(Number(db.settings.shopPageSize)||8)));
  if(!Array.isArray(db.settings.paymentMethods)||!db.settings.paymentMethods.length)db.settings.paymentMethods=base.settings.paymentMethods.map(x=>({...x}));
  const countries=[...(Array.isArray(db.settings.checkoutCountries)&&db.settings.checkoutCountries.length?db.settings.checkoutCountries:DEFAULT_CHECKOUT_COUNTRIES),...(Array.isArray(db.settings.checkoutCountriesExtra)?db.settings.checkoutCountriesExtra:[])];
  db.settings.checkoutCountries=[...new Set(countries.map(x=>String(x||'').trim()).filter(x=>x&&!/^(russia|belarus)$/i.test(x)))];
  if(!db.settings.checkoutCountries.length)db.settings.checkoutCountries=[...DEFAULT_CHECKOUT_COUNTRIES];
  if(!db.settings.pageBackgrounds||typeof db.settings.pageBackgrounds!=='object'||Array.isArray(db.settings.pageBackgrounds))db.settings.pageBackgrounds={};
  // Migrate legacy product records without dropping user content. Duplicate IDs used by
  // old test data are made unique so product links and admin edits remain deterministic.
  const seenProductIds=new Set();
  const legacyCategories={'invitation-tshirt':['tops'],'human-uniform':['tops'],'lobby-hoody':['jackets-coats'],'inside-jeans':['jeans-pants-shorts']};
  db.products=db.products.map((product,index)=>{
    const out=product&&typeof product==='object'?product:{};let pid=String(out.id||`product-${index+1}`).trim()||`product-${index+1}`,candidate=pid,n=2;
    while(seenProductIds.has(candidate)){candidate=`${pid}-${n++}`}seenProductIds.add(candidate);out.id=candidate;
    if(!Array.isArray(out.categories))out.categories=legacyCategories[pid]?[...legacyCategories[pid]]:[];
    if(!Array.isArray(out.images)||!out.images.length){const primary=String(out.image||'').trim();out.images=primary?[primary]:[]}
    if(!out.image&&out.images[0])out.image=out.images[0];
    if(!['number','text','hidden'].includes(String(out.priceMode||'')))out.priceMode='number';
    if(out.purchasable==null)out.purchasable=true;
    return out;
  });
  db.gallery=db.gallery.map(g=>{if(g&&typeof g==='object'&&!g.media&&g.image)g.media=g.image;return g});
  if(!db.users.some(u=>u.role==='admin')){
    db.users.push({ id:id(), name:'Administrator', email:'admin@demideville.local', passwordHash:hashPassword('Admin123!'), role:'admin', newsletter:false, createdAt:now() });
  }
  return db;
}
function loadJsonDbFromDisk(){
  if(!fs.existsSync(DB_PATH)){
    fs.mkdirSync(path.dirname(DB_PATH),{recursive:true});
    const db=ensureDbShape(defaultDb());
    fs.writeFileSync(DB_PATH,JSON.stringify(db,null,2));
    DB_CACHE_MTIME=fs.statSync(DB_PATH).mtimeMs;
    return db;
  }
  const mtime=fs.statSync(DB_PATH).mtimeMs;
  if(DB_CACHE&&!USE_POSTGRES&&DB_CACHE_MTIME===mtime)return DB_CACHE;
  const db=ensureDbShape(JSON.parse(fs.readFileSync(DB_PATH,'utf8')));
  DB_CACHE_MTIME=mtime;
  return db;
}
function loadDb(){
  if(DB_CACHE)return DB_CACHE;
  DB_CACHE=loadJsonDbFromDisk();
  return DB_CACHE;
}
async function initDbStore(){
  if(!USE_POSTGRES){DB_CACHE=loadJsonDbFromDisk();return;}
  const {Pool}=require('pg');
  const pgSslMode=String(process.env.PGSSL||'auto').toLowerCase();const isRailwayPrivate=/\.railway\.internal(?::|\/|$)/i.test(DATABASE_URL);const ssl=pgSslMode==='disable'||(pgSslMode==='auto'&&isRailwayPrivate)?false:{rejectUnauthorized:false};
  PG_POOL=new Pool({connectionString:DATABASE_URL,ssl,max:Number(process.env.PGPOOL_MAX||5),idleTimeoutMillis:30000,connectionTimeoutMillis:10000});
  await PG_POOL.query(`CREATE TABLE IF NOT EXISTS app_state (id integer PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`);
  await PG_POOL.query(`CREATE TABLE IF NOT EXISTS media_files (name text PRIMARY KEY, mime text NOT NULL, data bytea NOT NULL, size bigint NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`);
  const row=await PG_POOL.query('SELECT data FROM app_state WHERE id=1');
  if(row.rows[0]?.data){DB_CACHE=ensureDbShape(row.rows[0].data);}
  else{
    DB_CACHE=loadJsonDbFromDisk();
    await PG_POOL.query('INSERT INTO app_state(id,data,updated_at) VALUES(1,$1::jsonb,now()) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data, updated_at=now()',[JSON.stringify(DB_CACHE)]);
  }
  // One-time safety migration: if this archive already contains files in public/uploads,
  // copy them into PostgreSQL so a future Railway redeploy cannot remove them.
  if(fs.existsSync(UPLOAD_DIR)){
    for(const entry of fs.readdirSync(UPLOAD_DIR,{withFileTypes:true})){
      if(!entry.isFile())continue;
      const name=entry.name;const file=path.join(UPLOAD_DIR,name);const data=fs.readFileSync(file);
      const ext=path.extname(name).toLowerCase();const mime=({'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime'})[ext]||'application/octet-stream';
      await PG_POOL.query('INSERT INTO media_files(name,mime,data,size,updated_at) VALUES($1,$2,$3,$4,now()) ON CONFLICT(name) DO NOTHING',[name,mime,data,data.length]);
    }
  }
  console.log('PostgreSQL storage enabled.');
}
async function saveDb(db){
  DB_CACHE=ensureDbShape(db);
  if(USE_POSTGRES&&PG_POOL){
    DB_SAVE_QUEUE=DB_SAVE_QUEUE.then(()=>PG_POOL.query('INSERT INTO app_state(id,data,updated_at) VALUES(1,$1::jsonb,now()) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data, updated_at=now()',[JSON.stringify(DB_CACHE)]));
    await DB_SAVE_QUEUE;
    return;
  }
  fs.mkdirSync(path.dirname(DB_PATH),{recursive:true});
  fs.writeFileSync(DB_PATH,JSON.stringify(DB_CACHE,null,2));
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
function productPriceMode(product){const mode=String(product?.priceMode||'number');return ['number','text','hidden'].includes(mode)?mode:'number'}
function productPurchasable(product){return product?.purchasable!==false&&productPriceMode(product)!=='hidden'&&Number.isFinite(Number(product?.price))}
function publicProduct(product) {
  const out={...product};
  out.images=productImages(product);
  if(out.images.length)out.image=out.images[0];
  const variants=productVariants(product);
  out.variants=variants;
  out.sizes=variants.filter(v=>v.stock===null||v.stock>0).map(v=>v.size);
  out.priceMode=productPriceMode(out);out.purchasable=productPurchasable(out);
  return out;
}
function publicSite(db) { const settings={...db.settings}; delete settings.smtpPassword; return { settings, products:db.products.filter(p=>p.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)).map(publicProduct), gallery:db.gallery.filter(g=>g.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)), sections:db.sections.filter(s=>s.active!==false).sort((a,b)=>(a.sort||0)-(b.sort||0)) }; }
function sendJson(res,status,obj){const b=Buffer.from(JSON.stringify(obj));res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':b.length,'Cache-Control':'no-store'});res.end(b)}
function sendPublicSite(req,res,db){
  const body=Buffer.from(JSON.stringify(publicSite(db)));
  const etag=`"${crypto.createHash('sha1').update(body).digest('hex')}"`;
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-cache, must-revalidate','ETag':etag,'Vary':'Accept-Encoding'};
  if(req.headers['if-none-match']===etag){res.writeHead(304,headers);return res.end()}
  const accepts=String(req.headers['accept-encoding']||'');
  if(body.length>1024&&/\bbr\b/.test(accepts)){const compressed=zlib.brotliCompressSync(body,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:5}});headers['Content-Encoding']='br';headers['Content-Length']=compressed.length;res.writeHead(200,headers);return res.end(compressed)}
  if(body.length>1024&&/\bgzip\b/.test(accepts)){
    const compressed=zlib.gzipSync(body,{level:6});headers['Content-Encoding']='gzip';headers['Content-Length']=compressed.length;res.writeHead(200,headers);return res.end(compressed)
  }
  headers['Content-Length']=body.length;res.writeHead(200,headers);res.end(body)
}
function readJson(req,maxBytes=2*1024*1024){return new Promise((resolve,reject)=>{let size=0,parts=[];req.on('data',c=>{size+=c.length;if(size>maxBytes){reject(new Error('Body too large'));req.destroy();return}parts.push(c)});req.on('end',()=>{if(!parts.length)return resolve({});try{resolve(JSON.parse(Buffer.concat(parts).toString('utf8')))}catch{reject(new Error('Invalid JSON'))}});req.on('error',reject)})}
function needUser(req,res,admin=false){const db=loadDb(),user=currentUser(req,db);if(!user){sendJson(res,401,{error:'Unauthorized'});return null}if(admin&&user.role!=='admin'){sendJson(res,403,{error:'Admin only'});return null}return {db,user}}

let SMTP_TRANSPORTER=null;
let SMTP_TRANSPORTER_KEY='';
function smtpConfig(){
  const host=String(process.env.SMTP_HOST||'').trim();
  const user=String(process.env.SMTP_USER||'').trim();
  const pass=String(process.env.SMTP_PASS||'');
  const defaultPort=/secureserver\.net$/i.test(host)?465:587;
  const port=Number(process.env.SMTP_PORT||defaultPort);
  const secureSetting=String(process.env.SMTP_SECURE||'').trim().toLowerCase();
  const secure=secureSetting?secureSetting==='true':port===465;
  const from=String(process.env.MAIL_FROM||user).trim();
  return {host,user,pass,port,secure,from};
}
function smtpDebug(err){
  const cfg=smtpConfig();
  const code=String(err?.code||'SMTP_ERROR').slice(0,40);
  const responseCode=Number(err?.responseCode||0)||0;
  const command=String(err?.command||'').slice(0,30);
  const response=String(err?.response||err?.message||'SMTP request failed').replace(cfg.pass||'__NO_PASS__','***').replace(cfg.user||'__NO_USER__','SMTP_USER').replace(/[\r\n]+/g,' ').slice(0,280);
  let hint='Перевірте SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS і MAIL_FROM у Railway.';
  if(code==='SMTP_CONFIG')hint='У Railway відсутні SMTP_HOST, SMTP_USER або SMTP_PASS.';
  else if(code==='EAUTH'||responseCode===535||responseCode===534)hint='SMTP відхилив авторизацію. Перевірте логін/пароль пошти та чи дозволена SMTP-відправка у GoDaddy.';
  else if(['ETIMEDOUT','ESOCKET','ECONNECTION','ENOTFOUND'].includes(code))hint='Немає з’єднання з SMTP. Перевірте SMTP_HOST, порт і SMTP_SECURE. Для GoDaddy Professional Email зазвичай smtpout.secureserver.net:465 + SMTP_SECURE=true.';
  else if([530,550,551,552,553,554].includes(responseCode))hint='SMTP сервер відхилив відправника або relay. Перевірте, щоб MAIL_FROM використовував ту саму поштову скриньку, що й SMTP_USER, та дозвіл на SMTP.';
  const parts=[code,responseCode?String(responseCode):'',command,response].filter(Boolean);
  return {debug:parts.join(' | '),hint};
}
function getSmtpTransporter(){
  const cfg=smtpConfig();
  if(!cfg.host||!cfg.user||!cfg.pass){const e=new Error('SMTP is not configured');e.code='SMTP_CONFIG';throw e}
  const key=JSON.stringify([cfg.host,cfg.port,cfg.secure,cfg.user]);
  if(!SMTP_TRANSPORTER||SMTP_TRANSPORTER_KEY!==key){
    const nodemailer=require('nodemailer');
    SMTP_TRANSPORTER=nodemailer.createTransport({
      host:cfg.host,port:cfg.port,secure:cfg.secure,auth:{user:cfg.user,pass:cfg.pass},
      pool:true,maxConnections:3,maxMessages:50,
      connectionTimeout:12000,greetingTimeout:8000,socketTimeout:20000
    });
    SMTP_TRANSPORTER_KEY=key;
  }
  return SMTP_TRANSPORTER;
}
async function sendTransactionalMail({to,subject,text,html,replyTo,inReplyTo,references}){
  if(!to){const e=new Error('Recipient email is empty');e.code='EENVELOPE';throw e}
  const cfg=smtpConfig(),transporter=getSmtpTransporter();
  await transporter.sendMail({from:cfg.from||cfg.user,to,replyTo:replyTo||undefined,subject,text,html,inReplyTo:inReplyTo||undefined,references:references||undefined});
  return true;
}
async function loadInboxMessages(limit=40){
  const host=String(process.env.IMAP_HOST||'').trim(),user=String(process.env.IMAP_USER||'').trim(),pass=String(process.env.IMAP_PASS||'');
  if(!host||!user||!pass)throw new Error('IMAP is not configured. Add IMAP_HOST, IMAP_USER and IMAP_PASS in Railway Variables.');
  const {ImapFlow}=require('imapflow');const {simpleParser}=require('mailparser');
  const port=Number(process.env.IMAP_PORT||993),secure=String(process.env.IMAP_SECURE||'true').toLowerCase()!=='false';
  const client=new ImapFlow({host,port,secure,auth:{user,pass},logger:false});
  const messages=[];await client.connect();let lock;
  try{
    lock=await client.getMailboxLock(String(process.env.IMAP_MAILBOX||'INBOX'));
    const exists=Number(client.mailbox?.exists||0);if(!exists)return messages;
    const start=Math.max(1,exists-Math.max(1,Math.min(60,Number(limit)||40))+1);
    for await (const msg of client.fetch(`${start}:*`,{uid:true,envelope:true,internalDate:true,source:true})){
      let parsed={};try{parsed=await simpleParser(msg.source)}catch{}
      const fromObj=parsed.from?.value?.[0]||msg.envelope?.from?.[0]||{};
      const from=String(fromObj.address||'').trim();
      messages.push({uid:msg.uid,from,fromName:String(fromObj.name||'').trim(),subject:String(parsed.subject||msg.envelope?.subject||'(без темы)'),date:(parsed.date||msg.internalDate||new Date()).toISOString(),text:String(parsed.text||'').slice(0,100000),messageId:String(parsed.messageId||msg.envelope?.messageId||'')});
    }
  }finally{try{lock?.release()}catch{}try{await client.logout()}catch{}}
  messages.sort((a,b)=>new Date(b.date)-new Date(a.date));return messages;
}
async function handleApi(req,res,u){
  const p=u.pathname, m=req.method;
  if(m==='GET'&&p==='/api/health') return sendJson(res,200,{ok:true,storage:USE_POSTGRES?'postgres':'json',time:now()});
  if(m==='GET'&&p==='/api/site') return sendPublicSite(req,res,loadDb());
  if(m==='GET'&&p.startsWith('/api/products/')){const pid=decodeURIComponent(p.slice('/api/products/'.length)),prod=loadDb().products.find(x=>x.id===pid&&x.active!==false);return prod?sendJson(res,200,publicProduct(prod)):sendJson(res,404,{error:'Product not found'});}
  if(m==='POST'&&p==='/api/auth/register'){
    const b=await readJson(req), name=String(b.name||'').trim(), email=String(b.email||'').trim().toLowerCase(), password=String(b.password||'');
    if(name.length<2||!email.includes('@')||password.length<6)return sendJson(res,400,{error:'Enter a valid name, email and password (6+ characters).'});
    const db=loadDb(); if(db.users.some(x=>x.email.toLowerCase()===email))return sendJson(res,409,{error:'Email already registered.'});
    const user={id:id(),name,email,passwordHash:hashPassword(password),role:'customer',newsletter:!!b.newsletter,createdAt:now()};db.users.push(user);const token=crypto.randomBytes(32).toString('hex');db.sessions.push({token,userId:user.id,expiresAt:new Date(Date.now()+7*86400000).toISOString()});await saveDb(db);return sendJson(res,200,{token,user:sanitizeUser(user)});
  }
  if(m==='POST'&&p==='/api/auth/login'){
    const b=await readJson(req),db=loadDb(),email=String(b.email||'').trim().toLowerCase(),user=db.users.find(x=>x.email.toLowerCase()===email);if(!user||!verifyPassword(String(b.password||''),user.passwordHash))return sendJson(res,401,{error:'Wrong email or password.'});const token=crypto.randomBytes(32).toString('hex');db.sessions=db.sessions.filter(s=>new Date(s.expiresAt)>new Date());db.sessions.push({token,userId:user.id,expiresAt:new Date(Date.now()+7*86400000).toISOString()});await saveDb(db);return sendJson(res,200,{token,user:sanitizeUser(user)});
  }
  if(m==='GET'&&p==='/api/auth/me'){const a=needUser(req,res);if(!a)return;return sendJson(res,200,{user:sanitizeUser(a.user)});}
  if(m==='GET'&&p==='/api/account'){
    const a=needUser(req,res);if(!a)return;
    const orders=(Array.isArray(a.db.orders)?a.db.orders:[]).filter(o=>String(o.userId)===String(a.user.id));
    return sendJson(res,200,{user:sanitizeUser(a.user),orders,coupons:couponsOf(a.db,a.user.id)});
  }
  if(m==='PUT'&&p==='/api/account/preferences'){const a=needUser(req,res);if(!a)return;const b=await readJson(req);if(b.newsletter!=null)a.user.newsletter=!!b.newsletter;await saveDb(a.db);return sendJson(res,200,{user:sanitizeUser(a.user)});}
  if(m==='POST'&&p==='/api/coupons/validate'){
    const a=needUser(req,res);if(!a)return;const b=await readJson(req);const coupon=couponForUser(a.db,a.user,b.code);
    if(!coupon)return sendJson(res,404,{error:'Coupon is not available for this account.'});
    const subtotal=subtotalForItems(a.db,b.items);const percent=Math.max(1,Math.min(95,Math.floor(Number(coupon.percent)||0)));const discount=Math.round(subtotal*percent)/100;
    return sendJson(res,200,{ok:true,code:coupon.code,percent,discount,subtotal});
  }
  if(m==='POST'&&p==='/api/auth/logout'){const db=loadDb(),token=tokenFrom(req);db.sessions=db.sessions.filter(s=>s.token!==token);await saveDb(db);return sendJson(res,200,{ok:true});}
  if(m==='POST'&&p==='/api/support'){
    const b=await readJson(req), email=String(b.email||'').trim().toLowerCase(), message=String(b.message||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||message.length<2||message.length>5000)return sendJson(res,400,{error:'Enter a valid email and message.'});
    const db=loadDb();
    if(!Array.isArray(db.supportMessages)) db.supportMessages=[];
    const request={id:id(),email,message,lang:String(b.lang||'en').slice(0,8),status:'new',createdAt:now()};
    db.supportMessages.unshift(request);
    await saveDb(db);
    const supportTo=process.env.SUPPORT_TO||db.settings.contact||process.env.SMTP_USER||'';
    try{
      await sendTransactionalMail({to:supportTo,replyTo:email,subject:`DEMI DEVILLE support — ${email}`,text:`From: ${email}\n\n${message}`});
      request.status='sent';await saveDb(db);
      return sendJson(res,200,{ok:true,id:request.id,message:'Message sent successfully.'});
    }catch(err){
      request.status='email_failed';request.emailError=String(err?.code||err?.message||'SMTP_ERROR').slice(0,120);await saveDb(db);
      const d=smtpDebug(err);console.error('Support email failed:',d.debug,d.hint);
      return sendJson(res,503,{error:'Не вдалося надіслати повідомлення через пошту.',debug:d.debug,hint:d.hint,id:request.id});
    }
  }
  if(m==='POST'&&p==='/api/orders'){
    const b=await readJson(req),db=loadDb(),user=currentUser(req,db);
    if(!Array.isArray(b.items)||!b.items.length)return sendJson(res,400,{error:'Cart is empty.'});
    let subtotal=0;const items=[];const reservations=[];
    for(const x of b.items){
      const prod=db.products.find(q=>String(q.id)===String(x.productId)&&q.active!==false);if(!prod)continue;if(!productPurchasable(prod))return sendJson(res,400,{error:`${prod.name} is not available for online purchase.`});
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
    db.orders.unshift(order);await saveDb(db);
    try{if(order.email)await sendTransactionalMail({to:order.email,subject:`DEMI DEVILLE order ${order.number}`,text:`Thank you for your order ${order.number}. Total: ${total}${db.settings.currency||'$'}.`})}catch(err){console.error('Order email failed:',err.message)}
    return sendJson(res,200,{ok:true,order});
  }
  if(m==='GET'&&p==='/api/admin/state'){const a=needUser(req,res,true);if(!a)return;return sendJson(res,200,{settings:a.db.settings,products:a.db.products,gallery:a.db.gallery,sections:a.db.sections,orders:a.db.orders,supportMessages:Array.isArray(a.db.supportMessages)?a.db.supportMessages:[],users:a.db.users.map(sanitizeUser),coupons:(Array.isArray(a.db.coupons)?a.db.coupons:[]).map(sanitizeCoupon)});}
  if(m==='PUT'&&p==='/api/admin/settings'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);if(b.shopPageSize!=null)b.shopPageSize=Math.max(1,Math.min(8,Math.floor(Number(b.shopPageSize)||8)));if(Array.isArray(b.checkoutCountries)){b.checkoutCountries=[...new Set(b.checkoutCountries.map(x=>String(x||'').trim()).filter(x=>x&&!/^(russia|belarus)$/i.test(x)))];if(!b.checkoutCountries.length)b.checkoutCountries=[...DEFAULT_CHECKOUT_COUNTRIES]}if(b.pageBackgrounds!=null&&(!b.pageBackgrounds||typeof b.pageBackgrounds!=='object'||Array.isArray(b.pageBackgrounds)))b.pageBackgrounds={};a.db.settings={...a.db.settings,...b};await saveDb(a.db);return sendJson(res,200,a.db.settings);}
  if(m==='POST'&&p==='/api/admin/upload'){const a=needUser(req,res,true);if(!a)return;const uploadLimit=Math.max(5,Number(process.env.MAX_UPLOAD_MB||60))*1024*1024*1.45;const b=await readJson(req,uploadLimit),match=String(b.dataUrl||'').match(/^data:((?:image|video)\/[a-zA-Z0-9.+-]+);base64,(.+)$/);if(!match)return sendJson(res,400,{error:'Invalid image/video data'});const mime=match[1];let ext=(mime.split('/')[1]||'bin').replace('jpeg','jpg').replace('quicktime','mov').replace(/[^a-z0-9]/gi,'');if(mime==='video/mp4')ext='mp4';if(mime==='video/webm')ext='webm';const safe=String(b.filename||'media').replace(/[^a-zA-Z0-9._-]/g,'-').replace(/\.[^.]+$/,'').slice(0,60)||'media',name=`${Date.now()}-${safe}.${ext}`,data=Buffer.from(match[2],'base64');if(USE_POSTGRES&&PG_POOL){await PG_POOL.query('INSERT INTO media_files(name,mime,data,size,updated_at) VALUES($1,$2,$3,$4,now()) ON CONFLICT(name) DO UPDATE SET mime=EXCLUDED.mime,data=EXCLUDED.data,size=EXCLUDED.size,updated_at=now()',[name,mime,data,data.length]);}else{fs.mkdirSync(UPLOAD_DIR,{recursive:true});fs.writeFileSync(path.join(UPLOAD_DIR,name),data)}return sendJson(res,200,{url:`/uploads/${name}`});}
  if(m==='POST'&&p==='/api/admin/change-password'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);if(String(b.newPassword||'').length<8)return sendJson(res,400,{error:'New password must be at least 8 characters.'});if(!verifyPassword(String(b.currentPassword||''),a.user.passwordHash))return sendJson(res,400,{error:'Current password is wrong.'});a.user.passwordHash=hashPassword(b.newPassword);await saveDb(a.db);return sendJson(res,200,{ok:true});}
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
      a.db[collection].push(obj);await saveDb(a.db);return sendJson(res,200,obj)
    }
    if(m==='PUT'&&objId){
      const b=await readJson(req),idx=a.db[collection].findIndex(x=>String(x.id)===String(objId));if(idx<0)return sendJson(res,404,{error:'Not found'});
      const next={...a.db[collection][idx],...b,id:objId};
      if(collection==='products'){
        next.images=productImages(next);next.image=next.images[0]||String(next.image||'');
        if(Array.isArray(next.variants))next.sizes=productVariants(next).filter(v=>v.stock===null||v.stock>0).map(v=>v.size);
      }
      a.db[collection][idx]=next;await saveDb(a.db);return sendJson(res,200,next)
    }
    if(m==='DELETE'&&objId){a.db[collection]=a.db[collection].filter(x=>String(x.id)!==String(objId));await saveDb(a.db);return sendJson(res,200,{ok:true})}
  }
  if(m==='POST'&&p==='/api/admin/newsletter'){
    const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);const subject=String(b.subject||'DEMI DEVILLE').trim().slice(0,180),message=String(b.message||'').trim();if(message.length<2)return sendJson(res,400,{error:'Введите текст рассылки.'});
    const recipients=[...new Set([...a.db.users.filter(u=>u.role!=='admin').map(u=>u.email),...a.db.orders.map(o=>o.email)].map(v=>String(v||'').trim().toLowerCase()).filter(v=>v&&v.includes('@')))];
    if(!recipients.length)return sendJson(res,400,{error:'В базе нет email клиентов для рассылки.'});
    try{getSmtpTransporter()}catch(err){const d=smtpDebug(err);return sendJson(res,503,{error:'SMTP не настроен.',debug:d.debug,hint:d.hint,recipients:recipients.length,sent:0,failed:recipients.length})}
    let sent=0,failed=0,firstError=null;
    for(const email of recipients){
      try{await sendTransactionalMail({to:email,subject,text:message,html:`<div style="white-space:pre-wrap;font-family:Arial,sans-serif">${message.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</div>`});sent++}
      catch(err){failed++;if(!firstError)firstError=err;const code=String(err?.code||'');const rc=Number(err?.responseCode||0);if(['EAUTH','ETIMEDOUT','ESOCKET','ECONNECTION','ENOTFOUND'].includes(code)||[421,432,454,530,535].includes(rc)){failed+=Math.max(0,recipients.length-sent-failed);break}}
    }
    if(failed){const d=smtpDebug(firstError||new Error('SMTP send failed'));return sendJson(res,sent?207:503,{ok:false,recipients:recipients.length,sent,failed,error:sent?'Часть писем не отправлена.':'Рассылка не отправлена.',debug:d.debug,hint:d.hint})}
    return sendJson(res,200,{ok:true,recipients:recipients.length,sent,failed:0,message:'Рассылка успешно отправлена.'});
  }
  if(m==='GET'&&p==='/api/admin/mail/inbox'){
    const a=needUser(req,res,true);if(!a)return;
    try{const messages=await loadInboxMessages(Math.min(60,Math.max(1,Number(u.searchParams.get('limit')||40))));return sendJson(res,200,{messages})}catch(err){console.error('IMAP inbox failed:',err.message);return sendJson(res,503,{error:err.message||'Не удалось получить входящие письма.'})}
  }
  if(m==='POST'&&p==='/api/admin/mail/reply'){
    const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);const to=String(b.to||'').trim(),subject=String(b.subject||'Re: DEMI DEVILLE').trim().slice(0,200),message=String(b.message||'').trim();
    if(!to.includes('@')||!message)return sendJson(res,400,{error:'Укажите получателя и текст ответа.'});
    try{
      await sendTransactionalMail({to,subject,text:message,inReplyTo:String(b.inReplyTo||'').trim()||undefined,references:String(b.inReplyTo||'').trim()||undefined});
      return sendJson(res,200,{ok:true,message:'Сообщение успешно отправлено.'});
    }catch(err){
      const d=smtpDebug(err);console.error('Mail reply failed:',d.debug,d.hint);
      return sendJson(res,503,{error:'Не удалось отправить ответ через SMTP.',debug:d.debug,hint:d.hint});
    }
  }
  if(m==='POST'&&p==='/api/admin/coupons'){
    const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);const user=a.db.users.find(u=>String(u.id)===String(b.userId)&&u.role!=='admin');
    if(!user)return sendJson(res,404,{error:'Client not found'});const code=normalizeCouponCode(b.code||`DEMI${Math.random().toString(36).slice(2,8)}`);const percent=Math.max(1,Math.min(95,Math.floor(Number(b.percent)||0)));
    if(!code||!percent)return sendJson(res,400,{error:'Enter coupon code and discount percent'});if(!Array.isArray(a.db.coupons))a.db.coupons=[];
    if(a.db.coupons.some(c=>normalizeCouponCode(c.code)===code))return sendJson(res,409,{error:'Coupon code already exists'});
    const coupon={id:id(),code,userId:user.id,percent,active:true,note:String(b.note||''),createdAt:now()};a.db.coupons.unshift(coupon);await saveDb(a.db);return sendJson(res,200,sanitizeCoupon(coupon));
  }
  const cm=p.match(/^\/api\/admin\/coupons\/([^/]+)$/);
  if(cm&&m==='DELETE'){const a=needUser(req,res,true);if(!a)return;const cid=decodeURIComponent(cm[1]);if(!Array.isArray(a.db.coupons))a.db.coupons=[];a.db.coupons=a.db.coupons.filter(c=>String(c.id)!==String(cid));await saveDb(a.db);return sendJson(res,200,{ok:true})}
  if(cm&&m==='PUT'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req);const c=(a.db.coupons||[]).find(x=>String(x.id)===String(decodeURIComponent(cm[1])));if(!c)return sendJson(res,404,{error:'Coupon not found'});if(b.percent!=null)c.percent=Math.max(1,Math.min(95,Math.floor(Number(b.percent)||0)));if(b.active!=null)c.active=!!b.active;if(b.note!=null)c.note=String(b.note||'');await saveDb(a.db);return sendJson(res,200,sanitizeCoupon(c))}
  const om=p.match(/^\/api\/admin\/orders\/([^/]+)$/);if(om&&m==='PUT'){const a=needUser(req,res,true);if(!a)return;const b=await readJson(req),o=a.db.orders.find(x=>x.id===decodeURIComponent(om[1]));if(!o)return sendJson(res,404,{error:'Order not found'});const previousStatus=String(o.status||'new');Object.assign(o,b);await saveDb(a.db);if(o.email&&b.status&&String(o.status)!==previousStatus){try{await sendTransactionalMail({to:o.email,subject:`DEMI DEVILLE order ${o.number||''}`,text:`Order ${o.number||''} status: ${o.status}.`})}catch(err){console.error('Order status email failed:',err.message)}}return sendJson(res,200,o)}
  return sendJson(res,404,{error:'Not found'});
}

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.mp4':'video/mp4','.webm':'video/webm','.mov':'video/quicktime'};
const TEXT_EXT=new Set(['.html','.css','.js','.json','.svg']);
async function serveStatic(req,res,u){
  let rel=decodeURIComponent(u.pathname);if(rel==='/')rel='/index.html';if(rel==='/admin')rel='/admin/index.html';if(!path.extname(rel))rel += '.html';
  const isUpload=rel.startsWith('/uploads/');

  // Uploaded images/videos are stored in PostgreSQL when DATABASE_URL is set.
  // URLs stay exactly the same (/uploads/...), so the existing frontend/admin code does not change.
  if(isUpload&&USE_POSTGRES&&PG_POOL){
    const name=path.posix.basename(rel.slice('/uploads/'.length));
    if(!name||name!==rel.slice('/uploads/'.length)||name.includes('..')){res.writeHead(403);return res.end('Forbidden')}
    const result=await PG_POOL.query('SELECT mime,data,size,updated_at FROM media_files WHERE name=$1',[name]);
    const row=result.rows[0];
    if(!row){
      const nf=path.join(PUBLIC,'404.html');const b=fs.readFileSync(nf);
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Length':b.length});return res.end(b)
    }
    const data=Buffer.isBuffer(row.data)?row.data:Buffer.from(row.data);const size=Number(row.size)||data.length;
    const updated=row.updated_at?new Date(row.updated_at):new Date();const etag=`W/"${size.toString(16)}-${Math.floor(updated.getTime()).toString(16)}"`;
    const ext=path.extname(name).toLowerCase();const headers={'Content-Type':row.mime||MIME[ext]||'application/octet-stream','ETag':etag,'Last-Modified':updated.toUTCString(),'Cache-Control':'public, max-age=31536000, immutable'};
    if(req.headers['if-none-match']===etag&&!req.headers.range){res.writeHead(304,headers);return res.end()}
    const isVideo=['.mp4','.webm','.mov'].includes(ext)||String(row.mime||'').startsWith('video/');
    if(isVideo){
      headers['Accept-Ranges']='bytes';const range=String(req.headers.range||'').match(/^bytes=(\d*)-(\d*)$/);
      if(range){
        let from=range[1]?Number(range[1]):0,to=range[2]?Number(range[2]):size-1;
        if(!range[1]&&range[2]){const tail=Math.max(0,Number(range[2])||0);from=Math.max(0,size-tail);to=size-1}
        from=Math.max(0,Math.min(size-1,from));to=Math.max(from,Math.min(size-1,to));headers['Content-Range']=`bytes ${from}-${to}/${size}`;headers['Content-Length']=to-from+1;
        res.writeHead(206,headers);if(req.method==='HEAD')return res.end();return res.end(data.subarray(from,to+1));
      }
    }
    headers['Content-Length']=size;res.writeHead(200,headers);if(req.method==='HEAD')return res.end();return res.end(data)
  }

  const base=isUpload?UPLOAD_DIR:PUBLIC;const relative=isUpload?rel.slice('/uploads/'.length):rel;
  const file=path.normalize(path.join(base,relative));const safeBase=path.normalize(base+path.sep);if(file!==path.normalize(base)&&!file.startsWith(safeBase)){res.writeHead(403);return res.end('Forbidden')}
  fs.stat(file,(err,st)=>{
    if(err||!st.isFile()){
      const nf=path.join(PUBLIC,'404.html');const b=fs.readFileSync(nf);
      res.writeHead(404,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Length':b.length});return res.end(b)
    }
    const ext=path.extname(file).toLowerCase();
    const etag=`W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
    const headers={'Content-Type':MIME[ext]||'application/octet-stream','ETag':etag,'Last-Modified':st.mtime.toUTCString()};
    if(ext==='.html')headers['Cache-Control']='no-cache, must-revalidate';
    else if(['.jpg','.jpeg','.png','.gif','.webp','.svg','.ico','.woff','.woff2','.ttf','.mp4','.webm','.mov'].includes(ext))headers['Cache-Control']=isUpload?'public, max-age=31536000, immutable':'public, max-age=2592000, immutable';
    else headers['Cache-Control']='public, max-age=604800';
    if(req.headers['if-none-match']===etag&&!req.headers.range){res.writeHead(304,headers);return res.end()}
    const isVideo=['.mp4','.webm','.mov'].includes(ext);
    if(isVideo){
      headers['Accept-Ranges']='bytes';
      const range=String(req.headers.range||'').match(/^bytes=(\d*)-(\d*)$/);
      if(range){
        let start=range[1]?Number(range[1]):0,end=range[2]?Number(range[2]):st.size-1;
        if(!range[1]&&range[2]){const tail=Math.max(0,Number(range[2])||0);start=Math.max(0,st.size-tail);end=st.size-1}
        start=Math.max(0,Math.min(st.size-1,start));end=Math.max(start,Math.min(st.size-1,end));
        headers['Content-Range']=`bytes ${start}-${end}/${st.size}`;headers['Content-Length']=end-start+1;
        res.writeHead(206,headers);if(req.method==='HEAD')return res.end();return fs.createReadStream(file,{start,end}).pipe(res);
      }
    }
    if(req.method==='HEAD'){headers['Content-Length']=st.size;res.writeHead(200,headers);return res.end()}
    const accepts=String(req.headers['accept-encoding']||'');
    if(TEXT_EXT.has(ext)&&st.size>1024&&/\bbr\b/.test(accepts)){headers['Content-Encoding']='br';headers['Vary']='Accept-Encoding';res.writeHead(200,headers);return fs.createReadStream(file).pipe(zlib.createBrotliCompress({params:{[zlib.constants.BROTLI_PARAM_QUALITY]:5}})).pipe(res)}
    if(TEXT_EXT.has(ext)&&st.size>1024&&/\bgzip\b/.test(accepts)){
      headers['Content-Encoding']='gzip';headers['Vary']='Accept-Encoding';res.writeHead(200,headers);
      return fs.createReadStream(file).pipe(zlib.createGzip({level:6})).pipe(res);
    }
    headers['Content-Length']=st.size;res.writeHead(200,headers);fs.createReadStream(file).pipe(res)
  });
}

const server=http.createServer(async(req,res)=>{try{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(u.pathname.startsWith('/api/'))return await handleApi(req,res,u);return await serveStatic(req,res,u)}catch(e){console.error(e);if(!res.headersSent)sendJson(res,500,{error:'Server error'});else res.end()}});
initDbStore().then(()=>server.listen(PORT,()=>console.log(`DEMI DEVILLE running: http://localhost:${PORT}`))).catch(err=>{console.error('Database initialization failed:',err);process.exit(1)});
process.on('SIGTERM',async()=>{try{await DB_SAVE_QUEUE;await PG_POOL?.end()}catch{}process.exit(0)});
