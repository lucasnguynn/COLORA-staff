import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve('dist');
const pages=['index.html','apps/jd/index.html'];
for(const rel of pages){
  const file=path.join(dist,rel);
  if(!fs.existsSync(file))throw Error('Missing '+rel);
  const html=fs.readFileSync(file,'utf8');
  if(!/staticrypt/i.test(html))throw Error('Missing StatiCrypt marker: '+rel);
  if(html.length<1500)throw Error('Encrypted output too small: '+rel);
  if(!html.includes('class="brand-logo"') || !html.includes('colora-lettermark.png'))throw Error('Original COLORA logo is missing on login: '+rel);
  if(!html.includes('Cormorant Garamond') || !html.includes('Open Sans'))throw Error('COLORA font stack is missing from login: '+rel);
  if(!html.includes('staticrypt-password') || !html.includes('staticrypt-form'))throw Error('Login form is missing: '+rel);
  if(!html.includes('location.replace("https:"+location.href.substring(location.protocol.length))'))throw Error('Missing forced HTTPS redirect in '+rel);
  const forbidden=[
    '<div class="shell">',
    'An environment to <em>grow</em> together',
    'A space to <em>learn,</em>',
    'const STORAGE_KEY =',
    '<div class="app-shell">',
    '<div id="app"><div class="boot">',
    'id="downloadPng"',
    'Job Description Builder'
  ];
  for(const plain of forbidden)if(html.includes(plain))throw Error('Unencrypted HTML found in '+rel+': '+plain);
}
for(const rel of ['apps/learning/index.html','apps/client-care/index.html','apps/qr/index.html','apps/jd/app.js','apps/jd/styles.css','apps/jd/luxury.css','apps/jd/refinements.css','apps/jd/print-polish.css']){
  if(fs.existsSync(path.join(dist,rel)))throw Error('Senior source exposed in published artifact: '+rel);
}
// Senior gateway exposes only ciphertext + salt; no plaintext JD or
// password is ever published. The temporary Senior HTML must be deleted.
if(fs.existsSync(path.join(dist,'senior','index.html')))throw Error('Senior plaintext shell was published.');
const gatewayPath=path.join(dist,'senior-gateway.json');
if(!fs.existsSync(gatewayPath))throw Error('Missing encrypted Senior gateway');
const gateway=JSON.parse(fs.readFileSync(gatewayPath,'utf8'));
if(typeof gateway.staticryptEncryptedMsgUniqueVariableName!=='string'||
   typeof gateway.staticryptSaltUniqueVariableName!=='string')throw Error('Malformed Senior gateway');
if(JSON.stringify(gateway).includes('id="workspaceTitle"')||
   JSON.stringify(gateway).includes('Job Description Builder'))throw Error('Senior JD plaintext leaked into gateway');
const rootLinks=['apps/client-care/styles.css','apps/client-care/content.js','apps/learning/app.js','apps/learning/data/questions.json','apps/qr/assets/colora-logo.png','apps/qr/assets/colora-lettermark.png','apps/qr/assets/colora-symbol.png','apps/qr/vendor/qr-code-styling.js','brand-refinements.css','brand-guide.css','brand-assets/facet-symbol.svg','brand-assets/facet-pattern.svg','embedded-apps.css','module-host.js','apps/learning/brand-refinements.css','apps/client-care/brand-refinements.css','app.js','library.js','library-ui.js','mail-guide.js','mail-guide.css','jd-integrated.css','jd-workspace.js','senior-gateway.json','styles.css'];
for(const rel of rootLinks)if(!fs.existsSync(path.join(dist,rel)))throw Error('Missing integrated dependency: '+rel);
const qrHTML=fs.readFileSync(path.join('modules','qr','index.html'),'utf8');
 if(/<script[^>]+src=["']https?:\/\//i.test(qrHTML))throw Error('External QR script is not allowed: vendor all QR JavaScript locally.');
 if(!qrHTML.includes('src="./vendor/qr-code-styling.js"'))throw Error('QR vendor reference missing.');
 if(/Didot|Bodoni/i.test(qrHTML))throw Error('QR typography violates COLORA font rules.');
 const encryptedRoot=fs.readFileSync(path.join(dist,'index.html'),'utf8');
for(const module of ['learning','client-care','qr']){
  // Original application HTML is embedded INSIDE the encrypted staff payload,
  // so it cannot be read directly via an unencrypted public app URL.
  if(fs.existsSync(path.join(dist,'apps',module,'index.html')))throw Error('Ungated subapp HTML found: '+module);
}
const hostJS=fs.readFileSync(path.join(dist,'module-host.js'),'utf8');
if(!hostJS.includes('URL.createObjectURL') || !hostJS.includes('workspace-subnav-btn'))throw Error('Missing integrated section host');
const buildJS=fs.readFileSync(path.join('scripts','build.mjs'),'utf8');
if(!buildJS.includes('data-colora-embed') || !buildJS.includes('embedded-apps.css'))throw Error('Build must embed each app with unified Staff presentation');
if(!fs.readFileSync(path.join('site','index.html'),'utf8').includes('id="brand-guide"'))throw Error('COLORA visual brand knowledge section is absent.');
if(!fs.readFileSync(path.join('site','index.html'),'utf8').includes('Túi giấy Ivory'))throw Error('Current ivory shopping bag status missing.');
if(!fs.readFileSync(path.join('site','index.html'),'utf8').includes('Dự kiến / đang đánh giá'))throw Error('Planned packaging must be clearly identified.');
if(!fs.readFileSync(path.join('site','index.html'),'utf8').includes('id="mail-guide"'))throw Error('Mailbox guide must be part of encrypted Staff HTML.');
if(!fs.readFileSync(path.join('site','index.html'),'utf8').includes('id="jd-workspace-controls"'))throw Error('Native Staff JD controls missing.');
const staffSource=fs.readFileSync(path.join('site','index.html'),'utf8');
// Versioned script URLs are required to avoid stale GitHub Pages/CDN assets.
const bridgeScript=staffSource.search(/<script src="\.\/jd-workspace\.js\?v=[^"]+" defer>/);
const routerScript=staffSource.search(/<script src="\.\/app\.js\?v=[^"]+" defer>/);
if(bridgeScript<0 || routerScript<0 || bridgeScript>routerScript){
  throw Error('JD controller must load before app.js resolves bookmarked Senior #jd.');
}
if(!fs.readFileSync(path.join('scripts','build.mjs'),'utf8').includes('data-colora-embed="jd"'))throw Error('Build must tag embedded JD for unified Staff styling.');
if(encryptedRoot.includes('id="bundled-learning"') || encryptedRoot.includes('id="bundled-qr"'))throw Error('Bundled application templates leaked outside the encrypted payload.');
console.log('Verified: one encrypted Staff entry with 3 bundled applications; separate encrypted JD; no public child HTML routes.');
