import assert from 'node:assert/strict';
import vm from 'node:vm';
import {makeSearchIndex} from '../scripts/build-quick-search.mjs';

const code=makeSearchIndex(process.cwd());
const ctx={window:{}};
vm.runInNewContext(code,ctx,{timeout:1500});
const items=ctx.window.COLORA_SEARCH_INDEX?.items;
assert(Array.isArray(items)&&items.length>50,'Cross-module search index must cover multiple libraries');
assert.equal(new Set(items.map(x=>x.id)).size,items.length,'Duplicate search entry');
const kinds=new Set(items.map(x=>x.kind));
for(const k of ['Thư viện','Learning Studio','Client Care','Kịch bản tư vấn','9 dòng đá COLORA','Hồ sơ ngọc học'])
 assert(kinds.has(k),'Missing search category '+k);
for(const id of ['gem-ruby','gem-spinel','gem-tourmaline','gem-peridot'])
 assert(items.some(x=>x.id===id),'Missing core gemstone '+id);
for(const x of items){
 assert(x.route&&!x.route.includes('jd')&&!x.route.includes('account'),'Forbidden search route '+x.id);
 assert(x.status.includes('kiểm tra hồ sơ'),'Unreviewed search item marked as verified '+x.id);
 assert(x.summary.length<400&&x.terms.length<=3200,'Unbounded entry '+x.id);
}
assert(!code.includes('COLORA_ACCOUNT_CREDENTIALS_JSON'));
assert(!code.includes('SENIOR_JD_PASSWORD'));
assert(!code.includes('PRIVATE KEY'));
assert(!code.includes('bundled-jd'));
console.log('PASS public safe search index: '+items.length+' entries across '+kinds.size+' sources');
