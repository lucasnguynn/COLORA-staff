'use strict';
/*
 * COLORA Quick Search.
 * Uses only fixed, non-sensitive educational material. No remote search, no
 * search query logging, no localStorage of drafts, queries or customer data.
 * No approval or SKU facts are inferred from general learning references.
 */
(() => {
  const $=id=>document.getElementById(id);
  const overlay=$('quick-search-overlay');
  if(!overlay)return;
  const input=$('quick-search-input'), results=$('quick-search-results');
  const status=$('quick-search-status');
  const answers=[
  {
    "id": "help-01",
    "title": "Đá lỏng, chấu lỏng",
    "terms": "khẩn cấp đá lỏng rơi đá chấu bung nhẫn gãy setting",
    "steps": "Hướng dẫn khách tạm ngừng đeo, cất sản phẩm riêng, không tự ấn chấu hoặc dùng keo. Xin mã đơn và thông tin tối thiểu để chuyển QC. Không xác định nguyên nhân hay quyền lợi khi chưa kiểm tra.",
    "reply": "Chào bạn, COLORA rất tiếc vì trải nghiệm này. Để tránh viên đá bị ảnh hưởng thêm, bạn giúp mình tạm ngừng đeo và cất sản phẩm riêng nhé. Bạn gửi giúp mình mã đơn để COLORA chuyển bộ phận chuyên môn kiểm tra và phản hồi hướng xử lý phù hợp.",
    "warning": "Không hứa đổi mới, miễn phí hoặc kết luận lỗi sản xuất trước QC.",
    "route": "client-care/case/loose-stone",
    "urgent": true
  },
  {
    "id": "help-02",
    "title": "Khách bị khó chịu khi đeo",
    "terms": "khẩn cấp dị ứng mẩn đỏ ngứa rát đau sưng kích ứng kim loại",
    "steps": "Khuyên tạm ngừng đeo. Nếu có phản ứng nặng hoặc diễn tiến tăng, khuyên tìm hỗ trợ y tế. Chuyển bộ phận phụ trách kiểm tra thông tin vật liệu của đúng SKU.",
    "reply": "Chào bạn, COLORA rất tiếc vì bạn gặp tình trạng khó chịu khi đeo. Trước mắt, bạn vui lòng tạm ngừng sử dụng sản phẩm nhé. COLORA sẽ kiểm tra hồ sơ vật liệu của đúng mẫu và tiếp nhận thông tin để hỗ trợ tiếp.",
    "warning": "Không chẩn đoán nguyên nhân, không cam kết sản phẩm không thể gây kích ứng.",
    "route": "client-care/learn",
    "urgent": true
  },
  {
    "id": "help-03",
    "title": "Giao hàng trễ hoặc chưa có ETA",
    "terms": "khẩn cấp giao trễ giao chậm chưa giao deadline hẹn giao ship vận chuyển eta",
    "steps": "Kiểm tra mã đơn và trạng thái thực tế với đơn vị xử lý. Nếu chưa có ETA xác nhận, thông báo chưa có mốc chính thức và chủ động cập nhật khi có kết quả.",
    "reply": "Chào bạn, mình đã ghi nhận việc đơn hàng chưa đến như dự kiến. COLORA sẽ kiểm tra trạng thái với bộ phận vận chuyển và phản hồi khi có thông tin xác nhận. Mình chưa muốn hẹn một mốc nhận hàng khi chưa kiểm tra chính xác.",
    "warning": "Không tự cam kết thời gian giao, hoàn tiền hoặc voucher.",
    "route": "client-care/case/rush-gift",
    "urgent": true
  },
  {
    "id": "help-04",
    "title": "Đổi trả hoặc hoàn tiền",
    "terms": "khẩn cấp trả hàng đổi hàng hoàn tiền refund return lỗi chính sách",
    "steps": "Xác định mã đơn, tình trạng sản phẩm và chính sách hiện hành đã được phê duyệt. Chuyển Senior khi cần quyết định quyền lợi hoặc ngoại lệ.",
    "reply": "Chào bạn, COLORA đã ghi nhận yêu cầu đổi trả của bạn. Để hướng dẫn chính xác theo chính sách hiện hành, mình xin phép kiểm tra mã đơn và tình trạng sản phẩm trước khi xác nhận phương án phù hợp.",
    "warning": "Không tự hứa đủ điều kiện, thời hạn hoặc số tiền hoàn khi chưa có bản chính sách được duyệt.",
    "route": "client-care/resources",
    "urgent": true
  },
  {
    "id": "help-05",
    "title": "Bảo hành hoặc sửa chữa",
    "terms": "bảo hành bảo trì sửa chữa lỗi khóa chấu gãy nứt bảo hành bao lâu",
    "steps": "Thu thập thông tin đúng đơn và hiện trạng, xác minh quyền lợi theo bản chính sách có hiệu lực và kết luận kỹ thuật nếu cần.",
    "reply": "Chào bạn, mình sẽ hỗ trợ kiểm tra trường hợp của sản phẩm. Bạn gửi giúp mình mã đơn và mô tả ngắn tình trạng hiện tại nhé. COLORA sẽ đối chiếu điều kiện áp dụng rồi phản hồi phương án tiếp theo.",
    "warning": "Không tự hứa bảo hành miễn phí, thay mới hoặc thời hạn cố định.",
    "route": "client-care/resources",
    "urgent": true
  },
  {
    "id": "help-06",
    "title": "Đá màu khác ảnh trên website",
    "terms": "màu đá không giống ảnh nhạt đậm lệch màu giả ảnh quảng cáo",
    "steps": "Ghi nhận chênh lệch, hỏi điều kiện ánh sáng, đối chiếu ảnh và đúng SKU. Không lấy đặc tính đá tự nhiên làm lý do phủ nhận khiếu nại.",
    "reply": "Chào bạn, cảm ơn bạn đã phản hồi. Mình hiểu màu đá thực tế chưa giống kỳ vọng của bạn. COLORA sẽ đối chiếu hình ảnh và thông tin của đúng mẫu, đồng thời kiểm tra điều kiện ánh sáng để có câu trả lời cụ thể.",
    "warning": "Không khẳng định lỗi do màn hình hay bác bỏ khiếu nại trước khi kiểm tra.",
    "route": "client-care/case/color-difference",
    "urgent": true
  },
  {
    "id": "help-07",
    "title": "Đá tự nhiên và xử lý",
    "terms": "natural untreated xử lý nhiệt heated treated đá thật đá giả synthetic lab ruby sapphire citrine",
    "steps": "Kiểm tra tên khoáng vật, nguồn gốc natural/synthetic và treatment riêng biệt trên hồ sơ của đúng sản phẩm. Nếu chưa có bằng chứng, chuyển xác minh.",
    "reply": "Chào bạn, đá tự nhiên và đá chưa qua xử lý là hai thông tin khác nhau. Mình sẽ đối chiếu hồ sơ của đúng mẫu để xác nhận rõ loại đá và tình trạng xử lý, tránh trả lời thiếu chính xác.",
    "warning": "Không hứa mọi viên natural đều untreated hoặc có chứng thư.",
    "route": "client-care/intelligence",
    "urgent": false
  },
  {
    "id": "help-08",
    "title": "Giá bán hoặc sản phẩm còn hàng",
    "terms": "giá bao nhiêu hàng còn không tồn kho giá mới giảm giá chiết khấu discount khuyến mại",
    "steps": "Xác nhận đúng SKU, biến thể, giá đang áp dụng và tồn kho tại hệ thống bán hàng trước khi báo khách. Không dùng bảng giá đào tạo hoặc giá trong ví dụ.",
    "reply": "Chào bạn, mình sẽ kiểm tra giá và tình trạng còn hàng của đúng mẫu bạn quan tâm để gửi thông tin cập nhật chính xác nhé. Bạn cho mình xin mã hoặc ảnh sản phẩm được không?",
    "warning": "Portal hiện không có dữ liệu giá hoặc tồn kho được xác nhận theo thời gian thực.",
    "route": "client-care/catalog",
    "urgent": false
  },
  {
    "id": "help-09",
    "title": "Giao nhầm hoặc thiếu sản phẩm",
    "terms": "giao nhầm thiếu hàng sai mẫu giao sai thiếu hộp thất lạc",
    "steps": "Ghi nhận mã đơn, sản phẩm nhận được và thông tin cần thiết; chuyển người phụ trách đối chiếu đóng gói và giao nhận.",
    "reply": "Chào bạn, COLORA rất tiếc vì đơn hàng có điểm chưa đúng. Bạn giúp mình gửi mã đơn và mô tả món đã nhận để bộ phận phụ trách kiểm tra với đơn đóng gói nhé. COLORA sẽ cập nhật hướng xử lý sau khi xác minh.",
    "warning": "Không yêu cầu thông tin không cần thiết hoặc đổ lỗi cho khách.",
    "route": "client-care/cases",
    "urgent": false
  },
  {
    "id": "help-10",
    "title": "Đá trầy, mẻ hoặc đổi màu",
    "terms": "đá xước nứt mẻ đổi màu phai màu bong đá xuống màu bạc xỉn",
    "steps": "Ưu tiên tạm ngừng sử dụng nếu có mẻ, nứt hoặc chấu không an toàn. Xác minh loại đá, finish, treatment và tình trạng thực tế trước khi khuyến nghị vệ sinh hoặc bảo hành.",
    "reply": "Chào bạn, mình đã ghi nhận tình trạng của sản phẩm. Nếu viên đá có dấu hiệu nứt hoặc lỏng, bạn giúp mình tạm ngừng đeo trước nhé. COLORA sẽ kiểm tra thông tin và hướng xử lý phù hợp.",
    "warning": "Không tự kết luận lỗi sản xuất hoặc khuyên dùng chất tẩy mạnh.",
    "route": "client-care/stone/topaz",
    "urgent": false
  },
  {
    "id": "help-11",
    "title": "Chăm sóc và làm sạch trang sức",
    "terms": "vệ sinh đá bạc 930 mạ xi bạc rhodium nước rửa xà phòng siêu âm hơi nước",
    "steps": "Ưu tiên hướng dẫn đã duyệt của đúng sản phẩm. Chưa xác nhận cấu hình thì chỉ khuyên xử lý nhẹ bằng khăn mềm sạch khô và xin ý kiến kỹ thuật khi cần vệ sinh sâu.",
    "reply": "Chào bạn, cách chăm sóc còn tùy viên đá và lớp hoàn thiện của mẫu. Để tránh ảnh hưởng sản phẩm, bạn có thể lau nhẹ bằng khăn mềm sạch khô. Mình sẽ kiểm tra hướng dẫn dành riêng cho mẫu này nếu bạn muốn vệ sinh sâu.",
    "warning": "Không khuyên siêu âm, hơi nước, ngâm hóa chất cho mọi sản phẩm.",
    "route": "library/care-guide",
    "urgent": false
  },
  {
    "id": "help-12",
    "title": "Chứng thư và xác thực đá",
    "terms": "chứng chỉ chứng nhận certificate gia đá thật giám định kiểm định xuất xứ",
    "steps": "Đối chiếu chứng từ và phạm vi giám định của đúng viên hoặc lô. Phân biệt tài liệu thương hiệu, giấy mua hàng và báo cáo phòng lab.",
    "reply": "Chào bạn, mình sẽ kiểm tra bộ hồ sơ đi kèm đúng sản phẩm để xác nhận loại tài liệu và thông tin được chứng minh. Mình chưa muốn gọi đó là chứng thư giám định khi chưa xem tài liệu cụ thể.",
    "warning": "Không nói tất cả đá được GIA chứng nhận.",
    "route": "client-care/evidence",
    "urgent": false
  },
  {
    "id": "help-13",
    "title": "Chỉnh size hoặc độ vừa",
    "terms": "size nhẫn ni nhẫn resize chỉnh sửa cỡ chật rộng kích thước đo tay",
    "steps": "Kiểm tra mã sản phẩm, cấu trúc và quy định hỗ trợ chỉnh size đang áp dụng. Hướng dẫn đo theo quy chuẩn đã duyệt.",
    "reply": "Chào bạn, mình sẽ kiểm tra mẫu bạn đang quan tâm có hỗ trợ điều chỉnh kích thước không, vì mỗi thiết kế có cấu trúc khác nhau. Bạn cho mình xin mã sản phẩm và số đo hiện tại nhé.",
    "warning": "Không cam kết mọi nhẫn đều chỉnh được hoặc miễn phí.",
    "route": "client-care/catalog",
    "urgent": false
  },
  {
    "id": "help-14",
    "title": "Cá nhân hóa, đặt riêng hoặc tiến độ",
    "terms": "cá nhân hóa custom bespoke khắc tên đổi đá đặt hàng trước bao lâu",
    "steps": "Ghi nhận yêu cầu, kiểm tra tính khả thi thiết kế, nguồn đá và thời gian với bộ phận chuyên môn trước khi xác nhận.",
    "reply": "Chào bạn, COLORA rất vui khi được nghe ý tưởng của bạn. Mình sẽ ghi nhận chi tiết về mẫu, màu đá và thời điểm bạn mong muốn, sau đó kiểm tra khả năng thực hiện trước khi xác nhận nhé.",
    "warning": "Không hứa thời gian, giá hay thực hiện được trước khi duyệt.",
    "route": "client-care/learn",
    "urgent": false
  }
];
  const index=window.COLORA_SEARCH_INDEX?.items||[];
  const senior=document.body.dataset.staffRole==='senior';
  const items=index.filter(x=>x.access!=='senior'||senior);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim();
  const aliases={
    'qr':['ma qr','qr generator','code'],
    'chu ky':['signature','email signature'],
    'mailbox':['email setup','bkns'],
    'bao bi':['packaging','outer box','tui giay'],
    'ban ve':['cad','3d','thiet ke'],
    'doi tra':['hoan tien','refund','return'],
    'giao cham':['giao tre','supplier delay'],
    'da long':['chau long','roi da'],
    'agency':['media agency','creative agency'],
    'gia da':['gem value','gemstone'],
    'ho so':['passport','profile']
  };
  const groups=[
    ['tools','Công cụ và trang'],['operations','Quy trình làm việc'],
    ['templates','Biểu mẫu và email'],['knowledge','Bài học và kiến thức'],
    ['care','Chăm sóc khách hàng']
  ];
  const defaultIds=['nav-qr','nav-signature','nav-email-templates','nav-operations','nav-learning','nav-client-care','nav-brand-guide','nav-mail-setup','nav-library','operations-purchase-intake'];
  let shown=false,previousFocus=null,filter='all',limit=14;
  const filters=[...overlay.querySelectorAll('[data-quick-filter]')];
  function tokens(q){
    const n=norm(q),all=[n];
    for(const [k,v] of Object.entries(aliases))if(n.includes(k))all.push(...v.map(norm));
    return [...new Set(all.join(' ').split(' ').filter(x=>x.length>1))];
  }
  function score(q,words,item){
    const title=norm(item.title),terms=norm(item.terms),summary=norm(item.summary),phrase=norm(q);
    if(!phrase)return 0;
    let pts=title===phrase?110:title.includes(phrase)?42:terms.includes(phrase)?16:summary.includes(phrase)?13:0;
    let matches=0;
    for(const w of words){
      if(title.includes(w)){pts+=7;matches++}
      else if(terms.includes(w)){pts+=3;matches++}
      else if(summary.includes(w)){pts+=2;matches++}
    }
    if(words.length>2&&matches<Math.floor(words.length/3))return 0;
    return pts>0?pts+(item.priority||0):0;
  }
  function chooseFilter(next){
    if(!['all','tools','operations','knowledge','care','templates','answers','urgent'].includes(next))return;
    filter=next;limit=14;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quickFilter===filter)));
    render();
  }
  function render(){
    const query=input.value.trim().slice(0,140),words=tokens(query);
    const showAnswers=filter==='all'||filter==='answers'||filter==='urgent';
    const urgentOnly=filter==='urgent';
    const help=showAnswers?answers.map(x=>({...x,score:score(query,words,{...x,summary:x.steps,terms:x.terms})}))
      .filter(x=>query?x.score>0:filter!=='all')
      .filter(x=>!urgentOnly||x.urgent)
      .sort((a,b)=>query?b.score-a.score:Number(b.urgent)-Number(a.urgent)):[];
    const base=query?items:filter==='all'?defaultIds.map(id=>items.find(x=>x.id===id)).filter(Boolean):items.filter(x=>x.scope===filter);
    const docs=filter==='answers'||urgentOnly?[]:base.map((x,i)=>({...x,score:query?score(query,words,x):40-i}))
      .filter(x=>(!query||x.score>0)&&(!['tools','operations','knowledge','care','templates'].includes(filter)||x.scope===filter))
      .sort((a,b)=>query?b.score-a.score||a.title.localeCompare(b.title,'vi'):b.score-a.score);
    const answerList=help.slice(0,query?5:6),visibleDocs=docs.slice(0,limit);
    let html='';
    if(answerList.length){
      html+='<section class="quick-search-group" aria-label="Phản hồi nhanh"><div class="quick-search-group-head"><h3>'+(urgentOnly?'Cần xử lý gấp':'Hướng dẫn phản hồi')+'</h3><span>'+answerList.length+' tình huống</span></div>';
      html+=answerList.map(x=>'<article class="quick-search-item quick-search-answer'+(x.urgent?' is-urgent':'')+'"><div class="quick-search-item-head"><span class="quick-search-source">'+(x.urgent?'ƯU TIÊN XỬ LÝ':'MẪU TƯ VẤN')+'</span><strong>'+esc(x.title)+'</strong></div><p class="quick-search-steps">'+esc(x.steps)+'</p><div class="quick-search-actions"><button type="button" data-copy-answer="'+esc(x.id)+'">Sao chép phản hồi</button><button type="button" class="quick-search-secondary" data-quick-route="'+esc(x.route)+'">Mở nguồn</button></div><details class="quick-search-draft"><summary>Xem lời nhắn và lưu ý</summary><p>'+esc(x.reply)+'</p><p class="quick-search-warning"><strong>Trước khi gửi:</strong> '+esc(x.warning)+'</p></details></article>').join('');
      html+='</section>';
    }
    for(const [id,label] of groups){
      const matches=visibleDocs.filter(x=>x.scope===id);
      if(!matches.length)continue;
      html+='<section class="quick-search-group" aria-label="'+label+'"><div class="quick-search-group-head"><h3>'+label+'</h3><span>'+matches.length+' mục</span></div>';
      html+=matches.map(x=>{
        const action=id==='tools'?'Mở công cụ':id==='operations'?'Xem quy trình':id==='templates'?'Mở mẫu':'Mở nội dung';
        return '<article class="quick-search-item quick-search-doc"><div class="quick-search-item-head"><span class="quick-search-source">'+esc(x.kind)+'</span><strong>'+esc(x.title)+'</strong></div><p>'+esc(x.summary)+'</p><div class="quick-search-doc-footer"><span>'+esc(x.status||'Tài liệu tham khảo')+'</span><button type="button" data-quick-route="'+esc(x.route)+'">'+action+'</button></div></article>';
      }).join('');
      html+='</section>';
    }
    if(visibleDocs.length<docs.length)html+='<button type="button" class="quick-search-more" data-show-more>Hiển thị thêm ('+(docs.length-visibleDocs.length)+' kết quả)</button>';
    if(!answerList.length&&!visibleDocs.length){
      html='<div class="quick-search-empty"><strong>Chưa tìm thấy nội dung phù hợp</strong><p>Thử tên công cụ, từ khóa ngắn hơn hoặc chọn nhóm khác. Thông tin nhạy cảm và bản nháp chưa được duyệt không có trong chỉ mục.</p></div>';
    }
    if(!index.length)html+='<p class="quick-search-index-note">Chưa tải được chỉ mục tài liệu. Bạn vẫn có thể mở các khu vực từ menu.</p>';
    results.innerHTML=html;
    status.textContent=query?'Có '+docs.length+' kết quả từ Staff và '+help.length+' tình huống phản hồi. Chọn Mở để tới nội dung.':
      filter==='urgent'?'Chỉ hiển thị các tình huống cần ưu tiên xử lý.':
      'Tra cứu '+items.length+' mục công cụ và học liệu. Phím tắt Cmd/Ctrl + K.';
  }
  function open(query=''){
    if(shown){if(query){input.value=query;render()}input.focus();return;}
    shown=true;previousFocus=document.activeElement;
    overlay.hidden=false;document.body.classList.add('quick-search-active');
    filter='all';limit=14;filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.quickFilter===filter)));
    input.value=query;render();input.focus();
  }
  function close(){
    if(!shown)return;
    shown=false;overlay.hidden=true;document.body.classList.remove('quick-search-active');
    input.value='';results.replaceChildren();previousFocus?.focus?.();
  }
  function go(route){
    if(!/^(?:home|library|learning|client-care|brand-guide|email-templates|operations|qr|signature|mail-setup|jd)(?:\/[a-z0-9_-]+){0,2}$/i.test(route))return;
    if(route==='jd'&&!senior)return;
    close();
    if(location.hash==='#'+route)window.dispatchEvent(new Event('hashchange'));
    else location.hash='#'+route;
  }
  async function copy(id){
    const a=answers.find(x=>x.id===id);if(!a)return;
    try{await navigator.clipboard.writeText(a.reply);status.textContent='Đã sao chép. Vui lòng kiểm tra nội dung trước khi gửi.';}
    catch{
      const area=document.createElement('textarea');area.value=a.reply;
      area.style.cssText='position:fixed;opacity:0';document.body.appendChild(area);area.select();
      const ok=document.execCommand('copy');area.remove();
      status.textContent=ok?'Đã sao chép. Hãy kiểm tra trước khi gửi.':'Không sao chép tự động được. Hãy chọn nội dung thủ công.';
    }
  }
  overlay.addEventListener('click',e=>{
    if(e.target===overlay||e.target.closest('[data-quick-close]')){close();return;}
    const suggestion=e.target.closest('[data-quick-query]');
    if(suggestion){input.value=suggestion.dataset.quickQuery;chooseFilter('all');input.focus();return;}
    const f=e.target.closest('[data-quick-filter]');
    if(f){chooseFilter(f.dataset.quickFilter);return;}
    if(e.target.closest('[data-show-more]')){limit+=14;render();return;}
    const c=e.target.closest('[data-copy-answer]');
    if(c){void copy(c.dataset.copyAnswer);return;}
    const link=e.target.closest('[data-quick-route]');
    if(link)go(link.dataset.quickRoute);
  });
  input.addEventListener('input',()=>{limit=14;render();});
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){const first=results.querySelector('[data-quick-route],[data-copy-answer]');if(first){e.preventDefault();first.focus();}return;}
    if(e.key==='Enter'&&!e.isComposing){
      const first=results.querySelector('[data-quick-route]');
      if(first){e.preventDefault();go(first.dataset.quickRoute);return;}
      const draft=results.querySelector('.quick-search-answer details');
      if(draft){e.preventDefault();draft.open=true;draft.querySelector('summary')?.focus();}
    }
  });
  overlay.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const links=[...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],summary')]
      .filter(el=>!el.closest('[hidden]')&&(!el.closest('details:not([open])')||el.tagName==='SUMMARY')&&el.offsetParent!==null);
    if(!links.length)return;
    if(e.shiftKey&&document.activeElement===links[0]){e.preventDefault();links.at(-1).focus();}
    else if(!e.shiftKey&&document.activeElement===links.at(-1)){e.preventDefault();links[0].focus();}
  });
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();return;}
    if(e.key==='Escape'&&shown){e.preventDefault();close();}
  },true);
  document.querySelectorAll('[data-quick-search-open]').forEach(b=>b.addEventListener('click',()=>open()));
  window.COLORA_QUICK_SEARCH={open,close};
})();
