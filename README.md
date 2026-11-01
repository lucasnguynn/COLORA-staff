## Brand alignment and P0 security hardening — November 2026

- Typography: Cormorant Garamond for display, Open Sans for body and UI. Colors: Navy #002451, Ivory #F4EDE1, muted Gold #B08A5B.
- All logo treatments use the actual COLORA lettermark and symbol image files under modules/qr/assets. No reconstructed wordmarks or AI-generated brand logos.
- QR code generator JS library is a pinned npm build dependency copied to same-origin apps/qr/vendor/ rather than loaded as executable JS from a third-party CDN. CI validates it renders a QR.
- Public training data and answers remain directly downloadable from GitHub Pages; static encryption of the entry HTML is not server-side authorization. Never include confidential HR, customers or proprietary assessments in this architecture.
- Sandboxing a same-origin iframe with both allow-scripts and allow-same-origin is not secure isolation; denying same-origin breaks QnA data fetch and local storage. Do not claim iframe isolation until an alternate origin and data delivery are explicitly designed.
- Some Learning Studio questions are simulations or pending SKU/QC approval. Training results are not an official staff accreditation; filter approved content and move exam keys server-side before formal grading.

# COLORA Staff Workspace

**COLORA - COLOR YOUR AURA**

A simple integrated COLORA Staff Portal on GitHub Pages. The Staff entry HTML and separate Senior JD HTML are encrypted with StatiCrypt. This is for LOW-SENSITIVITY content only.

## Modules

| Area | Route | Source | Gate |
| --- | --- | --- | --- |
| Dashboard, Resource Library, Email Signature | / | COLORA-staff | Staff password |
| Client Care Academy | /#client-care | CSKH-COLORA (copied into staff bundle) | Included in one Staff login |
| Learning Studio | /#learning | QnA-COLORA (copied into staff bundle) | Included in one Staff login |
| QR Generator | /#qr | QR-V1 (copied into staff bundle) | Included in one Staff login |
| JD Library | /apps/jd/ | COLORA-JD | Separate senior password |

The three training/tool modules are copied and bundled into the portal's single encrypted HTML workspace. JD is inlined (JS + CSS) into the HTML BEFORE encryption. The deployment artifact does not contain plaintext JD JavaScript.

## IMPORTANT SECURITY LIMITATIONS

**This is NOT identity-verified senior role authorization.** It is two different knowledge-based passwords. Anyone who gets the manager password can access the JD page.

At implementation, **all 5 upstream repositories are PUBLIC, including COLORA-JD**. Source code, seed job descriptions and history from that repository are already visible publicly. The portal's extra password does NOT secure the original public repository or previously deployed public Pages URLs.

The JD source has been archived encrypted inside this repository, and Staff no longer checks out COLORA-JD. Still, older public commits and Pages URLs may have exposed information. Do not keep confidential employee data in a browser-only static portal; a real management-only document service would require authenticated server-side authorization.

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
8. The original JD source was publicly available; do not use this static portal for confidential HR information. After confirming migration, archive or retire the original JD repository.

**GitHub Actions publishes only the verified /dist artifact**. GitHub Pages from branch (root or /docs) must NOT be enabled, because the source /site/index.html is deliberately unencrypted until the build runs. A CNAME file in the artifact is not sufficient alone; set the custom domain in Pages Settings.

## How integration works

Staff CI builds exclusively from archived modules in this repository. No source checkout from the old repos is required. Edit modules directly for future changes; encrypted JD source is recovered from modules/jd-source.enc.json during trusted production builds.

JD is distributed only as the encrypted JD HTML plus non-sensitive logo images; no external JD scripts or stylesheets are deployed. The password is NOT stored in the repository. Staff pass has optional 7-day remember-me, while senior login is configured without remember-me.

## Development

Requires Node 22 and StatiCrypt 3.5.4.

1. The four app snapshots are already stored in modules/. Decrypt the JD archive using the senior password into .sources/jd before a real production build, or use JD_SOURCE_DIR=tests/fixtures/jd for local public CI tests.
2. Install StatiCrypt: npm install --no-save --no-package-lock staticrypt@3.5.4
3. Run: node scripts/build.mjs
4. Set STAFF_PORTAL_PASSWORD and SENIOR_JD_PASSWORD in your environment (do not log their values).
5. Run: node scripts/encrypt.mjs && node scripts/verify.mjs

CI pull-request validation uses disposable demo passwords and NEVER deploys. Only deploy from main after real secrets are set.


## Staff single-login architecture

**Exactly one common staff password** unlocks Dashboard, Resource Library, Learning Studio (full QnA-COLORA app), Client Care Academy (full CSKH-COLORA app), QR Generator (full QR-V1 app), and Email Signature. The three external app **HTML source documents are bundled inside the encrypted root `index.html` at build time** and mounted as `iframe.srcdoc` within the Staff shell, not published at standalone HTML URLs. Their JS/CSS/JSON/images are copied locally to `/apps/<name>/` for compatibility. It is NOT a redirect to other websites.

No staff login or separate Staff password forms should appear when switching between those apps. JD Library remains separately encrypted with the SENIOR_JD_PASSWORD as requested; it is the **only** page that may ask for another password.

The static-hosting security limitation remains: JavaScript, CSS, images and structured training datasets are publicly accessible by URL, and source repositories remain public. Do not enter confidential customer, HR, pricing or token data. This is not server-backed access authorization.

## Self-contained source archive — no original repositories required

**Since this migration, COLORA-staff owns the source code needed to build its apps.** No GitHub Actions checkout, submodule, API fetch, or network import from CSKH-COLORA, QnA-COLORA, QR-V1, or COLORA-JD is required at production build time. The snapshot was created on 01 November 2026, and original repositories can be retired **only after a successful clean production deployment and functional verification**.

| Location in COLORA-staff | Contains | Public source exposure |
| --- | --- | --- |
| `modules/client-care/` | Full CSKH source: HTML, styles, scripts, data, schema, tests and docs | Public, non-sensitive |
| `modules/learning/` | Full QnA source: app, tests, all 10 training data files, gemstone photos and docs | Public, non-sensitive |
| `modules/qr/` | Full QR-V1 HTML generator, all COLORA logos and docs | Public, non-sensitive |
| `modules/jd-source.enc.json` | Complete COLORA-JD original source and images, archived with AES-256-GCM | Encrypted; no public plaintext JD file |
| `site/` | Main Staff design system, search library and utility generators | Public, non-sensitive |

The Staff homepage **contains the three normal applications' complete HTML as inert, encrypted embedded templates**, not external iframes pointing to other GitHub Pages sites. External app source repositories are not loaded after migration. Shared CSS/JS/data/imagery are copied from local `modules/` during build and served at the same `staff.colora.vn` hostname. Individual QR/CSKH/QnA app HTML pages are not separately published. The Staff password is entered **once**; only JD has a second password.

### Production / CI source handling

- Production obtains the archived JD code via `SENIOR_JD_PASSWORD` inside the trusted GitHub Actions runner; it decrypts into a temporary, ignored `.sources/jd/` directory. Only the separately encrypted JD webpage is published.
- PR checks run against a **non-sensitive synthetic JD fixture**, never decrypting production JD source in untrusted PR jobs. Production CI tests the real encrypted JD end-to-end.
- **Rotating `SENIOR_JD_PASSWORD` now also requires re-encrypting the archived JD source before changing that secret.** Otherwise future build cannot read the snapshot. Changing `STAFF_PORTAL_PASSWORD` alone remains straightforward.
- The original JD repository was public before migration; existing copies or Git history may already have disclosed its old source. This design prevents future automatic exposure inside Staff, but cannot retroactively revoke public access.
- The QR generator currently uses an external QR rendering library/CDN. Its original application source is locally preserved, but to guarantee strictly offline operation the dependency would need to be vendored separately. Do not delete any upstream GitHub projects before verifying the latest Staff build, even though they are no longer needed for source checkout.

### Safe retirement of originals

After checking production workflow success and manually testing all training and creative functions, archive the four original repositories first (or make them read-only). Once satisfied all source and assets are present and backed up, delete them using GitHub's own repository settings. **Deletion is not automated**; it is irreversible without backups, may break historic links or any other independently deployed site, and does not make old public data confidential.

## V2: Website hoàn thiện trước khi kích hoạt tên miền

- Dashboard và layout COLORA đồng nhất, responsive trên desktop/tablet/mobile.
- Resource Library: 8 bài đọc về thương hiệu, triết lý, vật liệu, thiết kế, chăm sóc, khách hàng, media và sử dụng portal. Có tìm kiếm không dấu, lọc danh mục và liên kết trực tiếp đến từng bài.
- Learning Studio, Client Care Academy, QR Generator và JD Library được lắp vào cùng điều hướng; có chế độ mở rộng iframe, mở tab riêng.
- Email Signature: live preview, copy chữ ký HTML định dạng bảng tương thích email, download một file HTML độc lập.
- Các công cụ không kết nối dữ liệu Haravan và không gửi thông tin nhập form về máy chủ.

### Kiểm thử

Workflow pull request chạy kiểm tra hai ứng dụng Academy, build bốn module, sau đó dùng Playwright/Chromium để kiểm thử UI trên desktop/mobile, các module trong iframe, công cụ, tìm kiếm thư viện và lỗi tràn màn hình. Ảnh QA được lưu trong Actions artifact có tên colora-staff-ui-qa. Tiếp theo, CI dùng password minh họa chỉ cho kiểm thử để mã hóa năm trang HTML, rồi kiểm tra không xuất bản HTML chưa mã hóa hoặc mã JD JavaScript/CSS tách rời.

Không coi kiểm thử local là bằng chứng website thật đã online. Sau khi cấu hình GitHub Pages, mật khẩu và CNAME tại BKNS, vẫn cần kiểm tra HTTPS, direct URL và đăng nhập riêng JD trên domain cuối.

### Cập nhật thư viện

Chỉnh nội dung tại site/library.js. Tất cả nội dung trong repo này vẫn có thể được đọc trên GitHub public, kể cả khi bản HTML được mã hóa. KHÔNG được đưa thông tin mật, dữ liệu khách hàng, tài khoản, giá vốn, lương hoặc API key vào thư viện.
## Visual system

Ivory #F4EDE1, Navy #002451, accent Gold #B08A5B. Heading Cormorant Garamond and body Open Sans. No Haravan API, Firebase, Netlify or Cloudflare is required. Keep BKNS DNS and Haravan website as they are, except the one new staff CNAME.
