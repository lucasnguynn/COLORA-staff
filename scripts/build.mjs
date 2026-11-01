import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist');
const source=path.join(root,'.sources');
const site=path.join(root,'site');
const app=code=>path.join(source,code);
const allowed={
  'client-care': ['index.html','styles.css','favicon.svg','content.js','intelligence.js','ops.js','app.js','practice-tools.js','data/approved-public.js'],
  'learning': ['index.html','styles.css','app.js','data/questions.json','data/lessons.json','data/curriculum.json','data/gem-13.json','data/gem-14.json','data/gem-15.json','data/gem-16.json','data/care-17.json','data/applied-cases.json'],
  'qr': ['index.html']
};
function fail(message){throw new Error(message);}
function copyRequired(from,to){if(!fs.existsSync(from))fail('Missing required file: '+from);fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);}
function copyAssets(from,to){if(!fs.existsSync(from))return;for(const entry of fs.readdirSync(from,{withFileTypes:true})){if(!entry.isFile() || !/\.(png|jpg|jpeg|webp|svg)$/i.test(entry.name))continue;copyRequired(path.join(from,entry.name),path.join(to,entry.name));}}
function copyModule(name,sourceName){for(const file of allowed[name])copyRequired(path.join(app(sourceName),file),path.join(dist,'apps',name,file));}

fs.rmSync(dist,{recursive:true,force:true});
fs.mkdirSync(dist,{recursive:true});
for(const file of ['index.html','styles.css','library.js','library-ui.js','app.js','CNAME','.nojekyll'])copyRequired(path.join(site,file),path.join(dist,file));

copyModule('client-care','client-care');
copyModule('learning','learning');
copyAssets(path.join(app('learning'),'assets'),path.join(dist,'apps','learning','assets'));
copyModule('qr','qr');
copyAssets(path.join(app('qr'),'assets'),path.join(dist,'apps','qr','assets'));

// JD uses a separate encryption password. Bundle its JS and CSS INTO the HTML
// before encryption, so no unencrypted JD script or role templates are deployed.
// Important: JD source repo itself is currently public and must be made private
// for real source confidentiality; this build cannot change its visibility.
const jdSource=app('jd');
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

for(const name of ['index.html','apps/client-care/index.html','apps/learning/index.html','apps/qr/index.html','apps/jd/index.html']) if(!fs.existsSync(path.join(dist,name))) fail('Missing page '+name);
console.log('Built COLORA Staff Portal with 4 embedded applications a searchable staff library and 2 generators.');
