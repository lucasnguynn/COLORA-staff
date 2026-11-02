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
    "route": "library/care",
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
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const synonyms={
    'bao hanh':['bao tri','sua chua'],
    'hoan tien':['refund','doi tra'],
    'doi tra':['tra hang','return','hoan tien'],
    'da long':['chau long','roi da','da lung lay'],
    'giao tre':['giao cham','chua giao','eta'],
    've sinh':['lam sach','cham soc'],
    'nhan':['ring','ni nhan'],
    'sapphire':['corundum'],
    'aquamarin':['aquamarine'],
    'spinel':['ruby'],
    'tourmalin':['tourmaline']
  };
  let lastFocus=null,lastItems=[],shown=false;
  function tokens(query){
    const n=norm(query),all=[n];
    for(const [term,extra] of Object.entries(synonyms)){
      if(n.includes(term))all.push(...extra.map(norm));
    }
    return [...new Set(all.join(' ').split(' ').filter(w=>w.length>1))];
  }
  function scoreText(query,t,rec){
    const title=norm(rec.title),terms=norm(rec.terms||''),
      detail=norm(rec.summary||rec.steps||''),extra=norm(rec.reply||'');
    const all=title+' '+terms+' '+detail+' '+extra;
    const phrase=norm(query);
    if(!phrase)return 0;
    let score=title.includes(phrase)?22:all.includes(phrase)?10:0,matched=0;
    for(const word of t){
      if(title.includes(word)){score+=6;matched++}
      else if(terms.includes(word)){score+=3;matched++}
      else if(detail.includes(word)||extra.includes(word)){score+=2;matched++}
    }
    if(t.length>1&&matched===0)return 0;
    if(t.length>2&&matched<Math.max(1,Math.floor(t.length/3)))return 0;
    return score>0?score+(rec.priority||0):0;
  }
  function render(){
    const query=input.value.trim().slice(0,140),word=tokens(query);
    const quick=answers.map(x=>({...x,score:scoreText(query,word,x)}))
      .filter(x=>query?x.score>0:true)
      .sort((a,b)=>query?b.score-a.score:(Number(b.urgent)-Number(a.urgent)));
    const docs=query?index.map(x=>({...x,score:scoreText(query,word,x)}))
      .filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12):[];
    const top=quick.slice(0,query?7:6);
    let html='';
    if(top.length){
      html+='<section class="quick-search-group" aria-label="Phản hồi nhanh"><div class="quick-search-group-head"><h3>Phản hồi nhanh</h3><span>'+top.length+' tình huống</span></div>';
      html+=top.map(x=>'<article class="quick-search-item quick-search-answer"><div class="quick-search-item-head"><span class="quick-search-source">HƯỚNG DẪN TÌNH HUỐNG</span><strong>'+escape(x.title)+'</strong></div><p class="quick-search-steps">'+escape(x.steps)+'</p><details class="quick-search-draft"><summary>Xem câu trả lời mẫu</summary><p>'+escape(x.reply)+'</p><p class="quick-search-warning"><strong>Trước khi gửi:</strong> '+escape(x.warning)+'</p><div class="quick-search-actions"><button type="button" data-copy-answer="'+x.id+'">Sao chép câu mẫu</button><button type="button" data-quick-route="'+escape(x.route)+'">Mở tài liệu liên quan</button></div></details></article>').join('');
      html+='</section>';
    }
    if(docs.length){
      html+='<section class="quick-search-group" aria-label="Tài liệu liên quan"><div class="quick-search-group-head"><h3>Tài liệu liên quan</h3><span>'+docs.length+' kết quả</span></div>';
      html+=docs.map(x=>'<article class="quick-search-item quick-search-doc"><div class="quick-search-item-head"><span class="quick-search-source">'+escape(x.kind)+'</span><strong>'+escape(x.title)+'</strong></div><p>'+escape(x.summary)+'</p><div class="quick-search-doc-footer"><span>Tham khảo - chưa xác nhận theo SKU</span><button type="button" data-quick-route="'+escape(x.route)+'">Mở nguồn</button></div></article>').join('');
      html+='</section>';
    }
    if(!top.length&&!docs.length){
      html='<div class="quick-search-empty"><strong>Chưa tìm thấy thông tin phù hợp</strong><p>Thử cách gọi khác hoặc chọn một tình huống thường gặp. Với thông tin đơn hàng, giá, bảo hành hay SKU chưa xác minh, hãy chuyển bộ phận phụ trách thay vì tự trả lời.</p></div>';
    }
    results.innerHTML=html;
    lastItems=top;
    status.textContent=query?'Có '+top.length+' hướng dẫn nhanh và '+docs.length+' tài liệu liên quan.':'Chọn một tình huống hoặc nhập câu hỏi để tìm trong các học phần.';
  }
  function open(prefill=''){
    if(shown){if(prefill){input.value=prefill;render()}input.focus();return}
    shown=true;lastFocus=document.activeElement;
    overlay.hidden=false;document.body.classList.add('quick-search-active');
    input.value=prefill;render();input.focus();
  }
  function close(){
    if(!shown)return;shown=false;overlay.hidden=true;
    document.body.classList.remove('quick-search-active');
    input.value='';results.replaceChildren();lastFocus?.focus?.();
  }
  function go(route){
    if(!/^(?:library|learning|client-care|brand-guide|email-templates)(?:\/[a-z0-9/_-]+)?$/.test(route))return;
    close();const dest='#'+route;
    if(location.hash===dest)window.dispatchEvent(new Event('hashchange'));
    else location.hash=route;
  }
  async function copy(id){
    const a=answers.find(x=>x.id===id);if(!a)return;
    try{
      await navigator.clipboard.writeText(a.reply);
      status.textContent='Đã sao chép câu mẫu. Xác minh thông tin và điều chỉnh theo tình huống khách trước khi gửi.';
    }catch{
      const textarea=document.createElement('textarea');textarea.value=a.reply;
      textarea.style.cssText='position:fixed;opacity:0';document.body.appendChild(textarea);textarea.select();
      const ok=document.execCommand('copy');textarea.remove();
      status.textContent=ok?'Đã sao chép. Hãy kiểm tra trước khi gửi.':'Không thể sao chép tự động. Hãy chọn câu mẫu để sao chép thủ công.';
    }
  }
  overlay.addEventListener('click',e=>{
    if(e.target===overlay||e.target.closest('[data-quick-close]')){close();return}
    const suggestion=e.target.closest('[data-quick-query]');
    if(suggestion){input.value=suggestion.dataset.quickQuery;render();input.focus();return}
    const action=e.target.closest('[data-copy-answer]');if(action){copy(action.dataset.copyAnswer);return}
    const link=e.target.closest('[data-quick-route]');if(link)go(link.dataset.quickRoute);
  });
  input.addEventListener('input',render);
  input.addEventListener('keydown',e=>{
    if(e.key==='Enter'&&!e.isComposing){
      const button=results.querySelector('[data-copy-answer]')||results.querySelector('[data-quick-route]');
      if(button){e.preventDefault();button.closest('details')?.setAttribute('open','');button.click()}
    }
  });
  overlay.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const focusables=[...overlay.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href],summary')]
      .filter(el=>!el.closest('[hidden]')&&(!el.closest('details:not([open])')||el.tagName==='SUMMARY')&&el.offsetParent!==null);
    if(!focusables.length)return;
    if(e.shiftKey&&document.activeElement===focusables[0]){e.preventDefault();focusables.at(-1).focus()}
    else if(!e.shiftKey&&document.activeElement===focusables.at(-1)){e.preventDefault();focusables[0].focus()}
  });
  document.addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();return}
    if(e.key==='Escape'&&shown){e.preventDefault();close()}
  },true);
  document.querySelectorAll('[data-quick-search-open]').forEach(b=>b.addEventListener('click',()=>open()));
  window.COLORA_QUICK_SEARCH={open,close};
})();
