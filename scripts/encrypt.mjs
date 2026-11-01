import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const dist=path.join(root,'dist');
const standard=process.env.STAFF_PORTAL_PASSWORD||'';
const senior=process.env.SENIOR_JD_PASSWORD||'';
if(Array.from(standard).length<8||Array.from(senior).length<8)throw new Error('Both GitHub Actions secrets must be at least 8 characters.');
if(standard===senior)throw new Error('Senior password MUST be different from staff password.');
// Public, stable, 16-byte random salt for remembering a pass across pages.
// Neither salt is a password or an authentication token.
const saltStaff='f34a81924b11a02d56d4208c4510fe9e';
const saltSenior='c72e0d9a861b45e37f9ac1308b5624dc';

function findHTML(folder){
  const found=[];
  for(const item of fs.readdirSync(folder,{withFileTypes:true})){
    const full=path.join(folder,item.name);
    if(item.isDirectory())found.push(...findHTML(full));
    else if(item.name.endsWith('.html'))found.push(full);
  }
  return found;
}

function encryptFile(file, password, salt, isSenior){
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'colora-staticrypt-'));
  try{
    const input=path.join(temp,'source','index.html');
    const outdir=path.join(temp,'encrypted');
    fs.mkdirSync(path.dirname(input),{recursive:true});
    fs.copyFileSync(file,input);
    // StatiCrypt prompts interactively for short passwords by default.
    // Our explicit >=8-character preflight is authoritative; --short prevents
    // CI from silently skipping encryption when an 8-13 character secret is used.
    const args=['--no-install','staticrypt',input,'--short','--directory',outdir,'--config','false','--salt',salt,
      '--template',path.join(root,'site','login-template.html'),
      '--template-title',isSenior?'Management Access':'Staff Workspace',
      '--template-instructions',isSenior?'Nhập mật khẩu quản lý.':'Nhập mật khẩu Staff.',
      '--template-placeholder','Nhập mật khẩu',
      '--template-button','Đăng nhập',
      '--template-remember','Ghi nhớ trên thiết bị này',
      '--template-toggle-show','Hiện mật khẩu',
      '--template-toggle-hide','Ẩn mật khẩu',
      '--template-color-primary','#002451',
      '--template-color-secondary','#F4EDE1',
      '--template-error','Mật khẩu chưa đúng.',
      '--remember',isSenior?'false':'7'];
    const result=spawnSync('npx',args,{cwd:root,env:{...process.env,STATICRYPT_PASSWORD:password},encoding:'utf8',timeout:120000});
    if(result.error||result.status!==0)throw new Error('Encryption failed for '+path.relative(dist,file)+': '+(result.stderr||result.error||result.stdout));
    const outputs=findHTML(outdir);
    if(outputs.length!==1)throw new Error('Unexpected StatiCrypt outputs: '+outputs.length+' for '+file);
    const encrypted=fs.readFileSync(outputs[0],'utf8');
    if(encrypted.length<1000 || encrypted.includes('const STORAGE_KEY =') || encrypted.includes('An environment to <em>') || encrypted.includes('A space to <em>'))throw new Error('HTML not protected: '+file);
    // StatiCrypt v3 uses WebCrypto, which is unavailable on ordinary HTTP.
    // Redirect custom-domain visits to HTTPS *before* the password form or
    // Staticrypt decryption code runs. Localhost is exempt for CI smoke tests.
    // Keep this tiny script outside the encrypted payload: it has no secrets.
    const enforceSecureContext = '<script>(function(){if(location.protocol==="http:" && !["localhost","127.0.0.1","::1"].includes(location.hostname)){location.replace("https:"+location.href.substring(location.protocol.length));}})();</script>';
    if (!encrypted.includes('<head>')) throw new Error('Missing HTML head in encrypted page: '+file);
    const securedHTML = encrypted.replace('<head>','<head>\n'+enforceSecureContext);
    fs.writeFileSync(file,securedHTML);
    console.log('Encrypted '+path.relative(dist,file)+(isSenior?' [SENIOR]':' [STAFF]'));
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
// Encrypt Senior's complete workspace with its own password before generating
// the public two-role gateway. Only the encrypted payload and salt are
// extracted. The gateway cannot reveal JD content with a Staff password.
if(process.env.JD_BUILD_MODE==='preserve')throw Error('Dual-role login requires freshly encryptable Senior JD source.');
const seniorPortal=path.join(dist,'senior','index.html');
encryptFile(seniorPortal,senior,'693d7e80bd9ad117ec37b5f4482e2490',true);
const seniorEncrypted=fs.readFileSync(seniorPortal,'utf8');
const configMatch=seniorEncrypted.match(/const staticryptConfig = ([\s\S]*?);/);
if(!configMatch)throw Error('Cannot extract encrypted Senior configuration');
let gateway;
try {gateway=JSON.parse(configMatch[1]);} catch {throw Error('Senior envelope config is not JSON serializable');}
if(!gateway || typeof gateway.staticryptEncryptedMsgUniqueVariableName!=='string' ||
   typeof gateway.staticryptSaltUniqueVariableName!=='string' ||
   !gateway.staticryptEncryptedMsgUniqueVariableName.length) {
  throw Error('Senior gateway encrypted configuration is incomplete');
}
fs.writeFileSync(path.join(dist,'senior-gateway.json'),JSON.stringify(gateway));
fs.rmSync(path.dirname(seniorPortal),{recursive:true,force:true});
const pages=['index.html'];
for(const file of pages)encryptFile(path.join(dist,file),standard,saltStaff,false);
if(process.env.JD_BUILD_MODE==='preserve'){
  // Already encrypted by the last successful deployment. No recomputation
  // is possible without the original snapshot password, and none is needed
  // to publish new Staff content safely.
  const preserved=fs.readFileSync(path.join(dist,'apps/jd/index.html'),'utf8');
  if(!preserved.includes('staticrypt-password') || !preserved.includes('staticrypt-form') || preserved.includes('id="workspaceTitle"')){
    throw new Error('Cannot publish the preserved JD HTML: protection check failed.');
  }
  console.log('Preserved existing encrypted JD HTML (Senior password unchanged).');
}else{
  encryptFile(path.join(dist,'apps/jd/index.html'),senior,saltSenior,true);
}

// Fail closed: no other unencrypted HTML may be shipped.
const all=findHTML(dist).map(p=>path.relative(dist,p).replaceAll(path.sep,'/'));
if(all.length!==pages.length+1||all.some(p=>!pages.includes(p)&&p!=='apps/jd/index.html'))throw new Error('Unexpected unencrypted HTML discovered in output.');
if(fs.existsSync(path.join(dist,'apps','jd','app.js')))throw new Error('Unencrypted senior JD script in output!');
