# COLORA Staff — security and recovery runbook

Updated: 2026-11-02. This is a low-sensitivity learning and creative-tools portal, **not** a confidential employee database.

## Non-negotiable publication boundary

- This repository and the site served by GitHub Pages are **public**. Users can fetch all published static assets, notably Learning Studio JSON question/answer banks. A login screen does not make those assets private.
- **Never commit or enter** client names, phone numbers, order records, passwords, API tokens, confidential prices/BOMs/QC supplier data, salary information or unapproved human-resources content.
- The five email/password pairs, and the JD archive key, belong only in protected GitHub Actions / `github-pages` environment secrets. Never paste them into repository files, Actions logs, Issues, PRs or screenshots.
- The five AES-GCM account envelopes are publicly downloadable and subject to **offline** password guessing. Eight characters is only a minimum; use unique randomly generated passwords (prefer 16–20+ characters, especially Senior). Public salt/verifier metadata and downloaded historical ciphertext cannot be remotely revoked.
- Do not assume marking a repository Private makes a GitHub Pages URL private. Check the GitHub Pages availability of your current plan before changing visibility. **Do not break the free published site merely to hide this repository.**
- The original COLORA-JD repository remains public. Previously published source/history cannot be retroactively made confidential.

## Recommended free GitHub account settings (require owner action)

1. Enable two-factor authentication for the owner account, use a secure password, and audit authorized OAuth apps/deploy keys in GitHub Settings.
2. Go to **Settings → Branches / Rules → main**. If available on the current plan, require a pull request, the `Validate COLORA Staff Portal / validate` check, and disallow force pushes/deletions. This must be done by the repository owner; a source-code commit cannot itself turn on branch protection.
3. Under **Settings → Pages**, keep **GitHub Actions** as the only deployment source and enforce HTTPS for `staff.colora.vn`.
4. Review **Security / Code security** settings and activate any available Dependabot alerts / security advisories / secret scanning at no extra cost.
5. Review GitHub **Actions → Environments → github-pages**: store `COLORA_ACCOUNT_CREDENTIALS_JSON` and `SENIOR_JD_PASSWORD` there, limit who can modify them, and do not give contributor PRs access to production secrets.

## Current build and deploy controls

- `deploy-accounts.yml` is the production path when `STAFF_AUTH_MODE=static-accounts`. It validates modules, exercises encrypted Staff/Senior sign-ins, checks integrated UI and audits an explicit allowlist of public release files **before** publishing.
- `check-live-login.yml` runs after the current account deployment succeeds (or when manually dispatched). It verifies the actual email/password form and both roles, not the historical StatiCrypt form. It does not print or screenshot credentials.
- `pages.yml` is **legacy rollback only**: it requires `STAFF_AUTH_MODE=legacy` **and** a manual workflow_dispatch. A missing variable cannot silently switch security architecture.
- PR validation uses disposable credentials and a synthetic JD fixture, never production employee passwords or decrypted Senior material.
- Two-way isolation is limited: the Staff ciphertext does not contain JD markup, but publicly served training JSON/code are not access controlled.

## Local browser data and role changes

- The opt-in 30-day IndexedDB AES-GCM key is a *device-access capability*, not an online revocable session. Log out on untrusted devices and do not opt in on shared browsers.
- JD drafts (keys `colora_jd_library_v1`, `colora_jd_settings_v1`) and training progress reside in **origin-wide localStorage**. Different user logins on the same browser profile may see the earlier browser-local drafts. Keep separate browser profiles for Staff and Senior users, and do not store confidential HR material.
- In JD Library, use **Quản lý JD → Xuất dữ liệu JSON** to make a local backup. Keep it in company-managed storage with suitable access controls, not in this repository. Test import with a disposable copy before relying on it.
- Logging out does not wipe document drafts, which prevents accidental data loss. When a device is reassigned, export authorized data, then use browser **Site settings → Clear site data** for `staff.colora.vn` to clear drafts and remembered credentials.
- Browser-local course/exam results are not trustworthy employee certifications.

## JD archive key mismatch (known operational issue)

The latest deploy log showed `modules/jd-source.enc.json` cannot currently be decrypted by `SENIOR_JD_PASSWORD`. The build uses a fixed, reviewed historical COLORA-JD commit as an emergency fallback, with a visible Actions warning. **This is not a durable rekey** and will not include drafts saved only in a browser.

To repair without losing changes:
1. Export/backup any current JD drafts from the browser.
2. In the protected `github-pages` environment, supply the previous archive key as `SENIOR_JD_PASSWORD_PREVIOUS` and retain the current `SENIOR_JD_PASSWORD`.
3. Manually run **Rekey encrypted Senior JD snapshot**. It decrypts with the old secret, re-encrypts and verifies with the new one, commits ciphertext only, then triggers the **five-account** deployment. Never put either password into a file or log.
4. Confirm a later deploy reports `JD source restored`, with **no** key mismatch warning. If the old key is genuinely unavailable, do not claim the historical archive can be recovered; use the reviewed pinned source and exported drafts as the recovery inputs after confirming what data must be preserved.

## Security incident

If a secret or real customer data is accidentally committed, immediately rotate the affected credential and stop publishing the affected content. Deleting the latest GitHub file does not remove old Git history or previously downloaded versions. Consult a qualified responder for data-removal and disclosure obligations. If a laptop is lost, change the affected employee's Workspace password in the protected five-account secret and redeploy; already copied/decrypted content cannot be recalled.
