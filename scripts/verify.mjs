import fs from 'node:fs';
import path from 'node:path';
const dist=path.resolve('dist');
const pages=['index.html','apps/client-care/index.html','apps/learning/index.html','apps/qr/index.html','apps/jd/index.html'];
for(const rel of pages){
  const file=path.join(dist,rel);
  if(!fs.existsSync(file))throw Error('Missing '+rel);
  const html=fs.readFileSync(file,'utf8');
  if(!/staticrypt/i.test(html))throw Error('Missing StatiCrypt marker: '+rel);
  if(html.length<1500)throw Error('Encrypted output too small: '+rel);
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
for(const rel of ['apps/jd/app.js','apps/jd/styles.css','apps/jd/luxury.css','apps/jd/refinements.css','apps/jd/print-polish.css']){
  if(fs.existsSync(path.join(dist,rel)))throw Error('Senior source exposed in published artifact: '+rel);
}
const rootLinks=['apps/client-care/styles.css','apps/client-care/content.js','apps/learning/app.js','apps/learning/data/questions.json','apps/qr/assets/colora-logo.png','app.js','library.js','library-ui.js','styles.css'];
for(const rel of rootLinks)if(!fs.existsSync(path.join(dist,rel)))throw Error('Missing integrated dependency: '+rel);
console.log('Verified: all five HTML pages encrypted; JD bundle sealed; required assets present.');
