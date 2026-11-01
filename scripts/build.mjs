import fs from 'node:fs';
import path from 'node:path';

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
for(const file of ['index.html','styles.css','brand-refinements.css','embedded-apps.css','module-host.js','library.js','library-ui.js','app.js','CNAME','.nojekyll'])copyRequired(path.join(site,file),path.join(dist,file));

copyModule('client-care','client-care');
copyModule('learning','learning');
copyAssets(path.join(app('learning'),'assets'),path.join(dist,'apps','learning','assets'));
copyModule('qr','qr');
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
fs.writeFileSync(path.join(dist,'index.html'),portal);


// JD uses a separate encryption password. Bundle its JS and CSS INTO the HTML
// before encryption, so no unencrypted JD script or role templates are deployed.
// Important: JD source repo itself is currently public and must be made private
// for real source confidentiality; this build cannot change its visibility.
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
jd=jd.replace('<script src="app.js"></script>','<script>\n'+fs.readFileSync(path.join(jdSource,'app.js'),'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>');
jd=jd.replace(/family=Bodoni\+Moda:[^"&]+&family=Open\+Sans:/,'family=Cormorant+Garamond:wght@400;500;600&family=Open+Sans:');
jd=jd.replace('</head>','<style>h1,h2,h3,.serif,.brand-name{font-family:"Cormorant Garamond",Georgia,serif!important}</style>\n<meta name="robots" content="noindex,nofollow,noarchive">\n</head>');
const jdDir=path.join(dist,'apps','jd');
fs.mkdirSync(jdDir,{recursive:true});
fs.writeFileSync(path.join(jdDir,'index.html'),jd);
copyAssets(path.join(jdSource,'assets'),path.join(jdDir,'assets'));

for(const name of ['index.html','apps/jd/index.html']) if(!fs.existsSync(path.join(dist,name))) fail('Missing page '+name);
for(const key of ['learning','client-care','qr']){
  if(fs.existsSync(path.join(dist,'apps',key,'index.html')))fail('Plaintext sub-app HTML must not be published: '+key);
}
console.log('Built COLORA Staff Portal: 3 full applications bundled into single encrypted staff HTML; separately encrypted JD; resource library and generators.');
