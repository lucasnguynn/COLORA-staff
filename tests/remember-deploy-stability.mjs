/* Release safety: when account credentials are unchanged, the previous
 * random KDF salt + opaque ID must survive a normal redeploy so remembered
 * browser keys remain usable. AES-GCM IV MUST rotate for every new ciphertext.
 * This test never knows real COLORA emails or passwords.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const priorPath=process.argv[2];
const oldDir=process.argv[3];
if(!priorPath||!oldDir)throw Error('Missing prior public manifest and ciphertext snapshot');
const old=JSON.parse(fs.readFileSync(priorPath,'utf8'));
const pub=path.resolve('account-release/public');
const next=JSON.parse(fs.readFileSync(path.join(pub,'account-entries.json'),'utf8'));
assert.equal(old.entries.length,5);
assert.equal(next.entries.length,5);
for(let index=0;index<5;index++){
  const prev=old.entries[index],current=next.entries[index];
  assert.equal(current.id,prev.id,'Unchanged employee envelope ID should survive redeploy');
  assert.equal(current.salt,prev.salt,'Unchanged employee KDF salt should survive redeploy');
  assert.equal(current.verifier,prev.verifier,'Same email and password should preserve KDF verifier');
  const oldEnvelope=JSON.parse(fs.readFileSync(path.join(oldDir,prev.id+'.json'),'utf8'));
  const newEnvelope=JSON.parse(fs.readFileSync(path.join(pub,'account-files',current.id+'.json'),'utf8'));
  assert.notEqual(newEnvelope.iv,oldEnvelope.iv,'AES-GCM IV must be fresh every build');
  assert.notEqual(newEnvelope.ciphertext,oldEnvelope.ciphertext,'New encrypted document must be regenerated');
}
console.log('PASS: Five encrypted accounts retain stable ID/KDF salts across deployments with fresh GCM IVs.');
