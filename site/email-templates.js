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


  /* COLORA EMAIL EDITION V2: warm Senior → Staff and branded milestones. */
  const EDITS={
  "welcome": {
    "subject": "[Tên nhân viên] ơi, chào mừng bạn đến với COLORA!",
    "body": "Chào [Tên nhân viên],\n\nVậy là chúng mình chính thức cùng một đội rồi. Chào mừng bạn đến với COLORA!\n\nMỗi người mang đến một góc nhìn và một sắc màu riêng. Tụi mình rất vui vì từ hôm nay, hành trình ấy có thêm bạn.\n\nĐể ngày đầu nhẹ nhàng hơn, mình gửi bạn vài điểm bắt đầu nhé:\n\n01 · Email công ty\nĐịa chỉ: [Email @colora.vn]\nĐăng nhập: [Đường dẫn Webmail]\nMật khẩu được cấp riêng qua kênh bảo mật, không gửi trong email này.\n\n02 · Staff Workspace\nTruy cập: https://staff.colora.vn/\nĐăng nhập bằng email công ty và mật khẩu Workspace được cấp riêng. Đây là nơi bạn có thể tìm kiến thức thương hiệu, tài liệu và các công cụ hỗ trợ công việc.\n\n03 · COLORA Shared Drive\nTài liệu chung: https://drive.google.com/drive/u/2/folders/1WDzDVYKZ8tb1X8vVSJ5soXrKK_lZlEhs\nQuyền truy cập được cấp theo phạm vi công việc.\n\nNgười đồng hành: [Tên người phụ trách]\nĐiều cần chuẩn bị: [Nếu có]\n\nCó gì chưa rõ, cứ hỏi nhé. Không ai cần thuộc lòng cả Staff Workspace ngay trong ngày đầu đâu.\n\nRất vui được làm việc cùng bạn. Chào mừng bạn đến với COLORA!\n\nThân mến,\n[Tên người gửi]\nCOLORA - COLOR YOUR AURA",
    "design": {
      "kicker": "A NEW FACET BEGINS",
      "heading": "A new chapter,\ntogether.",
      "subtitle": "Chào mừng bạn đến với COLORA"
    }
  },
  "onboarding": {
    "subject": "[Tên nhân viên] ơi, mình hẹn gặp nhau ngày [Ngày] nhé!",
    "body": "Chào [Tên nhân viên],\n\nChào mừng bạn lần nữa nhé! Mình gửi lịch buổi làm quen đầu tiên để bạn dễ sắp xếp.\n\nThời gian: [Ngày, giờ]\nĐịa điểm hoặc link họp: [Địa điểm/Đường dẫn]\nNgười đồng hành: [Tên người phụ trách]\nMình sẽ cùng nhau đi qua: COLORA, công việc của bạn, các công cụ cần dùng và những điều bạn đang thắc mắc.\n\nBạn không cần chuẩn bị gì cầu kỳ, chỉ cần [Điều cần chuẩn bị, nếu có]. Nếu lịch chưa tiện, cứ trả lời email để mình đổi giờ nhé.\n\nHẹn gặp bạn!\n[Tên người gửi]",
    "design": {
      "kicker": "YOUR FIRST DAYS",
      "heading": "See you soon.",
      "subtitle": "Một buổi làm quen, thật thoải mái."
    }
  },
  "access": {
    "subject": "[Tên nhân viên] ơi, quyền truy cập của bạn đã sẵn sàng",
    "body": "Chào [Tên nhân viên],\n\nMình vừa cập nhật quyền truy cập của bạn. Bạn mở thử tài nguyên dưới đây xem vào được chưa nhé.\n\nTài nguyên: [Tên thư mục/công cụ]\nĐường dẫn: [Link truy cập]\nPhạm vi sử dụng: [Mô tả ngắn]\n\nNếu gặp lỗi hoặc thiếu quyền, cứ trả lời email này và gửi tên tài nguyên đang vướng. Mình sẽ kiểm tra cùng bạn.\n\nMột lưu ý nhỏ: tài liệu nội bộ chỉ dùng đúng phạm vi công việc; mình không chia sẻ tài khoản hoặc chuyển tiếp quyền truy cập cho người khác nhé.\n\nCảm ơn bạn!\n[Tên người gửi]"
  },
  "review": {
    "subject": "[Tên đồng nghiệp] ơi, xem giúp mình [Hạng mục] nhé",
    "body": "Chào [Tên đồng nghiệp],\n\nMình gửi bạn bản [Tài liệu/Hạng mục], nhờ bạn xem giúp một lượt trước khi chốt nhé.\n\nLink: [Đường dẫn]\nCần xem kỹ: [Các điểm cần xác nhận]\nMong nhận phản hồi trước: [Ngày/giờ]\n\nNếu thấy chỗ nào chưa ổn, cứ comment thẳng vào file. Mình thích sửa sớm hơn là cùng nhau chữa cháy phút 89 😄\n\nCảm ơn bạn nhiều!\n[Tên người gửi]"
  },
  "update": {
    "subject": "Một chút cập nhật về [Dự án/Hạng mục] - [Ngày]",
    "body": "Chào mọi người,\n\nMình gửi cả nhà bản cập nhật ngắn về [Dự án/Hạng mục] để cùng nắm một nhịp nhé.\n\nĐã xong:\n- [Kết quả đã được xác nhận]\n\nĐang làm:\n- [Công việc tiếp theo]\n\nCần mọi người hỗ trợ:\n- [Vấn đề hoặc quyết định cần gỡ, nếu có]\n\nMốc tiếp theo: [Ngày/giờ]\n\nCó gì cần bổ sung hoặc chưa hợp lý, cứ reply ngay trong mail này. Mình tổng hợp lại để cả team đỡ phải đi tìm tin nhắn ở khắp nơi.\n\nCảm ơn mọi người!\n[Tên người gửi]"
  },
  "media": {
    "subject": "Mình gửi bạn bộ media [Chiến dịch/Hạng mục] nhé",
    "body": "Chào [Tên đồng nghiệp],\n\nBộ tài nguyên cho [Chiến dịch/Hạng mục] sẵn sàng rồi, mình để mọi thứ ở đây nhé:\n\nThư mục: [Link]\nPhiên bản: [Ngày hoặc mã bản]\nPhạm vi đã duyệt: [Kênh/Thời gian/Mục đích]\nCần để ý: [Ảnh sản phẩm COLORA, quyền sử dụng, định dạng hoặc lưu ý khác]\n\nNhờ bạn kiểm tra quyền truy cập và bản đã duyệt trước khi sử dụng. Nếu cần thêm kích thước hoặc format, cứ báo mình.\n\nCảm ơn bạn!\n[Tên người gửi]"
  }
};
  TEMPLATES.forEach(t=>{if(EDITS[t.id])Object.assign(t,EDITS[t.id]);});
  TEMPLATES.push(...[
  {
    "id": "deadline",
    "audience": "senior",
    "group": "people",
    "title": "Nhắc deadline thật nhẹ",
    "note": "Công việc · Senior → Staff",
    "subject": "[Tên nhân viên] ơi, mình nhắc nhẹ việc [Tên công việc] nhé",
    "body": "[Tên nhân viên] ơi,\n\nMình nhắn một chiếc reminder nhỏ cho [Tên công việc] nhé. Deadline sắp đến rồi, nên mình muốn kiểm tra xem bạn có cần gỡ vướng gì không.\n\nViệc cần hoàn thành: [Tên công việc]\nHạn dự kiến: [Ngày/giờ]\nKết quả bàn giao: [Link/Đầu ra]\n\nNếu mọi thứ đúng tiến độ thì tuyệt. Còn nếu có vấn đề, cứ báo sớm để mình cùng xử lý — đừng để deadline xuất hiện như plot twist nhé 😄\n\nCảm ơn bạn!\n[Tên người gửi]"
  },
  {
    "id": "announcement",
    "audience": "senior",
    "group": "people",
    "title": "Thông báo nội bộ quan trọng",
    "note": "Thông báo chính thức · Senior → Staff",
    "subject": "COLORA | Thông báo về [Nội dung] - áp dụng từ [Ngày]",
    "body": "Chào mọi người,\n\nMình gửi cả team một thông báo quan trọng liên quan đến [Chủ đề]. Mọi người dành ít phút đọc kỹ để chúng ta cùng thực hiện thống nhất nhé.\n\nNội dung thay đổi: [Mô tả cụ thể đã được phê duyệt]\nÁp dụng từ: [Ngày/giờ]\nĐối tượng áp dụng: [Bộ phận/Nhân sự]\nViệc cần thực hiện: [Các bước cụ thể]\nTài liệu tham khảo: [Đường dẫn, nếu có]\nNgười hỗ trợ: [Tên/Email]\n\nCó gì chưa rõ hoặc có tình huống thực tế cần trao đổi, mọi người cứ phản hồi trực tiếp. Mình muốn cả team hiểu rõ trước khi áp dụng, chứ không phải tự đoán.\n\nCảm ơn mọi người đã phối hợp!\n[Tên người gửi]\n[Chức danh]\nCOLORA - COLOR YOUR AURA",
    "design": {
      "kicker": "OFFICIAL INTERNAL NOTE",
      "heading": "Moving forward,\ntogether.",
      "subtitle": "Một cập nhật dành cho đội ngũ COLORA"
    }
  },
  {
    "id": "role-change",
    "audience": "senior",
    "group": "people",
    "title": "Ghi nhận / thay đổi vai trò",
    "note": "Nhân sự quan trọng · Senior → Staff",
    "subject": "COLORA | Chúc mừng [Tên nhân viên] với chặng đường mới",
    "body": "Chào [Tên nhân viên],\n\nMình có một tin vui muốn gửi đến bạn.\n\nTừ [Ngày hiệu lực], bạn sẽ đảm nhận vai trò [Vai trò mới] tại COLORA, theo quyết định đã được phê duyệt.\n\nĐiều mình trân trọng là [Đóng góp cụ thể của nhân viên]. Cảm ơn bạn vì cách bạn đã làm việc và trưởng thành cùng đội ngũ.\n\nVai trò mới: [Chức danh]\nNgày hiệu lực: [Ngày]\nNgười đồng hành: [Tên]\nBước tiếp theo: [Bàn giao/Trao đổi đã được phê duyệt]\n\nChặng mới chắc chắn có thêm những điều để học, và tụi mình sẽ cùng nhau đi qua. Chúc mừng bạn nhé!\n\nThân mến,\n[Tên người gửi]\n[Chức danh]\nCOLORA",
    "design": {
      "kicker": "A NEW MILESTONE",
      "heading": "Here's to your\nnext chapter.",
      "subtitle": "Một lời chúc mừng, một hành trình mới."
    }
  },
  {
    "id": "recognition",
    "audience": "senior",
    "group": "people",
    "title": "Thư cảm ơn & ghi nhận",
    "note": "Ghi nhận · Senior → Staff",
    "subject": "[Tên nhân viên] ơi, cảm ơn bạn vì [Đóng góp]",
    "body": "Chào [Tên nhân viên],\n\nMình muốn dành riêng email này để nói lời cảm ơn bạn.\n\n[Đóng góp cụ thể của nhân viên] đã giúp [Tác động thực tế]. Có thể giữa lịch làm việc bận rộn, những cố gắng như vậy dễ bị lướt qua, nhưng mình và team có nhìn thấy đấy.\n\nMong bạn biết rằng sự chỉn chu và tinh thần đồng hành của bạn rất có ý nghĩa với COLORA.\n\nCảm ơn bạn nhé. Cứ tiếp tục mang sắc màu riêng của mình vào những việc chúng ta làm cùng nhau.\n\nThân mến,\n[Tên người gửi]\nCOLORA",
    "design": {
      "kicker": "WITH APPRECIATION",
      "heading": "The little things\nmean a lot.",
      "subtitle": "Một lời cảm ơn dành riêng cho bạn."
    }
  },
  {
    "id": "check-in",
    "audience": "senior",
    "group": "people",
    "title": "Hẹn trò chuyện 1:1",
    "note": "Đồng hành · Senior → Staff",
    "subject": "[Tên nhân viên] ơi, mình hẹn trò chuyện một chút nhé",
    "body": "[Tên nhân viên] ơi,\n\nDạo này công việc của bạn thế nào rồi? Mình muốn hẹn bạn một buổi trò chuyện ngắn để nghe xem phần nào đang thuận lợi, phần nào đang làm bạn vướng và mình có thể hỗ trợ gì.\n\nThời gian đề xuất: [Ngày/giờ]\nHình thức: [Trực tiếp/Online]\nThời lượng: [Số phút]\n\nBạn không cần chuẩn bị báo cáo đâu, cứ chia sẻ thoải mái nhé. Nếu giờ này chưa tiện, mình đổi lịch được.\n\nHẹn bạn!\n[Tên người gửi]"
  }
]);

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
  const designedBox=$('email-template-designed');
  const designedFrame=$('email-template-preview');
  const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const chosenTemplate=()=>visible.find(t=>t.id===chosen);
  function designHTML(template,body){
    if(!template.design)return '';
    const detail=template.design;
    const paras=String(body).replace(/\r\n?/g,'\n').split(/\n{2,}/).map(chunk=>{
      const lines=chunk.split('\n').map(line=>{
        const safe=escapeHTML(line);
        const match=safe.match(/^([^:]{2,48}:)(\s*)(.*)$/);
        return match?'<strong style="font-weight:600;color:#002451">'+match[1]+'</strong>'+match[2]+match[3]:safe;
      }).join('<br>');
      return '<p style="margin:0 0 19px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.85;color:#3C4D61">'+lines+'</p>';
    }).join('');
    const heading=escapeHTML(detail.heading).replace(/\n/g,'<br>');
    const kicker=escapeHTML(detail.kicker), subtitle=escapeHTML(detail.subtitle);
    return '<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>COLORA · Internal Email</title></head>'+
      '<body style="margin:0;padding:0;background:#EEE7DA">'+
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;background:#EEE7DA"><tr><td align="center" style="padding:28px 12px">'+
      '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;border-collapse:collapse;background:#F4EDE1">'+
      '<tr><td style="background:#002451;padding:30px 42px 28px"><div style="font-family:Georgia,serif;font-size:34px;line-height:1;letter-spacing:4px;color:#F4EDE1">COLORA</div>'+
      '<div style="margin-top:13px;font-family:Arial,sans-serif;font-size:9px;letter-spacing:3px;font-weight:bold;color:#D9C6AB">COLOR YOUR AURA</div></td></tr>'+
      '<tr><td style="padding:38px 42px 18px"><div style="font-family:Arial,sans-serif;font-size:10px;font-weight:bold;letter-spacing:2.5px;color:#9C774A">'+kicker+'</div>'+
      '<h1 style="margin:16px 0 0;font-family:Georgia,Times New Roman,serif;font-weight:normal;font-size:42px;line-height:1.08;letter-spacing:-1px;color:#002451">'+heading+'</h1>'+
      '<div style="font-family:Arial,sans-serif;font-size:13px;line-height:1.6;color:#706F6B;margin-top:18px">'+subtitle+'</div></td></tr>'+
      '<tr><td style="padding:8px 42px 4px"><div style="height:1px;background:#CFBFA9;font-size:1px;line-height:1px">&nbsp;</div></td></tr>'+
      '<tr><td style="padding:28px 42px 15px">'+paras+'</td></tr>'+
      '<tr><td style="padding:2px 42px 43px"><div style="height:1px;background:#CFBFA9;font-size:1px;line-height:1px">&nbsp;</div>'+
      '<div style="margin-top:23px;font-family:Georgia,serif;font-size:19px;letter-spacing:2px;color:#002451">COLORA</div>'+
      '<div style="margin-top:6px;font-family:Arial,sans-serif;font-size:10px;line-height:1.6;letter-spacing:1px;color:#947B5B">COLORA - COLOR YOUR AURA</div></td></tr>'+
      '</table><div style="font-family:Arial,sans-serif;font-size:10px;line-height:1.6;color:#867B6C;margin-top:18px">For COLORA team · Internal communication</div>'+
      '</td></tr></table></body></html>';
  }
  function refreshDesigned(){
    const t=chosenTemplate();
    const hasDesign=!!(t&&t.design);
    designedBox.hidden=!hasDesign;
    if(hasDesign)designedFrame.srcdoc=designHTML(t,message.value);
    else designedFrame.removeAttribute('srcdoc');
  }
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
    notify('Thay các thông tin [ ] trước khi gửi. Bản nháp chỉ nằm trong trình duyệt.');
    refreshDesigned();
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

  $('email-template-copy-rich').addEventListener('click',async()=>{
    const t=chosenTemplate();if(!t||!t.design)return;
    if(typeof ClipboardItem==='undefined'||!navigator.clipboard?.write){
      notify('Trình duyệt chưa hỗ trợ sao chép email có định dạng. Hãy dùng nút Tải HTML hoặc sao chép bản chữ.');return;
    }
    const html=designHTML(t,message.value);
    try{
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':new Blob([html],{type:'text/html'}),
        'text/plain':new Blob([message.value],{type:'text/plain'})
      })]);
      notify('Đã sao chép bản thiết kế. Dán vào nội dung Gmail/Outlook rồi kiểm tra hiển thị trước khi gửi.');
    }catch{
      notify('Không thể sao chép email có định dạng. Thử Tải HTML hoặc dùng bản văn bản.');
    }
  });
  $('email-template-download-html').addEventListener('click',()=>{
    const t=chosenTemplate();if(!t||!t.design)return;
    const file=new Blob([designHTML(t,message.value)],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(file),a=doc.createElement('a');
    a.href=url;a.download='colora-'+t.id+'-email.html';
    doc.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2500);
    notify('Đã tạo bản HTML. Kiểm tra các mục [ ] và nội dung trước khi sử dụng.');
  });
  for(const field of [subject,message])
    field.addEventListener('input',()=>{notify('Đang chỉnh bản nháp. Nội dung không được lưu hoặc gửi lên máy chủ.');refreshDesigned();});
  select(visible[0]?.id);
  window.COLORA_EMAIL_TEMPLATES={count:visible.length,select};

})();
