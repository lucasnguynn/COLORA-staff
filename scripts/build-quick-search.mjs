import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

/*
 * Search is an index of PUBLIC EDUCATIONAL REFERENCES, not verified inventory.
 * Do not include JD drafts, accounts, supplier records, costs, HR information
 * or any private file. This output is publicly downloadable on GitHub Pages.
 */
export function makeSearchIndex(root){
  const readJson=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
  const readGlobal=(p,key)=>{
    const context={window:{}};
    vm.runInNewContext(fs.readFileSync(path.join(root,p),'utf8'),context,{timeout:1200});
    return context.window[key];
  };
  const index=[];
  const plain=value=>String(value||'').replace(/[\u2013\u2014]/g,'-').replace(/[\r\n\t]+/g,' ').replace(/\s{2,}/g,' ').trim();
  const put=(id,kind,title,summary,terms,route,priority=1)=>{
    if(!id||!title||!route||/[<>]/.test(route))throw Error('Invalid search index entry');
    index.push({id,kind,title:plain(title),summary:plain(summary).slice(0,380),
      terms:plain(terms).slice(0,3200),route,priority,
      status:'Tài liệu học tập - kiểm tra hồ sơ đúng SKU và chính sách trước khi báo khách'});
  };
  const library=readGlobal('site/library.js','COLORA_LIBRARY');
  for(const a of library)put('library-'+a.id,'Thư viện',a.title,a.summary,
    [a.category,...(a.tags||[]),...(a.sections||[]).flatMap(s=>[s.title,...(s.body||[]),...(s.points||[])])].join(' '),
    'library/'+encodeURIComponent(a.id),2);

  const lessons=readJson('modules/learning/data/lessons.json');
  for(const a of lessons)put('learning-'+a.id,'Learning Studio',a.title,a.subtitle,
    [a.learning_objective,...(a.points||[])].join(' '),
    a.id==='14'?'learning/portfolio':'learning/learn',2);

  const portfolio=readJson('modules/learning/data/colora-gemstones.json');
  for(const g of portfolio.gems)put('gem-'+g.id,'9 dòng đá COLORA',g.name,
    g.family+' - Mohs '+g.mohs+'. '+g.benefit+'. '+g.caution,
    [g.color,g.family,g.mohs,g.benefit,g.caution,g.reply].join(' '),
    'learning/portfolio',4);
  put('portfolio-guide','9 dòng đá COLORA',portfolio.title,portfolio.memory,
    portfolio.criteria.map(c=>c.title+' '+c.detail+' '+c.remember).join(' '),
    'learning/portfolio',4);

  const colorGuide=portfolio.valueGuide;
  for(const gem of portfolio.gems){
    const x=colorGuide.gems[gem.id];
    put('gem-value-'+gem.id,'Giá trị màu đá',gem.name+' - Màu nào giá trị cao / thấp?',
      'Thường cao hơn: '+x.high+' Trung bình: '+x.mid+' Thường thấp hơn: '+x.lower,
      [gem.name,'màu sắc','giá trị cao thấp','tiêu chuẩn tuyển chọn','hue tone saturation',x.high,x.mid,x.lower,x.nuance,x.sourcing].join(' '),
      'learning/gem-value',5);
  }
  put('gem-value-rubric','Thang tuyển chọn COLORA','Thang tuyển chọn đá màu 100 điểm',
    'Màu sắc 40 điểm; độ trong 15; giác cắt 15; độ an toàn 10; minh bạch hồ sơ 15; phù hợp thiết kế 5. Đề xuất nội bộ, không phải chuẩn GIA.',
    ['hue tone saturation evenness grading màu giá trị tuyển chọn QC',...colorGuide.criteria.map(c=>c.title+' '+c.instruction)].join(' '),
    'learning/gem-value',5);

  const care=readGlobal('modules/client-care/content.js','COLORA_DATA');
  for(const a of care.lessons||[])put('care-lesson-'+a.id,'Client Care',a.title,a.summary,
    (a.sections||[]).map(s=>s.h+' '+s.p).join(' '),'client-care/learn',3);
  for(const a of care.scripts||[])put('care-script-'+a.id,'Kịch bản tư vấn',a.title,a.intent||a.reply||'',
    [a.type,a.intent,a.reply,a.check].join(' '),'client-care/scripts',3);
  for(const a of care.cases||[])put('care-case-'+a.id,'Case Lab',a.title,a.goal||a.scenario,
    [a.category,a.scenario,a.goal].join(' '),'client-care/case/'+a.id,3);

  const intel=readGlobal('modules/client-care/intelligence.js','COLORA_INTELLIGENCE');
  for(const g of intel.gems||[])put('care-gem-'+g.id,'Hồ sơ ngọc học',g.name,
    g.family+' - Mohs '+g.mohs+'. '+g.caution,
    [g.family,g.toughness,g.wear,g.care,g.risk].join(' '),
    'client-care/stone/'+g.id,3);
  for(const a of intel.conversations||[])put('care-answer-'+a.id,'Tư vấn đá',a.question,
    a.reply,[a.question,a.reply,a.avoid].join(' '),
    'client-care/intelligence',3);
  // Only approved public records, if present. The library presently has none.
  const approved=readGlobal('modules/client-care/data/approved-public.js','COLORA_PUBLIC_RELEASES');
  for(const a of approved.products||[]){
    if(a.status!=='approved'||!a.id||!a.title)continue;
    put('approved-product-'+a.id,'Hồ sơ đã duyệt',a.title,a.summary||'',
      [a.sku,a.name,a.summary].join(' '),'client-care/catalog',5);
  }
  for(const a of approved.policies||[]){
    if(a.status!=='approved'||!a.id||!a.title)continue;
    put('approved-policy-'+a.id,'Chính sách đã duyệt',a.title,a.summary||'',
      [a.summary,a.version,a.effectiveDate].join(' '),'client-care/resources',5);
  }
  const ids=new Set();
  for(const a of index){
    if(ids.has(a.id))throw Error('Duplicate search ID '+a.id);
    ids.add(a.id);
  }
  const output={version:1,generatedFrom:'COLORA public education source files',items:index};
  // Keep output JS inert. No remote calls, no external third-party engine.
  return '/* Public, non-sensitive training search index. Not verified SKU data. */\n'+
    'window.COLORA_SEARCH_INDEX = '+JSON.stringify(output).replace(/</g,'\\u003c')+';\n';
}
