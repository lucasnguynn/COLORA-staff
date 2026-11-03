'use strict';
/* Copy-only email library; no passwords, customer data or drafts are saved or sent. */
(function(){
  const TEMPLATES=[
  {
    "id": "welcome",
    "audience": "senior",
    "group": "people",
    "title": "Chào mừng thành viên mới",
    "note": "Onboarding · Senior",
    "subject": "COLORA | Chào mừng [Tên nhân viên] gia nhập đội ngũ",
    "body": "Chào [Tên nhân viên],\n\nChào mừng bạn gia nhập COLORA!\n\nCOLORA rất vui khi được chào đón một thành viên mới và hy vọng đây sẽ là khởi đầu cho một hành trình đồng hành ý nghĩa, với nhiều cơ hội học hỏi và phát triển.\n\nĐể thuận tiện cho quá trình làm việc, dưới đây là thông tin các tài khoản và tài nguyên nội bộ:\n\n1. Email công ty\n\nEmail: [Email @colora.vn]\nMật khẩu: [Được cấp riêng qua kênh bảo mật]\nĐăng nhập tại: [Đường dẫn Webmail]\n\n2. COLORA Staff Workspace\n\nWebsite: https://staff.colora.vn/\nEmail đăng nhập: [Email công ty]\nMật khẩu: [Được cấp riêng qua kênh bảo mật]\n\nStaff Workspace là không gian nội bộ cung cấp kiến thức về thương hiệu, sản phẩm, khách hàng cùng các công cụ hỗ trợ công việc hằng ngày.\n\n3. COLORA Shared Drive\n\nTruy cập: COLORA Tổng - https://drive.google.com/drive/u/2/folders/1WDzDVYKZ8tb1X8vVSJ5soXrKK_lZlEhs\n\nThư mục tổng hợp tài liệu, hình ảnh và các tài nguyên phục vụ công việc của COLORA. Quyền truy cập được cấp tùy theo phạm vi công việc.\n\nVui lòng bảo mật thông tin đăng nhập và sử dụng các tài nguyên nội bộ đúng mục đích. Mọi vấn đề liên quan đến tài khoản hoặc quyền truy cập có thể liên hệ trực tiếp với COLORA để được hỗ trợ.\n\nMột lần nữa, chào mừng bạn đến với COLORA. Chúc bạn có một khởi đầu thuận lợi và nhiều trải nghiệm đáng nhớ trong hành trình sắp tới!\n\nThân mến,\n[Tên người gửi]\nCOLORA"
  },
  {
    "id": "onboarding",
    "audience": "senior",
    "group": "people",
    "title": "Lịch gặp gỡ & onboarding",
    "note": "Nhân sự · Senior",
    "subject": "COLORA | Lịch onboarding của [Tên nhân viên]",
    "body": "Chào [Tên nhân viên],\n\nCOLORA gửi bạn lịch gặp gỡ đầu tiên để chúng ta làm quen với cách làm việc, các tài nguyên nội bộ và những điều cần chuẩn bị cho vai trò mới.\n\nThời gian: [Ngày, giờ]\nHình thức/Địa điểm: [Địa điểm hoặc đường dẫn họp]\nNgười đồng hành: [Tên người phụ trách]\nNội dung: Giới thiệu COLORA, phạm vi công việc, công cụ nội bộ và các câu hỏi của bạn.\n\nNếu thời gian này chưa phù hợp, bạn cứ phản hồi để chúng ta sắp xếp lại nhé.\n\nHẹn gặp bạn!\n[Tên người gửi]\nCOLORA"
  },
  {
    "id": "access",
    "audience": "senior",
    "group": "people",
    "title": "Xác nhận cấp quyền tài liệu",
    "note": "Quyền truy cập · Senior",
    "subject": "COLORA | Thông tin quyền truy cập của [Tên nhân viên]",
    "body": "Chào [Tên nhân viên],\n\nCOLORA đã cập nhật quyền truy cập nội bộ của bạn theo phạm vi công việc hiện tại.\n\nTài nguyên: [Tên thư mục hoặc công cụ]\nĐường dẫn: [Link truy cập]\nPhạm vi sử dụng: [Mô tả ngắn]\n\nBạn vui lòng kiểm tra xem đã mở được tài nguyên chưa. Nếu còn vướng ở bước đăng nhập hoặc phân quyền, hãy phản hồi email này để được hỗ trợ.\n\nLưu ý: chỉ sử dụng tài nguyên trong phạm vi công việc và không chuyển tiếp quyền truy cập cho người khác.\n\nCảm ơn bạn,\n[Tên người gửi]\nCOLORA"
  },
  {
    "id": "inquiry",
    "audience": "staff",
    "group": "clients",
    "title": "Phản hồi yêu cầu tư vấn",
    "note": "Khách hàng · Staff / Senior",
    "subject": "COLORA | Cảm ơn bạn đã liên hệ",
    "body": "Chào [Tên khách hàng],\n\nCảm ơn bạn đã dành thời gian liên hệ với COLORA.\n\nChúng tôi đã nhận được chia sẻ của bạn về [Sản phẩm hoặc nhu cầu]. Để tư vấn phù hợp hơn, COLORA xin phép tìm hiểu thêm về [Thông tin cần xác nhận].\n\nKhi có đủ thông tin, chúng tôi sẽ phản hồi với những lựa chọn phù hợp và thông tin sản phẩm đã được xác nhận.\n\nNếu có điều gì bạn muốn chia sẻ thêm, bạn cứ trả lời email này nhé.\n\nThân mến,\n[Tên người gửi]\nCOLORA - COLOR YOUR AURA"
  },
  {
    "id": "customize",
    "audience": "staff",
    "group": "clients",
    "title": "Bổ sung yêu cầu cá nhân hóa",
    "note": "Khách hàng · Staff / Senior",
    "subject": "COLORA | Một vài chi tiết cho dấu ấn riêng của bạn",
    "body": "Chào [Tên khách hàng],\n\nCOLORA cảm ơn bạn đã tin tưởng chia sẻ ý tưởng cá nhân hóa.\n\nĐể hiểu rõ hơn về dấu ấn bạn mong muốn, chúng tôi xin phép xác nhận một vài chi tiết:\n- Dành tặng ai: [Người nhận]\n- Tông màu đá: [Màu đá mong muốn]\n- Câu chuyện hoặc thông điệp: [Không bắt buộc]\n- Sản phẩm hoặc kích thước cần lưu ý: [Thông tin liên quan]\n\nSau khi nhận được thông tin, COLORA sẽ đối chiếu khả năng thực hiện với đội ngũ chuyên môn trước khi xác nhận phương án và thời gian.\n\nCảm ơn bạn vì đã để COLORA trở thành một phần trong câu chuyện này.\n\nThân mến,\n[Tên người gửi]\nCOLORA"
  },
  {
    "id": "progress",
    "audience": "staff",
    "group": "clients",
    "title": "Cập nhật tiến độ yêu cầu",
    "note": "Khách hàng · Staff / Senior",
    "subject": "COLORA | Cập nhật về [Sản phẩm/Yêu cầu]",
    "body": "Chào [Tên khách hàng],\n\nCOLORA muốn gửi đến bạn một cập nhật về [Sản phẩm hoặc yêu cầu].\n\nTình trạng đã xác nhận: [Thông tin thực tế]\nBước tiếp theo: [Công việc tiếp theo]\nThời điểm dự kiến cập nhật: [Ngày/giờ, nếu đã được xác nhận]\n\nChúng tôi sẽ tiếp tục theo dõi và thông tin đến bạn khi có thay đổi được xác nhận. Cảm ơn bạn đã kiên nhẫn và tin tưởng COLORA.\n\nThân mến,\n[Tên người gửi]\nCOLORA"
  },
  {
    "id": "aftercare",
    "audience": "staff",
    "group": "clients",
    "title": "Hỏi thăm sau khi nhận trang sức",
    "note": "Client Care · Staff / Senior",
    "subject": "COLORA | Một lời hỏi thăm dành cho bạn",
    "body": "Chào [Tên khách hàng],\n\nCOLORA hy vọng món trang sức mới đã mang đến cho bạn những khoảnh khắc thật đẹp.\n\nChúng tôi muốn hỏi thăm xem trải nghiệm của bạn với [Sản phẩm] đến lúc này có thuận tiện không. Nếu bạn cần hỗ trợ về cách đeo, bảo quản hay chăm sóc sản phẩm, COLORA luôn sẵn sàng lắng nghe.\n\nBạn cũng có thể tham khảo hướng dẫn chăm sóc được cung cấp cùng sản phẩm và các chính sách hiện hành trên website COLORA.\n\nCảm ơn bạn đã chọn COLORA.\n\nThân mến,\n[Tên người gửi]\nCOLORA - COLOR YOUR AURA"
  },
  {
    "id": "review",
    "audience": "staff",
    "group": "internal",
    "title": "Nhờ kiểm tra nội dung / sản phẩm",
    "note": "Phối hợp nội bộ · Staff / Senior",
    "subject": "COLORA | Nhờ kiểm tra [Hạng mục] trước [Ngày]",
    "body": "Chào [Tên đồng nghiệp],\n\nMình gửi bạn [Tài liệu hoặc hạng mục] để nhờ kiểm tra trước khi chúng ta sử dụng hoặc xuất bản.\n\nĐường dẫn: [Link tài liệu]\nMục cần đối chiếu: [Các điểm cần xác nhận]\nThời điểm mong nhận phản hồi: [Ngày/giờ]\n\nNếu thấy thông tin nào chưa chính xác hoặc cần bổ sung, bạn cứ ghi chú trực tiếp hoặc phản hồi qua email này nhé. Mình sẽ cập nhật sau khi nhận ý kiến.\n\nCảm ơn bạn nhiều!\n[Tên người gửi]"
  },
  {
    "id": "update",
    "audience": "staff",
    "group": "internal",
    "title": "Cập nhật tiến độ công việc",
    "note": "Phối hợp nội bộ · Staff / Senior",
    "subject": "COLORA | Cập nhật [Dự án/Hạng mục] - [Ngày]",
    "body": "Chào mọi người,\n\nMình gửi một cập nhật ngắn về [Dự án/Hạng mục]:\n\nĐã hoàn thành:\n- [Kết quả đã xác nhận]\n\nĐang thực hiện:\n- [Công việc tiếp theo]\n\nCần hỗ trợ hoặc quyết định:\n- [Vấn đề cần trao đổi, nếu có]\n\nMốc tiếp theo: [Ngày dự kiến]\n\nMọi người có thể phản hồi ngay trong email này nếu có điều gì cần điều chỉnh.\n\nCảm ơn mọi người,\n[Tên người gửi]"
  },
  {
    "id": "media",
    "audience": "staff",
    "group": "internal",
    "title": "Bàn giao hình ảnh & nội dung",
    "note": "Creative / Marketing · Staff / Senior",
    "subject": "COLORA | Bàn giao tài nguyên [Chiến dịch/Hạng mục]",
    "body": "Chào [Tên đồng nghiệp],\n\nMình gửi bộ tài nguyên cho [Chiến dịch/Hạng mục] tại đây:\n\nTài liệu / media: [Link thư mục]\nPhiên bản: [Ngày hoặc mã phiên bản]\nPhạm vi sử dụng được duyệt: [Kênh / thời gian / mục đích]\nCác điểm cần lưu ý: [Sản phẩm COLORA thật, quyền sử dụng ảnh, định dạng]\n\nNhờ bạn kiểm tra quyền truy cập và đối chiếu với guideline trước khi sử dụng. Nếu cần thêm định dạng hoặc phiên bản khác, cứ báo mình nhé.\n\nCảm ơn bạn,\n[Tên người gửi]"
  }
];

  const doc=document, $=id=>doc.getElementById(id);
  const list=$('email-template-list');
  const subject=$('email-template-subject');
  const message=$('email-template-body');
  if(!list||!subject||!message)return;
  const isSenior=doc.body.dataset.staffRole==='senior';
  const visible=TEMPLATES.filter(t=>t.audience!=='senior'||isSenior);
  const status=$('email-template-status');
  const search=$('email-template-search');
  let chosen='',filter='all';
  function notify(text){status.textContent=text;}
  function matches(t){
    const query=search.value.trim().toLocaleLowerCase('vi-VN');
    return (filter==='all'||filter===t.group)&&(!query||
      [t.title,t.subject,t.note].join(' ').toLocaleLowerCase('vi-VN').includes(query));
  }
  function select(id){
    const t=visible.find(x=>x.id===id);
    if(!t)return;
    chosen=id;
    subject.value=t.subject;
    message.value=t.body;
    $('email-template-current').textContent=t.note;
    $('email-template-title').textContent=t.title;
    $('email-template-security').hidden=t.id!=='welcome';
    notify('Điền các phần [ ] trước khi gửi. Nội dung chỉ nằm trong trang đang mở.');
    render();
  }
  function render(){
    list.replaceChildren();
    const filtered=visible.filter(matches);
    for(const t of filtered){
      const b=doc.createElement('button');b.type='button';b.className='email-template-option';
      b.classList.toggle('active',t.id===chosen);
      b.setAttribute('aria-pressed',String(t.id===chosen));
      const label=doc.createElement('span');label.className='email-template-option-type';label.textContent=t.note;
      const title=doc.createElement('strong');title.textContent=t.title;
      const icon=doc.createElement('span');icon.className='email-template-option-arrow';
      icon.textContent='→';icon.setAttribute('aria-hidden','true');
      b.append(label,title,icon);b.addEventListener('click',()=>select(t.id));
      list.append(b);
    }
    if(!filtered.length){
      const p=doc.createElement('p');p.className='email-template-empty';
      p.textContent='Chưa tìm thấy mẫu phù hợp. Hãy thử từ khóa khác.';
      list.append(p);
    }
    $('email-template-count').textContent=filtered.length+' mẫu';
  }
  $('email-template-filters').querySelectorAll('[data-template-filter]').forEach(button=>{
    if(button.dataset.templateFilter==='people'&&!isSenior){button.hidden=true;return;}
    button.setAttribute('aria-pressed',String(button.dataset.templateFilter==='all'));
    button.addEventListener('click',()=>{
      filter=button.dataset.templateFilter;
      $('email-template-filters').querySelectorAll('button').forEach(x=>
        x.setAttribute('aria-pressed',String(x===button)));
      render();
    });
  });
  search.addEventListener('input',render);
  $('email-template-reset').addEventListener('click',()=>select(chosen));
  async function copy(text){
    if(!text.trim()){notify('Chưa có nội dung để sao chép.');return;}
    try{await navigator.clipboard.writeText(text);notify('Đã sao chép. Vui lòng kiểm tra trước khi gửi.');}
    catch{
      try{
        const f=doc.createElement('textarea');f.value=text;
        f.style.cssText='position:fixed;opacity:0';doc.body.append(f);f.select();
        const ok=doc.execCommand('copy');f.remove();
        notify(ok?'Đã sao chép. Vui lòng kiểm tra trước khi gửi.':
          'Không thể sao chép tự động. Hãy chọn nội dung và sao chép thủ công.');
      }catch{notify('Không thể sao chép tự động. Hãy chọn nội dung và sao chép thủ công.');}
    }
  }
  $('email-template-copy-subject').addEventListener('click',()=>copy(subject.value));
  $('email-template-copy-body').addEventListener('click',()=>copy(message.value));
  $('email-template-copy-all').addEventListener('click',()=>copy('Tiêu đề: '+subject.value+'\n\n'+message.value));
  for(const field of [subject,message])
    field.addEventListener('input',()=>notify('Đang chỉnh bản nháp. Nội dung không được lưu hoặc gửi lên máy chủ.'));
  select(visible[0]?.id);
  window.COLORA_EMAIL_TEMPLATES={count:visible.length,select};

})();
