/* Public SOP proposals only - no real budgets, vendor records, contracts or customer data. */
window.COLORA_OPERATIONS = {
  "version": "2026-11-03-proposed-v1",
  "status": "DRAFT_FOR_FOUNDER_APPROVAL",
  "notice": "Đây là quy trình vận hành đề xuất. Chưa có bảng phân quyền / hạn mức chi được COLORA phê duyệt trong dữ liệu public. Không dùng để tự cấp quyền mua, ký hay thanh toán.",
  "security": "Nội dung playbook và index của website tĩnh là public. Chỉ nhập thông tin nhà cung cấp, hợp đồng, báo giá thực vào Drive/Sheets được phân quyền, không điền vào Staff Workspace.",
  "principles": [
    "Không đặt cọc, ký, phát PO hoặc vượt ngân sách khi chưa có phê duyệt đúng thẩm quyền.",
    "Mua hàng thông thường phải tìm ít nhất 5 nhà cung cấp. Nếu thị trường đặc thù không đủ, giải trình và xin ngoại lệ bằng văn bản.",
    "Không tự động chọn báo giá thấp nhất. Hard gate về chất lượng, chứng từ, pháp nhân, tài khoản thanh toán và quyền IP được ưu tiên.",
    "Trao đổi điện thoại / Zalo có thể dùng để điều phối; các điều khoản và quyết định phải xác nhận qua email doanh nghiệp hoặc văn bản đã ký.",
    "Không nhập thông tin mật của vendor, hợp đồng, chi phí, nhân sự, khách hàng vào website Staff tĩnh.",
    "Người lập yêu cầu, người duyệt và người nghiệm thu cần có kiểm soát độc lập ở mức phù hợp với quy mô doanh nghiệp."
  ],
  "stages": [
    "REQUEST",
    "BUDGET CHECK",
    "5 SUPPLIERS",
    "RFQ",
    "SHEET COMPARISON",
    "DUE DILIGENCE",
    "NEGOTIATE",
    "APPROVAL / CONTRACT",
    "PO",
    "DELIVERY & QC",
    "3-WAY MATCH",
    "CLOSE / REVIEW"
  ],
  "rubric": [
    {
      "id": "quality",
      "title": "Chất lượng / phù hợp spec",
      "weight": 25
    },
    {
      "id": "cost",
      "title": "Tổng chi phí quy đổi",
      "weight": 20
    },
    {
      "id": "delivery",
      "title": "Giao hàng / năng lực thực hiện",
      "weight": 15
    },
    {
      "id": "evidence",
      "title": "Hồ sơ / độ tin cậy",
      "weight": 15
    },
    {
      "id": "terms",
      "title": "Điều khoản / rủi ro hợp đồng",
      "weight": 10
    },
    {
      "id": "aftercare",
      "title": "Bảo hành / xử lý vấn đề",
      "weight": 10
    },
    {
      "id": "ethics",
      "title": "Minh bạch / đạo đức",
      "weight": 5
    }
  ],
  "gates": [
    "Đúng spec và tiêu chuẩn nghiệm thu bắt buộc",
    "Xác minh nhà cung cấp và tài khoản nhận tiền",
    "Có hồ sơ QC, treatment, IP hoặc chứng từ theo loại mua hàng",
    "Không có xung đột lợi ích / rủi ro chưa xử lý",
    "Có budget và quyền duyệt trước khi cam kết"
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
      "group": "Finance & Governance",
      "title": "Chi tiêu vượt ngân sách",
      "trigger": "Một yêu cầu mua, hợp đồng gia hạn hoặc thay đổi phạm vi làm vượt phần ngân sách đã duyệt.",
      "owner": "Requester + Department Lead + Finance + CEO / người được ủy quyền",
      "steps": [
        {
          "action": "Tạm dừng cam kết mới, đặt cọc hoặc gửi PO; xác nhận phần đã cam kết trước đó.",
          "evidence": "Budget hiện hành, committed spend, actual spend, số dư còn lại."
        },
        {
          "action": "Giải thích chênh lệch: sai dự toán, thay đổi scope, biến động giá, tình huống khẩn cấp.",
          "evidence": "Budget vs actual vs committed và nguyên nhân, ảnh hưởng cash flow."
        },
        {
          "action": "Đề xuất ít nhất hai phương án: thu hẹp scope, đổi spec, đàm phán, lùi lịch, chuyển khoản ngân sách nếu được phép hoặc xin bổ sung.",
          "evidence": "Cost / benefit / risk / deadline của từng phương án."
        },
        {
          "action": "Department Lead đối chiếu ưu tiên; Finance kiểm tra ngân sách, cash runway, thuế và cam kết hiện hữu.",
          "evidence": "Biên bản rà soát độc lập, số tiền cần bổ sung."
        },
        {
          "action": "Chỉ CEO hoặc người được ủy quyền bằng văn bản quyết định tăng ngân sách / ngoại lệ.",
          "evidence": "Văn bản phê duyệt có người duyệt, thời điểm, phạm vi và mức trần."
        },
        {
          "action": "Sau phê duyệt mới sửa kế hoạch, phát hành PO/contract change; cập nhật forecast hàng tuần.",
          "evidence": "Approval link, PO revision, budget register, owner."
        }
      ],
      "redFlags": [
        "Chia nhỏ giao dịch để né hạn mức phê duyệt.",
        "Hợp thức hóa việc đã đặt cọc hoặc cam kết miệng sau khi chi.",
        "Tự viện lý do cấp bách để mua ngay khi chưa có phân quyền.",
        "Dùng ngân sách phòng ban khác mà không có xác nhận."
      ],
      "records": [
        "Budget exception request",
        "Budget vs committed vs actual",
        "Decision log / reforecast"
      ],
      "decision": "HOLD khi chưa có phê duyệt chi vượt. Không có hạn mức VND được COLORA ký duyệt trong bản công khai này."
    },
    {
      "id": "purchase-intake",
      "group": "Procurement",
      "title": "Đề nghị mua hàng và RFQ",
      "trigger": "Có nhu cầu mua vật tư, bao bì, đá, dụng cụ, software hoặc dịch vụ ngoài.",
      "owner": "Requesting department + Procurement coordinator",
      "steps": [
        {
          "action": "Làm Purchase Request: mục đích, dự án, spec, số lượng, chất lượng bắt buộc, lịch cần hàng, ngân sách và owner.",
          "evidence": "PR ID, budget line, tiêu chí nghiệm thu."
        },
        {
          "action": "Phân biệt must-have với nice-to-have; quyết định cần sample, test, chứng thư, IP, NDA hay không.",
          "evidence": "Spec / acceptance checklist phiên bản thống nhất."
        },
        {
          "action": "Xác nhận ngân sách còn lại và người có thẩm quyền trước khi phát RFQ.",
          "evidence": "Budget check và quyết định không vượt hạn mức."
        },
        {
          "action": "Gửi RFQ cùng một brief cho tối thiểu 5 nhà cung cấp có khả năng đáp ứng, qua kênh doanh nghiệp có lưu vết.",
          "evidence": "5 contact entries, nguồn tìm, thời điểm liên hệ, RFQ version."
        },
        {
          "action": "Đặt cùng hạn phản hồi; làm rõ khác biệt bằng addendum gửi đồng đều cho nhà cung cấp liên quan.",
          "evidence": "Lịch Q&A và email bổ sung cho cùng scope."
        },
        {
          "action": "Khóa RFQ, lưu báo giá gốc, kiểm tra đủ điều kiện so sánh; nếu thiếu chào giá đáp ứng, ghi nhận lý do.",
          "evidence": "Quotation register và exception request nếu thiếu lựa chọn."
        }
      ],
      "redFlags": [
        "Tách RFQ khác spec để đẩy một vendor lên vị trí số một.",
        "Báo giá chỉ qua tài khoản chat cá nhân, không có bản xác nhận từ đại diện có thẩm quyền.",
        "Vendor yêu cầu chuyển tiền trước khi được duyệt."
      ],
      "records": [
        "Purchase Request",
        "RFQ brief / sample acceptance",
        "Vendor outreach register"
      ],
      "decision": "Mặc định tìm tối thiểu 5 nhà cung cấp. Trường hợp hàng đặc thù không đủ 5 phải ghi minh chứng tìm kiếm và xin phê duyệt ngoại lệ."
    },
    {
      "id": "supplier-screening",
      "group": "Procurement",
      "title": "Thẩm định nhà cung cấp",
      "trigger": "Đã tìm được các nhà cung cấp tiềm năng, trước so giá hoặc ký hợp đồng.",
      "owner": "Procurement + Product/QC + Finance",
      "steps": [
        {
          "action": "Kiểm tra pháp nhân, mã số thuế, địa chỉ, tên đại diện, lĩnh vực hoạt động, thông tin xuất hóa đơn.",
          "evidence": "Nguồn tra cứu độc lập và chứng từ tự cung cấp."
        },
        {
          "action": "Đối chiếu email miền công ty, số điện thoại, tài khoản ngân hàng đứng tên đối tác theo hợp đồng.",
          "evidence": "Thông tin nhận thanh toán xác minh qua kênh độc lập."
        },
        {
          "action": "Xem năng lực thật: mẫu, portfolio có quyền sử dụng, khách hàng tham chiếu, lead time, khả năng xử lý khiếu nại.",
          "evidence": "Sample report / capability checklist."
        },
        {
          "action": "Với bạc và đá màu: làm rõ xuất xứ, natural / treatment, lot, QC, dung sai, tính truy xuất và test được yêu cầu.",
          "evidence": "Bộ chứng từ đúng lô/SKU nếu liên quan; không tự suy đoán certificate."
        },
        {
          "action": "Kiểm tra rủi ro phụ thuộc một xưởng, MOQ, subcontracting, chất lượng nhất quán, xung đột lợi ích.",
          "evidence": "Supplier risk review và declaration không xung đột."
        }
      ],
      "redFlags": [
        "Chỉ dùng thương hiệu cá nhân / fanpage làm chứng cứ tư cách pháp nhân.",
        "Tài khoản nhận cọc không khớp tên bên ký.",
        "Đòi bỏ kiểm tra sample/QC với lý do thân quen.",
        "Supplier yêu cầu bí mật liên hệ với đội ngũ khác trong công ty."
      ],
      "records": [
        "Supplier screening checklist",
        "Legal / tax verification record",
        "Quality / treatment evidence reference"
      ],
      "decision": "HOLD nếu không xác minh được đối tác hoặc quyền nhận thanh toán."
    },
    {
      "id": "supplier-comparison",
      "group": "Procurement",
      "title": "So sánh báo giá trên Google Sheets",
      "trigger": "Đã nhận chào giá và cần chọn shortlist / đề xuất bên thắng.",
      "owner": "Procurement + requesting department + Finance",
      "steps": [
        {
          "action": "Đưa toàn bộ quotation gốc vào Drive có quyền truy cập; đặt tên SUP-YYYYMM-XX, tuyệt đối không upload tài liệu mật vào website tĩnh.",
          "evidence": "Quotation files / date / validity / scope revision."
        },
        {
          "action": "Chuẩn hóa tất cả báo giá về cùng spec, số lượng, tiền tệ, VAT treatment, vận chuyển, thuế nhập khẩu không hoàn lại, bảo hành và lead time.",
          "evidence": "Tổng landed cost, điều kiện không so sánh được và tỷ giá được duyệt."
        },
        {
          "action": "Chấm 7 nhóm tiêu chí trên thang 1-5 với trọng số 100; chỉ chấm khi có bằng chứng.",
          "evidence": "Quality 25, cost 20, delivery 15, evidence 15, terms 10, aftersales 10, ethics 5."
        },
        {
          "action": "Áp dụng hard gate trước bảng xếp hạng: đúng spec, chứng từ, tư cách vendor, thanh toán, IP/treatment/QC khi cần.",
          "evidence": "Pass / Hold reason; giá thấp không vượt qua hard gate."
        },
        {
          "action": "Lập top 2-3 đề xuất; nêu supplier có tổng chi phí thấp nhất, điểm cao nhất, trade-off và lý do chọn.",
          "evidence": "Comparison sheet version và summary recommendation."
        },
        {
          "action": "Người đánh giá và người phê duyệt khác nhau ký xác nhận; chỉ sau đó bước vào đàm phán / phát PO.",
          "evidence": "Decision record và approval trước cam kết."
        }
      ],
      "redFlags": [
        "Chọn tự động giá rẻ nhất hoặc điểm cao nhất khi hard gate fail.",
        "So sánh báo giá thiếu cùng điều kiện VAT, shipping hoặc hợp đồng.",
        "Ẩn quotation bất lợi hoặc tự sửa quotation gốc."
      ],
      "records": [
        "Google Sheets comparison",
        "Quotations register",
        "Selection memo"
      ],
      "decision": "Điểm chỉ giúp ra quyết định. Không phải giấy phép tự động chọn nhà cung cấp hay bỏ qua xác minh."
    },
    {
      "id": "negotiation",
      "group": "Procurement",
      "title": "Đàm phán và theo dõi cam kết",
      "trigger": "Có shortlist cần cải thiện giá, điều khoản hoặc trách nhiệm thực thi.",
      "owner": "Procurement + request owner + Finance / CEO theo phân quyền",
      "steps": [
        {
          "action": "Chuẩn bị BATNA, mục tiêu, giới hạn nhượng bộ và hạng mục không được đổi: QC, nguồn gốc, IP, nghĩa vụ thanh toán an toàn.",
          "evidence": "Negotiation brief và phạm vi được phép."
        },
        {
          "action": "Đàm phán tổng chi phí và giá trị: giá, MOQ, sample, lead time, giao nhiều đợt, lỗi, sửa lỗi, thanh toán theo nghiệm thu, bảo hành.",
          "evidence": "Offer vs counteroffer log; tác động ngân sách."
        },
        {
          "action": "Mọi cuộc gọi/Zalo trực tiếp chỉ là trao đổi; gửi recap qua email công ty cho đại diện đã xác minh, yêu cầu xác nhận bằng văn bản.",
          "evidence": "Email recap có thời điểm, điều khoản thay đổi, owner."
        },
        {
          "action": "Khi đổi pháp nhân nhận tiền, tài khoản hoặc người phụ trách, xác minh bằng kênh thứ hai độc lập; tạm dừng thanh toán.",
          "evidence": "Bank-change verification log."
        },
        {
          "action": "Khóa offer cuối cùng có thời hạn, version, điều kiện; review pháp lý / Finance trước khi ký.",
          "evidence": "Final quote + redline + sign-off."
        },
        {
          "action": "Sau ký theo dõi obligation register, deadline, acceptance, issue, payment milestone và rủi ro.",
          "evidence": "Supplier tracker cập nhật theo kỳ."
        }
      ],
      "redFlags": [
        "Chuyển thương lượng sang số cá nhân và phủ nhận email công ty.",
        "Đề nghị kickback / hoa hồng cá nhân hoặc quà không khai báo.",
        "Điều khoản thay đổi sau email chỉ có xác nhận qua chat.",
        "Đổi tài khoản nhận tiền gấp trong ngày."
      ],
      "records": [
        "Negotiation log",
        "Email decision trail",
        "Obligation and renewal tracker"
      ],
      "decision": "Không coi recap một phía là phụ lục thay đổi đã được hai bên chấp thuận."
    },
    {
      "id": "contract-po",
      "group": "Procurement",
      "title": "Kiểm soát hợp đồng, PO và đặt cọc",
      "trigger": "Có phương án lựa chọn đã duyệt, trước khi ràng buộc trách nhiệm công ty.",
      "owner": "Contract owner + Finance + authorized signatory",
      "steps": [
        {
          "action": "Đối chiếu đúng pháp nhân, người ký có thẩm quyền, MST, ngân hàng, phụ lục scope/spec và quotation version.",
          "evidence": "Contract/PO checklist với legal identity."
        },
        {
          "action": "Ghi rõ deliverables, số lượng, tiêu chuẩn nghiệm thu, dung sai, phê duyệt sample, thời hạn, địa điểm, giao từng đợt.",
          "evidence": "Acceptance annex và test plan."
        },
        {
          "action": "Khóa giá bao gồm / chưa bao gồm VAT, freight, FX, phí ẩn; điều kiện đặt cọc và hoàn cọc; thời điểm xuất hóa đơn.",
          "evidence": "Payment schedule gắn mốc chứng cứ."
        },
        {
          "action": "Quy định lỗi, hàng không đạt, thời hạn sửa / thay / hoàn, trách nhiệm mất mát, cơ chế chậm giao và xử lý tranh chấp.",
          "evidence": "Remedy & escalation terms; chế tài phải được rà soát pháp lý."
        },
        {
          "action": "Kiểm tra bảo mật, dữ liệu khách, quyền đối với file thiết kế, subcontractor, sử dụng lại tác phẩm, chấm dứt và bàn giao.",
          "evidence": "IP/data handoff annex nếu áp dụng."
        },
        {
          "action": "Yêu cầu approver độc lập xác nhận, lưu bản cuối và chữ ký hợp lệ, rồi mới phát PO / thanh toán.",
          "evidence": "Signed contract, PO, approval ID và ngân hàng đã đối soát."
        }
      ],
      "redFlags": [
        "Điều khoản tự động gia hạn không có nhắc nhở / cửa sổ chấm dứt.",
        "Đặt cọc 100% nhưng không có bảo đảm / mốc nghiệm thu tương xứng.",
        "Cam kết bằng giọng nói thay vì văn bản có quyền ký.",
        "Tài khoản cá nhân không tương ứng bên cung cấp hợp đồng."
      ],
      "records": [
        "Contract approval checklist",
        "Signed PO / agreement",
        "Renewal and obligations tracker"
      ],
      "decision": "Điều khoản mẫu cần được rà soát theo giao dịch và pháp luật; không thay tư vấn pháp lý."
    },
    {
      "id": "receiving-qc",
      "group": "Product & Production",
      "title": "Nhận hàng, nghiệm thu và QC",
      "trigger": "Nhà cung cấp giao vật tư, đá, thành phẩm, bao bì hoặc asset đã đặt.",
      "owner": "Receiving owner + QC + Finance",
      "steps": [
        {
          "action": "Đối chiếu đơn hàng, số lượng, lot, niêm phong, giao nhận và tình trạng hàng ngay khi nhận.",
          "evidence": "Delivery note + PO + photographs theo chính sách quyền dữ liệu."
        },
        {
          "action": "Kiểm tra đúng spec, sample/approved CAD, đá/treatment/finish/chấu và an toàn đeo khi liên quan.",
          "evidence": "QC record đúng SKU / lot; không suy từ mẫu khác."
        },
        {
          "action": "Cách ly hàng không đạt, lập NCR với ảnh, defect, thời hạn xử lý; không tự sửa để che lỗi.",
          "evidence": "Nonconformance report và claim với vendor."
        },
        {
          "action": "Nghiệm thu từng hạng mục theo evidence, không xác nhận hoàn thành sớm để giải ngân.",
          "evidence": "Acceptance sign-off theo milestone."
        },
        {
          "action": "Finance 3-way match: PO/contract - biên bản nhận/nghiệm thu - hóa đơn hợp lệ; thanh toán theo phê duyệt.",
          "evidence": "Payment packet, đối soát và lưu hồ sơ."
        }
      ],
      "redFlags": [
        "QC đạt chỉ qua ảnh render/portfolio.",
        "Dùng chứng thư lô khác để chứng minh chất lượng lô hiện tại.",
        "Thanh toán khi thiếu biên bản nghiệm thu / yêu cầu chuyển gấp."
      ],
      "records": [
        "Goods receipt / QC checklist",
        "NCR and resolution",
        "3-way match packet"
      ],
      "decision": "QC và quyền thanh toán là hai bước độc lập."
    },
    {
      "id": "media-agency-selection",
      "group": "Media & Marketing",
      "title": "Tuyển chọn media agency",
      "trigger": "Cần studio, agency, production house, ads/PR/creative partner hoặc media buying.",
      "owner": "Marketing Lead + Brand/Product + Finance + CEO",
      "steps": [
        {
          "action": "Phát agency brief: objective, persona, KPI có thể đo, ngân sách trần, deliverables, lịch, kênh và quyền thương hiệu.",
          "evidence": "Agency brief v1 + evaluation rubric."
        },
        {
          "action": "Shortlist tối thiểu 5 agency phù hợp theo quy tắc tìm vendor; nếu thị trường chuyên biệt thiếu lựa chọn, ghi nhận và xin ngoại lệ.",
          "evidence": "Agency outreach register và năng lực kiểm chứng."
        },
        {
          "action": "Yêu cầu proposal cùng format: strategy, production scope, số lần chỉnh, team, media spend vs service fee, timeline và exclusions.",
          "evidence": "Comparable proposal and fee breakdown."
        },
        {
          "action": "Chấm năng lực thực, hiểu Brand DNA, quyền asset, chất lượng production, báo cáo, chi phí, risk; tham chiếu khách hàng nếu có.",
          "evidence": "Pitch scorecard & due diligence."
        },
        {
          "action": "Chạy pilot/paid test giới hạn khi phù hợp; không giao toàn bộ tài khoản hoặc dữ liệu trước khi có thỏa thuận.",
          "evidence": "Pilot success criteria, limited access."
        },
        {
          "action": "Chọn agency theo decision memo và duyệt ngân sách/hợp đồng; xác định một point of contact chính thức mỗi bên.",
          "evidence": "Decision + statement of work."
        }
      ],
      "redFlags": [
        "Proposal không phân biệt fee và tiền media.",
        "Dùng ảnh/footage thương hiệu khác để trình bày như case đã thực hiện cho COLORA.",
        "Pitch hứa doanh số / impressions cố định không có giả định.",
        "Đòi password hoặc quyền sở hữu ad account của COLORA."
      ],
      "records": [
        "Agency brief / pitch scorecard",
        "Supplier due diligence",
        "SOW and pilot approval"
      ],
      "decision": "KPI mục tiêu là giả thuyết quản trị; kết quả kinh doanh không được bảo đảm nếu không có thỏa thuận rõ."
    },
    {
      "id": "media-agency-execution",
      "group": "Media & Marketing",
      "title": "Triển khai và giám sát media agency",
      "trigger": "Agency đã được chọn, trước khi chụp, quay, chạy quảng cáo hoặc nghiệm thu.",
      "owner": "Brand owner + Marketing project manager + agency account lead",
      "steps": [
        {
          "action": "Kickoff khóa scope, moodboard, product list/SKU đã duyệt, rights, talent releases, approval chain, sprint và meeting cadence.",
          "evidence": "Signed SOW, asset brief, channel calendar."
        },
        {
          "action": "Kiểm tra ownership: COLORA giữ quyền quản trị tài khoản quảng cáo, pixel, dữ liệu; agency chỉ được cấp quyền tối thiểu có thể thu hồi.",
          "evidence": "Role permission inventory; admin owner record."
        },
        {
          "action": "Khóa quyền dùng ảnh, mẫu, nhạc, stock, model, creator, footage, AI content và quyền tái sử dụng theo phạm vi địa lý/thời gian/kênh.",
          "evidence": "Usage rights + model/talent release + asset license register."
        },
        {
          "action": "Thiết lập review 2 vòng: rough concept trước, final assets và claims theo đúng SKU/chính sách trước khi public.",
          "evidence": "Creative approval vN, claim proof and QC sign-off."
        },
        {
          "action": "Weekly report: deliverables completed, actual vs approved budget, spend, CPA/CTR/conversion nếu dữ liệu đủ, issue, next actions.",
          "evidence": "Source platform exports, change/issue log."
        },
        {
          "action": "Change request khi vượt cap, tăng media spend, thêm deliverable hoặc đổi rights. Không nhận việc phát sinh qua chat cá nhân như approval.",
          "evidence": "Signed or emailed change approval trước triển khai."
        },
        {
          "action": "Nghiệm thu deliverables: master files, raw files nếu SOW quy định, caption, thumbnails, usage rights, report, invoices; khi kết thúc thu hồi access.",
          "evidence": "Final handover + access revocation + acceptance."
        }
      ],
      "redFlags": [
        "Agency chạy từ tài khoản cá nhân, không bàn giao dữ liệu gốc.",
        "Đăng hình sản phẩm khác hoặc gán claim không có hồ sơ SKU.",
        "Dùng nhạc / hình không có license; lộ khuôn mặt hoặc dữ liệu khách khi không có quyền hợp lệ.",
        "Agency yêu cầu exclusivity mơ hồ hoặc giữ file nguồn làm điều kiện thu thêm phí."
      ],
      "records": [
        "Production & rights register",
        "Weekly report / change log",
        "Acceptance and offboarding checklist"
      ],
      "decision": "Mọi nội dung có tuyên bố về vật liệu, xử lý đá, chứng nhận hoặc chính sách phải có owner duyệt trước đăng."
    },
    {
      "id": "campaign-release",
      "group": "Marketing & Brand",
      "title": "Duyệt chiến dịch và xuất bản",
      "trigger": "Có chiến dịch sale, launch, influencer, email, TikTok, Instagram hoặc trang web cần đăng.",
      "owner": "Campaign owner + Brand + Product/QC + Client Care",
      "steps": [
        {
          "action": "Viết campaign one-pager: mục tiêu, người xem, hypothesis, KPI, budget cap, kênh, người duyệt.",
          "evidence": "Campaign brief và phiên bản."
        },
        {
          "action": "Đối chiếu mọi SKU, giá, tồn kho, thông điệp, discount, material, stone treatment và policy với hồ sơ được duyệt.",
          "evidence": "Product claim evidence and policy version."
        },
        {
          "action": "Soát visual rights: hình thật COLORA, người mẫu, nhạc, footage; tránh dùng asset thương hiệu khác làm bằng chứng.",
          "evidence": "Asset rights register."
        },
        {
          "action": "Review CTA, link, UTM, tracking, form bảo vệ dữ liệu, landing/mobile và nội dung trả lời khách.",
          "evidence": "QA prelaunch checklist."
        },
        {
          "action": "Brand/Product/Care ký duyệt trong kênh công ty trước khi public; lưu phiên bản proof và lịch đăng.",
          "evidence": "Approval trail và final asset checksum/version."
        },
        {
          "action": "Theo dõi actual spend, feedback, complaints, report và postmortem; cập nhật học liệu nếu policy thay đổi.",
          "evidence": "Launch log, dashboard, retrospective."
        }
      ],
      "redFlags": [
        "Không có xác thực quyền dùng hình / âm nhạc.",
        "Quảng cáo chứng nhận sản phẩm hoặc độ bền không đúng scope.",
        "Kênh quảng cáo do bên thứ ba sở hữu hoàn toàn."
      ],
      "records": [
        "Campaign brief / approval",
        "Asset rights / legal checks",
        "Launch report"
      ],
      "decision": "Áp dụng Luật Quảng cáo hiện hành và các quy định liên quan trước khi phát hành."
    },
    {
      "id": "payment-close",
      "group": "Finance & Governance",
      "title": "Thanh toán, hóa đơn và đối soát",
      "trigger": "Sắp đặt cọc, thanh toán giai đoạn hoặc quyết toán chi phí.",
      "owner": "Requester + receiving owner + Finance + authorized approver",
      "steps": [
        {
          "action": "Xác nhận hợp đồng/PO còn hiệu lực, hạng mục nghiệm thu đúng, không có dispute chưa xử lý.",
          "evidence": "Signed contract / PO / acceptance."
        },
        {
          "action": "Đối chiếu pháp nhân xuất hóa đơn, mã số thuế, số tiền, VAT, tài khoản nhận và chứng từ đi kèm.",
          "evidence": "Invoice validation / verified vendor master."
        },
        {
          "action": "Đối chiếu số đã đặt cọc, còn phải trả, khoản giữ lại và phí vượt dự toán.",
          "evidence": "Payment ledger and committed cash forecast."
        },
        {
          "action": "Thực hiện maker-checker: người yêu cầu khác người duyệt chi; xác minh riêng mọi thay đổi tài khoản ngân hàng.",
          "evidence": "Payment authorization trail."
        },
        {
          "action": "Sau thanh toán cập nhật PO status, chứng từ kế toán và mức tiêu ngân sách thực tế.",
          "evidence": "Bank evidence, expense report, supplier balance."
        }
      ],
      "redFlags": [
        "Gửi ảnh chuyển khoản thay hóa đơn/chứng từ.",
        "Thanh toán cá nhân vì tài khoản công ty trục trặc mà chưa có ngoại lệ hợp lệ.",
        "Nhiều khoản nhỏ tách từ một hợp đồng để qua gate."
      ],
      "records": [
        "3-way match ledger",
        "Verified invoice / bank",
        "Budget update"
      ],
      "decision": "Finance xác minh cách áp dụng VAT và chứng từ theo luật hiện hành, không lấy thang điểm supplier thay cho kiểm toán chi."
    },
    {
      "id": "information-security",
      "group": "Governance & Security",
      "title": "Phát hiện rủi ro, gian lận và lộ dữ liệu",
      "trigger": "Có phishing, yêu cầu chuyển tài khoản, link lạ, email mạo danh, lộ dữ liệu hoặc tài khoản agency.",
      "owner": "Discoverer + system owner + CEO / authorized incident lead",
      "steps": [
        {
          "action": "Dừng giao dịch đáng ngờ, không tiếp tục chuyển tiền hoặc mở link/file lạ.",
          "evidence": "Incident timestamp, channel, affected process."
        },
        {
          "action": "Báo ngay người phụ trách bảo mật/Finance và CEO qua kênh được xác minh; không tự xóa bằng chứng.",
          "evidence": "Incident ticket và evidence giữ trong hệ thống có quyền."
        },
        {
          "action": "Đối chiếu danh tính qua số điện thoại/email đã xác minh độc lập; không dùng chỉ số do email nghi vấn cung cấp.",
          "evidence": "Out-of-band verification."
        },
        {
          "action": "Thu hồi quyền của agency/vendor, đổi khóa liên quan, cô lập tài khoản khi được người phụ trách chỉ đạo.",
          "evidence": "Access revocation log và scope."
        },
        {
          "action": "Đánh giá nghĩa vụ thông báo, bảo vệ dữ liệu cá nhân, khôi phục và postmortem cùng cố vấn phù hợp.",
          "evidence": "Incident response record (private)."
        }
      ],
      "redFlags": [
        "Dùng form Staff tĩnh để nhập ảnh CCCD, khách, chứng từ ngân hàng.",
        "Công bố thông tin sự cố trước khi có người phát ngôn duyệt.",
        "Xóa email nghi vấn làm mất chứng cứ."
      ],
      "records": [
        "Private incident log",
        "Access review",
        "Post-incident corrective actions"
      ],
      "decision": "Website này chỉ chứa hướng dẫn. Không nhập hồ sơ sự cố hay dữ liệu thực vào mã nguồn hoặc trình duyệt Staff."
    },
    {
      "id": "handover-project",
      "group": "Operations & People",
      "title": "Bàn giao công việc và change control",
      "trigger": "Thay owner, hết hợp đồng, nghỉ việc, nghỉ phép, chuyển dự án hoặc thay phạm vi.",
      "owner": "Project owner + receiver + department lead",
      "steps": [
        {
          "action": "Ghi objective, status, deliverables, timeline, rủi ro, budget, hợp đồng đang mở và ai có quyền quyết định.",
          "evidence": "Handover checklist / project status."
        },
        {
          "action": "Bàn giao quyền Drive/email/ad tools ở mức được duyệt; không chia sẻ mật khẩu cá nhân.",
          "evidence": "Permission inventory and transfer approval."
        },
        {
          "action": "Liệt kê việc cần làm tiếp theo, người nhận, hạn, dependency và mốc báo lại.",
          "evidence": "Action register."
        },
        {
          "action": "Xác nhận từ người nhận và manager, gỡ quyền không còn cần; lưu final closeout.",
          "evidence": "Handover acceptance + offboarding evidence."
        }
      ],
      "redFlags": [
        "Chỉ bàn giao qua chat không có file / version.",
        "Quên thu hồi quyền agency trên ad account, Drive hoặc email.",
        "Không rà soát hóa đơn, deposit và contract renewal đang mở."
      ],
      "records": [
        "Handover memo",
        "Permission register",
        "Task / obligation tracker"
      ],
      "decision": "Không để tài khoản quảng cáo, chứng từ hoặc quy trình chỉ phụ thuộc một cá nhân."
    }
  ]
};
