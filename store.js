import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
const folder=process.env.DATA_DIR||'./data';
const file=path.join(folder,'family.json');
await fs.mkdir(folder,{recursive:true,mode:0o700});
async function snapshot(){try{let raw=await fs.readFile(file,'utf8');return{raw,etag:createHash('sha256').update(raw).digest('hex')}}catch(e){if(e.code==='ENOENT')return null;throw e}}
export const env={BUCKET:{async get(){let s=await snapshot();return s?{etag:s.etag,json:async()=>JSON.parse(s.raw)}:null},async put(key,value,options){let s=await snapshot();if(options.onlyIf.etagMatches&&s?.etag!==options.onlyIf.etagMatches||options.onlyIf.etagDoesNotMatch&&s)return null;
let temp=file+'.'+randomUUID()+'.tmp';let handle=await fs.open(temp,'wx',0o600);try{await handle.writeFile(value);await handle.sync()}finally{await handle.close()}await fs.rename(temp,file);return{etag:createHash('sha256').update(value).digest('hex')}}}};
