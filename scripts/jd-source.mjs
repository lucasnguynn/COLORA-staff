/**
 * Encrypted snapshot of the original COLORA-JD source repository.
 *
 * Usage:
 *   SENIOR_JD_PASSWORD=... node scripts/jd-source.mjs encrypt <input.tar.gz> <archive.json>
 *   SENIOR_JD_PASSWORD=... node scripts/jd-source.mjs decrypt <archive.json> <output_directory>
 *
 * The GitHub repository is public. Raw senior JD source must never be committed.
 * The archive uses AES-256-GCM with a unique random IV, scrypt-derived key and
 * a new random salt. Rotating SENIOR_JD_PASSWORD requires decrypting + re-encrypting
 * the archive BEFORE replacing the secret, else future builds cannot decrypt it.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const [mode,src,dest]=process.argv.slice(2);
const password=process.env.SENIOR_JD_PASSWORD||'';
if(Array.from(password).length<8)throw Error('SENIOR_JD_PASSWORD is absent or too short (no value printed).');
if(!src||!dest||!['encrypt','decrypt'].includes(mode))throw Error('Usage: jd-source.mjs encrypt <tar.gz> <json> OR decrypt <json> <folder>');

const derive=salt=>crypto.scryptSync(password,salt,32,{maxmem:64*1024*1024});
if(mode==='encrypt'){
  const bytes=fs.readFileSync(src);
  const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12);
  const cipher=crypto.createCipheriv('aes-256-gcm',derive(salt),iv);
  const ciphertext=Buffer.concat([cipher.update(bytes),cipher.final()]);
  const archive={version:1,algorithm:'aes-256-gcm',kdf:'scrypt',salt:salt.toString('base64'),iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),ciphertext:ciphertext.toString('base64')};
  fs.mkdirSync(path.dirname(path.resolve(dest)),{recursive:true});
  fs.writeFileSync(dest,JSON.stringify(archive));
  console.log('Encrypted JD source archive created; source not committed in plaintext.');
}else{
  const archive=JSON.parse(fs.readFileSync(src,'utf8'));
  if(archive.version!==1||archive.algorithm!=='aes-256-gcm'||archive.kdf!=='scrypt')throw Error('Unsupported JD source archive format');
  const salt=Buffer.from(archive.salt,'base64'),iv=Buffer.from(archive.iv,'base64'),tag=Buffer.from(archive.tag,'base64'),ciphertext=Buffer.from(archive.ciphertext,'base64');
  if(salt.length!==16||iv.length!==12||tag.length!==16)throw Error('Invalid JD encryption metadata');
  const decipher=crypto.createDecipheriv('aes-256-gcm',derive(salt),iv);
  decipher.setAuthTag(tag);
  const plain=Buffer.concat([decipher.update(ciphertext),decipher.final()]);
  const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'colora-jd-source-'));
  const archiveFile=path.join(scratch,'snapshot.tar.gz');
  try{
    fs.writeFileSync(archiveFile,plain,{mode:0o600});
    fs.mkdirSync(dest,{recursive:true});
    const result=spawnSync('tar',['-xzf',archiveFile,'-C',dest],{encoding:'utf8'});
    if(result.status!==0)throw Error('Cannot extract protected JD archive: '+result.stderr);
    for(const file of ['index.html','app.js','styles.css','luxury.css','refinements.css','print-polish.css']){
      if(!fs.existsSync(path.join(dest,file)))throw Error('JD snapshot missing '+file);
    }
    console.log('Private JD snapshot unlocked in temporary build directory.');
  }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}
