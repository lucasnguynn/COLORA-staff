# COLORA Learning Studio V10.1 | Quality & Competency Release

**Tình trạng:** triển khai kỹ thuật, chưa hoàn thành phê duyệt học thuật/nội dung và chưa đủ điều kiện chứng nhận nhân sự.

## 1. Các sửa lỗi thực hiện

- **Đề thi cố định vai trò:** khi bắt đầu thi ghi rõ `exam.role`; nộp bài dùng vai trò này, không dùng `state.role` có thể bị đổi trong profile. Giao diện ngăn chuyển vị trí trong khi có bài thi; luồng resume giữ nguyên vai trò của đề.
- **Nội dung chờ phê duyệt:** 5 câu Essentials tạm không vào đề chấm điểm: FN-033/034/035 (mission/vision/values diễn giải), GM-048/053 (QC đá chờ SOP). Chúng vẫn hiện để học với trạng thái rõ ràng, không được coi đã được phê duyệt.
- **Applied Cases:** AC-001/003/007/008/011 được sửa bối cảnh, tiêu chí và lời giải thích để người học có một lựa chọn tốt nhất *trong giả định được nêu*, thay vì kết luận rằng những cách giải quyết khác hoàn toàn sai trong mọi hoàn cảnh.
- **FN-032:** làm rõ “thiết kế có bản sắc riêng” không đồng nghĩa dịch vụ bespoke cho từng khách.
- **Đúng lần đầu / hiện đúng / ôn lại:** giao diện phân biệt kết quả lần đầu (nếu dữ liệu có), trạng thái hiện tại, và lịch gợi ý kiểm tra trì hoãn sau 7 ngày rồi 30 ngày. Lịch này **không phải** thước đo đã kiểm định về khả năng nhớ.
- **Chuyển phiên bản:** V10 practice/teach-back lưu trong trình duyệt được giữ; câu AC được sửa không kế thừa lịch sử cũ; đề thi V10 đang làm dở được đóng lại để không chấm bằng ngân hàng V10.1. Lượt thi trước vẫn là lịch sử, không trở thành chứng chỉ V10.1.
- **Regression tests:** bổ sung kiểm tra hành vi chấm bài đúng vai trò được ghi khi tạo đề, các mốc 7/30 ngày, preservations của firstCorrect, phủ đủ 17 chương và loại 5 câu chờ duyệt.

## 2. 86 Essentials | Quản trị phê duyệt

Bảng kiểm duyệt máy đọc: [`data/essentials-review.json`](../data/essentials-review.json).

**86/86 câu đang ở trạng thái PENDING_HUMAN_REVIEW.** Trong đó 5 câu tạm không dùng để chấm thi vì cần duyệt nguyên văn/scope SOP; 81 câu còn lại đủ điều kiện **kỹ thuật** để chọn vào bài thi, **không đồng nghĩa đã được founder/chuyên gia ký duyệt**.

Đối với từng câu, người duyệt cần kiểm tra:
1. Kiến thức và lời giải thích đúng với tài liệu COLORA có hiệu lực và kiến thức ngành; không nêu tên riêng/điều khoản không có nguồn.
2. Phân biệt **quyết định founder đã chốt** với **định hướng**, **giả thuyết nghiên cứu**, **SOP đề xuất**, **dữ kiện riêng SKU**.
3. Có đúng **một lựa chọn tốt nhất** trong điều kiện được cho, tất cả lựa chọn sai đều là lỗi có thể mắc thực tế, không cố tình phi lý.
4. Câu hỏi đo **một năng lực có thể quan sát** (giải thích/nhận diện/áp dụng), không chỉ nhận ra từ khóa.
5. Claim về GENIA276 Ag 930‰, lớp phủ, đá natural/treated, certification RJC và chính sách cần ghi đúng phạm vi; không mở rộng sang mọi thành phẩm hoặc mọi SKU.
6. Khi duyệt, điền `source_document_id`, `source_version`, `source_owner`, `reviewed_by`, `reviewed_at`; người duyệt thay trạng thái theo quy trình nội bộ và kiểm tra thay đổi Git.

**Không điền tên người duyệt giả hoặc tự chuyển trạng thái sang Approved.**

## 3. Bảo mật nội dung public/private

Repository và GitHub Pages hiện là **public**. Một mục được ghi nhãn `internal`, ẩn bằng JavaScript, đặt ngoài menu, hoặc minify vẫn có thể được đọc qua dữ liệu JSON, mã nguồn và lịch sử Git.

- **Được phép ở bản public:** mô tả định vị đã duyệt để công bố, kiến thức gemology và hướng chăm sóc tổng quát, ví dụ tình huống mô phỏng không chứa dữ liệu thật, mẫu Product Passport không có hồ sơ mật.
- **Cần phê duyệt trước khi public:** giá dự kiến, hồ sơ/chứng từ nguyên liệu, thông tin năng lực lớp phủ, quy trình QC, thỏa thuận/logic mua hàng và kế hoạch doanh nghiệp chưa ra mắt.
- **Không đưa lên public:** giá vốn, danh sách khách thực, hồ sơ nhân viên, bảng lương, tài liệu nguồn cung cần bảo mật, thông số kỹ thuật lớp phủ độc quyền không dành để công bố.

Nếu cần giữ tài liệu nhân sự private, **chuyển dữ liệu đó sang kho xác thực riêng** thay vì chỉ ẩn giao diện hoặc dùng password client-side. Những thông tin đã từng commit public có thể vẫn còn trong lịch sử hoặc bản sao; việc xóa khỏi `main` không bảo đảm thu hồi hoàn toàn.

**Quyết định cần owner thực hiện:** rà lại phạm vi thông tin có thể công bố trước khi xem repo này là nguồn đào tạo nội bộ chính thức. V10.1 thêm cơ chế kiểm duyệt, **không tự tạo private access**.

## 4. Product Passport và ảnh thật

Không có hồ sơ SKU đã xác minh đầy đủ và bộ ảnh sản phẩm hoàn chỉnh trong repo. Không dùng ảnh AI thay ảnh sản phẩm thật. Dùng [Product Passport template](PRODUCT_PASSPORT_TEMPLATE.md) để thu thập: SKU, stones/treatments, approved finish, on-body, macro, front/side/back/under-gallery, safety/comfort notes, warranty/care, người duyệt. Không tự suy ra claims từ hình mô phỏng CAD.

## 5. Pilot với nhân sự thật (đề xuất)

- Pre-test trước khi học; post-test sau học; delayed test sau khoảng 7–30 ngày, không lặp nguyên thứ tự.
- Thu tỷ lệ đúng lần đầu, phân bố chọn phương án sai, những câu có hai đáp án được nhân viên có chuyên môn biện luận hợp lý; đánh giá lại item.
- Yêu cầu teach-back bằng lời: giải thích demi-fine, giới thiệu COLORA SILVER, phân biệt value Functional/Technical/Emotional, tư vấn một người mua quà, hướng dẫn chăm đúng SKU.
- Đối với Designer/Editor: đối chiếu ảnh trên tay/macro/side với DNA thiết kế; với Customer Care: tư vấn sự cố, quyền lợi và nguồn; với Marketing: tư duy Customer Journey và CUG.
- Chỉ công bố kết luận về chất lượng đào tạo khi có bằng chứng quan sát, không dựa riêng 80% tổng điểm.

## 6. Giới hạn còn tồn tại

- Website tĩnh công khai và đáp án nằm trong JSON; không có xác thực nhân viên hay bài thi có chống gian lận.
- Bản review manifest chưa được người phụ trách ký duyệt; 5 câu bị giữ khỏi đề không có nghĩa 81 câu còn lại đã đúng tuyệt đối.
- Chỉ có ít ảnh đá tham khảo, không đủ sản phẩm thật cho competency assessment.
- Chu kỳ 7/30 ngày là lịch gợi ý, chưa phải thuật toán spaced repetition đã hiệu chỉnh.
- Giá trị mục tiêu **2,3–8 triệu đồng** là dải dự kiến. **COLORA SILVER** dùng nền bạc tái chế **GENIA276 Ag 930‰** cho đợt ra mắt, cần hồ sơ SKU để nói tính năng lớp phủ. Không nhận giấy RJC nguồn bạc là giấy chứng nhận của toàn bộ thành phẩm.

**Release gate:** CI chạy đúng là điều kiện cần, không đủ để ký duyệt nội dung.
