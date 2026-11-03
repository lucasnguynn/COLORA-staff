import assert from 'node:assert/strict';
import vm from 'node:vm';
import {makeSearchIndex} from '../scripts/build-quick-search.mjs';

const code=makeSearchIndex(process.cwd());
const ctx={window:{}};
vm.runInNewContext(code,ctx,{timeout:1500});
const items=ctx.window.COLORA_SEARCH_INDEX?.items;
assert(Array.isArray(items)&&items.length>400,'Search must cover every module, public question and tool');
assert.equal(new Set(items.map(x=>x.id)).size,items.length,'Duplicate search entry');
const kinds=new Set(items.map(x=>x.kind));
for(const k of ['Thư viện','Learning Studio','Client Care','Kịch bản tư vấn','9 dòng đá COLORA','Hồ sơ ngọc học','Công cụ','Mẫu email','Operations Playbook','Câu hỏi luyện tập','Brand & Packaging'])
 assert(kinds.has(k),'Missing search category '+k);
for(const id of ['gem-ruby','gem-spinel','gem-tourmaline','gem-peridot','gem-value-ruby','gem-value-garnet','gem-value-tourmaline','gem-value-rubric'])
 assert(items.some(x=>x.id===id),'Missing core gemstone '+id);
assert.equal(items.filter(x=>x.kind==='Operations Playbook').length,20,'All operations SOPs searchable');
assert(items.some(x=>x.route==='operations/budget-overrun'));
assert(items.some(x=>x.route==='operations/cad-review'));
assert(items.some(x=>x.route==='operations/agency-revision'));
assert(items.some(x=>x.route==='operations/website-publish'));
assert.equal(items.filter(x=>x.kind==='Câu hỏi luyện tập').length,303,'Every public practice question should be searchable');
assert(items.filter(x=>x.kind==='Mẫu email').length>=10,'All email templates indexed');
for(const route of ['qr','signature','mail-setup/outlook','mail-setup/apple','brand-guide/identity-packaging','brand-guide/identity-pattern','client-care/scripts','client-care/lesson/brand','email-templates/inquiry','learning/question/FN-001','learning/chapter/01','operations/cad-review','client-care/cases'])
 assert(items.some(x=>x.route===route),'Missing searchable destination '+route);
assert(items.some(x=>x.route==='jd'&&x.access==='senior'),'JD navigation must be Senior-only metadata');
assert(items.some(x=>x.route==='email-templates/welcome'&&x.access==='senior'),'HR template must be Senior-only');
assert(items.some(x=>x.route==='email-templates/inquiry'&&x.access==='all'),'Staff email templates must be available');
for(const x of items){
 assert(x.route&&(x.route!=='jd'||x.access==='senior')&&!x.route.startsWith('jd/'),'Forbidden private JD route '+x.id);
 assert(x.access==='all'||x.access==='senior','Missing access metadata '+x.id);
 assert(['tools','operations','templates','knowledge','care'].includes(x.scope),'Missing category '+x.id);
 assert(x.status.includes('tham khảo'),'Search item incorrectly marked as approved '+x.id);
 assert(x.summary.length<400&&x.terms.length<=3200,'Unbounded entry '+x.id);
}
assert(items.some(x=>x.kind==='Giá trị màu đá'&&x.route==='learning/gem-value'));
assert(items.some(x=>x.kind==='Thang tuyển chọn COLORA'&&x.route==='learning/gem-value'));
assert(!code.includes('COLORA_ACCOUNT_CREDENTIALS_JSON'));
assert(!code.includes('SENIOR_JD_PASSWORD'));
assert(!code.includes('PRIVATE KEY'));
assert(!code.includes('bundled-jd'));
console.log('PASS comprehensive public-safe Staff search: '+items.length+' entries across '+kinds.size+' sources');
