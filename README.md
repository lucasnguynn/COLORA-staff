# COLORA Staff Workspace

**COLORA - COLOR YOUR AURA**

A simple integrated COLORA Staff Portal on GitHub Pages. All published HTML entry points are encrypted with StatiCrypt. This is for LOW-SENSITIVITY content only.

## Modules

| Area | Route | Source | Gate |
| --- | --- | --- | --- |
| Dashboard, Resource Library, Email Signature, Website Generator | / | COLORA-staff | Staff password |
| Client Care Academy | /apps/client-care/ | CSKH-COLORA | Staff password |
| Learning Studio | /apps/learning/ | QnA-COLORA | Staff password |
| QR Generator | /apps/qr/ | QR-V1 | Staff password |
| JD Library | /apps/jd/ | COLORA-JD | Separate senior password |

The three training/tool modules run embedded in the portal's sidebar workspace. JD is inlined (JS + CSS) into the HTML BEFORE encryption. The deployment artifact does not contain plaintext JD JavaScript.

## IMPORTANT SECURITY LIMITATIONS

**This is NOT identity-verified senior role authorization.** It is two different knowledge-based passwords. Anyone who gets the manager password can access the JD page.

At implementation, **all 5 upstream repositories are PUBLIC, including COLORA-JD**. Source code, seed job descriptions and history from that repository are already visible publicly. The portal's extra password does NOT secure the original public repository or previously deployed public Pages URLs.

For genuine management-only information, change COLORA-JD to private, review/remove old public deployments and do not keep HR secrets in a public static website. If changing the source to private, create a fine-grained read-only token (Contents permission) restricted ONLY to COLORA-JD, stored as the GitHub Actions secret SENIOR_SOURCE_TOKEN. The workflow can then continue checking out the private source.

StatiCrypt encrypts HTML only. JS, CSS, JSON, and images in the normal CSKH/QnA/QR apps remain publicly accessible by direct URLs. The QnA answers are available in JSON, so this is NOT a secure employee test or certification system. Existing apps may use localStorage for progress and JD drafts; localStorage is device-local, user-modifiable, and not secure storage. Do not put confidential customer, HR, financial, pricing cost, API tokens or client records in these apps.

## Activation checklist

1. Review and merge the feature pull request into main.
2. In repository **Settings > Secrets and variables > Actions**, create two secrets:
   - STAFF_PORTAL_PASSWORD: distinct, random, at least 20 characters (the build enforces >=16).
   - SENIOR_JD_PASSWORD: different, random, at least 20 characters (the build enforces >=16).
   Do NOT put passwords in commits, logs or README.
3. In **Settings > Pages**, change **Build and deployment > Source** to **GitHub Actions**. Do not publish the plaintext site/ branch directly.
4. Go to **Actions > Deploy COLORA Staff Portal > Run workflow**; wait for build and security verification to pass. If secrets are missing, build fails safely without publishing.
5. In **Settings > Pages > Custom domain** enter staff.colora.vn and save BEFORE changing DNS. Enable Enforce HTTPS when available.
6. At BKNS DNS, add a **CNAME** named **staff**, targeting **lucasnguynn.github.io**. Remove only a conflicting prior staff record if one exists. Never change the Haravan apex/www records, email MX/TXT or nameservers.
7. Visit staff.colora.vn in an incognito window. Test the staff pass on the dashboard and all three normal subapps, then confirm the staff password CANNOT open JD and the separate senior password CAN. Verify email signature copy, HTML export, QR download, training navigation and mobile.
8. Make the original JD repo private before anyone enters non-public management/HR data.

**GitHub Actions publishes only the verified /dist artifact**. GitHub Pages from branch (root or /docs) must NOT be enabled, because the source /site/index.html is deliberately unencrypted until the build runs. A CNAME file in the artifact is not sufficient alone; set the custom domain in Pages Settings.

## How integration works

Every staff workflow execution checks out CURRENT main branch of CSKH-COLORA, QnA-COLORA, QR-V1 and COLORA-JD; it copies a whitelist of production files to /dist and encrypts every HTML page. Changes in the component repositories are NOT automatically reflected until the Staff workflow is run again. Review upstream changes before triggering publication.

JD is distributed only as the encrypted JD HTML plus non-sensitive logo images; no external JD scripts or stylesheets are deployed. The password is NOT stored in the repository. Staff pass has optional 7-day remember-me, while senior login is configured without remember-me.

## Development

Requires Node 22 and StatiCrypt 3.5.4.

1. Checkout the four source repositories into .sources/client-care, .sources/learning, .sources/qr and .sources/jd.
2. Install StatiCrypt: npm install --no-save --no-package-lock staticrypt@3.5.4
3. Run: node scripts/build.mjs
4. Set STAFF_PORTAL_PASSWORD and SENIOR_JD_PASSWORD in your environment (do not log their values).
5. Run: node scripts/encrypt.mjs && node scripts/verify.mjs

CI pull-request validation uses disposable demo passwords and NEVER deploys. Only deploy from main after real secrets are set.

## V2: Website hoàn thiện trước khi kích hoạt tên miền

- Dashboard và layout COLORA đồng nhất, responsive trên desktop/tablet/mobile.
- Resource Library: 8 bài đọc về thương hiệu, triết lý, vật liệu, thiết kế, chăm sóc, khách hàng, media và sử dụng portal. Có tìm kiếm không dấu, lọc danh mục và liên kết trực tiếp đến từng bài.
- Learning Studio, Client Care Academy, QR Generator và JD Library được lắp vào cùng điều hướng; có chế độ mở rộng iframe, mở tab riêng.
- Email Signature: live preview, copy chữ ký HTML định dạng bảng tương thích email, download một file HTML độc lập.
- Website Generator: ba theme HTML tĩnh (Editorial / Announcement / Minimal), xem trước trực tiếp trong iframe sandbox, download HTML hoặc copy code. Nội dung nhập được escape trước khi tạo markup.
- Các công cụ không kết nối dữ liệu Haravan và không gửi thông tin nhập form về máy chủ.

### Kiểm thử

Workflow pull request chạy kiểm tra hai ứng dụng Academy, build bốn module, sau đó dùng Playwright/Chromium để kiểm thử UI trên desktop/mobile, các module trong iframe, công cụ, tìm kiếm thư viện và lỗi tràn màn hình. Ảnh QA được lưu trong Actions artifact có tên colora-staff-ui-qa. Tiếp theo, CI dùng password minh họa chỉ cho kiểm thử để mã hóa năm trang HTML, rồi kiểm tra không xuất bản HTML chưa mã hóa hoặc mã JD JavaScript/CSS tách rời.

Không coi kiểm thử local là bằng chứng website thật đã online. Sau khi cấu hình GitHub Pages, mật khẩu và CNAME tại BKNS, vẫn cần kiểm tra HTTPS, direct URL và đăng nhập riêng JD trên domain cuối.

### Cập nhật thư viện

Chỉnh nội dung tại site/library.js. Tất cả nội dung trong repo này vẫn có thể được đọc trên GitHub public, kể cả khi bản HTML được mã hóa. KHÔNG được đưa thông tin mật, dữ liệu khách hàng, tài khoản, giá vốn, lương hoặc API key vào thư viện.
## Visual system

Ivory #F4EDE1, Navy #002451, accent Gold #B08A5B. Heading Cormorant Garamond and body Open Sans. No Haravan API, Firebase, Netlify or Cloudflare is required. Keep BKNS DNS and Haravan website as they are, except the one new staff CNAME.
