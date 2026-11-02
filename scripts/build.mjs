import fs from 'node:fs';
import path from 'node:path';
import {makeSearchIndex} from './build-quick-search.mjs';

const root=process.cwd();
const dist=path.join(root,'dist');
// Fully self-contained source snapshots committed within COLORA-staff.
const source=path.join(root,'modules');
const site=path.join(root,'site');
const app=code=>path.join(source,code);
function fail(message){throw new Error(message);}
function copyRequired(from,to){if(!fs.existsSync(from))fail('Missing required file: '+from);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);}
function copyAssets(from,to){if(!fs.existsSync(from))return;for(const entry of fs.readdirSync(from,{withFileTypes:true})){if(!entry.isFile() || !/\.(png|jpg|jpeg|webp|svg)$/i.test(entry.name))continue;copyRequired(path.join(from,entry.name),path.join(to,entry.name));}}
function copyModule(name,sourceName){
  const from=app(sourceName),to=path.join(dist,'apps',name);
  if(!fs.existsSync(path.join(from,'index.html')))fail('Missing archived source for '+sourceName);
  // Runtime files copied locally, not fetched from any other repository.
  // Keep docs, tests, unpublished workflows, plaintext entry HTML, private
  // files and configuration OUT of the public GitHub Pages artifact.
  for(const entry of fs.readdirSync(from,{withFileTypes:true})){
    if(entry.isDirectory()){
      if(['assets','data'].includes(entry.name))fs.cpSync(path.join(from,entry.name),path.join(to,entry.name),{recursive:true});
    }else if(entry.isFile() && /\.(?:js|css|json|svg|png|webp|jpe?g)$/i.test(entry.name)){
      copyRequired(path.join(from,entry.name),path.join(to,entry.name));
    }
  }
}

fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
for(const file of ['index.html','styles.css','brand-refinements.css','brand-guide.css','mail-guide.css','email-templates.css','quick-search.css','jd-integrated.css','embedded-apps.css','module-host.js','library.js','library-ui.js','mail-guide.js','email-templates.js','quick-search.js','jd-workspace.js','jd-storage-gate.js','app.js','CNAME','.nojekyll'])copyRequired(path.join(site,file),path.join(dist,file));

// Use actual brand vectors archived from COLORA's Identity/Pattern Drive folder.
for(const image of ['facet-symbol.svg','facet-pattern.svg'])copyRequired(path.join(site,'brand-assets',image),path.join(dist,'brand-assets',image));

copyModule('client-care','client-care');
copyModule('learning','learning');
copyAssets(path.join(app('learning'),'assets'),path.join(dist,'apps','learning','assets'));
copyModule('qr','qr');
// Public reference-only index. No account, JD, pricing or supplier data.
fs.writeFileSync(path.join(dist,'quick-search-index.js'),makeSearchIndex(root));
 // Pin the original QR engine locally: no third-party JavaScript runs from a CDN.
 const qrRuntime=path.join(root,'node_modules','qr-code-styling','lib','qr-code-styling.js');
 copyRequired(qrRuntime,path.join(dist,'apps','qr','vendor','qr-code-styling.js'));
copyAssets(path.join(app('qr'),'assets'),path.join(dist,'apps','qr','assets'));
/**
 * Bundle the FULL HTML of all normal tools into the ONE encrypted staff page.
 * The HTML is serialized as JSON text within an inert script tag, then the
 * complete root page gets encrypted by StatiCrypt. Each child app loads
 * its own JS/CSS/assets from /apps/<module>/, but no public child HTML
 * document exists and the user never sees another login form.
 */
const bundledModules=[
  {key:'learning',source:'learning'},
  {key:'client-care',source:'client-care'},
  {key:'qr',source:'qr'}
];
let portal=fs.readFileSync(path.join(dist,'index.html'),'utf8');
if(!portal.includes('</body>'))fail('Main Staff HTML missing closing body');
for(const entry of bundledModules){
  let child=fs.readFileSync(path.join(app(entry.source),'index.html'),'utf8');
  // Always resolve relative assets in the integration folder, including
  // scripts, stylesheets, fetch('data/...'), and logo images.
  if(!/<head[^>]*>/i.test(child))fail('Sub-app HTML missing head: '+entry.source);
  child=child.replace(/<head([^>]*)>/i,'<head$1>\n<base href="/apps/'+entry.key+'/">');
  // Retain original functionality, but publish each app as a CONTENT SECTION.
  // A build-time CSS layer removes duplicate child sidebars/headers and
  // removes the huge 2nd homepage. All routes remain usable in Blob context.
  child=child.replace(/<html(\s|>)/i,'<html data-colora-embed="'+entry.key+'"$1');
  child=child.replace(/<\/head>/i,'<link rel="stylesheet" href="/embedded-apps.css">\n</head>');
  // JSON encoding plus escaping of HTML sentinels prevents closing the inert
  // script element or accidentally parsing executable HTML in the shell.
  const json=JSON.stringify(child).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
  portal=portal.replace('</body>','<script id="bundled-'+entry.key+'" type="application/json">'+json+'</script>\n</body>');
}
// Both roles receive identical non-management tools; each has a DIFFERENT
// encrypted shell. Never deliver JD markup in the Staff-encrypted document.
// This file is a pre-encryption staging artifact, not a deployed HTML page.
if(!portal.includes('<body style="visibility:hidden">'))fail('Missing Staff role build anchor');
const staffRole=portal
  .replace('<body style="visibility:hidden">','<body style="visibility:hidden" data-staff-role="staff">')
  .replace(/\s*<button data-view="jd" class="nav-btn">[^\n]*<\/button>/,'')
  .replace(/\s*<button class="feature-card feature-card-restricted" data-view="jd">[^\n]*<\/button>/,'')
  .replace(/\s*<p class="menu-label">MANAGEMENT<\/p>/,'');
if(staffRole.includes('data-view="jd"'))fail('Staff role still exposes the JD navigation');
fs.writeFileSync(path.join(dist,'index.html'),staffRole);


// JD uses a separate encryption password. Bundle its JS and CSS INTO the HTML
// before encryption, so no unencrypted JD script or role templates are deployed.
// Important: JD source repo itself is currently public and must be made private
// for real source confidentiality; this build cannot change its visibility.
const jdDir=path.join(dist,'apps','jd');
if(process.env.JD_BUILD_MODE==='preserve'){
  // A secret rotation must not block unrelated Staff improvements. Reuse
  // ONLY the already encrypted JD HTML and images from a successful deployment.
  // Never attempt to decrypt this backup with a different password.
  const prior=path.join(root,'.sources','last-published','site','apps','jd');
  const document=path.join(prior,'index.html');
  if(!fs.existsSync(document))fail('Missing previously encrypted JD document');
  const html=fs.readFileSync(document,'utf8');
  if(html.length<1500 || !html.includes('staticrypt-password') || !html.includes('Management Access') || html.includes('id="workspaceTitle"')){
    fail('Previous JD page is not recognized as protected StatiCrypt output');
  }
  fs.cpSync(prior,jdDir,{recursive:true});
  for(const unsafe of ['app.js','styles.css','luxury.css','refinements.css','print-polish.css']){
    if(fs.existsSync(path.join(jdDir,unsafe)))fail('Unprotected JD source present in copied archive: '+unsafe);
  }
  console.log('Preserved the previously published, encrypted Senior JD page unchanged.');
}else{
const jdSource=process.env.JD_SOURCE_DIR || path.join(root,'.sources','jd');
if(!fs.existsSync(path.join(jdSource,'index.html')))fail('Missing decrypted JD source. Run scripts/jd-source.mjs decrypt before build.');
let jd=fs.readFileSync(path.join(jdSource,'index.html'),'utf8');
const cssFiles=['styles.css','luxury.css','refinements.css','print-polish.css'];
for(const filename of cssFiles){
  const css=fs.readFileSync(path.join(jdSource,filename),'utf8').replace(/<\/style/gi,'<\\/style');
  const pattern=new RegExp('<link\\s+rel="stylesheet"\\s+href="'+filename.replace('.','\\.')+'"\\s*/?>','i');
  if(!pattern.test(jd))fail('Cannot inline JD CSS: '+filename);
  jd=jd.replace(pattern,'<style>\n'+css+'\n</style>');
}
if(!jd.includes('<script src="app.js"></script>'))fail('Cannot inline JD JS');
let jdEngine=fs.readFileSync(path.join(jdSource,'app.js'),'utf8');
// The existing COLORA-JD source is pinned; change only storage keys in the
// temporary built Senior document. No raw JD source is committed or published.
// The legacy static rollback remains unchanged when this flag is off.
if(process.env.COLORA_JD_SCOPED_STORAGE==='true'){
  const legacyKeys="const STORAGE_KEY = 'colora_jd_library_v1';\nconst SETTINGS_KEY = 'colora_jd_settings_v1';";
  const scopedKeys=[
    "const COLORA_JD_ACCOUNT_ID = window.parent.COLORA_ACCOUNT_SCOPE;",
    "if(!/^[a-f0-9]{32}$/.test(COLORA_JD_ACCOUNT_ID||'')) throw Error('Senior account context missing');",
    "const STORAGE_KEY = 'colora_jd_library_v2_' + COLORA_JD_ACCOUNT_ID;",
    "const SETTINGS_KEY = 'colora_jd_settings_v2_' + COLORA_JD_ACCOUNT_ID;"
  ].join('\n');
  if(jdEngine.includes(legacyKeys))jdEngine=jdEngine.replace(legacyKeys,scopedKeys);
  else if(jdSource.split(path.sep).slice(-3).join('/')!=='tests/fixtures/jd')
    fail('Pinned JD storage format changed; refusing to build without explicit scoped keys');
}
jd=jd.replace('<script src="app.js"></script>','<script>\n'+jdEngine.replace(/<\/script/gi,'<\\/script')+'\n</script>');
jd=jd.replace(/family=Bodoni\+Moda:[^"&]+&family=Open\+Sans:/,'family=Cormorant+Garamond:wght@400;500;600&family=Open+Sans:');
jd=jd.replace('</head>','<style>h1,h2,h3,.serif,.brand-name{font-family:"Cormorant Garamond",Georgia,serif!important}</style>\n<meta name="robots" content="noindex,nofollow,noarchive">\n</head>');
fs.mkdirSync(jdDir,{recursive:true});
fs.writeFileSync(path.join(jdDir,'index.html'),jd);
copyAssets(path.join(jdSource,'assets'),path.join(jdDir,'assets'));
}

// Senior can open the JD module directly after the SAME outer login; only
// Senior-encrypted HTML contains the complete JD application source. No
// separate second password prompt is presented inside the workspace.
if(process.env.JD_BUILD_MODE==='preserve'){
  fail('Cannot enable dual-role login without a decrypted JD source; refusing to expose anything unprotected.');
}
const seniorJD=fs.readFileSync(path.join(jdDir,'index.html'),'utf8');
if(!seniorJD.includes('id="workspaceTitle"')||!seniorJD.includes('</body>')){
  fail('JD source must be a complete unencrypted HTML application before Senior envelope encryption.');
}
// Reuse original JD data model and actions but render its editor as a
// native Staff section: one sidebar, one heading, one shared action bar.
const seniorEmbedded=seniorJD
  .replace(/<html(\s|>)/i,'<html data-colora-embed="jd"$1')
  .replace(/<head([^>]*)>/i,'<head$1>\n<base href="/apps/jd/">')
  .replace('</head>','<link rel="stylesheet" href="/jd-integrated.css">\n</head>');
const seniorBundle=JSON.stringify(seniorEmbedded)
  .replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
const seniorRole=portal
  .replace('<body style="visibility:hidden">','<body style="visibility:hidden" data-staff-role="senior">')
  // The plaintext staging file lives under /senior/ during CI, while the
  // decrypted ciphertext replaces /index.html at runtime. Parent-relative
  // assets resolve to the site root in BOTH contexts.
  .replace(/(href|src)="\.\//g,'$1="../')
  .replace('</body>','<script id="bundled-jd" type="application/json">'+seniorBundle+'</script>\n</body>');
const seniorDir=path.join(dist,'senior');
fs.mkdirSync(seniorDir,{recursive:true});
fs.writeFileSync(path.join(seniorDir,'index.html'),seniorRole);

for(const name of ['index.html','apps/jd/index.html']) if(!fs.existsSync(path.join(dist,name))) fail('Missing page '+name);
for(const key of ['learning','client-care','qr']){
  if(fs.existsSync(path.join(dist,'apps',key,'index.html')))fail('Plaintext sub-app HTML must not be published: '+key);
}
console.log('Built COLORA Staff Portal: 3 full applications bundled into single encrypted staff HTML; separately encrypted JD; resource library and generators.');
