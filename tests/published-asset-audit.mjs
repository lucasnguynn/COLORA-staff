import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve('account-release/public');
const expectedRoot=new Set([
  'index.html','account-login.css','account-login.js','account-entries.json','release-version.json',
  'account-files','apps','brand-assets',
  'styles.css','brand-refinements.css','brand-guide.css','mail-guide.css','email-templates.css','quick-search.css',
  'jd-integrated.css','mobile-ui.css','embedded-apps.css','module-host.js','mobile-ui.js','library.js',
  'library-ui.js','mail-guide.js','email-templates.js','quick-search.js','quick-search-index.js','jd-workspace.js','jd-storage-gate.js','app.js','CNAME','.nojekyll'
]);
assert(fs.existsSync(root),'No built public release to audit');
const actual=fs.readdirSync(root);
for(const file of actual)assert(expectedRoot.has(file),'Unexpected public release file: '+file);
for(const required of ['index.html','account-entries.json','account-files','apps','brand-assets'])
 assert(actual.includes(required),'Missing required public file: '+required);
const published=[];
function walk(dir,base=''){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  const rel=base?base+'/'+entry.name:entry.name;
  const abs=path.join(dir,entry.name);
  assert(!entry.isSymbolicLink(),'Public release contains symlink: '+rel);
  if(entry.isDirectory())walk(abs,rel);
  else{
   assert(entry.isFile(),'Unsupported release entry: '+rel);
   published.push(rel);
  }
 }
}
walk(root);
assert.deepEqual(published.filter(x=>x.toLowerCase().endsWith('.html')),['index.html'],
 'No non-login HTML may be directly served');
assert(!published.some(x=>/(^|\/)(?:dist|src|\.git|\.env|tests|fixtures|private|\.sources|senior)(\/|\.)|\.(?:mjs|md|map|pem|key|log|zip|tar|gz|bak)$/i.test(x)),
 'Potentially private or build-only file was published');
assert(!published.some(x=>x.startsWith('apps/jd/')),'JD source cannot be public');
for(const file of published){
 if(file.startsWith('apps/')){
  assert(/^apps\/(?:learning|client-care|qr)\/(?:assets|data|vendor\/qr-code-styling\.js|[^/]+\.(?:js|css|json|svg|png|webp|jpe?g))(?:\/.*)?$/i.test(file),
   'Unexpected public app resource: '+file);
  assert(/\.(?:js|css|json|svg|png|webp|jpe?g)$/i.test(file),'Non-runtime app file published: '+file);
 }
}
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(html.includes('id="signin-form"')&&html.includes('id="staff-email"'),'Expected five-account login missing');
assert(!html.includes('id="bundled-jd"'),'Encrypted JD source exposed in login HTML');
assert(!html.includes('id="module-frame"'),'Unencrypted Staff source exposed in login HTML');
assert(html.includes('Content-Security-Policy'),'Login CSP must be set');
const release=JSON.parse(fs.readFileSync(path.join(root,'release-version.json'),'utf8'));
assert.equal(release.schema,1);
assert(/^[a-f0-9]{40}$/.test(release.commit)||release.commit==='local-unversioned',
  'Public release version must be a commit SHA or explicit local fixture');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'account-entries.json'),'utf8'));
assert.equal(manifest.version,1);
assert.equal(manifest.entries.length,5);
assert.equal(new Set(manifest.entries.map(e=>e.id)).size,5);
const files=fs.readdirSync(path.join(root,'account-files'));
assert.equal(files.length,5,'Exactly five encrypted envelopes allowed');
for(const e of manifest.entries){
 assert(/^[a-f0-9]{32}$/.test(e.id));
 assert(files.includes(e.id+'.json'),'Missing encrypted member file');
 const sealed=JSON.parse(fs.readFileSync(path.join(root,'account-files',e.id+'.json'),'utf8'));
 assert.equal(Buffer.from(sealed.iv,'base64').length,12,'Invalid GCM IV');
 assert(Buffer.from(sealed.ciphertext,'base64').length>120,'Empty encrypted document');
}
console.log('PASS: Public release file allowlist, five encrypted records, and no exposed Staff/Senior HTML.');
