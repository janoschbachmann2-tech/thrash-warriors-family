import {env} from './store.js';
import {timingSafeEqual} from 'node:crypto';
const ownerKey=process.env.SETUP_KEY||'';
function ownerAllowed(value){return typeof value==='string'&&ownerKey.length>=32&&Buffer.byteLength(value)===Buffer.byteLength(ownerKey)&&timingSafeEqual(Buffer.from(value),Buffer.from(ownerKey));}
import {reduce} from './game-engine.js';
export const dynamic='force-dynamic';
const PEOPLE=['Janosch','Tanja','Mio','Nele'];
const KEY='trash-warriors/family-v16.json';
const json=(data    ,status=200,headers                      ={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
const hex=(b            )=>Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,'0')).join('');
const digest=async(s       )=>hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
const good=(s    )=>typeof s==='string'&&s.length>=8&&s.length<=80;
async function hash(password       ,salt       ){let k=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},k,256))}
                                                                                                                                                                                                          
async function read(){if(!env.BUCKET)throw Error('Gemeinsamer Speicher fehlt');let o=await env.BUCKET.get(KEY);return{etag:o?.etag,data:o?await o.json()              :{players:{},sessions:{},attempts:{},state:null,revision:0}              }}
async function write(data           ,etag        ){return await env.BUCKET.put(KEY,JSON.stringify(data),{onlyIf:etag?{etagMatches:etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}})}
function cleanup(d           ){for(let [key,s] of Object.entries(d.sessions))if(s.expires<Date.now())delete d.sessions[key];for(let [key,a] of Object.entries(d.attempts))if(a.expires<Date.now())delete d.attempts[key]}
async function handler(req        ){try{
 let path=new URL(req.url).pathname.split('/').pop(),post=req.method==='POST';
 if(post&&(req.headers.get('origin')!==new URL(req.url).origin||!req.headers.get('content-type')?.startsWith('application/json')))return json({error:'Ungültige Anfrage'},403);
 let p    ={};if(post){if(Number(req.headers.get('content-length')||0)>5000000)return json({error:'Datei zu groß'},413);let raw=await req.text();if(raw.length>5000000)return json({error:'Datei zu groß'},413);p=JSON.parse(raw)}
 let token=(req.headers.get('cookie')||'').match(/(?:^|;\s*)tw_session=([a-f0-9]{64})/)?.[1],sessionHash=token?await digest(token):'';
 if(path==='status'){let {data}=await read();return json({configured:Object.keys(data.players).length===4})}
 for(let tries=0;tries<5;tries++){
  let {data:d,etag}=await read();cleanup(d);
  if(path==='setup'&&post){
   if(!ownerAllowed(p.setupKey))return json({error:'Einrichtungsschlüssel fehlt oder ist falsch.'},403);
   if(Object.keys(d.players).length)return json({error:'Familie bereits eingerichtet.'},409);
   if(PEOPLE.some(id=>!good(p[id])))return json({error:'Jede Person braucht ein Passwort mit 8 bis 80 Zeichen.'},400);
   if(new Set(PEOPLE.map(id=>p[id])).size!==4)return json({error:'Bitte vier unterschiedliche Passwörter wählen.'},400);
   for(let id of PEOPLE){let salt=crypto.randomUUID();d.players[id]={salt,hash:await hash(p[id],salt)}}d.state=reduce(null,'Janosch','read');
   if(await write(d,etag))return json({ok:true});continue;
  }
  if(path==='login'&&post){
   if(!PEOPLE.includes(p.person)||!good(p.password))return json({error:'Anmeldung fehlgeschlagen'},401);
   let attemptKey=await digest(('family')+':'+p.person+':'+Math.floor(Date.now()/300000));
   let attempt=d.attempts[attemptKey]||{count:0,expires:Date.now()+600000};attempt.count++;d.attempts[attemptKey]=attempt;
   if(attempt.count>8){if(await write(d,etag))return json({error:'Zu viele Versuche. Bitte bis zu 5 Minuten warten.'},429);continue}
   let person=d.players[p.person];if(!person||await hash(p.password,person.salt)!==person.hash){if(await write(d,etag))return json({error:'Name oder Passwort falsch'},401);continue}
   let newToken=hex(crypto.getRandomValues(new Uint8Array(32)).buffer);d.sessions[await digest(newToken)]={person:p.person,expires:Date.now()+604800000};
   if(await write(d,etag))return json({person:p.person,state:d.state,revision:d.revision},200,{'Set-Cookie':`tw_session=${newToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`});continue;
  }
  let session=d.sessions[sessionHash];if(!session||session.expires<Date.now())return json({error:'Bitte anmelden'},401);let actor=session.person;
  if(path==='logout'&&post){delete d.sessions[sessionHash];if(await write(d,etag))return json({ok:true},200,{'Set-Cookie':'tw_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});continue}
  if(path==='password'&&post){let old=d.players[actor];if(!good(p.old)||!good(p.password)||await hash(p.old,old.salt)!==old.hash)return json({error:'Aktuelles Passwort falsch oder neues Passwort zu kurz'},403);let salt=crypto.randomUUID();d.players[actor]={salt,hash:await hash(p.password,salt)};for(let [key,value] of Object.entries(d.sessions))if(value.person===actor&&key!==sessionHash)delete d.sessions[key];if(await write(d,etag))return json({ok:true});continue}
  if(path!=='state'&&path!=='action')return json({error:'Nicht gefunden'},404);
  if(path==='action'&&!post)return json({error:'POST erforderlich'},405);
  if(path==='action'&&p.revision!==d.revision)return json({error:'Stand wurde geändert. Neu laden und erneut versuchen.'},409);
  let next=reduce(d.state,actor,path==='action'?p.action:'read',p.payload||{});
  if(JSON.stringify(next)===JSON.stringify(d.state))return json({person:actor,state:d.state,revision:d.revision});
  d.state=next;d.revision++;
  if(await write(d,etag))return json({person:actor,state:d.state,revision:d.revision});
  if(path==='action')return json({error:'Gleichzeitige Änderung. Neu laden und erneut versuchen.'},409);
 }
 return json({error:'Gerade viele Änderungen. Bitte erneut versuchen.'},409);
}catch(e    ){return json({error:e instanceof SyntaxError?'Ungültige Daten':e.message||'Verbindung fehlgeschlagen'},400)}}
export {handler};
