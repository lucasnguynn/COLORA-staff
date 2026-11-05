import assert from 'node:assert/strict';
import {readAccountRoster} from '../scripts/account-roster.mjs';
const base=[
 {email:'test-a@colora.vn',password:'test-strong-A-0001',role:'staff'},
 {email:'test-b@colora.vn',password:'test-strong-B-0002',role:'staff'},
 {email:'test-c@colora.vn',password:'test-strong-C-0003',role:'staff'},
 {email:'test-d@colora.vn',password:'test-strong-D-0004',role:'senior'},
 {email:'test-e@colora.vn',password:'test-strong-E-0005',role:'senior'}
];
const original=JSON.stringify(base);
const extra={email:'synthetic-added@colora.vn',password:'synthetic-addon-secret-0006',role:'staff'};
const baseline=readAccountRoster({COLORA_ACCOUNT_CREDENTIALS_JSON:original});
assert.equal(baseline.length,5);
assert.deepEqual(baseline,base,'Original five accounts must remain unchanged');
const extended=readAccountRoster({
 COLORA_ACCOUNT_CREDENTIALS_JSON:original,
 COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON:JSON.stringify(extra)
});
assert.equal(extended.length,6);
assert.deepEqual(extended.slice(0,5),base,'Adding Staff must not mutate existing identities');
assert.deepEqual(extended[5],extra);
for(const invalid of ['invalid JSON','[]',JSON.stringify({...extra,role:'senior'})]){
 assert.throws(()=>readAccountRoster({
  COLORA_ACCOUNT_CREDENTIALS_JSON:original,
  COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON:invalid
 }));
}
assert.throws(()=>readAccountRoster({
 COLORA_ACCOUNT_CREDENTIALS_JSON:JSON.stringify(base.slice(0,4)),
 COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON:JSON.stringify(extra)
}));
console.log('PASS: optional sixth Staff member; original five unchanged; malformed/privileged extras rejected.');
