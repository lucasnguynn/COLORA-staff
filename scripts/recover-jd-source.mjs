/**
 * Emergency, read-only restoration of the original COLORA-JD source.
 * Used only if the archived JD source cannot be decrypted with the current
 * SENIOR_JD_PASSWORD. This DOES NOT recover any browser-local JD drafts.
 *
 * Repository and exact immutable commit are pinned. Never use the current
 * branch head as unreviewed executable code. No passwords are used here.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const repoURL='https://github.com/lucasnguynn/COLORA-JD.git';
const pinned='e3017942eeb00c945341ca3e03d79b9c063fc085';
const out=path.resolve(process.argv[2]||'.sources/jd');
const files=['index.html','app.js','styles.css','luxury.css','refinements.css','print-polish.css'];
const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'colora-jd-recovery-'));
const git=(args)=> {
  const result=spawnSync('git',args,{encoding:'utf8',timeout:90000});
  if(result.error||result.status!==0)throw Error('Pinned JD source checkout failed (no data or credentials logged).');
  return result.stdout.trim();
};
try{
  const clone=path.join(scratch,'repo');
  git(['clone','--depth','1','--quiet',repoURL,clone]);
  const actual=git(['-C',clone,'rev-parse','HEAD']);
  if(actual!==pinned)throw Error('JD upstream has changed; refusing to import unreviewed source.');
  if(fs.existsSync(out))throw Error('JD recovery destination already exists; refusing to overwrite files.');
  for(const file of files) {
    const source=path.join(clone,file);
    if(!fs.statSync(source,{throwIfNoEntry:false})?.isFile())throw Error('Pinned JD snapshot missing required file: '+file);
  }
  const html=fs.readFileSync(path.join(clone,'index.html'),'utf8');
  if(!html.includes('<script src="app.js"></script>') || !files.slice(2).every(name=>html.includes('href="'+name+'"'))){
    throw Error('Pinned JD entry no longer matches the Staff build contract.');
  }
  fs.mkdirSync(out,{recursive:true});
  for(const file of files)fs.copyFileSync(path.join(clone,file),path.join(out,file));
  const assets=path.join(clone,'assets');
  if(!fs.statSync(assets,{throwIfNoEntry:false})?.isDirectory())throw Error('Pinned JD image assets are missing.');
  fs.mkdirSync(path.join(out,'assets'),{recursive:true});
  for(const item of fs.readdirSync(assets,{withFileTypes:true})){
    if(!item.isFile()||!/\.(png|jpg|jpeg|webp|svg)$/i.test(item.name))throw Error('Unexpected recovery asset in pinned source.');
    fs.copyFileSync(path.join(assets,item.name),path.join(out,'assets',item.name));
  }
  console.log('Recovered pinned JD application source in temporary CI directory; encrypted archive remains untouched.');
}finally{
  fs.rmSync(scratch,{recursive:true,force:true});
}
