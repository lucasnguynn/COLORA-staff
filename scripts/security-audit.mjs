#!/usr/bin/env node
// Prevent accidental commits of high-confidence credentials and dangerous
// file types BEFORE a repository PR is merged or a public Page is published.
// This is not a historical secret scan, a substitute for GitHub Secret
// Scanning, or an assurance that all sensitive information has been removed.
// Do not output secret values or the lines in which they were found.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const roots=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const forbiddenNames=[
 /(^|\/)\.env(?:\..+)?$/i,
 /(^|\/)(?:id_rsa|id_ed25519|secrets?\.(?:json|ya?ml)|credentials?\.(?:json|ya?ml))$/i,
 /\.(?:p12|pfx|pem|key|keystore|jks|sqlite3?|db|bak)$/i,
 /(^|\/)(?:account-release|dist|\.sources|node_modules)\//i
];
const secretPatterns=[
 {name:'private-key-material',re:/-----BEGIN (?:OPENSSH|RSA|EC|DSA|ENCRYPTED )?PRIVATE KEY-----/g},
 {name:'github-access-token',re:/(?:gh[pousr]_[A-Za-z0-9]{32,}|github_pat_[A-Za-z0-9_]{40,})/g},
 {name:'cloud-access-key',re:/AKIA[0-9A-Z]{16}/g},
 {name:'google-api-key',re:/AIza[0-9A-Za-z_-]{35}/g},
 {name:'slack-access-token',re:/xox[baprs]-[0-9A-Za-z-]{20,}/g},
 {name:'openai-access-token',re:/sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{36,}/g}
];

let scanned=0,failures=0;
for(const filename of roots){
 if(forbiddenNames.some(rx=>rx.test(filename))){
   console.error('BLOCK: forbidden tracked path ('+filename+')');
   failures++;
   continue;
 }
 const full=path.resolve(filename);
 if(!fs.existsSync(full) || !fs.statSync(full).isFile()){
   console.error('BLOCK: tracked source missing or is not regular file: '+filename);
   failures++;continue;
 }
 if(fs.statSync(full).size>1024*1024){
   console.error('REVIEW: large tracked file skipped in source-only credential audit: '+filename);
   continue;
 }
 const data=fs.readFileSync(full);
 if(data.includes(0) || data.subarray(0,2048).some(b=>b<9 || (b>13&&b<32)))continue;
 scanned++;
 const source=data.toString('utf8');
 for(const p of secretPatterns){
   p.re.lastIndex=0;
   if(p.re.test(source)){
     // Filename and category only, never the matching string, context or line.
     console.error('BLOCK: possible '+p.name+' in tracked file '+filename);
     failures++;
   }
 }
}
if(failures){
 console.error('Source credential audit failed ('+failures+' issue(s)). Rotate exposed credentials; deleting the latest commit is NOT enough to remove Git history.');
 process.exitCode=1;
}else console.log('PASS: '+scanned+' tracked text files have no recognized high-confidence credential patterns or forbidden secret paths.');
