import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('site/operations-data.js','utf8'),ctx,{timeout:1500});
const D=ctx.window.COLORA_OPERATIONS;
assert(D&&Array.isArray(D.procedures)&&D.procedures.length===13,'Operations must have 13 procedures');
assert.equal(D.status,'DRAFT_FOR_FOUNDER_APPROVAL','No false SOP approvals');
assert.equal(D.rubric,undefined,'No preassigned supplier score criteria');
assert.equal(D.gates,undefined,'No imposed supplier ranking gates');
assert.equal(new Set(D.procedures.map(x=>x.id)).size,13,'Unique SOP routes');
for(const p of D.procedures){
  assert(p.title&&p.trigger&&p.owner&&p.steps.length>=4&&p.redFlags.length>=2&&p.records.length>=2&&p.decision,'Incomplete SOP '+p.id);
}
assert(D.procedures.some(p=>p.id==='purchase-intake'&&p.steps.some(s=>s.action.includes('5 nhà cung cấp'))),'Five-supplier sourcing missing');
assert(D.procedures.some(p=>p.id==='budget-overrun'&&p.decision.includes('chưa mua')),'Budget approval control missing');
assert(D.procedures.some(p=>p.id==='media-agency-execution'),'Agency execution SOP missing');
assert(D.sources.length>=4,'Official legal references missing');
assert(!/[–—]/.test(fs.readFileSync('site/operations-data.js','utf8')),'Only hyphens in SOP');
assert(!fs.readFileSync('site/operations-data.js','utf8').includes('@colora.vn'),'No actual staff addresses in source');
console.log('PASS Operations: 13 concise SOPs, five-supplier sourcing, no scores, safe budget control');