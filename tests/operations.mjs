import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync('site/operations-data.js','utf8'),ctx,{timeout:1500});
const D=ctx.window.COLORA_OPERATIONS;
assert(D&&Array.isArray(D.procedures)&&D.procedures.length===20,'Operations V3 must have 20 practical situations');
assert.equal(D.status,'DRAFT_FOR_FOUNDER_APPROVAL','No false SOP approvals');
assert.equal(D.rubric,undefined,'No preassigned supplier score criteria');
assert.equal(D.gates,undefined,'No imposed supplier ranking gates');
assert.equal(new Set(D.procedures.map(x=>x.id)).size,20,'Unique SOP routes');
for(const p of D.procedures){
  assert(p.title&&p.trigger&&p.owner&&p.steps.length>=3&&p.steps.length<=5&&p.redFlags.length>=2&&p.records.length>=2&&p.decision&&p.approver&&p.action&&Array.isArray(p.next)&&p.status==='draft','Incomplete SOP '+p.id);
}
assert(D.procedures.some(p=>p.id==='purchase-intake'&&p.steps.some(s=>s.action.includes('5 nhà cung cấp'))),'Five-supplier sourcing missing');
assert(D.procedures.some(p=>p.id==='budget-overrun'&&p.decision.includes('chưa mua')),'Budget approval control missing');
assert(D.procedures.some(p=>p.id==='media-agency-execution'),'Agency execution SOP missing');
assert.equal(D.entryPoints.length,6,'Six action-first situations required');
for(const e of D.entryPoints)assert(D.procedures.some(p=>p.id===e.id),'Unknown entry point '+e.id);
for(const p of D.procedures){
 for(const next of p.next)assert(D.procedures.some(x=>x.id===next),'Invalid next-step '+p.id+' / '+next);
 assert(['template','download','route'].includes(p.action.type),'Invalid action '+p.id);
}
for(const id of ['design-cad-request','cad-review','sample-revision','qc-sku-release','supplier-delay','agency-revision','website-publish'])assert(D.procedures.some(p=>p.id===id),'Missing practical COLORA situation '+id);
assert(D.sources.length>=4,'Official legal references missing');
assert(!/[–—]/.test(fs.readFileSync('site/operations-data.js','utf8')),'Only hyphens in SOP');
assert(!fs.readFileSync('site/operations-data.js','utf8').includes('@colora.vn'),'No actual staff addresses in source');
console.log('PASS Operations V3: 20 practical workflows, 6 situations, verified actions and next steps, no scores');