import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root=process.cwd();
const dist=path.join(root,'dist');
const standard=process.env.STAFF_PORTAL_PASSWORD||'';
const senior=process.env.SENIOR_JD_PASSWORD||'';
if(standard.length<16||senior.length<16)throw new Error('Both GitHub Actions secrets must be at least 16 characters.');
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
    const args=['--no-install','staticrypt',input,'--directory',outdir,'--config','false','--salt',salt,
      '--template-title',isSenior?'COLORA - Management Access':'COLORA - Staff Access',
      '--template-instructions',isSenior?'Chỉ dành cho quản lý được cấp mật khẩu riêng.':'Nhập mật khẩu nhân viên COLORA để tiếp tục.',
      '--template-placeholder','Mật khẩu',
      '--template-button','VÀO KHÔNG GIAN LÀM VIỆC',
      '--template-color-primary','#002451',
      '--template-color-secondary','#F4EDE1',
      '--template-error','Mật khẩu chưa đúng.',
      '--remember',isSenior?'false':'7'];
    const result=spawnSync('npx',args,{cwd:root,env:{...process.env,STATICRYPT_PASSWORD:password},encoding:'utf8',timeout:120000});
    if(result.error||result.status!==0)throw new Error('Encryption failed for '+path.relative(dist,file)+': '+(result.stderr||result.error||result.stdout));
    const outputs=findHTML(outdir);
    if(outputs.length!==1)throw new Error('Unexpected StatiCrypt outputs: '+outputs.length+' for '+file);
    const encrypted=fs.readFileSync(outputs[0],'utf8');
    if(encrypted.length<1000 || encrypted.includes('const STORAGE_KEY =') || encrypted.includes('An environment to <em>'))throw new Error('HTML not protected: '+file);
    fs.writeFileSync(file,encrypted);
    console.log('Encrypted '+path.relative(dist,file)+(isSenior?' [SENIOR]':' [STAFF]'));
  }finally{fs.rmSync(temp,{recursive:true,force:true});}
}
const pages=[
  'index.html',
  'apps/client-care/index.html',
  'apps/learning/index.html',
  'apps/qr/index.html'
];
for(const file of pages)encryptFile(path.join(dist,file),standard,saltStaff,false);
encryptFile(path.join(dist,'apps/jd/index.html'),senior,saltSenior,true);

// Fail closed: no other unencrypted HTML may be shipped.
const all=findHTML(dist).map(p=>path.relative(dist,p).replaceAll(path.sep,'/'));
if(all.length!==pages.length+1||all.some(p=>!pages.includes(p)&&p!=='apps/jd/index.html'))throw new Error('Unexpected unencrypted HTML discovered in output.');
if(fs.existsSync(path.join(dist,'apps','jd','app.js')))throw new Error('Unencrypted senior JD script in output!');
