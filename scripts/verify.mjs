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
const rootLinks=['apps/client-care/styles.css','apps/client-care/content.js','apps/learning/app.js','apps/learning/data/questions.json','apps/qr/assets/colora-logo.png','apps/qr/assets/colora-lettermark.png','apps/qr/assets/colora-symbol.png','apps/qr/vendor/qr-code-styling.js','brand-refinements.css','apps/learning/brand-refinements.css','apps/client-care/brand-refinements.css','app.js','library.js','library-ui.js','styles.css'];
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
if(encryptedRoot.includes('id="bundled-learning"') || encryptedRoot.includes('id="bundled-qr"'))throw Error('Bundled application templates leaked outside the encrypted payload.');
console.log('Verified: one encrypted Staff entry with 3 bundled applications; separate encrypted JD; no public child HTML routes.');
