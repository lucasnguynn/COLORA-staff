# COLORA Staff — security and recovery runbook

Updated: 2026-11-02. This is a low-sensitivity learning and creative-tools portal, **not** a confidential employee database.

## Non-negotiable publication boundary

- **Current status:** this repository and the site served by GitHub Pages are **public**. Users can fetch all published static assets, notably Learning Studio JSON question/answer banks. A login screen does not make those assets private. The team is considering PRIVATE source plus PUBLIC artifact hosting. Review [safe no-cost privacy migration](docs/SOURCE_PRIVACY_MIGRATION.md) before touching repository visibility: GitHub Free will unpublish Pages from an existing repo changed to Private.
- **Never commit or enter** client names, phone numbers, order records, passwords, API tokens, confidential prices/BOMs/QC supplier data, salary information or unapproved human-resources content.
- The five baseline email/password pairs, the optional sixth Staff credential, and the JD archive key belong only in protected GitHub Actions / `github-pages` environment secrets. Never paste them into repository files, Actions logs, Issues, PRs or screenshots.
- The encrypted AES-GCM account envelopes are publicly downloadable and subject to **offline** password guessing. Eight characters is only a minimum; use unique randomly generated passwords (prefer 16–20+ characters, especially Senior). Public salt/verifier metadata and downloaded historical ciphertext cannot be remotely revoked.
- Do not assume marking a repository Private makes a GitHub Pages URL private. Check the GitHub Pages availability of your current plan before changing visibility. **Do not break the free published site merely to hide this repository.**
- The original COLORA-JD repository remains public. Previously published source/history cannot be retroactively made confidential.

## Recommended free GitHub account settings (require owner action)

1. Enable two-factor authentication for the owner account, use a secure password, and audit authorized OAuth apps/deploy keys in GitHub Settings.
2. Go to **Settings → Branches / Rules → main**. If available on the current plan, require a pull request, the `Validate COLORA Staff Portal / validate` check, and disallow force pushes/deletions. This must be done by the repository owner; a source-code commit cannot itself turn on branch protection.
3. Under **Settings → Pages**, keep **GitHub Actions** as the only deployment source and enforce HTTPS for `staff.colora.vn`.
4. Review **Security / Code security** settings and activate any available Dependabot alerts / security advisories / secret scanning at no extra cost.
5. Review GitHub **Actions → Environments → github-pages**: store `COLORA_ACCOUNT_CREDENTIALS_JSON`, optional `COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON`, and `SENIOR_JD_PASSWORD` there, limit who can modify them, and do not give contributor PRs access to production secrets.

## Current build and deploy controls

- `deploy-accounts.yml` is the production path when `STAFF_AUTH_MODE=static-accounts`. It validates modules, exercises encrypted Staff/Senior sign-ins, checks integrated UI and audits an explicit allowlist of public release files **before** publishing. The **build** job has read-only repository permissions and protected secrets but NO Pages/OIDC publishing permissions; a separate **deploy** job can publish only the audited artifact and does not check out source or use employee passwords.
- `scripts/security-audit.mjs` runs in PR validation and production before building. It blocks recognized private key/token patterns and forbidden tracked credential filenames. It does not scan previous commits, external assets or unknown secret formats. A successful check is NOT proof that all sensitive data are absent.
- `check-live-login.yml` runs after the current account deployment succeeds (or when manually dispatched). It verifies the actual email/password form for every configured account and compares the public `release-version.json` commit to the triggering deployment SHA; secrets are not printed.
- `rotate-jd-password.yml` intentionally uses an explicit workflow dispatch after committing with `GITHUB_TOKEN`. GitHub does not trigger `push` workflows from its own `GITHUB_TOKEN` pushes, so this is **not** a duplicate deploy. It does not print or screenshot credentials.
- `pages.yml` is **legacy rollback only**: it requires `STAFF_AUTH_MODE=legacy` **and** a manual workflow_dispatch. A missing variable cannot silently switch security architecture.
- PR validation uses disposable credentials and a synthetic JD fixture, never production employee passwords or decrypted Senior material.
- Two-way isolation is limited: the Staff ciphertext does not contain JD markup, but publicly served training JSON/code are not access controlled.

## Local browser data and role changes

- The opt-in 30-day IndexedDB AES-GCM key is a *device-access capability*, not an online revocable session. Log out on untrusted devices and do not opt in on shared browsers.
- In the **individual-account** gateway, new Senior JD drafts use opaque account-scoped browser keys (`colora_jd_library_v2_<opaque-id>`, `colora_jd_settings_v2_<opaque-id>`). This prevents normal JD screens from accidentally sharing drafts between Senior accounts on the same browser profile. It **does not cryptographically encrypt JD localStorage data or isolate JavaScript by account**: any code running with the same origin or a person with browser profile access may still read it. Use separate browser profiles and keep sensitive HR data outside this portal.
- **Non-destructive one-time migration:** if old shared `colora_jd_library_v1` / `colora_jd_settings_v1` entries exist and the Senior account has no scoped drafts, the JD opening screen asks for a backup download before allowing an explicit copy into that account, or a fresh library. Migration never automatically claims, deletes or overwrites old shared drafts. Verify the downloaded backup file and the resulting JD list before clearing any old browser data.
- **Password changes / account rotation:** the opaque namespace currently follows the encrypted account record ID, which changes if its password is rotated. The old drafts remain on the device but are no longer automatically displayed. **Export each Senior user's JD JSON before rotating their Workspace password** and import the backup afterward. The old shared data is intentionally untouched; do not mistake absent scoped drafts for deleted data.
- Learning Studio / Client Care progress remains stored **origin-wide** in browser localStorage and is only suitable for self-study, not a private cross-user record system.
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
