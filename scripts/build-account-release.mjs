/* Build a no-provider, five-user encrypted login on GitHub Pages.
 * Use only in a trusted Actions environment with secret
 * COLORA_ACCOUNT_CREDENTIALS_JSON. Never print, upload, or commit it.
 *
 * Source: plaintext `dist` from scripts/build.mjs, only inside the
 * trusted runner. Published: public account gateway and five encrypted blobs.
 * Staff HTML contains NO Senior JD. Do not confuse static encryption with
 * server-verifiable identity, email ownership or revocable sessions.
 */
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes,pbkdf2Sync,createCipheriv} from 'node:crypto';
const cwd=process.cwd(),dist=path.join(cwd,'dist');
const output=path.join(cwd,'account-release'),pub=path.join(output,'public');
const source=path.join(cwd,'account-auth');
let users;
try{users=JSON.parse(process.env.COLORA_ACCOUNT_CREDENTIALS_JSON||'null')}catch{}
if(!Array.isArray(users)||users.length!==5)throw Error('Exactly five private employee credentials are required');
let tally={staff:0,senior:0},emails=new Set(),passwords=new Set();
for(const member of users){
 const email=String(member?.email||'').toLowerCase().trim();
 const password=member?.password,role=member?.role;
 if(!/^[a-z0-9._%+-]+@colora\.vn$/.test(email)||emails.has(email))throw Error('Invalid or duplicate company email');
 if(typeof password!=='string'||password.length<20||password.length>512||passwords.has(password)){
   throw Error('Each user must have a unique randomly generated 20+ character Workspace password');
 }
 if(!['staff','senior'].includes(role))throw Error('Invalid staff role');
 tally[role]++;emails.add(email);passwords.add(password);
}
if(tally.staff!==3||tally.senior!==2)throw Error('Expected exactly 3 Staff and 2 Senior');
const roleDocuments={
  staff:fs.readFileSync(path.join(dist,'index.html')),
  senior:fs.readFileSync(path.join(dist,'senior','index.html'))
};
for(const [role,bytes] of Object.entries(roleDocuments)){
 const html=bytes.toString('utf8');
 if(!html.includes('data-staff-role="'+role+'"')||!html.includes('id="module-frame"'))throw Error('Invalid role document');
 if(role==='staff'&&(html.includes('id="bundled-jd"')||html.includes('data-view="jd"')))throw Error('Staff document contains JD');
 if(role==='senior'&&!html.includes('id="bundled-jd"'))throw Error('Senior document lacks JD');
}
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(path.join(pub,'account-files'),{recursive:true});
function copyStatic(src,dst){
 for(const entry of fs.readdirSync(src,{withFileTypes:true})){
  const input=path.join(src,entry.name),out=path.join(dst,entry.name);
  if(entry.isDirectory()){
   if(entry.name==='senior'||entry.name.startsWith('.'))continue;
   fs.mkdirSync(out,{recursive:true});copyStatic(input,out);
  }else if(entry.isFile()){
   // Never publish the plain role documents or old senior ciphertext.
   if(entry.name.endsWith('.html')||entry.name==='senior-gateway.json')continue;
   fs.copyFileSync(input,out);
  }
 }
}
copyStatic(dist,pub);
for(const [src,dst] of [
 ['login.html','index.html'],
 ['account-login.css','account-login.css'],
 ['account-login.js','account-login.js']
])fs.copyFileSync(path.join(source,src),path.join(pub,dst));
const manifest={version:1,entries:[]};
for(const member of users){
 const email=member.email.toLowerCase().trim();
 const role=member.role;
 const salt=randomBytes(16),iv=randomBytes(12);
 const material=Buffer.from(JSON.stringify([email,member.password]),'utf8');
 const kdf=pbkdf2Sync(material,salt,600000,48,'sha256');
 const verifier=kdf.subarray(0,16),key=kdf.subarray(16,48);
 const cipher=createCipheriv('aes-256-gcm',key,iv);
 const ciphertext=Buffer.concat([cipher.update(roleDocuments[role]),cipher.final(),cipher.getAuthTag()]);
 const id=randomBytes(16).toString('hex');
 manifest.entries.push({id,salt:salt.toString('base64'),verifier:verifier.toString('base64')});
 fs.writeFileSync(path.join(pub,'account-files',id+'.json'),
   JSON.stringify({iv:iv.toString('base64'),ciphertext:ciphertext.toString('base64')}));
}
fs.writeFileSync(path.join(pub,'account-entries.json'),JSON.stringify(manifest));
const all=[];
function scan(dir,rel=''){
 for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  const p=path.join(dir,e.name),r=rel+e.name;
  if(e.isDirectory())scan(p,r+'/');else all.push(r);
 }
}
scan(pub);
const nonLoginHtml=all.filter(f=>f.endsWith('.html')&&f!=='index.html');
if(nonLoginHtml.length||all.includes('senior-gateway.json'))throw Error('Found unauthorized public HTML');
for(const member of users){
 for(const file of ['index.html','account-entries.json','account-login.js']){
  if(fs.readFileSync(path.join(pub,file),'utf8').includes(member.email))throw Error('Employee email leaked to public artifact');
 }
}
console.log('PASS: five separately encrypted, opaque employee envelopes generated; three Staff, two Senior. No plaintext role HTML is published.');
