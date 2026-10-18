import http from 'node:http';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {handler} from './handler.js';
const production=process.env.NODE_ENV==='production';
if((process.env.SETUP_KEY||'').length<32)throw Error('SETUP_KEY muss mindestens 32 Zeichen haben.');
if(production&&!process.env.DATA_DIR)throw Error('DATA_DIR muss auf den dauerhaften Datenspeicher zeigen.');
const root=fileURLToPath(new URL('./public/',import.meta.url));
let queue=Promise.resolve();
export const server=http.createServer(async(req,res)=>{try{
const origin=(process.env.APP_ORIGIN||process.env.RENDER_EXTERNAL_URL||'http://127.0.0.1:'+ (process.env.PORT||3000)).replace(/[/]$/,'');
const target=new URL(req.url,origin);
res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','same-origin');res.setHeader('X-Frame-Options','DENY');
if(target.pathname==='/health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('ok')}
if(target.pathname.startsWith('/api/game/')){
if(!['GET','POST'].includes(req.method)){res.writeHead(405);return res.end()}
let chunks=[],size=0;for await(let chunk of req){size+=chunk.length;if(size>5000000){res.writeHead(413);res.end('Datei zu groß');return}chunks.push(chunk)}
let input=new Request(target,{method:req.method,headers:req.headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})});
let pending=queue.then(()=>handler(input));queue=pending.catch(()=>{});let output=await pending;res.writeHead(output.status,Object.fromEntries(output.headers));return res.end(Buffer.from(await output.arrayBuffer()))}
if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
let filename=target.pathname==='/setup'?'setup.html':target.pathname==='/'||target.pathname==='/game.html'?'game.html':null;
if(!filename){res.writeHead(404);return res.end('Nicht gefunden')}
let data=await fs.readFile(root+filename);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:data)
}catch(e){console.error('Anfrage fehlgeschlagen:',e.message);if(!res.headersSent)res.writeHead(500);res.end('Serverfehler')}});
if(process.env.TEST_IMPORT!=='1')server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Trash Warriors bereit'));
