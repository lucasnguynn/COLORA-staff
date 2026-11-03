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
  const scopeFor=kind=>{
    if(['Công cụ','Trang Staff','Cài đặt Email','Brand & Packaging'].includes(kind))return 'tools';
    if(['Operations Playbook'].includes(kind))return 'operations';
    if(['Mẫu email','Mẫu biểu'].includes(kind))return 'templates';
    if(['Client Care','Kịch bản tư vấn','Case Lab','Hồ sơ ngọc học','Tư vấn đá','Hồ sơ đã duyệt','Chính sách đã duyệt'].includes(kind))return 'care';
    return 'knowledge';
  };
  const put=(id,kind,title,summary,terms,route,priority=1,meta={})=>{
    if(!id||!title||!route||/[<>]/.test(route))throw Error('Invalid search index entry');
    index.push({id,kind,title:plain(title),summary:plain(summary).slice(0,380),
      terms:plain(terms).slice(0,3200),route,priority,
      scope:meta.scope||scopeFor(kind),access:meta.access||'all',
      status:meta.status||'Tài liệu tham khảo - kiểm tra thông tin đã duyệt trước khi áp dụng'});
  };
  // Only a public navigation map; no account, encrypted JD content or supplier files.
  const entry=(id,kind,title,summary,terms,route,priority=7,meta={})=>
    put(id,kind,title,summary,terms,route,priority,meta);
  const nav=[
    ['home','Trang Staff','Tổng quan Staff Workspace','Mở trang chủ và tất cả khu vực của COLORA.','trang chu home staff dashboard workspace bat dau','home'],
    ['library','Trang Staff','Resource Library - Thư viện tài liệu','Kiến thức nền tảng về COLORA, thiết kế và khách hàng.','tai lieu kien thuc document resource library','library'],
    ['operations','Công cụ','Operations Playbook','Tra cứu quy trình công việc và tải biểu mẫu.','sop quy trinh mua hang supplier agency budget cad qc','operations'],
    ['brand-guide','Công cụ','Brand & Packaging','Xem logo, pattern, moodboard và bộ bao bì COLORA.','brand identity logo pattern moodboard packaging guideline nhan dien','brand-guide'],
    ['learning','Công cụ','Learning Studio','Học kiến thức, luyện tập, ôn câu sai và làm bài kiểm tra.','on tap hoc bai tap quiz qna 303 cau exam','learning/learn'],
    ['learning-portfolio','Công cụ','9 dòng đá màu - Learning Studio','Tra cứu hình ảnh và đặc điểm chín dòng đá màu trong chương trình học.','gemstones ruby sapphire spinel topaz peridot tourmaline garnet aquamarine citrine','learning/portfolio'],
    ['learning-gem-value','Công cụ','Giá trị màu đá và cách tuyển chọn','Thư viện giáo dục về màu đá và nguồn đá.','hue tone saturation da mau gia tri giac cat','learning/gem-value'],
    ['learning-review','Công cụ','Ôn câu sai - Learning Studio','Mở phần ôn tập và kiểm tra lại câu đã trả lời.','review spaced repetition on cau sai','learning/review'],
    ['learning-exam','Công cụ','Bài thi tổng kết - Learning Studio','Bài tự đánh giá kiến thức, không phải chứng nhận năng lực.','test exam thi tong ket trac nghiem','learning/exam'],
    ['learning-profile','Công cụ','Hồ sơ học tập và tiến độ','Xem tiến độ tự học lưu trong trình duyệt.','tien do ho so ca nhan diem thi','learning/profile'],
    ['client-care','Công cụ','Client Care Academy','Kiến thức và mô phỏng chăm sóc khách hàng.','cskh client care khach hang academy','client-care/learn'],
    ['client-care-scripts','Công cụ','Thư viện kịch bản tư vấn','Mở các mẫu lời nhắn để chỉnh và sao chép.','tin nhan kich ban reply script giao tiep','client-care/scripts'],
    ['client-care-cases','Công cụ','Case Lab - Tình huống thực hành','Luyện xử lý tình huống CSKH.','case lab roleplay tinh huong thuc hanh','client-care/cases'],
    ['client-care-intelligence','Công cụ','Product Intelligence','Kiến thức đá quý và cách tư vấn có bằng chứng.','ngoc hoc chat lieu da quy mica gem','client-care/intelligence'],
    ['client-care-catalog','Công cụ','Hồ sơ sản phẩm - Client Care','Vào khu vực hồ sơ sản phẩm. Chỉ tin các SKU đã duyệt.','san pham sku gia ton kho passport','client-care/catalog'],
    ['client-care-resources','Công cụ','Chính sách và nguồn tham khảo - Client Care','Đối chiếu các chính sách đã được phê duyệt trước khi tư vấn.','bao hanh shipping doi tra refund chinh sach','client-care/resources'],
    ['client-care-practice','Công cụ','Luyện tập CSKH','Bài tập chăm sóc khách hàng.','practice client care quiz','client-care/practice'],
    ['client-care-exam','Công cụ','Bài kiểm tra CSKH','Mở bài đánh giá tự học Client Care.','thi kiem tra cskh final assessment','client-care/exam'],
    ['client-care-progress','Công cụ','Tiến độ học Client Care','Xem tiến độ học và kết quả lưu trên máy.','progress tien do cskh','client-care/progress'],
    ['qr','Công cụ','QR Generator','Tạo, xem trước và tải QR mang nhận diện COLORA.','tao ma qr code png svg logo qr generator','qr'],
    ['signature','Công cụ','Email Signature','Tạo và sao chép chữ ký email theo nhận diện COLORA.','chu ky email tao signature cai chu ky','signature'],
    ['email-templates','Công cụ','Email Templates','Mở thư viện email mẫu dành cho khách hàng và nội bộ.','mau email tin nhan noi bo soan thu','email-templates'],
    ['mail-setup','Công cụ','Cài đặt Email - BKNS','Hướng dẫn cấu hình hộp thư và kết nối ứng dụng.','email setup mailbox imap smtp bkns webmail outlook apple','mail-setup/outlook'],
    ['mail-outlook','Cài đặt Email','Thiết lập Outlook for Mac','Hướng dẫn từng bước cài tài khoản email COLORA trong Outlook.','outlook microsoft mac imap smtp may chu them tai khoan','mail-setup/outlook'],
    ['mail-apple','Cài đặt Email','Thiết lập Apple Mail','Hướng dẫn cài tài khoản email COLORA trong Apple Mail.','apple mac mail imap smtp may chu them tai khoan','mail-setup/apple']
  ];
  for(const x of nav)entry('nav-'+x[0],x[1],x[2],x[3],x[4],x[5],8);
  // Senior JD is a NAVIGATION entry only. No JD text, archive, draft or metadata
  // from encrypted bundles may ever be part of the public search index.
  entry('nav-jd','Công cụ','JD Library - Senior','Soạn và quản lý Job Description trong khu vực dành riêng cho Senior.','jd mo ta cong viec job description senior','jd',8,{access:'senior'});

  const identity=[
    ['identity-logo','Logo và Brand Identity','Cách sử dụng biểu trưng và nhận diện chính thức.','logo logotype brand identity master visual'],
    ['identity-pattern','Pattern COLORA','Nguyên tắc họa tiết, bố cục và kích thước pattern.','pattern facets shape hoa tiet'],
    ['identity-moodboard','Moodboard và Media Direction','Tư liệu hình ảnh, tone ánh sáng, chủ thể bàn tay và moodboard.','moodboard hands anh chup media tone visual'],
    ['identity-packaging','Packaging COLORA','Hộp trang sức, outer box, túi giấy, shipping box và dự kiến bao bì.','hop trang suc tui giay shipping box outer box bao bi ivory']
  ];
  // Pull only public on-screen identity text from the existing index.html
  // instead of maintaining a second manual copy of brand claims.
  const shellHtml=fs.readFileSync(path.join(root,'site/index.html'),'utf8');
  for(let i=0;i<identity.length;i++){
    const [id,title,summary,aliases]=identity[i];
    const from=shellHtml.indexOf('id="'+id+'"');
    const next=i+1<identity.length?shellHtml.indexOf('id="'+identity[i+1][0]+'"',from+1):shellHtml.indexOf('<section id="operations"',from+1);
    const html=from>=0?shellHtml.slice(from,next>from?next:from+3000):'';
    const safeText=html.replace(/<script[\s\S]*?<\/script>/gi,' ')
      .replace(/<style[\s\S]*?<\/style>/gi,' ')
      .replace(/<[^>]*>/g,' ').replace(/https?:\/\/\S+/g,' ');
    entry('brand-'+id,'Brand & Packaging',title,summary,aliases+' '+safeText,'brand-guide/'+id,7);
  }

  const emailSource=fs.readFileSync(path.join(root,'site/email-templates.js'),'utf8');
  const emailStart=emailSource.indexOf('const TEMPLATES=');
  const emailEnd=emailSource.indexOf('\n];',emailStart);
  if(emailStart<0||emailEnd<0)throw Error('Cannot extract public email template list');
  const emailLiteral=emailSource.slice(emailStart+'const TEMPLATES='.length,emailEnd+2);
  const emailContext={window:{}};
  vm.runInNewContext('window.emailTemplates='+emailLiteral,emailContext,{timeout:1200});
  if(!Array.isArray(emailContext.window.emailTemplates))throw Error('Email template list missing');
  for(const t of emailContext.window.emailTemplates){
    entry('email-'+t.id,'Mẫu email',t.title,t.note||'Mẫu email có thể chỉnh sửa trước khi gửi.',
      [t.group,t.note,t.subject,String(t.body||'').replace(/https?:\/\/\S+/g,' ')].join(' '),
      'email-templates/'+t.id,6,{access:t.audience==='senior'?'senior':'all'});
  }

  const library=readGlobal('site/library.js','COLORA_LIBRARY');
  for(const a of library)put('library-'+a.id,'Thư viện',a.title,a.summary,
    [a.category,...(a.tags||[]),...(a.sections||[]).flatMap(s=>[s.title,...(s.body||[]),...(s.points||[])])].join(' '),
    'library/'+encodeURIComponent(a.id),2);

  const operations=readGlobal('site/operations-data.js','COLORA_OPERATIONS');
  for(const p of operations.procedures)put('operations-'+p.id,'Operations Playbook',p.title,
    p.trigger+' - Dự thảo chờ phê duyệt nội bộ.',
    [p.group,p.owner,p.decision,...p.steps.map(x=>x.action+' '+x.evidence),...p.redFlags,...p.records].join(' '),
    'operations/'+p.id,7);

  const lessons=readJson('modules/learning/data/lessons.json');
  for(const a of lessons)put('learning-'+a.id,'Learning Studio',a.title,a.subtitle,
    [a.learning_objective,...(a.points||[])].join(' '),
    'learning/chapter/'+a.id,4);

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
    (a.sections||[]).map(s=>s.h+' '+s.p).join(' '),'client-care/lesson/'+a.id,4);
  for(const a of care.scripts||[])put('care-script-'+a.id,'Kịch bản tư vấn',a.title,a.intent||a.reply||'',
    [a.type,a.intent,a.reply,a.check].join(' '),'client-care/scripts/'+a.id,4);
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
  // Make the entire 303-question public learning bank discoverable without
  // copying answer keys or confidential assessments into search snippets.
  const questionPaths=[
    'modules/learning/data/questions.json','modules/learning/data/gem-13.json',
    'modules/learning/data/gem-14.json','modules/learning/data/gem-15.json',
    'modules/learning/data/gem-16.json','modules/learning/data/care-17.json',
    'modules/learning/data/applied-cases.json'
  ];
  const bank=questionPaths.flatMap(readJson);
  if(bank.length!==303)throw Error('Unexpected public learning question count '+bank.length);
  for(const q of bank){
    put('question-'+q.id,'Câu hỏi luyện tập',q.q,
      'Chương '+q.chapter+' - '+q.topic+'. Mở đúng câu trong Learning Studio để tự luyện.',
      [q.id,q.role,q.pillar,q.topic,q.q,q.why,q.apply].join(' '),
      'learning/question/'+q.id,1);
  }

  const ids=new Set();
  for(const a of index){
    if(ids.has(a.id))throw Error('Duplicate search ID '+a.id);
    ids.add(a.id);
  }
  const output={version:2,generatedFrom:'Public COLORA Staff modules, tools and approved/public training files',items:index};
  // Keep output JS inert. No remote calls, no external third-party engine.
  return '/* Public, non-sensitive training search index. Not verified SKU data. */\n'+
    'window.COLORA_SEARCH_INDEX = '+JSON.stringify(output).replace(/</g,'\\u003c')+';\n';
}
