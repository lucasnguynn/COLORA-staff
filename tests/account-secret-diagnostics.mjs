// Ensure failed GitHub Actions logs pinpoint errors WITHOUT exposing identities,
// passwords, email addresses, or any portion of secret config.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const accounts=[
 {email:'synthetic-1@colora.vn',password:'A_LONG_STRONG_SYNTHETIC_PASSWORD_001',role:'staff'},
 {email:'synthetic-2@colora.vn',password:'seven77',role:'staff'},
 {email:'synthetic-3@colora.vn',password:'A_LONG_STRONG_SYNTHETIC_PASSWORD_001',role:'staff'},
 {email:'synthetic-4@colora.vn',password:'A_LONG_STRONG_SYNTHETIC_PASSWORD_004',role:'senior'},
 {email:'synthetic-5@colora.vn',password:'A_LONG_STRONG_SYNTHETIC_PASSWORD_005',role:'senior'}
];
const result=spawnSync(process.execPath,['scripts/build-account-release.mjs'],{
 encoding:'utf8',env:{...process.env,COLORA_ACCOUNT_CREDENTIALS_JSON:JSON.stringify(accounts),COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON:''}
});
assert.notEqual(result.status,0,'Unsafe credentials must fail closed');
assert.match(result.stderr,/Account #2: password must contain at least 8 characters/);
assert.match(result.stderr,/Account #3: password duplicates another account/);
for(const account of accounts){
 assert(!result.stderr.includes(account.email),'Email leaked to workflow log');
 assert(!result.stderr.includes(account.password),'Password leaked to workflow log');
}
console.log('PASS: Invalid credentials report only numbered account issues and no private values.');
