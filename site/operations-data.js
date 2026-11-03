/* Public SOP guide only. Do not add actual budgets, suppliers, contracts, bank details or customer records. */
window.COLORA_OPERATIONS = {
  "version": "2026-11-03-practical-v2",
  "status": "DRAFT_FOR_FOUNDER_APPROVAL",
  "notice": "Quy trình tham khảo, chờ COLORA phê duyệt hạn mức chi và người có quyền ký.",
  "security": "Báo giá, hợp đồng và thông tin đối tác thực tế chỉ lưu trong Drive / Sheets có phân quyền.",
  "principles": [
    "Vượt ngân sách thì xin duyệt trước khi mua.",
    "Mua hàng cần tìm ít nhất 5 nhà cung cấp, trừ trường hợp ngoại lệ được chấp thuận.",
    "Những gì thống nhất qua điện thoại hoặc Zalo cần được xác nhận lại qua email công ty.",
    "Tài khoản nhận tiền phải được kiểm tra trước khi chuyển.",
    "Không nhập dữ liệu thật của công ty vào website Staff."
  ],
  "stages": [
    "Ghi nhu cầu",
    "Tìm 5 nhà cung cấp",
    "Nhận báo giá",
    "Tự so sánh trên Sheets",
    "Chọn và xin duyệt",
    "Ký / đặt hàng",
    "Nhận hàng và thanh toán"
  ],
  "sources": [
    {
      "label": "Luật sửa đổi Luật Quảng cáo 75/2025/QH15",
      "url": "https://vbpl.vn/FileData/TW/Lists/vbpq/Attachments/179167/VanBanGoc_LUAT_SDBS_LUAT_QUANG_CAO_FINAL%20%282%29.pdf",
      "scope": "Hiệu lực 01-01-2026"
    },
    {
      "label": "Luật Sở hữu trí tuệ sửa đổi 131/2025/QH15",
      "url": "https://vanban.chinhphu.vn/?docid=216511&pageid=27160",
      "scope": "Hiệu lực 01-04-2026"
    },
    {
      "label": "Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15",
      "url": "https://vanban.chinhphu.vn/?docid=214590&pageid=27160&typegroupid=3",
      "scope": "Hiệu lực 01-01-2026"
    },
    {
      "label": "Nghị định 70/2025/NĐ-CP về hóa đơn",
      "url": "https://vanban.chinhphu.vn/?classid=1&docid=213179&pageid=27160&typegroupid=4",
      "scope": "Hiệu lực 01-06-2025"
    }
  ],
  "procedures": [
    {
      "id": "budget-overrun",
      "group": "Ngân sách",
      "title": "Khi mua hàng vượt ngân sách",
      "trigger": "Chi phí dự kiến cao hơn ngân sách còn lại.",
      "owner": "Nhân viên đề nghị - Trưởng bộ phận - Finance - Người có quyền duyệt",
      "steps": [
        {
          "action": "Dừng đặt cọc hoặc xác nhận mua khi chưa được duyệt.",
          "evidence": ""
        },
        {
          "action": "Gửi bảng ngắn: ngân sách còn lại, số cần chi, phần vượt và lý do.",
          "evidence": ""
        },
        {
          "action": "Đề xuất cách xử lý: giảm số lượng, đổi phương án, xin thêm ngân sách hoặc dời lịch.",
          "evidence": ""
        },
        {
          "action": "Trưởng bộ phận và Finance kiểm tra; gửi người có quyền duyệt quyết định bằng văn bản.",
          "evidence": ""
        },
        {
          "action": "Chỉ tiếp tục mua sau khi được duyệt. Cập nhật ngân sách và theo dõi khoản chi.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không chia nhỏ hóa đơn để tránh xin duyệt.",
        "Không nhờ người khác ứng tiền rồi hợp thức hóa sau."
      ],
      "records": [
        "Yêu cầu vượt ngân sách",
        "Email / văn bản duyệt",
        "Bảng theo dõi ngân sách"
      ],
      "decision": "Chưa có phê duyệt thì chưa mua."
    },
    {
      "id": "purchase-intake",
      "group": "Mua hàng",
      "title": "Từ yêu cầu mua đến báo giá",
      "trigger": "Cần đặt hàng, vật tư, đá, bao bì hoặc thuê dịch vụ.",
      "owner": "Nhân viên cần mua - Trưởng bộ phận",
      "steps": [
        {
          "action": "Ghi rõ cần mua gì, số lượng, yêu cầu cơ bản, hạn cần hàng và ngân sách dự kiến.",
          "evidence": ""
        },
        {
          "action": "Tìm ít nhất 5 nhà cung cấp phù hợp. Nếu thực tế không đủ 5, báo lý do cho trưởng bộ phận.",
          "evidence": ""
        },
        {
          "action": "Gửi cùng một nội dung yêu cầu báo giá tới các nhà cung cấp, ưu tiên email doanh nghiệp.",
          "evidence": ""
        },
        {
          "action": "Lưu tất cả báo giá gốc vào Drive của công ty, đặt tên dễ tìm theo ngày và hạng mục.",
          "evidence": ""
        },
        {
          "action": "Mở bảng so sánh trống trong Google Sheets để tự ghi nhận điều quan trọng với lần mua này.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không nhận báo giá chỉ qua cuộc gọi mà không có xác nhận.",
        "Không đặt cọc ngay khi mới nhận báo giá."
      ],
      "records": [
        "Yêu cầu mua hàng",
        "Báo giá và liên hệ nhà cung cấp",
        "Bảng Google Sheets"
      ],
      "decision": "Chỉ chuyển sang chọn nhà cung cấp khi đã có thông tin đủ để so sánh."
    },
    {
      "id": "supplier-screening",
      "group": "Mua hàng",
      "title": "Kiểm tra nhà cung cấp trước khi chọn",
      "trigger": "Đã có nhà cung cấp muốn hợp tác nhưng chưa xác minh.",
      "owner": "Nhân viên mua hàng - Người phụ trách sản phẩm / Finance khi cần",
      "steps": [
        {
          "action": "Xác nhận tên đơn vị, người phụ trách và cách liên hệ chính thức.",
          "evidence": ""
        },
        {
          "action": "Kiểm tra mẫu hoặc kết quả đã làm; xin thông tin pháp nhân và chứng từ phù hợp với giao dịch.",
          "evidence": ""
        },
        {
          "action": "Với bạc, đá và sản phẩm: hỏi rõ chất liệu, xuất xứ, xử lý đá, tiêu chuẩn mẫu và cách giải quyết hàng lỗi.",
          "evidence": ""
        },
        {
          "action": "Xác minh thông tin thanh toán từ nguồn độc lập trước khi chuyển tiền.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Nhà cung cấp yêu cầu chuyển sang tài khoản cá nhân mà không giải thích hợp lệ.",
        "Người nhận tiền không khớp với thỏa thuận.",
        "Không cung cấp bằng chứng về chất lượng như đã hứa."
      ],
      "records": [
        "Thông tin đối tác đã xác minh",
        "Mẫu / phản hồi kiểm tra"
      ],
      "decision": "Thông tin quan trọng còn mâu thuẫn thì hỏi lại trước khi ký hoặc đặt cọc."
    },
    {
      "id": "supplier-comparison",
      "group": "Mua hàng",
      "title": "So sánh và chọn nhà cung cấp",
      "trigger": "Có nhiều báo giá và cần đề xuất một lựa chọn.",
      "owner": "Nhân viên phụ trách - Trưởng bộ phận",
      "steps": [
        {
          "action": "Nhập tên ít nhất 5 nhà cung cấp vào mẫu bảng trống trong Google Sheets.",
          "evidence": ""
        },
        {
          "action": "Tự chọn những thông tin cần so sánh phù hợp với loại hàng hoặc dịch vụ lần này. Không cần chấm điểm.",
          "evidence": ""
        },
        {
          "action": "Đối chiếu báo giá gốc, trao đổi thêm những điểm chưa rõ và cập nhật Sheet.",
          "evidence": ""
        },
        {
          "action": "Chọn phương án đề xuất, viết ngắn vì sao chọn và gửi trưởng bộ phận duyệt.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không cần cố ép mọi nhà cung cấp vào bộ tiêu chí giống nhau.",
        "Không sửa báo giá gốc để làm một phương án trông tốt hơn."
      ],
      "records": [
        "Bảng so sánh tự lập",
        "Báo giá gốc",
        "Xác nhận lựa chọn"
      ],
      "decision": "Nhân viên tự đánh giá và đề xuất. Người có quyền duyệt mới chốt việc mua."
    },
    {
      "id": "negotiation",
      "group": "Mua hàng",
      "title": "Đàm phán với nhà cung cấp",
      "trigger": "Đã chọn đối tác tiềm năng và cần thống nhất hợp tác.",
      "owner": "Nhân viên mua hàng - Trưởng bộ phận",
      "steps": [
        {
          "action": "Chuẩn bị mức giá mong muốn và những điều muốn thương lượng trước khi liên hệ.",
          "evidence": ""
        },
        {
          "action": "Trao đổi về giá, số lượng, giao hàng, đặt cọc, chất lượng và cách xử lý khi phát sinh lỗi.",
          "evidence": ""
        },
        {
          "action": "Sau cuộc gọi hoặc Zalo, gửi email tóm tắt những gì đã thống nhất để bên kia xác nhận.",
          "evidence": ""
        },
        {
          "action": "Lưu email, báo giá cuối và ghi rõ việc ai phải làm tiếp, hạn nào.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không để thỏa thuận chỉ nằm trong tin nhắn hoặc cuộc gọi cá nhân.",
        "Không nhận hoa hồng hoặc lợi ích riêng từ nhà cung cấp.",
        "Có yêu cầu đổi tài khoản nhận tiền thì xác minh lại trước khi chuyển."
      ],
      "records": [
        "Báo giá cuối",
        "Email xác nhận",
        "Việc cần theo dõi"
      ],
      "decision": "Không tự hứa điều khoản vượt quyền được giao."
    },
    {
      "id": "contract-po",
      "group": "Mua hàng",
      "title": "Trước khi ký hợp đồng hoặc đặt cọc",
      "trigger": "Sắp ký hợp đồng, phát đơn đặt hàng hoặc thanh toán trước.",
      "owner": "Nhân viên phụ trách - Finance - Người có quyền ký",
      "steps": [
        {
          "action": "Kiểm tra đúng đơn vị ký, tên hàng / dịch vụ, số lượng, giá và lịch bàn giao.",
          "evidence": ""
        },
        {
          "action": "Đọc kỹ điều khoản thanh toán, đặt cọc, nghiệm thu, sửa lỗi, hủy hợp đồng và tự động gia hạn.",
          "evidence": ""
        },
        {
          "action": "Với media hoặc thiết kế, xác nhận ai sở hữu file, hình ảnh, quyền sử dụng và bản gốc.",
          "evidence": ""
        },
        {
          "action": "Nếu có điều khoản chưa rõ, yêu cầu sửa bằng văn bản. Chuyển người có quyền ký duyệt bản cuối.",
          "evidence": ""
        },
        {
          "action": "Lưu bản đã ký và ghi chú các mốc cần theo dõi vào Sheet.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không ký vào bản khác với bản đã duyệt.",
        "Không thanh toán chỉ vì đối tác nói cần gấp.",
        "Không bỏ qua điều khoản tự động gia hạn hoặc phí phát sinh."
      ],
      "records": [
        "Hợp đồng / PO bản đã ký",
        "Lịch thanh toán - bàn giao"
      ],
      "decision": "Chưa có bản cuối được duyệt thì chưa ký, chưa cọc."
    },
    {
      "id": "receiving-qc",
      "group": "Mua hàng",
      "title": "Nhận hàng và xử lý hàng lỗi",
      "trigger": "Nhà cung cấp giao hàng, mẫu hoặc sản phẩm hoàn chỉnh.",
      "owner": "Người nhận hàng - QC / bộ phận sử dụng",
      "steps": [
        {
          "action": "Kiểm đếm số lượng và đối chiếu đúng hàng đã đặt.",
          "evidence": ""
        },
        {
          "action": "Kiểm tra mẫu, chất lượng hoặc file bàn giao theo thỏa thuận; ghi lại lỗi nếu có.",
          "evidence": ""
        },
        {
          "action": "Nếu không đạt, giữ nguyên bằng chứng và báo nhà cung cấp để thống nhất xử lý.",
          "evidence": ""
        },
        {
          "action": "Xác nhận nghiệm thu phần đạt rồi mới chuyển Finance thanh toán theo hợp đồng.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không xác nhận hàng đạt khi chưa kiểm tra.",
        "Không thanh toán toàn bộ khi đang có lỗi chưa xử lý mà hợp đồng chưa cho phép."
      ],
      "records": [
        "Biên bản giao nhận / nghiệm thu",
        "Ảnh và danh sách lỗi nếu có"
      ],
      "decision": "Chỉ nghiệm thu phần thực sự đạt."
    },
    {
      "id": "media-agency-selection",
      "group": "Media & Marketing",
      "title": "Chọn media agency",
      "trigger": "Cần thuê agency quay, chụp, sáng tạo, PR hoặc chạy quảng cáo.",
      "owner": "Marketing - Brand - Trưởng bộ phận",
      "steps": [
        {
          "action": "Viết brief ngắn: muốn làm gì, bao nhiêu sản phẩm, đầu ra cần nhận, deadline và ngân sách.",
          "evidence": ""
        },
        {
          "action": "Tham khảo ít nhất 5 agency phù hợp, xem dự án họ đã thực hiện thật.",
          "evidence": ""
        },
        {
          "action": "Nhận proposal và báo giá; tách rõ tiền sản xuất, phí agency và tiền chạy quảng cáo.",
          "evidence": ""
        },
        {
          "action": "Trao đổi những phần chưa rõ và tự so sánh phương án dựa trên nhu cầu chiến dịch.",
          "evidence": ""
        },
        {
          "action": "Đề xuất đối tác, gửi duyệt rồi mới chốt lịch và hợp đồng.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không chọn chỉ vì proposal đẹp mà chưa hiểu sản phẩm họ từng làm.",
        "Không cấp mật khẩu chính hoặc quyền sở hữu tài khoản quảng cáo cho agency."
      ],
      "records": [
        "Brief",
        "Proposal / báo giá",
        "Email xác nhận chọn agency"
      ],
      "decision": "Chưa duyệt ngân sách và phạm vi thì chưa thuê."
    },
    {
      "id": "media-agency-execution",
      "group": "Media & Marketing",
      "title": "Làm việc và theo dõi media agency",
      "trigger": "Agency đã được chọn và chuẩn bị sản xuất hoặc chạy chiến dịch.",
      "owner": "Marketing project owner - Agency account manager",
      "steps": [
        {
          "action": "Kickoff: chốt lịch, người liên hệ, số lượng video / ảnh, hạn góp ý và hạn bàn giao.",
          "evidence": ""
        },
        {
          "action": "Gửi đúng tài liệu thương hiệu và sản phẩm đã duyệt; thống nhất ai duyệt nội dung trước khi đăng.",
          "evidence": ""
        },
        {
          "action": "Theo dõi công việc bằng một bảng chung: việc gì, ai phụ trách, deadline, trạng thái, file link.",
          "evidence": ""
        },
        {
          "action": "Khi agency phát sinh chi phí hoặc thay đổi sản phẩm bàn giao, yêu cầu báo trước và xác nhận qua email.",
          "evidence": ""
        },
        {
          "action": "Trước nghiệm thu, kiểm tra đủ file cuối, quyền sử dụng, hóa đơn và thu hồi quyền truy cập khi kết thúc.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không để agency tự đăng nội dung, cam kết công dụng hoặc đổi brief khi chưa duyệt.",
        "Không giao toàn bộ dữ liệu khách hàng hoặc tài khoản chính.",
        "Không chấp nhận phí phát sinh chỉ thông báo sau khi thực hiện."
      ],
      "records": [
        "Brief / lịch công việc",
        "File nhận bàn giao",
        "Email duyệt và nghiệm thu"
      ],
      "decision": "Theo dõi theo đầu việc và deadline, không cần báo cáo dài nếu không có vấn đề."
    },
    {
      "id": "campaign-release",
      "group": "Media & Marketing",
      "title": "Kiểm tra trước khi đăng chiến dịch",
      "trigger": "Sắp đăng quảng cáo, social post, video hoặc cập nhật website.",
      "owner": "Marketing - Brand - Người phụ trách sản phẩm",
      "steps": [
        {
          "action": "Kiểm tra nội dung, hình ảnh, mã sản phẩm và giá theo bản đã duyệt.",
          "evidence": ""
        },
        {
          "action": "Kiểm tra quyền dùng hình, nhạc, video và phần text có thể gây hiểu nhầm.",
          "evidence": ""
        },
        {
          "action": "Nhờ người phụ trách duyệt bản cuối qua email hoặc kênh công ty.",
          "evidence": ""
        },
        {
          "action": "Đăng, kiểm tra link hiển thị thực tế trên điện thoại và ghi lại các lỗi cần sửa.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không đăng ảnh sản phẩm của thương hiệu khác như của COLORA.",
        "Không tự công bố chứng nhận, chính sách hoặc ưu đãi chưa được duyệt."
      ],
      "records": [
        "Bản đăng cuối",
        "Xác nhận duyệt",
        "Link sau đăng"
      ],
      "decision": "Có thay đổi giá, chính sách hoặc tuyên bố sản phẩm thì phải duyệt lại."
    },
    {
      "id": "payment-close",
      "group": "Ngân sách",
      "title": "Thanh toán và đối soát",
      "trigger": "Đến hạn đặt cọc, thanh toán giai đoạn hoặc quyết toán.",
      "owner": "Nhân viên đề nghị - Người nghiệm thu - Finance",
      "steps": [
        {
          "action": "Kiểm tra đã có phê duyệt và đúng hợp đồng / báo giá cuối.",
          "evidence": ""
        },
        {
          "action": "Đối chiếu số tiền, hóa đơn, biên bản nghiệm thu và số đã trả trước đó.",
          "evidence": ""
        },
        {
          "action": "Finance xác minh tài khoản nhận tiền, nhất là khi đối tác vừa yêu cầu thay đổi.",
          "evidence": ""
        },
        {
          "action": "Sau thanh toán, lưu chứng từ và cập nhật trạng thái trong Sheet theo dõi.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không chuyển tiền chỉ từ tin nhắn cá nhân.",
        "Không bỏ qua đối soát số tiền đã đặt cọc."
      ],
      "records": [
        "Chứng từ thanh toán",
        "Hóa đơn / nghiệm thu",
        "Sheet theo dõi"
      ],
      "decision": "Thiếu hồ sơ hoặc thông tin nhận tiền bất thường thì hỏi Finance trước khi trả."
    },
    {
      "id": "information-security",
      "group": "Vận hành",
      "title": "Khi có dấu hiệu lừa đảo hoặc lộ thông tin",
      "trigger": "Nhận email lạ, thông tin ngân hàng thay đổi, link đáng ngờ hoặc phát hiện mất quyền truy cập.",
      "owner": "Người phát hiện - Người quản lý - Phụ trách hệ thống / Finance",
      "steps": [
        {
          "action": "Không bấm link lạ, chuyển tiền hoặc cung cấp mật khẩu.",
          "evidence": ""
        },
        {
          "action": "Báo ngay quản lý và người phụ trách theo kênh công ty; giữ nguyên tin nhắn, email làm bằng chứng.",
          "evidence": ""
        },
        {
          "action": "Xác minh người gửi bằng số điện thoại hoặc email đã biết từ trước, không dùng thông tin mới trong tin đáng ngờ.",
          "evidence": ""
        },
        {
          "action": "Người có trách nhiệm xử lý quyền truy cập và kiểm tra phạm vi ảnh hưởng.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không chia sẻ OTP hay mật khẩu.",
        "Không tải thông tin khách hàng và hợp đồng lên Staff Workspace tĩnh."
      ],
      "records": [
        "Bằng chứng sự cố lưu riêng",
        "Xác nhận đã xử lý"
      ],
      "decision": "Không tự xóa bằng chứng hoặc xử lý sự cố tài chính một mình."
    },
    {
      "id": "handover-project",
      "group": "Vận hành",
      "title": "Bàn giao việc cho người khác",
      "trigger": "Đổi người phụ trách, nghỉ phép, kết thúc dự án hoặc ngừng hợp tác.",
      "owner": "Người bàn giao - Người nhận - Trưởng bộ phận",
      "steps": [
        {
          "action": "Liệt kê việc đang làm, tình trạng hiện tại và việc còn chờ.",
          "evidence": ""
        },
        {
          "action": "Gửi link file, bảng theo dõi, hợp đồng liên quan cùng deadline và người liên hệ.",
          "evidence": ""
        },
        {
          "action": "Xác nhận người nhận đã hiểu các việc cần tiếp tục.",
          "evidence": ""
        },
        {
          "action": "Điều chỉnh quyền truy cập Drive, ad account hoặc công cụ khi cần.",
          "evidence": ""
        }
      ],
      "redFlags": [
        "Không bàn giao mật khẩu cá nhân.",
        "Không bỏ sót việc đã đặt cọc hoặc lịch thanh toán sắp đến."
      ],
      "records": [
        "Bảng bàn giao ngắn",
        "Danh sách việc chưa xong"
      ],
      "decision": "Việc có người nhận và hạn rõ ràng mới coi là đã bàn giao."
    }
  ]
};
