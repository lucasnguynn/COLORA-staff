# COLORA Staff — Individual email/password access (no Supabase)

**Passwords: minimum 8 characters; different for every employee.** This is a static encrypted gateway, not server-verified identity or ownership of an email inbox.

## Staff roles

The existing protected roster contains **3 Staff and 2 Senior**. A sixth **Staff** account can be added using a separate protected environment secret; the original five-person roster remains unchanged. Never commit any real employee credentials or password-bearing JSON to this public repository.

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

## Adding a sixth Staff account (without replacing the five existing credentials)

This optional path was added to avoid re-entering the existing five-person secret. It does **not** require changing the original `COLORA_ACCOUNT_CREDENTIALS_JSON`.

1. In **GitHub → COLORA-staff → Settings → Environments → github-pages → Environment secrets**, create `COLORA_ADDITIONAL_STAFF_CREDENTIALS_JSON` as one **JSON object** (not an array) with the exact keys `email`, `password`, `role`. Set `role` to `staff`. Enter the sixth person's company address and unique password **only in the GitHub secret editor**, never in a commit, PR, or issue.
2. Existing `COLORA_ACCOUNT_CREDENTIALS_JSON` remains unchanged at five members. The build combines the original five and the additional Staff member inside the protected runner, validates all six, generates encrypted account envelopes, and publishes no plaintext roster.
3. Run **Actions → Deploy COLORA individual encrypted accounts (opt-in) → Run workflow** on `main`. The production workflow and post-deployment login checks both use the optional secret. Confirm that all six accounts can sign in and only the two Senior members have JD access.
4. If the optional secret is not present, the portal continues to build and deploy the **existing five users**, so source changes alone do not activate a new account. If the optional secret is malformed or duplicates an existing employee email/password, the build fails safely without publishing a partial roster.
5. To revoke the additional member, delete the **optional** environment secret and redeploy. Previously downloaded encrypted data cannot be remotely erased.

**Security:** This is a static offline-decryptable login. Avoid passwords based on staff names or email addresses. Prefer a unique randomly generated password of at least 16 characters and share it only via a secure channel.

## Remember this browser for 30 days (opt-in)

The login now includes an unchecked **“Ghi nhớ đăng nhập trên thiết bị này trong 30 ngày”** option. On a trusted personal laptop, select it the first time you enter your individual email/password. Subsequent visits from the same browser profile normally open the Staff Workspace automatically without re-entering credentials.

- The application saves **only a non-extractable AES-GCM CryptoKey, an opaque encrypted-account ID and a 30-day expiration** to the browser's IndexedDB. It does **not** save the original password, email address, decrypted Staff HTML or a login token in localStorage/cookies.
- Choosing not to remember never saves the key. **Đăng xuất** deletes the local key, so the next visit requires the password. Sign-out is broadcast to other open Staff tabs in the same browser.
- Browser private/incognito mode, clearing site data, a different computer or another browser profile require another sign-in. Device storage may be cleared by the browser.
- **Normal updates preserve remembered access.** When the previous published manifest is accessible and an employee's email/password is unchanged, the build retains that employee's original randomly generated KDF salt and opaque ID, while rotating the AES-GCM IV for every new release. This allows the remembered browser key to decrypt updated workspace content without another login. Changing that employee's password invalidates their remembered access. If GitHub Pages is unavailable during deployment or a record cannot be safely matched, the build generates fresh credentials and that device must log in again (fail closed).
- **Security trade-off:** a remembered browser can decrypt role content without knowing the password, so any person or hostile same-origin code with access to that browser profile could use the stored key. A non-extractable key only blocks direct export; it does not make the browser a trusted server. Use only on an individual, physically protected device, especially for Senior JD access. The 30-day time limit and local logout are client-side controls and do not revoke already-downloaded content.

## Replacing a password or revoking an employee

To change any password, replace only that member's `password` in `COLORA_ACCOUNT_CREDENTIALS_JSON`, update the whole GitHub Secret, and rerun the encrypted account workflow. The base secret must continue to contain **exactly five** members; the sixth Staff member has its own separate protected secret. Rebuilt ciphertext blocks decryption of the *newly deployed* site with old credentials, but previously downloaded encrypted documents cannot be remotely erased.

## Rollback

Set repository variable `STAFF_AUTH_MODE` to `legacy` or remove it, then manually run **Actions → Deploy COLORA Staff Portal** (`.github/workflows/pages.yml`). Keep the legacy Staff and Senior Secrets until you've verified the new gateway is usable. This does not change DNS, Haravan or company email settings.
