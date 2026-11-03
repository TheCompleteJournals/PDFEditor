// Bump VERSION when you change anything in lib/ or icons/. index.html updates itself whenever the user is online.
const VERSION='v1',CACHE='jt-'+VERSION;
const SHELL=['./','index.html','manifest.webmanifest','lib/pdf.min.js','lib/pdf.worker.min.js','lib/pdf-lib.min.js','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin)return;
 if(r.mode==='navigate'){e.respondWith(page(r));return}
 e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})))});
async function page(r){
 const c=await caches.open(CACHE);
 try{
  const res=await Promise.race([fetch(r.url,{cache:'no-cache'}),new Promise((_,no)=>setTimeout(no,4000))]);
  if(res&&res.ok){c.put(r,res.clone());c.put('index.html',res.clone());return res}
 }catch(_){}
 return (await c.match(r,{ignoreSearch:true}))||(await c.match('index.html'))||(await c.match('./'))||Response.error()}
