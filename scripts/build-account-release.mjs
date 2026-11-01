/* Isolated authenticated-release builder.
 * Source: plaintext "dist" from scripts/build.mjs BEFORE StatiCrypt.
 * Output: account-release/public (ONLY public files), account-release/private
 * (NEVER deploy to Pages; upload ONLY to Supabase private Storage).
 */
import fs from 'node:fs';
import path from 'node:path';
const cwd=process.cwd();
const dist=path.join(cwd,'dist');
const output=path.join(cwd,'account-release');
const pub=path.join(output,'public'), priv=path.join(output,'private');
const url=String(process.env.SUPABASE_URL||'').replace(/\/+$/,'');
const key=String(process.env.SUPABASE_PUBLISHABLE_KEY||'');
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url))throw Error('Missing/invalid Supabase project HTTPS URL');
if(!/^(sb_publishable_|eyJ)[A-Za-z0-9_.-]{15,}$/.test(key))throw Error('Missing/invalid Supabase publishable key (NEVER a service_role key)');
if(/^eyJ/.test(key)&&key.length>1024)throw Error('Unexpected public key size');
if(!fs.existsSync(path.join(dist,'senior','index.html')) || !fs.existsSync(path.join(dist,'index.html'))){
 throw Error('Plaintext Staff/Senior build must exist before this separate staging command');
}
const roleHtml=[
 ['staff',fs.readFileSync(path.join(dist,'index.html'),'utf8')],
 ['senior',fs.readFileSync(path.join(dist,'senior','index.html'),'utf8')]
];
for(const [role,html] of roleHtml){
 if(!html.includes('data-staff-role="'+role+'"') || !html.includes('id="module-frame"'))throw Error('Unexpected role-specific HTML: '+role);
 if(role==='staff' && (html.includes('id="bundled-jd"')||html.includes('data-view="jd"')))throw Error('Staff role leaks JD');
 if(role==='senior' && !html.includes('id="bundled-jd"'))throw Error('Senior app payload missing');
}
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(pub,{recursive:true});fs.mkdirSync(priv,{recursive:true});
function copyStatic(src,dst){
 for(const entry of fs.readdirSync(src,{withFileTypes:true})){
  const input=path.join(src,entry.name),out=path.join(dst,entry.name);
  if(entry.isDirectory()){
    if(entry.name==='senior'||entry.name.startsWith('.'))continue;
    fs.mkdirSync(out,{recursive:true});copyStatic(input,out);
  }else if(entry.isFile()){
    // Never distribute any independent .html or the old public senior gateway.
    if(entry.name.endsWith('.html')||entry.name==='senior-gateway.json')continue;
    fs.copyFileSync(input,out);
  }
 }
}
copyStatic(dist,pub);
for(const [role,html] of roleHtml)fs.writeFileSync(path.join(priv,role+'.html'),html,{mode:0o600});
const source=path.join(cwd,'account-auth');
for(const [src,dst] of [['login.html','index.html'],['account-login.css','account-login.css'],['account-login.js','account-login.js']]){
 fs.copyFileSync(path.join(source,src),path.join(pub,dst));
}
let login=fs.readFileSync(path.join(pub,'index.html'),'utf8');
// The trusted app uses inline scripts in its private document (legacy JD
// engine and boot guard). srcdoc inherits the gateway's CSP. Limit network
// access to this exact Supabase URL and self; no external app scripts.
login=login.replace("script-src 'self';","script-src 'self' 'unsafe-inline';")
 .replace("style-src 'self' https://fonts.googleapis.com;","style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;")
 .replace("base-uri 'none';","base-uri 'self';")
 .replace("connect-src 'self' https:;","connect-src 'self' "+url+";")
 .replace("frame-src 'self' about:;","frame-src 'self' about:;"); 
if(login.includes("connect-src 'self' https:;"))throw Error('Unrestricted network policy');
fs.writeFileSync(path.join(pub,'index.html'),login);
fs.writeFileSync(path.join(pub,'account-config.js'),
 'window.COLORA_AUTH_CONFIG=Object.freeze('+JSON.stringify({supabaseUrl:url,publishableKey:key})+');\n');
const found=[];
function scan(dir,prefix=''){
 for(const item of fs.readdirSync(dir,{withFileTypes:true})){
  const rel=prefix+item.name,abs=path.join(dir,item.name);
  if(item.isDirectory())scan(abs,rel+'/');
  else found.push(rel);
 }
}
scan(pub);
const forbidden=found.filter(f=>f.endsWith('.html')&&f!=='index.html'||f.includes('senior-gateway')||f.includes('.sources')||f.includes('jd-source.enc'));
if(forbidden.length)throw Error('Private files leaked into public Pages: '+forbidden.join(', '));
if(!fs.existsSync(path.join(pub,'CNAME')))throw Error('Missing custom domain CNAME');
console.log('Account release staged: public assets and separate private Staff/Senior HTML. No individual passwords used or stored.');
