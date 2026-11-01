/* COLORA Academy: zero-backend practice aids. No customer data, no sizing promises. */
(function(){
  "use strict";
  var mode="ring",diameter="",wrist="",allowance="",caseId="loose";
  var root=function(){return document.getElementById("main-content");};
  function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function n(v){if(v===""||v===null)return NaN;return Number(String(v).replace(",","."));}
  function num(v){return Number.isFinite(v)?v.toLocaleString("vi-VN",{minimumFractionDigits:1,maximumFractionDigits:2}):"—";}
  function panel(kicker,title,desc,body){return '<div class="page"><div class="practice-intro"><p class="eyebrow">'+kicker+'</p><h1>'+title+'</h1><p>'+desc+'</p></div>'+body+'</div>';}
  function fitBody(){
    return panel("FIT LAB / CALCULATION ONLY","Đo đúng trước khi chọn size",
      "Thực hành quan hệ số đo cơ bản. Không phải bảng size chính thức hay đề xuất mua SKU COLORA.",
      '<div class="notice"><strong>Giới hạn:</strong> Nhẫn: chu vi trong = π × đường kính trong. Vòng tay mềm: chiều dài minh họa = chu vi cổ tay + khoảng chừa do người dùng tự chọn. Chưa tính độ dày bản, khóa, charm, khả năng đi qua khớp tay hoặc cấu trúc bangle cứng.</div>'+
      '<div class="fit-tabbar"><button class="fit-tab '+(mode==="ring"?"selected":"")+'" data-fit-mode="ring" type="button">Nhẫn</button><button class="fit-tab '+(mode==="bracelet"?"selected":"")+'" data-fit-mode="bracelet" type="button">Vòng tay mềm</button></div>'+
      (mode==="ring"?
        '<div class="fit-layout"><section class="fit-panel"><p class="eyebrow">INNER DIAMETER</p><h2>Đường kính trong</h2><label for="fit-d">Đường kính bên trong, đơn vị mm</label><input id="fit-d" type="number" min="10" max="28" step="0.01" inputmode="decimal" placeholder="Ví dụ: 17.15" value="'+esc(diameter)+'"><p class="fit-hint">Chỉ nhập số đo hình học, không nhập tên, số điện thoại hay thông tin đơn hàng.</p></section><section class="fit-result"><p class="eyebrow">INNER CIRCUMFERENCE</p><strong id="fit-value">—</strong><p id="fit-status">Nhập đường kính để xem chu vi.</p><small>Công thức: C = π × d. Kết quả không phải ni US/EU/JP hoặc ni riêng của COLORA.</small></section></div>':
        '<div class="fit-layout"><section class="fit-panel"><p class="eyebrow">SOFT BRACELET</p><h2>Chu vi và độ chừa</h2><label for="fit-wrist">Chu vi cổ tay (cm)</label><input id="fit-wrist" type="number" min="10" max="30" step="0.1" inputmode="decimal" placeholder="Ví dụ: 15.5" value="'+esc(wrist)+'"><label for="fit-extra">Khoảng chừa do người hướng dẫn chọn (cm)</label><input id="fit-extra" type="number" min="0" max="5" step="0.1" inputmode="decimal" placeholder="Tự nhập, không có chuẩn mặc định" value="'+esc(allowance)+'"><p class="fit-hint">Đây là minh họa cộng số học, không phải công thức fit áp dụng chung cho mọi mẫu.</p></section><section class="fit-result"><p class="eyebrow">ILLUSTRATIVE LENGTH</p><strong id="fit-value">—</strong><p id="fit-status">Nhập cả chu vi và khoảng chừa.</p><small>Bangle cứng cần kiểm tra bàn tay, khớp và đường kính trong. Vòng charm/khóa đặc biệt cần đối chiếu SKU và QC.</small></section></div>')+
      '<div class="practice-rule"><h3>Trước khi tư vấn thực tế</h3><p>Đối chiếu kích thước đo được với bảng size đã phê duyệt cho đúng SKU/biến thể. Với nhẫn bản rộng, nhẫn có phần đầu lớn, vòng tay có charm hoặc khóa đặc biệt, không kết luận từ một phép tính.</p><a href="#/evidence">SKU Evidence Gate ↗</a></div>');
  }
  var careCases=[
    {id:"loose",title:"Chấu hoặc viên đá bị lỏng",status:"Ưu tiên an toàn",body:"Khuyên khách tạm ngừng đeo và cất riêng sản phẩm. Không hướng dẫn siết chấu, dùng keo hoặc tiếp tục thử độ lỏng. Ghi nhận mô tả và chuyển kiểm tra kỹ thuật.",reason:"Dấu hiệu mất ổn định có thể gây mất đá hoặc làm nặng hư hỏng."},
    {id:"dirt",title:"Bụi bẩn nhẹ, chưa thấy hư hại",status:"Chăm sóc thận trọng",body:"Ưu tiên khăn mềm sạch, khô. Muốn làm sạch sâu cần kiểm tra danh tính đá, treatment, kim loại, finish, kết cấu thực tế và hướng dẫn QC cho đúng SKU.",reason:"Hướng dẫn vệ sinh đá rời không chứng minh một món trang sức hoàn thiện chịu được hóa chất, hơi nước hoặc siêu âm."},
    {id:"coating",title:"Bề mặt đổi màu hoặc lớp phủ bất thường",status:"Cần xác minh",body:"Ghi nhận tình trạng, thời điểm, ảnh nếu khách thuận tiện cung cấp và thông tin SKU. Không kết luận là lỗi người dùng; không khuyến nghị ngâm/tẩy bạc khi chưa biết cấu hình.",reason:"Thay đổi màu có thể liên quan đến môi trường đeo, lớp phủ, vật liệu và chất lượng hoàn thiện."},
    {id:"broken",title:"Khóa, mắt dây hoặc chi tiết nối hỏng",status:"Tạm ngừng sử dụng",body:"Khuyên khách ngừng đeo để tránh rơi mất. Không hướng dẫn tự nối keo hay dùng kìm. Mở case và xin QC đánh giá kết cấu.",reason:"Kết cấu suy yếu có thể làm thất lạc sản phẩm hoặc gây xước da."},
    {id:"unknown",title:"Không xác định loại đá hoặc treatment",status:"Chưa đủ thông tin",body:"Không tự suy luận 'đá tự nhiên = không xử lý'. Hướng dẫn bảo quản nhẹ nhàng, tránh nhiệt/hóa chất và xin hồ sơ đúng viên đá/biến thể trước khi đưa lời khuyên cụ thể.",reason:"Thông tin khoáng vật, xử lý đá và lớp phủ thay đổi cách chăm sóc."}
  ];
  function careBody(){
    var c=careCases.find(function(x){return x.id===caseId;})||careCases[0];
    return panel("CARE TRIAGE / GUIDED PRACTICE","Chọn hành động an toàn","Bài tập tình huống giả định từ kiến thức chăm sóc đã có trong Academy; không thay thế phân tích lỗi và phê duyệt bảo hành của QC.",
      '<div class="notice">Không sử dụng tình huống khách thật hoặc tải ảnh/hồ sơ cá nhân lên website công khai. Chưa xác minh điều khoản bảo hành không đồng nghĩa được tự hứa hoặc tự từ chối quyền lợi.</div>'+
      '<div class="care-triage"><div class="care-choice"><p class="eyebrow">CHỌN HIỆN TƯỢNG</p>'+careCases.map(function(x){return '<button type="button" data-care-id="'+esc(x.id)+'" class="'+(x.id===caseId?"active":"")+'">'+esc(x.title)+'</button>';}).join("")+'</div>'+
      '<div class="care-guidance"><p class="eyebrow">HƯỚNG XỬ LÝ THAM KHẢO</p><span class="care-status">'+esc(c.status)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.body)+'</p><h3>Vì sao?</h3><p>'+esc(c.reason)+'</p><div class="care-disclaimer">Nếu khách cần giải pháp dịch vụ, sử dụng case ID, người phụ trách, lịch cập nhật và chính sách được duyệt; không suy luận quyền lợi chỉ từ hiện tượng.</div><a href="#/cases" class="btn btn-navy">Luyện tình huống xử lý ↗</a></div></div>');
  }
  function calculate(){
    var display=document.getElementById("fit-value"),status=document.getElementById("fit-status");
    if(!display||!status)return;
    if(mode==="ring"){
      var d=n(diameter),valid=d>=10&&d<=28;
      display.textContent=valid?num(Math.PI*d)+" mm":"—";
      status.textContent=valid?"Chu vi trong hình học, không phải mã ni.":"Nhập đường kính hợp lệ từ 10 đến 28 mm.";
    }else{
      var w=n(wrist),a=n(allowance),valid=w>=10&&w<=30&&a>=0&&a<=5;
      display.textContent=valid?num(w+a)+" cm":"—";
      status.textContent=valid?"Chiều dài minh họa, cần kiểm tra cấu trúc thực tế.":"Nhập chu vi cổ tay và khoảng chừa hợp lệ.";
    }
  }
  function render(page){
    if(page==="fitlab")return fitBody();
    if(page==="careguide")return careBody();
    return null;
  }
  function click(e){
    var x=e.target.closest("[data-fit-mode]");if(x){mode=x.dataset.fitMode;root().innerHTML=fitBody();calculate();return true;}
    var c=e.target.closest("[data-care-id]");if(c){caseId=c.dataset.careId;root().innerHTML=careBody();return true;}
    return false;
  }
  function input(e){
    if(e.target.id==="fit-d"){diameter=e.target.value;calculate();return true;}
    if(e.target.id==="fit-wrist"){wrist=e.target.value;calculate();return true;}
    if(e.target.id==="fit-extra"){allowance=e.target.value;calculate();return true;}
    return false;
  }
  window.COLORA_PRACTICE={render:render,click:click,input:input};
})();