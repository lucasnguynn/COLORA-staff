# COLORA Staff — Individual email/password access (no Supabase)

**Passwords: minimum 8 characters; different for every employee.** This is a static encrypted gateway, not server-verified identity or ownership of an email inbox.

## Staff roles

The owner-approved roster contains **3 Staff and 2 Senior**. Keep the real employee email list and their passwords in the protected GitHub environment secret; never commit the roster to this public repository.

Each approved email/password pair decrypts its own HTML envelope. Staff envelopes contain only the ordinary Staff Workspace, while Senior envelopes also contain JD Library. Each employee must use a **different** password. Passwords are independent of their BKNS mailbox passwords.

## Security limitations

GitHub Pages serves encrypted files publicly, so attackers can download encrypted content and attempt password guesses **offline**, without hitting the login form. Eight-character passwords are accepted, but a weak, predictable eight-character password offers much less protection than a long, randomly generated one. **For Senior, prefer 16–20+ truly random characters even though eight is accepted.**

This system cannot verify mailbox ownership, provide MFA, rate-limit offline attacks, log individual access, recover passwords automatically, or immediately revoke previously downloaded encrypted content. Do not use it for confidential HR, customer or finance information. Previously published public JD code/assets are not retroactively protected by this gateway.

## Activation

1. Prepare an array of exactly **five objects** in the JSON structure below. Keep their real values private. The minimum allowed password length is **8 characters**; the maximum is **512 characters**. Passwords must be unique across all five employees.

   ```json
   [
     {"email":"example.employee@colora.vn","password":"REPLACE_WITH_AN_UNIQUE_PASSWORD","role":"staff"}
   ]
   ```

   This is just one illustrative object. Your actual secret must contain five entries with **3** `staff` and **2** `senior` roles. No real passwords, account emails or JSON credentials should be pasted into GitHub source, an issue, Actions logs, or chat.

2. Open GitHub repository **Settings → Environments → github-pages → Environment secrets**. Create or update **`COLORA_ACCOUNT_CREDENTIALS_JSON`** with the complete five-person JSON. Retain `SENIOR_JD_PASSWORD` for the existing encrypted JD archive build.

3. Open **Settings → Secrets and variables → Actions → Variables**, set repository variable `STAFF_AUTH_MODE` to `static-accounts`. The old Staff workflow skips itself when this mode is active.

4. Open **Actions → Deploy COLORA individual encrypted accounts (opt-in) → Run workflow** (branch `main`). The job builds five independent AES-256-GCM encrypted role envelopes, tests correct/wrong credentials and Senior-only JD access in Chrome, then publishes only the login and encrypted content on GitHub Pages.

5. After the workflow reports **Success**, open https://staff.colora.vn/ in a private browser and test all five accounts, logout and Senior JD Library. If it fails, read the workflow error. For invalid passwords, the build reports **Account #1–#5** with a reason but never prints the email or password.

## Remember this browser for 30 days (opt-in)

The login now includes an unchecked **“Ghi nhớ đăng nhập trên thiết bị này trong 30 ngày”** option. On a trusted personal laptop, select it the first time you enter your individual email/password. Subsequent visits from the same browser profile normally open the Staff Workspace automatically without re-entering credentials.

- The application saves **only a non-extractable AES-GCM CryptoKey, an opaque encrypted-account ID and a 30-day expiration** to the browser's IndexedDB. It does **not** save the original password, email address, decrypted Staff HTML or a login token in localStorage/cookies.
- Choosing not to remember never saves the key. **Đăng xuất** deletes the local key, so the next visit requires the password. Sign-out is broadcast to other open Staff tabs in the same browser.
- Browser private/incognito mode, clearing site data, a different computer or another browser profile require another sign-in. Device storage may be cleared by the browser.
- **Important: each GitHub Pages rebuild regenerates all five encrypted envelope IDs and key salts.** As a result, **any new Staff deployment invalidates saved keys**, even if passwords did not change. On that next visit, the site requests the email/password again. Changing a user's password also invalidates their saved access.
- **Security trade-off:** a remembered browser can decrypt role content without knowing the password, so any person or hostile same-origin code with access to that browser profile could use the stored key. A non-extractable key only blocks direct export; it does not make the browser a trusted server. Use only on an individual, physically protected device, especially for Senior JD access. The 30-day time limit and local logout are client-side controls and do not revoke already-downloaded content.

## Replacing a password or revoking an employee

To change any password, replace only that member's `password` in `COLORA_ACCOUNT_CREDENTIALS_JSON`, update the whole GitHub Secret, and rerun the encrypted account workflow. The current build requires **exactly five** members; changing headcount requires a code update. Rebuilt ciphertext blocks decryption of the *newly deployed* site with old credentials, but previously downloaded encrypted documents cannot be remotely erased.

## Rollback

Set repository variable `STAFF_AUTH_MODE` to `legacy` or remove it, then manually run **Actions → Deploy COLORA Staff Portal** (`.github/workflows/pages.yml`). Keep the legacy Staff and Senior Secrets until you've verified the new gateway is usable. This does not change DNS, Haravan or company email settings.
