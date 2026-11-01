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

## Replacing a password or revoking an employee

To change any password, replace only that member's `password` in `COLORA_ACCOUNT_CREDENTIALS_JSON`, update the whole GitHub Secret, and rerun the encrypted account workflow. The current build requires **exactly five** members; changing headcount requires a code update. Rebuilt ciphertext blocks decryption of the *newly deployed* site with old credentials, but previously downloaded encrypted documents cannot be remotely erased.

## Rollback

Set repository variable `STAFF_AUTH_MODE` to `legacy` or remove it, then manually run **Actions → Deploy COLORA Staff Portal** (`.github/workflows/pages.yml`). Keep the legacy Staff and Senior Secrets until you've verified the new gateway is usable. This does not change DNS, Haravan or company email settings.
