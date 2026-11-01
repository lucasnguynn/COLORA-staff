/* COLORA Academy V2.1 | Public release gate + local facilitator scoring.
   This script never sends network requests or stores submitted review information.
*/
(function(){
  "use strict";
  var I=window.COLORA_INTELLIGENCE||{situations:[],rubric:[]};
  var P=window.COLORA_PUBLIC_RELEASES||{products:[],policies:[]};
  var state={scenarioId:null,ratings:{},redFlags:{},scored:false,notes:""};
  var forbidden=/(\b(cccd|cmnd|passport|s[oố] ?đi[eệ]n ?tho[aạ]i|email|địa chỉ khách|mã đơn thật)\b)/i;

  function h(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function safeUrl(s){try{var u=new URL(s);return u.protocol==="https:"?u.href:"";}catch(e){return "";}}
  function validDate(s){return typeof s==="string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));}
  function approved(p){
    return !!(p&&p.status==="approved"&&p.sku&&p.name&&p.revision&&validDate(p.approvedOn)&&p.reviewerRole&&p.metal&&p.gemstone&&p.finish&&p.care&&Array.isArray(p.claims)&&p.claims.every(function(c){return c&&c.verified===true&&validDate(c.approvedOn)&&c.text;}));
  }
  function approvedPolicy(p){return !!(p&&p.status==="approved"&&p.id&&p.title&&p.version&&p.reviewerRole&&validDate(p.effectiveOn)&&validDate(p.approvedOn)&&safeUrl(p.url));}
  function products(){return Array.isArray(P.products)?P.products.filter(approved):[];}
  function policies(){return Array.isArray(P.policies)?P.policies.filter(approvedPolicy):[];}
  function title(k,t,p){return '<div class="page-intro"><p class="eyebrow">'+h(k)+'</p><h1 class="heading-serif">'+h(t)+'</h1><p class="page-subtitle">'+h(p)+'</p></div>';}
  function notice(t){return '<div class="notice">'+t+'</div>';}
  function page(s){return '<div class="page">'+s+'</div>';}
  function score(){
    var weighted=I.rubric.reduce(function(n,r){var v=state.ratings[r.id]||0;return n+r.weight*v/4;},0);
    var missed=I.rubric.filter(function(r){return r.critical&&(state.ratings[r.id]||0)<3;});
    var flagged=Object.keys(state.redFlags).filter(function(k){return state.redFlags[k];});
    return {points:Math.round(weighted),missed:missed,flagged:flagged,meetsReference:weighted>=80&&missed.length===0&&flagged.length===0};
  }
  function catalog(){
    var p=products();
    var cards=p.map(function(x){
      return '<a class="lesson-card" href="#/product/'+encodeURIComponent(x.sku)+'"><div class="lesson-top"><span class="lesson-no">◈</span><span class="lesson-status">ĐÃ DUYỆT CÔNG KHAI</span></div><p class="lesson-tag">'+h(x.category||"Trang sức")+' · '+h(x.sku)+'</p><h3>'+h(x.name)+'</h3><p>'+h(x.summary||"Thông tin công khai đã được kiểm tra theo hồ sơ sản phẩm.")+'</p><div class="lesson-bottom"><span>Version '+h(x.revision)+'</span><b>Xem thông tin ↗</b></div></a>';
    }).join("");
    return page(title("PUBLIC PRODUCT KNOWLEDGE","Thư viện sản phẩm đã xác minh","Chỉ hiển thị thông tin SKU có trạng thái phê duyệt công khai. Đây là nơi nhân viên tra cứu thông số được phép tư vấn, không phải nơi lưu hồ sơ QC nội bộ.")+
      notice('<strong>Giới hạn nguồn:</strong> GitHub Pages là public. Mọi SKU xuất hiện tại đây đều công khai cho khách truy cập. Không đưa BOM mật, giá nhập, số lô, dữ liệu cá nhân hay thông tin chưa được COLORA duyệt vào repository.')+
      '<div class="ops-summary"><div><strong>'+p.length+'</strong><span>Hồ sơ SKU đã duyệt</span></div><div><strong>'+policies().length+'</strong><span>Phiên bản chính sách đã duyệt</span></div><div><strong>7</strong><span>Nhóm chứng cứ bắt buộc</span></div></div>'+
      (p.length?'<div class="lesson-grid">'+cards+'</div>':'<div class="ops-empty"><span class="ops-emblem">◇</span><h2>Chưa có SKU đã được phê duyệt công khai.</h2><p>Không có sản phẩm hư cấu hay thông số giả định. Hệ thống đang chờ bản trích xuất thông tin được Product/QC và người phụ trách phê duyệt để xuất bản.</p><a class="btn btn-navy" href="#/release">Xem quy trình phê duyệt ↗</a></div>')+
      '<div class="insight-band"><div><h3>From source to trust.</h3><p>Nguồn QC/BOM được lưu trong hệ thống riêng có phân quyền. Chỉ một bản thông tin công khai được phê duyệt mới đi vào Academy.</p></div><a class="btn btn-ghost" href="#/evidence">Xem 7 tiêu chuẩn chứng cứ ↗</a></div>');
  }
  function product(id){
    var p=products().find(function(x){return x.sku===id;});
    if(!p)return page('<button type="button" class="detail-back" data-ops-go="catalog">← Danh mục</button><div class="ops-empty"><h2>Không có hồ sơ được phép hiển thị.</h2><p>SKU không tồn tại trong danh mục công khai hoặc chưa qua cổng kiểm duyệt.</p><a class="btn btn-navy" href="#/catalog">Trở về danh mục</a></div>');
    var fields=[["Mã SKU",p.sku],["Danh mục",p.category],["Phiên bản",p.revision],["Ngày duyệt",p.approvedOn],["Vai trò duyệt",p.reviewerRole],["Đá",p.gemstone],["Kim loại",p.metal],["Finish",p.finish],["Hướng dẫn đeo",p.wearability],["Chăm sóc",p.care]];
    return page('<a class="detail-back" href="#/catalog">← Trở về danh mục</a><section class="detail-hero"><p class="eyebrow">PUBLIC APPROVED RECORD · '+h(p.sku)+'</p><h1>'+h(p.name)+'</h1><p>'+h(p.summary||"Thông tin công khai đã duyệt.")+'</p></section>'+
      '<article class="lesson-article" style="margin-top:20px"><h2>Thông số công khai đã duyệt</h2><div class="stone-properties">'+fields.map(function(f){return '<div><span>'+h(f[0])+'</span><strong>'+h(f[1]||"Không công bố")+'</strong></div>';}).join("")+'</div>'+
      '<h2 style="margin-top:27px">Thông tin được phép tư vấn</h2><ul class="check-list">'+p.claims.map(function(c){return '<li>'+h(c.text)+' (duyệt '+h(c.approvedOn)+')</li>';}).join("")+'</ul></article>'+
      notice('<strong>Phạm vi:</strong> Thông tin public này không thay thế phiếu QC gốc. Khi sản phẩm thay đá, lớp phủ, cấu trúc hoặc điều khoản, cần duyệt revision mới.'));
  }
  function release(){
    var steps=[
      ["01","Khóa thông tin SKU","Chọn biến thể thực tế, BOM, đá/treatment, finish, kích thước và ảnh theo mã."],
      ["02","QC xác minh","BOM, phiếu QC, kết quả kiểm tra, cảnh báo sử dụng và giới hạn treatment."],
      ["03","Duyệt nội dung công khai","Product, Client Care và Content đối chiếu wording; chỉ xuất bản những gì được phép chia sẻ."],
      ["04","Duyệt chính sách hiệu lực","Điều khoản bảo hành, đổi trả và giao nhận có ngày hiệu lực, người duyệt, đường dẫn truy cập thật."],
      ["05","Pull request và kiểm tra CI","Chỉnh public manifest, tạo PR và để kiểm tra cấu trúc/claim chạy; bắt buộc review theo ruleset GitHub."],
      ["06","Kiểm thử sau xuất bản","Mở trên Pages, đối chiếu với bản được duyệt, kiểm tra ảnh/URL, lịch rà soát nội dung."]
    ];
    var pol=policies();
    return page(title("CONTENT GOVERNANCE","Publication & Policy Control","Một quy trình xuất bản có kiểm chứng. CI giúp phát hiện sai cấu trúc, nhưng không thể tự xác định chứng từ QC hoặc quyết định phê duyệt có thật.")+
      notice('<strong>Hiện chưa có policy version được đưa vào manifest công khai.</strong> Sáu đường dẫn chính sách COLORA được kiểm tra lần trước đều dẫn tới Coming Soon. Không tự xác nhận thời hạn bảo hành hoặc quyền lợi từ đường dẫn đó.')+
      '<div class="ops-steps">'+steps.map(function(a){return '<div class="ops-step"><span>'+a[0]+'</span><div><h3>'+h(a[1])+'</h3><p>'+h(a[2])+'</p></div></div>';}).join("")+'</div>'+
      '<div class="section-head"><div><h2>Policy release registry</h2><p>Chỉ các phiên bản đã phê duyệt, ngày hiệu lực rõ và URL công khai HTTPS.</p></div></div>'+
      (pol.length?'<div class="resource-grid">'+pol.map(function(x){return '<div class="resource-card"><p class="eyebrow">'+h(x.id)+'</p><h3>'+h(x.title)+'</h3><p>'+h(x.summary)+'</p><p>Version '+h(x.version)+' · hiệu lực '+h(x.effectiveOn)+'</p><a href="'+h(safeUrl(x.url))+'" rel="noopener noreferrer" target="_blank">Mở bản công bố ↗</a></div>';}).join("")+'</div>':
      '<div class="ops-empty"><h2>Chưa có phiên bản chính sách đã duyệt.</h2><p>Để tránh hứa sai với khách, cần người phụ trách xác nhận và đưa bản chính sách có ngày hiệu lực vào quy trình duyệt trước khi đăng tại đây.</p></div>')+
      '<div class="insight-band"><div><h3>No evidence, no promise.</h3><p>Code review không thay thế trách nhiệm phê duyệt nghiệp vụ hoặc bảo vệ dữ liệu.</p></div><a class="btn btn-ghost" href="https://github.com/lucasnguynn/CSKH-COLORA/blob/main/docs/PUBLISHING_GUIDE.md" target="_blank" rel="noopener noreferrer">Hướng dẫn xuất bản ↗</a></div>');
  }
  var risks=[
    {id:"unverified",text:"Đã đưa ra lời hứa kỹ thuật/chính sách khi chưa có chứng cứ hoặc thẩm quyền."},
    {id:"safety",text:"Đã khuyên khách tiếp tục đeo/tự sửa sản phẩm có dấu hiệu không an toàn."},
    {id:"privacy",text:"Đã tiết lộ hoặc yêu cầu dữ liệu cá nhân vượt mục đích cần thiết."}
  ];
  function review(){
    var c=I.situations.find(function(x){return x.id===state.scenarioId;});
    if(!c){
      return page(title("FACILITATOR ASSESSMENT","Review Lab","Dành cho người hướng dẫn chấm thủ công một buổi role-play giả định. Không có đăng nhập, không xác minh người chấm hay người học, không lưu dữ liệu lên máy chủ.")+
        notice('<strong>Không phải chứng chỉ nhân sự.</strong> Chỉ sử dụng câu trả lời giả định, không nhập tên, mã nhân viên, số điện thoại, mã đơn hàng hay dữ liệu khách thật.')+
        '<div class="roleplay-grid">'+I.situations.map(function(x){return '<button class="roleplay-card" type="button" data-ops-start="'+h(x.id)+'"><span class="eyebrow">REVIEW SCENARIO</span><h2>'+h(x.title)+'</h2><p>'+h(x.objective)+'</p><span>Chọn để chấm thủ công ↗</span></button>';}).join("")+'</div>');
    }
    var totals=score(),details=I.rubric.map(function(r){
      var v=state.ratings[r.id]||0;
      return '<div class="ops-rubric-row"><div><strong>'+h(r.name)+(r.critical?' *':'')+'</strong><p>'+h(r.detail)+'</p></div><label><span>Đánh giá 0–4</span><select data-ops-score="'+h(r.id)+'" aria-label="'+h(r.name)+'"><option value="0"'+(v===0?' selected':'')+'>0 - Chưa đạt</option><option value="1"'+(v===1?' selected':'')+'>1 - Yếu</option><option value="2"'+(v===2?' selected':'')+'>2 - Cần cải thiện</option><option value="3"'+(v===3?' selected':'')+'>3 - Tốt</option><option value="4"'+(v===4?' selected':'')+'>4 - Rất tốt</option></select><small>Trọng số '+r.weight+'%</small></label></div>';
    }).join("");
    var flagged=risks.map(function(r){return '<label class="ops-risk"><input type="checkbox" data-ops-risk="'+h(r.id)+'"'+(state.redFlags[r.id]?' checked':'')+'><span>'+h(r.text)+'</span></label>';}).join("");
    var result=state.scored?'<div class="ops-result"><strong>'+totals.points+'/100</strong><div><h3>'+(totals.meetsReference?"Đạt ngưỡng tham khảo của rubric.":"Cần coaching hoặc đánh giá lại.")+'</h3><p>'+(totals.missed.length?'Tiêu chí trọng yếu dưới 3/4: '+totals.missed.map(function(r){return h(r.name);}).join(", ")+'. ':'')+(totals.flagged.length?'Có '+totals.flagged.length+' cảnh báo nghiêm trọng. ':'')+'Không phải quyết định chứng nhận chính thức.</p></div></div>':"";
    return page('<button class="detail-back" type="button" data-ops-back="1">← Trở về chọn tình huống</button>'+
      title("FACILITATOR-LED ROLEPLAY","Đánh giá: "+c.title,"Rubric 6 tiêu chí, 100 điểm, có điều kiện trọng yếu. Người hướng dẫn nghe/đọc phản hồi giả định và đưa nhận định thủ công.")+
      notice('<strong>Vùng chấm thủ công, không có AI tự phân tích.</strong> Điểm chỉ tính từ lựa chọn của người chấm. Không nhập dữ liệu nhận dạng hoặc nội dung khách hàng thực tế; dữ liệu ở trang này chỉ nằm trong bộ nhớ phiên hiện tại.')+
      '<div class="ops-review-layout"><div><article class="ops-panel"><p class="eyebrow">SITUATION / CONTEXT</p><h2>'+h(c.title)+'</h2><p>'+h(c.context)+'</p><p><strong>Mục tiêu:</strong> '+h(c.objective)+'</p><p class="eyebrow">SCORING RUBRIC</p>'+details+'</article>'+
      '<article class="ops-panel"><p class="eyebrow">CRITICAL SAFETY FLAGS</p><h2>Rủi ro loại trừ</h2><p>Chọn nếu đã xảy ra trong bài role-play. Có bất kỳ mục nào được đánh dấu thì không đạt ngưỡng tham khảo, bất kể tổng điểm.</p>'+flagged+'</article>'+
      '<article class="ops-panel"><p class="eyebrow">REFLECTION / COACHING</p><h2>Nhận xét của người hướng dẫn</h2><label class="roleplay-label" for="ops-notes">Ghi nhận điểm cần cải thiện (không bao gồm thông tin cá nhân)</label><textarea class="roleplay-textarea" id="ops-notes" maxlength="1200" placeholder="Chỉ ghi nhận kỹ năng và hướng cải thiện, không có dữ liệu khách hoặc nhân viên thật...">'+h(state.notes)+'</textarea><p class="source-line">Ghi chú không được đưa vào tệp kết quả xuất ra và không được lưu trên máy chủ.</p>'+
      '<div class="progress-actions"><button type="button" class="btn btn-navy" data-ops-evaluate="1">Tính điểm rubric</button><button type="button" class="btn btn-ghost" data-ops-export="1"'+(!state.scored?' disabled':'')+'>Xuất phiếu không chứa PII (JSON)</button></div>'+result+'</article></div>'+
      '<aside class="roleplay-aside"><div class="aside-panel"><p class="eyebrow">THRESHOLD</p><h3>80/100 + Safety Gate</h3><p class="care-note">Các tiêu chí trọng yếu phải đạt tối thiểu 3/4 và không có cảnh báo nghiêm trọng. Đây là **ngưỡng tham khảo được đề xuất**, cần COLORA kiểm định sau pilot. Không dùng để ra quyết định nhân sự khi chưa có xác minh.</p><div class="rule-line"><span>Tiêu chí</span><strong>6</strong></div><div class="rule-line"><span>Tổng trọng số</span><strong>100%</strong></div><div class="rule-line"><span>Điểm tối đa</span><strong>100</strong></div></div></aside></div>');
  }
  function exportResult(){
    var c=I.situations.find(function(x){return x.id===state.scenarioId;});
    if(!state.scored||!c)return;
    var result=score();
    var item={type:"COLORA_FICTIONAL_ROLEPLAY_REVIEW",version:"2.1",scenarioId:c.id,rubric:I.rubric.map(function(r){return {id:r.id,weight:r.weight,rating:state.ratings[r.id]||0,critical:!!r.critical};}),flagIds:result.flagged,points:result.points,meetsSuggestedThreshold:result.meetsReference,evaluationMethod:"manual_unverified",savedAt:new Date().toISOString(),notice:"Local export; no identity validation; not HR certification; no answer text or personal data included."};
    var blob=new Blob([JSON.stringify(item,null,2)],{type:"application/json"});
    var uri=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=uri;a.download="colora-roleplay-review-anonymous.json";document.body.appendChild(a);a.click();a.remove();
    setTimeout(function(){URL.revokeObjectURL(uri);},500);
  }
  function rerender(){var main=document.getElementById("main-content");if(main)main.innerHTML=review();}
  function handleClick(e){
    var x=e.target.closest("[data-ops-start]");
    if(x){state.scenarioId=x.dataset.opsStart;state.ratings={};state.redFlags={};state.scored=false;state.notes="";rerender();return true;}
    if(e.target.closest("[data-ops-back]")){state.scenarioId=null;state.scored=false;state.notes="";rerender();return true;}
    if(e.target.closest("[data-ops-evaluate]")){state.scored=true;rerender();return true;}
    if(e.target.closest("[data-ops-export]")){exportResult();return true;}
    var go=e.target.closest("[data-ops-go]");if(go){location.hash="#/"+go.dataset.opsGo;return true;}
    return false;
  }
  function handleChange(e){
    var a=e.target.closest("[data-ops-score]");
    if(a){state.ratings[a.dataset.opsScore]=Number(a.value)||0;state.scored=false;return true;}
    var b=e.target.closest("[data-ops-risk]");
    if(b){state.redFlags[b.dataset.opsRisk]=!!b.checked;state.scored=false;return true;}
    return false;
  }
  function handleInput(e){
    if(e.target.id==="ops-notes"){
      var s=String(e.target.value||"").slice(0,1200);
      state.notes=forbidden.test(s)?"":s;
      if(forbidden.test(s))e.target.value="";
      return true;
    }
    return false;
  }
  function render(name,id){
    if(name==="catalog")return catalog();
    if(name==="product")return product(id);
    if(name==="release")return release();
    if(name==="review")return review();
    return null;
  }
  window.COLORA_OPS={render:render,click:handleClick,change:handleChange,input:handleInput,score:score,approved:approved,approvedPolicy:approvedPolicy};
})();
