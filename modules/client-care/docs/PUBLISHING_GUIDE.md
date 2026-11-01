# COLORA | Quy trình xuất bản thông tin sản phẩm đã duyệt

Đây là repository **PUBLIC** và GitHub Pages cũng **PUBLIC**. Mọi thông tin trong source code và trong các tệp dữ liệu đều có thể được đọc và sao chép. Không lưu dữ liệu khách, hợp đồng, báo giá xưởng, chứng từ gốc, thông tin nhà cung cấp, số điện thoại, ảnh chứa thông tin riêng tư hoặc hồ sơ QC mật.

## Hai lớp dữ liệu

1. **Private source of truth**: BOM, CAD, phiếu QC, hồ sơ đá, mua hàng, treatment, phiên bản coating, kết quả kiểm tra, chính sách ký duyệt. Lưu trong hệ thống có quyền truy cập phù hợp, **không lưu tại repo này**.
2. **Approved public projection**: bản trích xuất thông tin sản phẩm hoặc điều khoản đã được phê duyệt để có thể công khai. Chỉ bản trích xuất này được đưa vào `data/approved-public.js`.

Website hiện cố ý để trống `products` và `policies`. Không tự dùng thông số mẫu khác để điền. Không lấy lời hứa bảo hành từ trang `colora.vn` khi website đang yêu cầu mật khẩu.

## Workflow chuẩn: 7 bước

1. **Product/QC** khóa đúng SKU, biến thể, version, vật liệu, đá/treatment, lớp phủ, khả năng resize, an toàn chăm sóc, ảnh/video.
2. **Client Care / Operations** phê duyệt wording và chính sách bảo hành/đổi trả/giao hàng có ngày hiệu lực.
3. **Content** chỉ sao chép nội dung được phép xuất bản; không đưa chứng từ nguồn và ID nội bộ nhạy cảm vào website.
4. **Reviewer** đối chiếu từng thông tin công khai với nguồn lưu riêng, xác nhận thời hạn hiệu lực, thay đổi SKU và điều kiện dịch vụ.
5. **Developer** mở Pull Request cập nhật `data/approved-public.js`, đính kèm **xác nhận không mật** của người duyệt; bảo đảm CI pass.
6. **Owner** review thay đổi và merge. Cấu hình GitHub **Settings > Branches > Branch protection** hoặc ruleset yêu cầu PR/review trước merge. `CODEOWNERS` là yêu cầu reviewer gợi ý, **không có khả năng tự bảo vệ branch** nếu chưa bật ruleset.
7. **Sau phát hành** xem GitHub Pages, test links, xác minh nội dung hiển thị đúng bản được duyệt và cập nhật lịch rà soát.

## Chỉ các trường công khai đã duyệt

`data/approved-public.js` nhận:

- `products[]`: `sku`, `name`, `category` (ring/earring/necklace/bracelet), `status: "approved"`, `revision`, `approvedOn` (YYYY-MM-DD), `reviewerRole`, `gemstone`, `metal`, `finish`, `wearability`, `care`, `claims[]`.
- `policies[]`: `id`, `title`, `version`, `effectiveOn`, `approvedOn`, `reviewerRole`, `url`, `summary`, `status: "approved"`. Public URL phải là HTTPS và nội dung có thể truy cập với người không đăng nhập.

Với claim, dùng `claims: [{ text, verified: true, approvedOn: "YYYY-MM-DD" }]`. **Không được thêm câu tuyệt đối** nếu không có chứng cứ đầy đủ. Thông tin điều trị đá không rõ phải nói "Chưa xác minh" và tuyệt đối không biến thành "không xử lý".

Không điền dữ liệu thử nghiệm giả vào manifest chính. Các script CI cố ý từ chối record thiếu trường, status chưa duyệt hoặc key chứa các tên trường nhạy cảm.

## Nhân sự chấm Role-play

Trang "Review Lab" chỉ là **biểu mẫu chấm thủ công giả lập**. Người quản lý chọn tình huống hư cấu, đánh giá 6 tiêu chí 0–4, đánh dấu lỗi nghiêm trọng. Điểm là tính toán theo rubric; không phải AI hiểu ngôn ngữ, không xác minh nhân viên, không phải chứng chỉ HR. Export chỉ chứa điểm theo tiêu chí, kết quả và tình huống, **không chứa văn bản người học hay tên nhân viên**. Không nhập thông tin khách hàng thật.

## Định kỳ rà soát

- Khi SKU đổi đá, finish, cấu trúc/chấu, size hoặc chính sách, lập thay đổi và review trước công bố.
- Khi brand thay đổi chính sách hậu mãi, làm lại kịch bản/trắc nghiệm liên quan.
- Không phát hành thông tin nhà cung cấp hoặc QC source files vào repo public.
- Chỉ gắn nhãn `approved` sau khi có **phê duyệt thực tế ngoài hệ thống**.

**Tài liệu này mô tả quy trình đề xuất, không chứng minh bất kỳ SKU hay chính sách nào đã được phê duyệt.**
