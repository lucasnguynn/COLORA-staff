'use strict';
/* Public operations curriculum only. No real supplier, contract or customer input is persisted. */
window.COLORA_OPS_PLAYBOOK=(()=>{
  const D=window.COLORA_OPERATIONS;
  const root=document.getElementById('operations-root');
  if(!D||!root)return {open:()=>{}};
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'' :'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim();
  const roles=[
    ['Requester','Mô tả nhu cầu, spec, lý do và hồ sơ đề nghị. Không tự tạo cam kết.'],
    ['Department Lead','Chứng minh giá trị, duyệt phạm vi đề xuất và ưu tiên trong budget.'],
    ['Finance','Đối soát ngân sách, tổng chi phí, đối tác, tài khoản ngân hàng, hóa đơn và cash forecast.'],
    ['Product / QC / Brand','Xác nhận chuẩn kỹ thuật, hồ sơ đá/SKU, quyền media và điều kiện nghiệm thu.'],
    ['CEO / Authorized approver','Quyết định ngoại lệ, chi vượt và hợp đồng theo ma trận phân quyền đã ký duyệt.']
  ];
  const templates={
    purchase:{title:'Purchase Request - Nội dung cần điền',text:[
      'REQUEST ID: [Mã yêu cầu trong Drive bảo mật]',
      'DEPARTMENT / OWNER: [Phòng ban / người phụ trách]',
      'PURPOSE AND BUSINESS IMPACT: [Mục đích và lý do cần mua]',
      'SPEC / QUANTITY / ACCEPTANCE: [Tiêu chuẩn, số lượng, nghiệm thu]',
      'BUDGET LINE / REMAINING: [Chỉ lưu trong Sheet phân quyền]',
      'TARGET DELIVERY / RISK: [Mốc và rủi ro]',
      'FIVE SUPPLIERS SEARCH PLAN: [Cách tìm 5 nhà cung cấp]',
      'QUOTATION REGISTER LINK: [Đường dẫn Drive phân quyền]',
      'REQUEST FOR APPROVAL: [Chưa tạo PO trước khi được duyệt]'
    ].join('\n')},
    rfq:{title:'RFQ email - Yêu cầu báo giá thống nhất',text:[
      'Subject: COLORA - RFQ [Reference] - [Category]',
      'Chào anh/chị,',
      'COLORA đang tham khảo báo giá cho [hạng mục] theo yêu cầu kỹ thuật đính kèm.',
      'Vui lòng phản hồi: báo giá, số lượng/MOQ, thời gian, VAT, phí vận chuyển,',
      'thanh toán, thời hạn hiệu lực, quy trình đổi lỗi, chứng từ và mẫu khi cần.',
      'Đề nghị gửi báo giá bằng email doanh nghiệp từ người được ủy quyền.',
      'Hạn nhận báo giá: [ngày và giờ]. Phản hồi làm rõ sẽ được xác nhận qua email.',
      'Trân trọng,',
      '[Người phụ trách] | COLORA'
    ].join('\n')},
    exception:{title:'Budget Exception - Mẫu xin phê duyệt',text:[
      'SUBJECT: COLORA - Budget Exception Request - [Reference]',
      'Dự toán đã duyệt: [lưu trong Finance Sheet phân quyền]',
      'Đã chi / đã cam kết / còn lại: [đối soát riêng]',
      'Yêu cầu mới / phần vượt: [số liệu trong file phân quyền]',
      'Lý do và mức độ khẩn cấp: ...',
      'Phương án 1 - giảm scope / hoãn lịch: ...',
      'Phương án 2 - đàm phán / vendor khác: ...',
      'Tác động dòng tiền và deadline: ...',
      'Xác nhận từ Department Lead: ...',
      'Rà soát Finance: ...',
      'Người có quyền quyết định và phạm vi phê duyệt: ...',
      'Không cam kết hoặc đặt cọc trước khi duyệt.'
    ].join('\n')},
    agency:{title:'Media Agency Brief - Thông tin tối thiểu',text:[
      'PROJECT / OWNER / DATE: ...',
      'GOAL: [Awareness / product education / launch / conversion]',
      'AUDIENCE / INSIGHT: ...',
      'COLORA BRAND DNA: gemstone-first, quiet luxury, hands as hero',
      'SCOPE: [Video / macro photos / editing / media buying / reporting]',
      'DELIVERABLES & SPECS: [Số lượng, ratio, raw/master, định dạng]',
      'TIMELINE / APPROVAL ROUNDS: ...',
      'BUDGET CAP: [Chỉ chia sẻ qua Drive/email được phân quyền]',
      'AGENCY SERVICE FEE VS MEDIA SPEND: [Tách riêng]',
      'KPI / ATTRIBUTION / REPORT CADENCE: ...',
      'IP / LICENSE / TALENT RELEASE / MUSIC / STOCK: ...',
      'ACCOUNT OWNERSHIP / ACCESS / DATA HANDLING: ...',
      'CHANGE REQUEST / OFFBOARDING / ACCEPTANCE: ...'
    ].join('\n')},
    meeting:{title:'Negotiation recap - Mẫu email xác nhận',text:[
      'Subject: COLORA - Meeting Recap - [Supplier] - [Reference]',
      'Ngày họp / đại diện của hai bên: ...',
      'Scope / báo giá version đang trao đổi: ...',
      'Các điểm đã thống nhất về nguyên tắc: ...',
      'Các điểm chưa thống nhất / đề xuất: ...',
      'Ảnh hưởng đến giá, timeline, QC, IP hoặc payment: ...',
      'Người phụ trách / hạn phản hồi: ...',
      'Vui lòng xác nhận hoặc ghi rõ điểm cần sửa bằng email.',
      'Lưu ý: recap không thay thế phụ lục hợp đồng có hiệu lực.'
    ].join('\n')}
  };
  let group='all',query='',active=null;
  function btn(text,attrs=''){return '<button type="button" '+attrs+'>'+e(text)+'</button>'}
  function csvRow(values){return values.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')+'\r\n'}
  function getCsv(){
    const cols=['Supplier code','Legal entity','Verified identity / email','Quote date','Currency','Unit price','Quantity','Subtotal','Freight','Nonrecoverable import/tax','Comparable landed cost','Payment terms','Lead days','Quote valid until',
      ...D.rubric.map(r=>r.title+' (1-5)'),'Weighted score /100','Hard gates (PASS/HOLD)','Reviewer notes','Reviewed by','Approval reference'];
    let csv='\ufeff'+csvRow(cols);
    for(let n=2;n<=6;n++){
      const row=Array(cols.length).fill('');
      row[0]='S'+(n-1);
      row[7]='=IF(OR(F'+n+'="",G'+n+'=""),"",F'+n+'*G'+n+')';
      row[10]='=IF(H'+n+'="","",SUM(H'+n+',I'+n+',J'+n+'))';
      row[21]='=IF(COUNT(O'+n+':U'+n+')<7,"",ROUND(SUMPRODUCT(O'+n+':U'+n+',{25,20,15,15,10,10,5})/5,1))';
      row[22]='HOLD';
      csv+=csvRow(row);
    }
    return csv;
  }
  function download(){
    const url=URL.createObjectURL(new Blob([getCsv()],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');a.href=url;a.download='COLORA_Supplier_Comparison_5_Vendors_TEMPLATE.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    const msg=document.getElementById('operations-status');if(msg)msg.textContent='Đã tạo CSV mẫu trống cho 5 nhà cung cấp. Nhập vào Google Sheets được phân quyền và kiểm tra công thức, định dạng số theo locale.';
  }
  function header(){
    return '<div class="ops-hero"><div class="ops-kicker">COLORA / OPERATIONS & GOVERNANCE</div>'+
      '<h1>Work with <em>clarity.</em></h1><p>Hướng dẫn công việc từ đề nghị chi phí, lựa chọn nhà cung cấp, đàm phán đến nghiệm thu, truyền thông và bàn giao.</p>'+
      '<div class="ops-hero-meta"><span>13 quy trình thực hành</span><span>5 nhà cung cấp tối thiểu</span><span>Dự thảo - chờ duyệt nội bộ</span></div></div>'+
      '<p class="ops-important"><strong>Trạng thái:</strong> '+e(D.notice)+' '+e(D.security)+'</p>';
  }
  function groups(){
    return ['all',...new Set(D.procedures.map(x=>x.group))];
  }
  function filterView(){
    const filtered=D.procedures.filter(p=>{
      if(group!=='all'&&p.group!==group)return false;
      const words=norm([p.title,p.trigger,p.owner,p.group,p.decision,...p.steps.map(x=>x.action),...p.redFlags].join(' '));
      return !query||words.includes(norm(query));
    });
    return '<div class="ops-section-title"><div class="ops-kicker">PROCESS LIBRARY</div><h2>Tìm quy trình phù hợp</h2><p>Chọn tình huống, đọc từng bước và kiểm tra điều kiện cần trước khi hành động.</p></div>'+
      '<label class="ops-search-label" for="operations-search">Tìm theo công việc hoặc tình huống</label>'+
      '<input class="ops-search" id="operations-search" type="search" autocomplete="off" placeholder="Ví dụ: vượt ngân sách, agency, nhà cung cấp, hợp đồng..." value="'+e(query)+'">'+
      '<div class="ops-filters" aria-label="Nhóm quy trình">'+groups().map(g=>btn(g==='all'?'Tất cả':g,'data-ops-filter="'+e(g)+'" aria-pressed="'+(group===g)+'"')).join('')+'</div>'+
      '<p class="ops-count" role="status">'+filtered.length+' / '+D.procedures.length+' quy trình</p>'+
      '<div class="ops-cards">'+filtered.map((p,i)=>'<button type="button" class="ops-card" data-ops-open="'+e(p.id)+'">'+
        '<span class="ops-card-top">'+e(p.group)+' / '+String(i+1).padStart(2,'0')+'</span><strong>'+e(p.title)+'</strong>'+
        '<span>'+e(p.trigger)+'</span><span class="ops-card-action">Xem quy trình</span></button>').join('')+'</div>'+
      (filtered.length?'':'<p class="ops-empty">Không tìm thấy quy trình phù hợp. Thử từ khóa ngắn hơn.</p>');
  }
  function workflow(){
    return '<section class="ops-panel"><div class="ops-kicker">PURCHASE WORKFLOW</div><h2>Từ yêu cầu đến quyết toán</h2>'+
      '<div class="ops-timeline">'+D.stages.map((x,i)=>'<span><small>'+String(i+1).padStart(2,'0')+'</small>'+e(x)+'</span>').join('')+'</div>'+
      '<p class="ops-muted">Quy trình 5 nhà cung cấp là yêu cầu đề xuất của COLORA, không phải nghĩa vụ đấu thầu pháp lý áp dụng mặc định cho mọi doanh nghiệp.</p></section>';
  }
  function compare(){
    return '<section class="ops-panel" id="operations-compare"><div class="ops-kicker">TOOLS / GOOGLE SHEETS</div>'+
      '<div class="ops-panel-heading"><div><h2>Mẫu so sánh 5 nhà cung cấp</h2><p>Tải CSV trống, nhập vào Google Sheets riêng có phân quyền, lưu báo giá gốc và có reviewer độc lập.</p></div>'+btn('Tải CSV mẫu','data-ops-download')+'</div>'+
      '<div class="ops-table-wrap"><table class="ops-score-table"><thead><tr><th>Tiêu chí</th><th>Trọng số</th><th>Cách đánh giá</th></tr></thead><tbody>'+
      D.rubric.map(r=>'<tr><td>'+e(r.title)+'</td><td>'+r.weight+'/100</td><td>Cho 1-5 điểm dựa trên bằng chứng thực</td></tr>').join('')+
      '<tr class="ops-table-total"><td>Tổng</td><td>100/100</td><td>Điểm là tài liệu hỗ trợ, không thay thế phê duyệt</td></tr></tbody></table></div>'+
      '<div class="ops-mini-grid"><div><strong>Công thức điểm tại V2</strong><code>=IF(COUNT(O2:U2)&lt;7,"",ROUND(SUMPRODUCT(O2:U2,{25,20,15,15,10,10,5})/5,1))</code><p>Nhập điểm 1-5 vào O-U, sao chép xuống các dòng; dấu phân cách công thức có thể khác theo locale Google Sheets.</p></div>'+
      '<div><strong>Hard gates trước khi xếp hạng</strong><ol>'+D.gates.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol><p>Với bất kỳ gate nào chưa đạt, ghi HOLD; không chọn chỉ vì điểm cao hoặc giá thấp.</p></div></div>'+
      '<p class="ops-muted">Mẫu không chứa dữ liệu thật và không đồng bộ với Drive. Các số liệu, hợp đồng, tên vendor và thông tin thanh toán phải nằm trong Sheet được phân quyền.</p></section>';
  }
  function templatesView(){
    return '<section class="ops-panel"><div class="ops-kicker">READY TO ADAPT</div><h2>Mẫu biểu và email</h2><div class="ops-template-grid">'+
      Object.entries(templates).map(([id,t])=>'<article class="ops-template"><strong>'+e(t.title)+'</strong><pre>'+e(t.text)+'</pre>'+btn('Sao chép mẫu','data-ops-copy="'+e(id)+'"')+'</article>').join('')+'</div>'+
      '<p class="ops-muted">Sử dụng bản sao trong Drive công ty. Không dán bản chứa tên nhà cung cấp hoặc ngân sách thực trở lại mã nguồn Staff.</p></section>';
  }
  function governance(){
    return '<section class="ops-panel"><div class="ops-kicker">CONTROL FRAMEWORK</div><h2>Phân vai và nguyên tắc</h2>'+
      '<div class="ops-role-grid">'+roles.map(([role,detail])=>'<div><strong>'+e(role)+'</strong><p>'+e(detail)+'</p></div>').join('')+'</div>'+
      '<div class="ops-divider"></div><ol class="ops-principles">'+D.principles.map(x=>'<li>'+e(x)+'</li>').join('')+'</ol>'+
      '<p class="ops-muted">Chưa có ma trận hạn mức chi VND, tên người duyệt và quyền ký được phê duyệt trong hệ thống này. CEO / Finance cần ban hành riêng trước khi coi quy trình là SOP bắt buộc.</p></section>';
  }
  function sources(){
    return '<section class="ops-panel ops-source"><div class="ops-kicker">LEGAL REFERENCE</div><h2>Nguồn tham chiếu chính thức</h2>'+
      '<div class="ops-sources">'+D.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+e(x.url)+'"><strong>'+e(x.label)+'</strong><span>'+e(x.scope)+'</span></a>').join('')+'</div>'+
      '<p class="ops-muted">Dẫn chiếu pháp luật phục vụ tra cứu. Nội dung hợp đồng, thuế, dữ liệu và quảng cáo cần được người phụ trách đối chiếu trường hợp cụ thể và văn bản hiện hành.</p></section>';
  }
  function index(){
    return header()+filterView()+workflow()+compare()+governance()+templatesView()+sources()+'<p id="operations-status" class="ops-feedback" role="status" aria-live="polite"></p>';
  }
  function detail(p){
    return header()+'<div class="ops-back">'+btn('Quay về danh mục','data-ops-back')+'</div>'+
      '<section class="ops-detail"><div class="ops-kicker">'+e(p.group)+' / PROCESS</div><h2>'+e(p.title)+'</h2>'+
      '<p class="ops-lead">'+e(p.trigger)+'</p>'+
      '<div class="ops-owner"><strong>Người tham gia</strong><span>'+e(p.owner)+'</span></div>'+
      '<div class="ops-kicker">WORKFLOW / STEP BY STEP</div><ol class="ops-steps">'+p.steps.map((s,i)=>'<li>'+
        '<span class="ops-step-no">'+String(i+1).padStart(2,'0')+'</span><div><strong>'+e(s.action)+'</strong><p><b>Minh chứng / đầu ra:</b> '+e(s.evidence)+'</p></div></li>').join('')+'</ol>'+
      '<div class="ops-detail-grid"><div class="ops-risk"><div class="ops-kicker">STOP / ESCALATE</div><h3>Dấu hiệu cần dừng và báo cáo</h3><ul>'+p.redFlags.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul></div>'+
      '<div class="ops-records"><div class="ops-kicker">RECORDS & CONTROL</div><h3>Tài liệu cần lưu</h3><ul>'+p.records.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul><p><strong>Điều kiện quyết định:</strong> '+e(p.decision)+'</p></div></div></section>'+
      '<div class="ops-next">'+btn('Quay về toàn bộ quy trình','data-ops-back')+
      (['supplier-comparison','supplier-screening','purchase-intake','negotiation'].includes(p.id)?btn('Xem mẫu Sheets','data-ops-go-compare'):'')+'</div>'+
      '<p id="operations-status" class="ops-feedback" role="status" aria-live="polite"></p>';
  }
  function open(id=''){
    active=D.procedures.find(x=>x.id===id)||null;
    root.innerHTML=active?detail(active):index();
  }
  root.addEventListener('input',ev=>{
    if(ev.target.id!=='operations-search')return;
    const pos=ev.target.selectionStart;
    query=ev.target.value;
    // Only replace the result list and count; keep focus and caret in the search input.
    const view=document.createElement('div');view.innerHTML=filterView();
    const newCards=view.querySelector('.ops-cards'),oldCards=root.querySelector('.ops-cards');
    oldCards?.replaceWith(newCards);
    const newCount=view.querySelector('.ops-count'),oldCount=root.querySelector('.ops-count');
    if(newCount&&oldCount)oldCount.textContent=newCount.textContent;
    const oldEmpty=root.querySelector('.ops-empty');oldEmpty?.remove();
    const nextEmpty=view.querySelector('.ops-empty');if(nextEmpty)newCards?.after(nextEmpty);
    ev.target.setSelectionRange(pos,pos);
  });
  root.addEventListener('click',async ev=>{
    const a=ev.target.closest('[data-ops-filter],[data-ops-open],[data-ops-back],[data-ops-download],[data-ops-copy],[data-ops-go-compare]');
    if(!a)return;
    if(a.hasAttribute('data-ops-filter')){group=a.dataset.opsFilter;open();return;}
    if(a.hasAttribute('data-ops-open')){location.hash='operations/'+a.dataset.opsOpen;return;}
    if(a.hasAttribute('data-ops-back')){location.hash='operations';return;}
    if(a.hasAttribute('data-ops-go-compare')){location.hash='operations';requestAnimationFrame(()=>root.querySelector('#operations-compare')?.scrollIntoView({block:'start'}));return;}
    if(a.hasAttribute('data-ops-download')){download();return;}
    const t=templates[a.dataset.opsCopy];
    if(t){
      const msg=root.querySelector('#operations-status');
      try{await navigator.clipboard.writeText(t.text);if(msg)msg.textContent='Đã sao chép mẫu. Dùng trong Drive/email công ty theo đúng phân quyền.';}
      catch(_){if(msg)msg.textContent='Không thể tự sao chép trong trình duyệt này. Chọn nội dung mẫu và sao chép thủ công.';}
    }
  });
  open();
  return {open,version:D.version,templateColumns:26};
})();