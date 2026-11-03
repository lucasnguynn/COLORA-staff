'use strict';
/* Public operations curriculum only. No real supplier, contract or customer input is persisted. */
window.COLORA_OPS_PLAYBOOK=(()=>{
  const D=window.COLORA_OPERATIONS;
  const root=document.getElementById('operations-root');
  if(!D||!root)return {open:()=>{}};
  const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'' :'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').trim();
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
  Object.assign(templates,{"approval":{"title":"Xin duyệt nội dung trước khi đăng","text":"Subject: COLORA - Duyệt nội dung [Kênh / Ngày]\nNội dung dự kiến: [Link bản cuối]\nSản phẩm / SKU / giá được dùng: [...]\nThời gian muốn đăng: [...]\nPhần cần kiểm tra: [...]\nNhờ anh/chị xác nhận bằng email trước khi xuất bản."},"incident":{"title":"Thông báo sự cố","text":"Subject: COLORA - Báo sự cố cần kiểm tra\nTình huống đã phát hiện: [...]\nThời gian / hệ thống liên quan: [...]\nViệc đã tạm dừng: [...]\nLink bằng chứng riêng có phân quyền: [...]\nNhờ người phụ trách hướng dẫn bước tiếp theo."},"handover":{"title":"Bàn giao công việc","text":"Công việc / dự án: [...]\nTrạng thái: [...]\nViệc tiếp theo và deadline: [...]\nNgười nhận: [...]\nLink tài liệu đúng quyền: [...]\nViệc còn chờ duyệt / cần lưu ý: [...]"},"design":{"title":"Brief thiết kế / CAD","text":"Mẫu hoặc mã thiết kế: [...]\nẢnh / bản tham chiếu: [Link]\nĐiểm cần giữ nguyên: [...]\nĐiểm cần thiết kế hoặc sửa: [...]\nĐá / kích thước / đặc điểm đeo đã thống nhất: [...]\nHạn phản hồi và người duyệt: [...]"},"cad":{"title":"Phản hồi chỉnh sửa CAD","text":"Subject: COLORA - Phản hồi CAD [Mã mẫu / Phiên bản]\nBản CAD được review: [Link]\nBản tham chiếu đã duyệt: [Link]\nVị trí cần chỉnh: [...]\nẢnh đánh dấu: [Link]\nBản cập nhật cần gửi trước: [...]\nNhờ xác nhận tiếp nhận và phiên bản tiếp theo."},"sample":{"title":"Yêu cầu sửa sample","text":"Subject: COLORA - Yêu cầu sửa sample [Mã mẫu]\nSample nhận ngày: [...]\nSai lệch so với bản duyệt: [...]\nẢnh / video lỗi: [Link]\nPhần cần làm lại: [...]\nNgày trả sample dự kiến: [...]\nNgười kiểm tra mẫu sửa: [...]"},"delay":{"title":"Email xác nhận giao trễ","text":"Subject: COLORA - Xác nhận lịch giao mới [PO / Hạng mục]\nThời hạn đã thống nhất: [...]\nTình trạng hiện tại: [...]\nNgày / số lượng có thể giao: [...]\nVướng mắc và phương án xử lý: [...]\nNhờ anh/chị xác nhận bằng email trước: [...]"},"agencyRevision":{"title":"Yêu cầu agency chỉnh sửa","text":"Subject: COLORA - Revision Feedback [Dự án / Version]\nBrief được duyệt: [Link]\nFile đang review: [Link]\nĐiểm 1 cần sửa và timestamp: [...]\nĐiểm 2 cần sửa: [...]\nVòng chỉnh sửa theo SOW: [...]\nDeadline nhận bản cập nhật: [...]\nNhờ xác nhận lại timeline và scope qua email."},"webQa":{"title":"Checklist trước khi publish web","text":"Link trang / theme bản thử: [...]\nĐã kiểm tra desktop: [ ]\nĐã kiểm tra mobile: [ ]\nGiá, SKU, ảnh, link, form đã đối chiếu: [ ]\nNgười duyệt: [...]\nThời điểm publish: [...]\nLink / cách rollback: [...]\nKết quả kiểm tra sau khi lên live: [...]"}});
  let group='all',query='',active=null,showAll=false,pendingAnchor='';
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
  const featured=['purchase-intake','cad-review','sample-revision','agency-revision','budget-overrun','website-publish'];
  function header(){
    return '<div class="ops-hero"><div class="ops-kicker">COLORA / OPERATIONS</div>'+
      '<h1>Work with <em>clarity.</em></h1><p>Chọn tình huống, làm theo hướng dẫn và mở mẫu cần dùng.</p>'+
      '<div class="ops-hero-meta"><span>'+D.procedures.length+' hướng dẫn công việc</span><span>Không cần biểu mẫu phức tạp</span></div></div>';
  }
  function situations(){
    return '<section class="ops-situations" aria-label="Tình huống thường gặp">'+
      '<div class="ops-section-title"><div class="ops-kicker">START HERE</div><h2>Bạn đang cần làm gì?</h2>'+
      '<p>Chọn ngay một tình huống để xem hướng dẫn thực hiện.</p></div>'+
      '<div class="ops-situation-grid">'+D.entryPoints.map(x=>
        btn(x.title,'class="ops-situation" data-ops-open="'+e(x.id)+'"')
      ).join('')+'</div></section>';
  }
  function groups(){return ['all',...new Set(D.procedures.map(x=>x.group))]}
  function results(){
    const filtered=D.procedures.filter(p=>{
      if(group!=='all'&&p.group!==group)return false;
      const words=norm([p.title,p.trigger,p.owner,p.group,p.decision,...(p.keywords||[]),...p.steps.map(x=>x.action),...p.redFlags].join(' '));
      return !query||words.includes(norm(query));
    });
    const shortlist=!query&&group==='all'&&!showAll;
    const listed=shortlist?featured.map(id=>filtered.find(p=>p.id===id)).filter(Boolean):filtered;
    const showToggle=!query&&group==='all'&&filtered.length>featured.length;
    return '<p class="ops-count" role="status">'+(shortlist?'Gợi ý '+listed.length+' quy trình thường dùng':'Có '+filtered.length+' quy trình phù hợp')+'</p>'+
      '<div class="ops-cards">'+listed.map(p=>'<button type="button" class="ops-card" data-ops-open="'+e(p.id)+'">'+
        '<span class="ops-card-top">'+e(p.group)+'</span><strong>'+e(p.title)+'</strong>'+
        '<span>'+e(p.trigger)+'</span><span class="ops-card-action">Xem hướng dẫn</span></button>').join('')+'</div>'+
      (showToggle?btn(showAll?'Thu gọn danh sách':'Xem toàn bộ '+D.procedures.length+' quy trình','class="ops-all-toggle" data-ops-show-all aria-expanded="'+showAll+'"'):'')+
      (filtered.length?'':'<p class="ops-empty">Chưa tìm thấy. Hãy thử tên công việc hoặc từ khóa khác.</p>');
  }
  function filterView(){
    return '<section class="ops-library"><div class="ops-section-title"><div class="ops-kicker">PROCESS LIBRARY</div>'+
      '<h2>Tra cứu khi cần</h2><p>Tìm theo việc đang gặp phải, không cần biết tên quy trình.</p></div>'+
      '<label class="ops-search-label" for="operations-search">Tìm tình huống hoặc công việc</label>'+
      '<input class="ops-search" id="operations-search" type="search" autocomplete="off" placeholder="Ví dụ: CAD sai, giao chậm, agency, chi vượt..." value="'+e(query)+'">'+
      '<div class="ops-filters" aria-label="Nhóm công việc">'+groups().map(g=>
        btn(g==='all'?'Tất cả':g,'data-ops-filter="'+e(g)+'" aria-pressed="'+(group===g)+'"')
      ).join('')+'</div><div id="ops-results">'+results()+'</div></section>';
  }
  function compare(){
    return '<section class="ops-panel" id="operations-compare"><div class="ops-kicker">GOOGLE SHEETS / MẪU TRỐNG</div>'+
      '<div class="ops-panel-heading"><div><h2>Biểu mẫu dùng ngay</h2>'+
      '<p>Tải mẫu trống rồi làm trên Drive / Sheets có phân quyền của công ty.</p></div></div>'+
      '<div class="ops-download-actions">'+btn('Bảng so sánh 5 nhà cung cấp','data-ops-download')+
      btn('Bảng theo dõi công việc','data-ops-tracker')+'</div>'+
      '<p class="ops-muted">Nhân viên tự chọn nội dung so sánh. Không có chấm điểm, trọng số hay xếp hạng.</p></section>';
  }
  function templatesView(){
    return '<details class="ops-panel ops-collapsible"><summary>Email và mẫu biểu khác</summary>'+
      '<div class="ops-template-grid">'+Object.entries(templates).map(([id,t])=>
        '<article class="ops-template"><strong>'+e(t.title)+'</strong><pre>'+e(t.text)+'</pre>'+
        btn('Sao chép mẫu','data-ops-copy="'+e(id)+'"')+'</article>').join('')+'</div></details>';
  }
  function sources(){
    return '<details class="ops-panel ops-collapsible"><summary>Văn bản pháp lý tham khảo</summary>'+
      '<div class="ops-sources">'+D.sources.map(x=>'<a target="_blank" rel="noopener noreferrer" href="'+e(x.url)+'"><strong>'+e(x.label)+'</strong><span>'+e(x.scope)+'</span></a>').join('')+'</div>'+
      '<p class="ops-muted">Các giao dịch thực tế cần được người phụ trách rà soát theo quy định hiện hành.</p></details>';
  }
  function index(){
    return header()+situations()+filterView()+compare()+templatesView()+sources()+
      '<p id="operations-status" class="ops-feedback" role="status" aria-live="polite"></p>'+
      '<p class="ops-footnote">Quy trình đang là bản dự thảo để học và tham khảo. '+e(D.security)+'</p>';
  }
  function detail(p){
    const a=p.action;
    const actionAttr='data-ops-primary="'+e(a.type)+':'+e(a.id)+'"';
    return '<div class="ops-detail-shell">'+
      '<div class="ops-back">'+btn('Tất cả quy trình','data-ops-back')+'</div>'+
      '<div class="ops-detail"><div class="ops-detail-head"><div class="ops-kicker">'+e(p.group)+'</div>'+
      '<span class="ops-draft">Dự thảo - chờ duyệt</span></div>'+
      '<h1 class="ops-detail-title">'+e(p.title)+'</h1>'+
      '<p class="ops-lead">'+e(p.trigger)+'</p>'+
      '<div class="ops-assignment"><div><span>Người thực hiện</span><strong>'+e(p.owner)+'</strong></div>'+
      '<div><span>Người xác nhận / duyệt</span><strong>'+e(p.approver)+'</strong></div></div>'+
      '<p class="ops-muted">Vai trò mang tính hướng dẫn. Quyền ký và hạn mức chi vẫn phải theo quyết định chính thức của COLORA.</p>'+
      '<div class="ops-kicker">CẦN LÀM</div><ol class="ops-steps">'+p.steps.map((step,i)=>'<li>'+
        '<span class="ops-step-no">'+String(i+1).padStart(2,'0')+'</span><strong>'+e(step.action)+'</strong></li>').join('')+'</ol>'+
      '<div class="ops-primary-action"><div><strong>Làm ngay</strong><span>Chọn mẫu hoặc hành động liên quan đến việc này.</span></div>'+
      btn(a.label,'data-ops-primary="'+e(a.type)+':'+e(a.id)+'"')+'</div>'+
      '<p id="operations-status" class="ops-feedback" role="status" aria-live="polite"></p>'+
      '<div class="ops-detail-grid"><section class="ops-risk"><h2>Cần lưu ý</h2><ul>'+
        p.redFlags.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul></section>'+
      '<section class="ops-records"><h2>Cần giữ lại</h2><ul>'+
        p.records.map(x=>'<li>'+e(x)+'</li>').join('')+'</ul>'+
      '<p><strong>Trước khi tiếp tục:</strong> '+e(p.decision)+'</p></section></div>'+
      (p.next.length?'<div class="ops-follow-on"><h2>Bước tiếp theo</h2><div class="ops-next-links">'+p.next.map(id=>{
        const n=D.procedures.find(x=>x.id===id);
        return n?btn(n.title,'data-ops-open="'+e(id)+'"'):'';
      }).join('')+'</div></div>':'')+
      '<div class="ops-sop-feedback"><span>Hướng dẫn còn thiếu hoặc không phù hợp?</span>'+
      btn('Sao chép mẫu góp ý','data-ops-feedback="'+e(p.id)+'"')+'</div>'+
      '</div><div class="ops-back">'+btn('Về danh sách','data-ops-back')+'</div></div>';
  }
  function open(id=''){
    active=D.procedures.find(x=>x.id===id)||null;
    root.innerHTML=active?detail(active):index();
    if(pendingAnchor&&!active){
      const target=pendingAnchor;pendingAnchor='';
      requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({block:'start'}));
    }
    if(active)requestAnimationFrame(()=>root.querySelector('.ops-detail-title')?.scrollIntoView({block:'start'}));
  }
  function go(id){
    const route='operations'+(id?'/'+id:'');
    if(location.hash==='#'+route)open(id);
    else location.hash=route;
  }
  async function copy(text,success){
    const status=root.querySelector('#operations-status');
    try{await navigator.clipboard.writeText(text);if(status)status.textContent=success;}
    catch(_){
      const ta=document.createElement('textarea');
      ta.value=text;ta.className='ops-copy-fallback';ta.setAttribute('aria-label','Mẫu cần sao chép');
      status?.before(ta);ta.focus();ta.select();
      if(status)status.textContent='Không thể tự sao chép. Nội dung mẫu đã được chọn để bạn sao chép thủ công.';
    }
  }
  root.addEventListener('input',ev=>{
    if(ev.target.id!=='operations-search')return;
    query=ev.target.value;
    root.querySelector('#ops-results').innerHTML=results();
  });
  root.addEventListener('click',ev=>{
    const el=ev.target.closest('[data-ops-filter],[data-ops-open],[data-ops-back],[data-ops-show-all],[data-ops-download],[data-ops-tracker],[data-ops-copy],[data-ops-primary],[data-ops-feedback],[data-ops-go-compare]');
    if(!el)return;
    if(el.hasAttribute('data-ops-filter')){group=el.dataset.opsFilter;showAll=true;open();return;}
    if(el.hasAttribute('data-ops-show-all')){showAll=!showAll;root.querySelector('#ops-results').innerHTML=results();return;}
    if(el.hasAttribute('data-ops-open')){go(el.dataset.opsOpen);return;}
    if(el.hasAttribute('data-ops-back')){group='all';query='';showAll=false;go('');return;}
    if(el.hasAttribute('data-ops-download')){download();return;}
    if(el.hasAttribute('data-ops-tracker')){downloadTracker();return;}
    if(el.hasAttribute('data-ops-go-compare')){pendingAnchor='operations-compare';go('');return;}
    if(el.hasAttribute('data-ops-feedback')){
      const p=D.procedures.find(x=>x.id===el.dataset.opsFeedback);
      if(!p)return;
      const text=['GÓP Ý OPERATIONS PLAYBOOK','Quy trình: '+p.title,'Mã: '+p.id,'Phiên bản: '+D.version,'Bước chưa rõ / còn thiếu: [...]','Đề xuất sửa: [...]','Gửi qua kênh công ty tới người phụ trách Playbook. Không kèm dữ liệu nhạy cảm.'].join('\n');
      void copy(text,'Đã sao chép mẫu góp ý. Gửi qua kênh nội bộ của công ty.');
      return;
    }
    if(el.hasAttribute('data-ops-copy')){
      const t=templates[el.dataset.opsCopy];if(t)void copy(t.text,'Đã sao chép mẫu. Dùng trong email / Drive được phân quyền.');
      return;
    }
    if(el.hasAttribute('data-ops-primary')){
      const [type,id]=el.dataset.opsPrimary.split(':');
      if(type==='template'&&templates[id])void copy(templates[id].text,'Đã sao chép mẫu. Điền thông tin qua kênh công ty.');
      if(type==='download'&&id==='compare')download();
      if(type==='download'&&id==='tracker')downloadTracker();
      if(type==='route'&&D.procedures.some(p=>p.id===id))go(id);
    }
  });
  open();
  return {open,version:D.version,templateColumns:7};
})();