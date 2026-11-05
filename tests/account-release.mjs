/* Test all five/six independently encrypted records, fail closed for wrong email,
 * wrong password and mismatched role. Only test credentials live in CI env.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pbkdf2Sync,createDecipheriv} from 'node:crypto';
import {readAccountRoster} from '../scripts/account-roster.mjs';
const pub=path.resolve('account-release/public');
const html=fs.readFileSync(path.join(pub,'index.html'),'utf8');
const script=fs.readFileSync(path.join(pub,'account-login.js'),'utf8');
const records=JSON.parse(fs.readFileSync(path.join(pub,'account-entries.json'),'utf8'));
const users=readAccountRoster();
assert([5,6].includes(users.length),'Only five or six protected credentials are allowed');
assert.equal(records.version,1);assert.equal(records.entries.length,users.length);
assert(script.includes('![5,6].includes(manifest.entries.length)'),
  'Client login must accept all five/six encrypted manifest entries');
assert(html.includes('id="staff-email"')&&html.includes('id="staff-password"'));
assert(html.includes('id="remember-device"')&&html.includes('type="checkbox"'),'Remember must be explicit opt-in');
assert(!html.includes('id="remember-device" type="checkbox" checked'),'Remember must default to off');
assert(script.includes("indexedDB.open(DB_NAME,1)"),'Browser remember should use IndexedDB');
assert(script.includes("await safelyForget()"),'Logout must erase saved access key');
assert(script.includes("extractable===false"),'Stored key must be non-extractable');
assert(!script.includes("localStorage.setItem(")&&!script.includes("document.cookie="),'Remember must not store plaintext passwords in cookies or localStorage');

assert(html.includes("frame-src 'self' about: blob:"),'Account CSP must permit local module Blob frames');
assert(!html.includes("frame-src *"),'Do not allow arbitrary frame hosts');

assert(!html.includes('supabase')&&!script.includes('supabase'));
assert(!html.includes('id="bundled-jd"'));
assert(!fs.existsSync(path.join(pub,'senior-gateway.json')));
assert(!fs.existsSync(path.join(pub,'apps/jd/index.html')));
assert(!fs.existsSync(path.join(pub,'senior/index.html')));
const all=[];
function scan(dir,base=''){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name),r=base+e.name;if(e.isDirectory())scan(p,r+'/');else all.push(r);}}
scan(pub);
assert.deepEqual(all.filter(x=>x.endsWith('.html')),['index.html']);
assert.equal(all.filter(x=>x.startsWith('account-files/')&&x.endsWith('.json')).length,users.length);
function decrypt(email,password){
 for(const e of records.entries){
  const salt=Buffer.from(e.salt,'base64'),kdf=pbkdf2Sync(Buffer.from(JSON.stringify([email,password])),salt,600000,48,'sha256');
  if(!kdf.subarray(0,16).equals(Buffer.from(e.verifier,'base64')))continue;
  const obj=JSON.parse(fs.readFileSync(path.join(pub,'account-files',e.id+'.json'),'utf8'));
  const sealed=Buffer.from(obj.ciphertext,'base64');
  const d=createDecipheriv('aes-256-gcm',kdf.subarray(16,48),Buffer.from(obj.iv,'base64'));
  d.setAuthTag(sealed.subarray(sealed.length-16));
  return Buffer.concat([d.update(sealed.subarray(0,-16)),d.final()]).toString('utf8');
 }
 return null;
}
let staff=0,senior=0;
for(const u of users){
 const email=u.email.toLowerCase().trim();
 const page=decrypt(email,u.password);
 assert(page?.includes('data-staff-role="'+u.role+'"'),'Correct email+password must decrypt correct role');
 assert(page.includes('id="module-frame"'));
 assert.equal(page.includes('id="bundled-jd"'),u.role==='senior','Only Senior can decrypt JD');
 assert.equal(decrypt(email,'incorrect-password-2026'),null,'Wrong password must fail');
 assert.equal(decrypt('incorrect@colora.vn',u.password),null,'Wrong email must fail');
 staff+=u.role==='staff';senior+=u.role==='senior';
 assert(!html.includes(email)&&!script.includes(email)&&!JSON.stringify(records).includes(email),'Email address exposed publicly');
 assert(!all.some(file=>file.includes(email)),'Employee email in public file name');
}
assert.equal(staff,users.length-2);assert.equal(senior,2);
console.log('PASS: '+users.length+' email+password pairs decrypt correct roles; wrong pairs rejected; no plaintext account roster.');
