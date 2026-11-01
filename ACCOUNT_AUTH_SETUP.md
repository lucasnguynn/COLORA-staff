# COLORA Staff — 5 individual email/password credentials, without Supabase

**STAGED ONLY.** No third-party identity service, backend database, DNS change, or subscription is required for this option. The production website continues using the existing Staff/Senior StatiCrypt passwords until the owner **explicitly** activates it. This implements **static encrypted access**, not a server-authenticated user identity system.

## Who can access which content?

The owner-approved roster consists of **3 Staff and 2 Senior**. Their actual company addresses were supplied privately, so do **not** commit them in this public repository.

Each employee is given ONE **independent, unique, randomly generated Workspace password**; it must not be their BKNS mailbox password. Only the correct email + that password decrypts that employee's encrypted content. Staff envelopes exclude the JD Library source entirely; Senior envelopes include JD. Changing a page URL, role value, or CSS does not make encrypted JD readable with a Staff password.

## How this works (the security boundary)

GitHub Pages serves an elegant email/password login and a list of five randomly named envelopes with unique salts. A browser derives an AES-256-GCM key from **email + password** using PBKDF2-HMAC-SHA256 (600,000 iterations) and tests the five 16-byte verifiers. Only one matching, authenticated ciphertext is fetched/decrypted in memory; nothing is stored in browser localStorage, URLs, Git files, or cookies. The public manifests contain no employee email addresses or plaintext passwords.

**This is not server authentication.** Because all encrypted files are publicly downloadable, someone can attempt password guesses offline, independently of the login page. Rate limiting, two-factor authentication, email ownership checks, self-service password recovery, per-employee access logs, and immediate revocation of content already downloaded are **not possible on a static site alone**. Use long **random passwords of 20+ characters** generated in a password manager and distribute them individually over a trusted channel. This solution is for a small internal **low-sensitivity** team portal, not confidential personnel/customer/finance data.

## One-time activation

1. In a password manager, generate **five unique, random passwords, 20–32+ characters each**. Collect the five approved email addresses and their exact roles (3 Staff / 2 Senior) in a private JSON array of objects with fields `email», `password», `role». Example schema using **fictional test data only**:

   ```json
   [
     {"email":"example.employee@colora.vn","password":"REPLACE-WITH-STRONG-RANDOM-PASSWORD","role":"staff"}
   ]
   ```

   **Do not paste actual emails or passwords in GitHub issues, pull requests, chat, tracked files or Actions logs.**

2. In GitHub → `lucasnguynn/COLORA-staff» → **Settings → Environments → github-pages → Environment secrets**, create `COLORA_ACCOUNT_CREDENTIALS_JSON» and store the complete private five-object JSON as the value. The script enforces five unique addresses, five different passwords at least 20 characters, exactly 3 staff / 2 senior, and addresses under `@colora.vn». Keep the existing `SENIOR_JD_PASSWORD» temporarily: it decrypts the historical JD archive **inside the trusted GitHub Actions runner**, not for employee login. Do not copy that shared password into the user array.

3. Set a GitHub **repository variable** (not secret): `STAFF_AUTH_MODE=static-accounts» under **Settings → Secrets and variables → Actions → Variables**. Do this only after the five credentials are configured. Until then, leave it unset and the current production login stays in place.

4. Open **Actions → Deploy COLORA individual encrypted accounts (opt-in)** and choose **Run workflow** on `main». This builds separate Staff and Senior plaintext only on the temporary runner, encrypts them into five random files, tests wrong emails/passwords and Staff/JD isolation in Chrome, destroys the plaintext staging files and publishes **only the new login and encrypted user blobs** to GitHub Pages. The legacy Pages workflow is skipped while this mode is selected.

5. Privately provide each employee their own randomly generated Workspace password. Test login for all 5 in private browser sessions, test switching roles and signout, and test a fake email or wrong password. Do not enable auto-save of passwords on shared devices.

## Password changes and departure

There is **no self-service password reset**: the administrator generates a replacement password, edits that user's entry inside the protected `COLORA_ACCOUNT_CREDENTIALS_JSON» GitHub environment secret, and reruns the opt-in deployment. To remove an employee, use a *new* replacement private roster (still exactly five for this initial implementation) or migrate to a server-backed access-control service when headcount changes. Changing a record only prevents access to the **newly published ciphertext**. A former employee who saved old encrypted files and knows the old password can still decrypt those saved copies; browser-local JD drafts/exports and other downloaded content cannot be remotely removed.

## Rollback without losing the existing portal

Set `STAFF_AUTH_MODE=legacy» or remove that repository variable, then manually run **Deploy COLORA Staff Portal** (`.github/workflows/pages.yml»). The existing legacy Staff and Senior secrets remain configured until migration is independently validated. Keep this recovery route ready.

## Important source visibility reminder

The original repositories and previous public commits (including the original JD repository) may still contain publicly accessible job-description templates and assets. Changing the new login cannot unpublish past commits or enforce user authentication on separate old sites. Normal training resource JS/JSON and media are still public; only the Staff/Senior HTML document is password-encrypted in this design.

This implementation intentionally needs no Supabase, Firebase, Google Sheets, Apps Script, Cloudflare or other identity provider.
