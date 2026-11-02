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
import {randomBytes,pbkdf2Sync,createCipheriv,timingSafeEqual} from 'node:crypto';
const cwd=process.cwd(),dist=path.join(cwd,'dist');
const output=path.join(cwd,'account-release'),pub=path.join(output,'public');
const source=path.join(cwd,'account-auth');
let users;
try{users=JSON.parse(process.env.COLORA_ACCOUNT_CREDENTIALS_JSON||'null')}catch{}
if(!Array.isArray(users)||users.length!==5)throw Error('Exactly five private employee credentials are required');
// Report ALL problems together without ever printing account emails, secrets,
// password lengths, password content, or other personally identifying data.
let tally={staff:0,senior:0},emails=new Set(),passwords=new Set(),issues=[];
for(const [index,member] of users.entries()){
 const number=index+1;
 const email=String(member?.email||'').toLowerCase().trim();
 const password=member?.password,role=member?.role;
 if(!/^[a-z0-9._%+-]+@colora\.vn$/.test(email)){
  issues.push('Account #'+number+': email is not a valid @colora.vn address');
 }else if(emails.has(email)){
  issues.push('Account #'+number+': company email repeats another account');
 }else emails.add(email);
 if(typeof password!=='string'||password.length<8){
  issues.push('Account #'+number+': password must contain at least 8 characters');
 }else if(password.length>512){
  issues.push('Account #'+number+': password exceeds 512 characters');
 }else if(passwords.has(password)){
  issues.push('Account #'+number+': password duplicates another account');
 }else passwords.add(password);
 if(role!=='staff'&&role!=='senior'){
  issues.push('Account #'+number+': role must be staff or senior');
 }else tally[role]++;
}
if(tally.staff!==3||tally.senior!==2)issues.push('Roles must contain exactly 3 staff and 2 senior accounts');
if(issues.length)throw Error('Account configuration failed (no secrets displayed):\n- '+issues.join('\n- '));
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
// Preserve already-random per-user KDF salts and opaque IDs across ordinary
// deployments when the employee's email+password has NOT changed. This lets
// an opted-in browser CryptoKey keep decrypting new AES-GCM ciphertext for
// its 30-day remember window. Every deployment STILL uses a fresh 96-bit
// AES-GCM IV; a changed password gets a new random salt and ID.
// No employee emails, passwords or raw keys are retrieved from the website.
let oldEntries=[];
try{
 let old;
 if(process.env.COLORA_PREVIOUS_ACCOUNT_MANIFEST_PATH){
   old=JSON.parse(fs.readFileSync(process.env.COLORA_PREVIOUS_ACCOUNT_MANIFEST_PATH,'utf8'));
 }else if(process.env.COLORA_REUSE_DEPLOYED_ACCOUNTS==='true'){
   const response=await fetch('https://staff.colora.vn/account-entries.json',{
     cache:'no-store',signal:AbortSignal.timeout(7500)
   });
   if(response.ok)old=await response.json();
 }
 if(old?.version===1 && Array.isArray(old.entries) && old.entries.length===5){
   const entries=old.entries.filter(e=>typeof e?.id==='string'&&/^[a-f0-9]{32}$/.test(e.id) &&
     typeof e.salt==='string'&&Buffer.from(e.salt,'base64').length===16 &&
     typeof e.verifier==='string'&&Buffer.from(e.verifier,'base64').length===16);
   if(entries.length===5 && new Set(entries.map(e=>e.id)).size===5)oldEntries=entries;
 }
}catch{
 // A transient Pages/network failure must not block deploying the portal.
 // It can instead require remembered browsers to sign in after this release.
}
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(path.join(pub,'account-files'),{recursive:true});
// Allowlist the exact public root and supported static assets; the previous
// recursive copy would inadvertently publish any future private build file
// ending in .json/.js/.txt. Unexpected artifacts now BLOCK deployment.
const publicRoot=new Set([
  'styles.css','brand-refinements.css','brand-guide.css','mail-guide.css','email-templates.css','quick-search.css',
  'jd-integrated.css','embedded-apps.css','module-host.js','library.js',
  'library-ui.js','mail-guide.js','email-templates.js','quick-search.js','quick-search-index.js','jd-workspace.js','jd-storage-gate.js','app.js','CNAME','.nojekyll'
]);
const publicAssetTypes=/\.(?:css|js|json|svg|png|webp|jpe?g)$/i;
function copyStatic(src,dst,relative=''){
 for(const entry of fs.readdirSync(src,{withFileTypes:true})){
  const rel=relative?relative+'/'+entry.name:entry.name;
  const input=path.join(src,entry.name),out=path.join(dst,entry.name);
  if(entry.isSymbolicLink())throw Error('Symlink is forbidden in public release: '+rel);
  // The build intentionally stages raw JD HTML under dist/apps/jd, but that
  // *entire directory* must never reach a GitHub Pages artifact.
  if(relative==='apps'&&entry.name==='jd')continue;
  if(!relative&&(entry.name==='senior'||entry.name==='index.html'))continue;
  if(entry.isDirectory()){
   if(!relative && !['apps','brand-assets'].includes(entry.name))
     throw Error('Unexpected public directory: '+rel);
   if(relative && !/^(?:apps\/(?:learning|client-care|qr)(?:\/(?:assets|data|vendor))?|brand-assets)(?:\/.*)?$/.test(rel))
     throw Error('Unapproved nested public directory: '+rel);
   fs.mkdirSync(out,{recursive:true});
   copyStatic(input,out,rel);
  }else if(entry.isFile()){
   if(!relative){
     if(!publicRoot.has(entry.name))throw Error('Unapproved public root file: '+rel);
   }else if(!publicAssetTypes.test(entry.name)||/\.map$|\.html$/i.test(entry.name)){
     throw Error('Unapproved public asset file: '+rel);
   }
   fs.copyFileSync(input,out);
  }else{
   throw Error('Unexpected artifact type in public release: '+rel);
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
 const material=Buffer.from(JSON.stringify([email,member.password]),'utf8');
 let salt, kdf, id;
 for(const entry of oldEntries){
   const candidateSalt=Buffer.from(entry.salt,'base64');
   const candidate=pbkdf2Sync(material,candidateSalt,600000,48,'sha256');
   if(timingSafeEqual(candidate.subarray(0,16),Buffer.from(entry.verifier,'base64'))){
     salt=candidateSalt;kdf=candidate;id=entry.id;break;
   }
 }
 if(!kdf){
   salt=randomBytes(16);
   kdf=pbkdf2Sync(material,salt,600000,48,'sha256');
   id=randomBytes(16).toString('hex');
 }
 const iv=randomBytes(12);
 const verifier=kdf.subarray(0,16),key=kdf.subarray(16,48);
 const cipher=createCipheriv('aes-256-gcm',key,iv);
 const ciphertext=Buffer.concat([cipher.update(roleDocuments[role]),cipher.final(),cipher.getAuthTag()]);
 manifest.entries.push({id,salt:salt.toString('base64'),verifier:verifier.toString('base64')});
 fs.writeFileSync(path.join(pub,'account-files',id+'.json'),
   JSON.stringify({iv:iv.toString('base64'),ciphertext:ciphertext.toString('base64')}));
}
fs.writeFileSync(path.join(pub,'account-entries.json'),JSON.stringify(manifest));
// Public, non-sensitive release identity for detecting stale CDN/Pages builds.
// A successful login against an older version is not proof that this
// particular GitHub Actions deployment has reached the production domain.
const buildSha=process.env.COLORA_BUILD_SHA||process.env.GITHUB_SHA||'';
if(buildSha && !/^[a-f0-9]{40}$/.test(buildSha))throw Error('Invalid release commit SHA');
fs.writeFileSync(path.join(pub,'release-version.json'),JSON.stringify({
  schema:1,commit:buildSha||'local-unversioned'
}));
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
