'use strict';
/* Public operations curriculum only. No real supplier, contract or customer input is persisted. */
window.COLORA_OPS_PLAYBOOK=(()=>{
  const D=window.COLORA_OPERATIONS;
  const root=document.getElementById('operations-root');
  if(!D||!root)return {open:()=>{}};
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'' :'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().trim();
  const templates={
    purchase:{title:'Yêu cầu mua hàng',text:[
      'Cần mua: [Tên hàng / dịch vụ]',
      'Số lượng / yêu cầu: [...]',
      'Hạn cần: [...]',
      'Ngân sách dự kiến: [Ghi trong Sheet nội bộ]',
      'Người phụ trách: [...]',
      'Lý do cần mua: [...]'
    ].join('\n')},
    rfq:{title:'Email xin báo giá',text:[
      'Subject: COLORA - Yêu cầu báo giá [Hạng mục]',
      'Chào anh/chị,',
      'Bên mình cần báo giá cho [hạng mục], số lượng [số lượng].',
      'Nhờ anh/chị gửi giá, thời gian giao, phí khác nếu có, điều kiện thanh toán và cách xử lý hàng lỗi.',
      'Mong nhận báo giá qua email trước [ngày].',
      'Cảm ơn anh/chị.'
    ].join('\n')},
    exception:{title:'Xin duyệt vượt ngân sách',text:[
      'Subject: COLORA - Xin duyệt chi vượt ngân sách [Hạng mục]',
      'Ngân sách còn lại: [...]',
      'Khoản cần chi: [...]',
      'Số tiền vượt: [...]',
      'Lý do: [...]',
      'Phương án khác đã xem xét: [...]',
      'Đề nghị phê duyệt: [...]'
    ].join('\n')},
    agency:{title:'Brief media agency',text:[
      'Dự án / mục tiêu: [...]',
      'Sản phẩm và thông điệp: [...]',
      'Cần bàn giao: [Số ảnh / video / nội dung]',
      'Phong cách và ảnh tham khảo: [...]',
      'Deadline: [...]',
      'Ngân sách: [Trao đổi qua kênh được phân quyền]',
      'Phí agency và ngân sách quảng cáo: [Tách riêng]',
      'File gốc / quyền sử dụng / số vòng chỉnh sửa: [...]',
      'Người duyệt nội dung: [...]'
    ].join('\n')},
    meeting:{title:'Email tóm tắt sau đàm phán',text:[
      'Subject: COLORA - Xác nhận nội dung trao đổi [Hạng mục]',
      'Chào anh/chị,',
      'Mình gửi lại các điểm đã trao đổi hôm nay:',
      'Giá / phạm vi: [...]',
      'Thời hạn: [...]',
      'Thanh toán / bàn giao / xử lý lỗi: [...]',
      'Các điểm còn cần xác nhận: [...]',
      'Nhờ anh/chị phản hồi lại bằng email. Cảm ơn anh/chị.'
    ].join('\n')}
  };
  let group='all',query='',active=null;
  function btn(text,attrs=''){return '<button type="button" '+attrs+'>'+e(text)+'</button>'}
  function csvRow(values){return values.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')+'\r\n'}
  function getCsv(){
    // A deliberately blank five-supplier grid. Staff decide which rows matter.
    // No preset evaluation criteria, scores, weights, rankings or formulas.
    const cols=['Nội dung tự chọn','Nhà cung cấp 1','Nhà cung cấp 2','Nhà cung cấp 3','Nhà cung cấp 4','Nhà cung cấp 5','Ghi chú'];
    let csv='\ufeff'+csvRow(cols);
    for(let i=0;i<12;i++)csv+=csvRow(Array(cols.length).fill(''));
    return csv;
  }
  function download(){
    const url=URL.createObjectURL(new Blob([getCsv()],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');a.href=url;a.download='COLORA_So_sanh_5_nha_cung_cap_MAU_TRONG.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    const msg=document.getElementById('operations-status');if(msg)msg.textContent='Đã tải bảng trống cho 5 nhà cung cấp. Tự thêm nội dung cần so sánh trong Google Sheets.';
  }
  function downloadTracker(){
    const cols=['Mã yêu cầu','Bộ phận','Việc cần mua','Người phụ trách','Nhà cung cấp','Trạng thái','Việc tiếp theo','Hạn xử lý','Link hồ sơ','Ghi chú'];
    let csv='\ufeff'+csvRow(cols);
    for(let i=0;i<15;i++)csv+=csvRow(Array(cols.length).fill(''));
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const a=document.createElement('a');a.href=url;a.download='COLORA_Theo_doi_mua_hang_MAU_TRONG.csv';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    const msg=document.getElementById('operations-status');
    if(msg)msg.textContent='Đã tải bảng theo dõi trống. Tạo bản sao trong Sheets công ty để cập nhật công việc.';
  }
  function header(){
    return '<div class="ops-hero"><div class="ops-kicker">COLORA / OPERATIONS</div>'+
      '<h1>Work with <em>clarity.</em></h1><p>Chọn việc cần làm để xem các bước xử lý thực tế.</p>'+
      '<div class="ops-hero-meta"><span>13 hướng dẫn công việc</span><span>Ngắn gọn, dễ áp dụng</span></div></div>'+
      '<p class="ops-important"><strong>Lưu ý:</strong> '+e(D.notice)+' '+e(D.security)+'</p>';
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
  function compare(){
    return '<section class="ops-panel" id="operations-compare"><div class="ops-kicker">BIỂU MẪU / GOOGLE SHEETS</div>'+
      '<div class="ops-panel-heading"><div><h2>Bảng so sánh nhà cung cấp</h2>'+
      '<p>File hoàn toàn trống. Nhân viên tự chọn nội dung cần so sánh, tự nhận xét và đề xuất.</p></div></div>'+
      '<div class="ops-download-actions">'+btn('Tải bảng so sánh 5 nhà cung cấp','data-ops-download')+
      btn('Tải bảng theo dõi công việc','data-ops-tracker')+'</div>'+
      '<p class="ops-muted">Tải CSV rồi mở bằng Google Sheets. Lưu báo giá gốc và dữ liệu thật trong Drive có phân quyền. Không có thang điểm, trọng số hoặc kết luận tự động.</p></section>';
  }
  function templatesView(){
    return '<details class="ops-panel ops-collapsible"><summary>Mẫu email và đề nghị có thể sao chép</summary>'+
      '<div class="ops-template-grid">'+Object.entries(templates).map(([id,t])=>
        '<article class="ops-template"><strong>'+e(t.title)+'</strong><pre>'+e(t.text)+'</pre>'+
        btn('Sao chép','data-ops-copy="'+e(id)+'"')+'</article>').join('')+'</div></details>';
  }
  function sources(){
    return '<details class="ops-panel ops-collapsible"><summary>Nguồn tham khảo pháp lý</summary>'+
      '<div class="ops-sources">'+D.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+e(x.url)+'"><strong>'+e(x.label)+'</strong><span>'+e(x.scope)+'</span></a>').join('')+'</div>'+
      '<p class="ops-muted">Đối chiếu các văn bản hiện hành khi phát sinh vấn đề cụ thể.</p></details>';
  }
  function index(){
    return header()+filterView()+compare()+templatesView()+sources()+
      '<p id="operations-status" class="ops-feedback" role="status" aria-live="polite"></p>';
  }
  function detail(p){
    return header()+'<div class="ops-back">'+btn('Quay lại danh sách','data-ops-back')+'</div>'+
      '<section class="ops-detail"><div class="ops-kicker">'+e(p.group)+'</div><h2>'+e(p.title)+'</h2>'+
      '<p class="ops-lead">'+e(p.trigger)+'</p>'+
      '<div class="ops-owner"><strong>Ai phụ trách:</strong><span>'+e(p.owner)+'</span></div>'+
      '<div class="ops-kicker">CÁC BƯỚC THỰC HIỆN</div>'+
      '<ol class="ops-steps">'+p.steps.map((step,i)=>'<li>'+
        '<span class="ops-step-no">'+String(i+1).padStart(2,'0')+'</span>'+
        '<div><strong>'+e(step.action)+'</strong></div></li>').join('')+'</ol>'+
      '<div class="ops-detail-grid"><div class="ops-risk"><h3>Cần lưu ý</h3><ul>'+
      p.redFlags.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul></div>'+
      '<div class="ops-records"><h3>Cần lưu lại</h3><ul>'+
      p.records.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>'+
      '<p><strong>Trước khi tiếp tục:</strong> '+e(p.decision)+'</p></div></div></section>'+
      '<div class="ops-next">'+btn('Quay lại danh sách','data-ops-back')+
      (['supplier-comparison','supplier-screening','purchase-intake','negotiation'].includes(p.id)?
        btn('Tải mẫu so sánh','data-ops-go-compare'):'')+'</div>'+
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
    const a=ev.target.closest('[data-ops-filter],[data-ops-open],[data-ops-back],[data-ops-download],[data-ops-tracker],[data-ops-copy],[data-ops-go-compare]');
    if(!a)return;
    if(a.hasAttribute('data-ops-filter')){group=a.dataset.opsFilter;open();return;}
    if(a.hasAttribute('data-ops-open')){location.hash='operations/'+a.dataset.opsOpen;return;}
    if(a.hasAttribute('data-ops-back')){location.hash='operations';return;}
    if(a.hasAttribute('data-ops-go-compare')){location.hash='operations';requestAnimationFrame(()=>root.querySelector('#operations-compare')?.scrollIntoView({block:'start'}));return;}
    if(a.hasAttribute('data-ops-download')){download();return;}
    if(a.hasAttribute('data-ops-tracker')){downloadTracker();return;}
    const t=templates[a.dataset.opsCopy];
    if(t){
      const msg=root.querySelector('#operations-status');
      try{await navigator.clipboard.writeText(t.text);if(msg)msg.textContent='Đã sao chép mẫu. Dùng trong Drive/email công ty theo đúng phân quyền.';}
      catch(_){if(msg)msg.textContent='Không thể tự sao chép trong trình duyệt này. Chọn nội dung mẫu và sao chép thủ công.';}
    }
  });
  open();
  return {open,version:D.version,templateColumns:7};
})();