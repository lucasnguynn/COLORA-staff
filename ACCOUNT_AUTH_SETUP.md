# COLORA Staff — individual accounts (staged migration)

**Status: staged / NOT activated.** The existing StatiCrypt Staff and Senior passwords stay live until the operator finishes the checklist and explicitly changes `STAFF_AUTH_MODE` to `accounts`. This feature is implemented in repository source only; it cannot create a Supabase project or its users by itself.

## Approved personnel

The five company addresses and their roles are provided privately by the COLORA owner: **3 Staff and 2 Senior**. Because this GitHub repository is public, do **not** commit the actual employees' email addresses. Keep the exact five `[email,role]` pairs from the approved roster in the server-side `COLORA_AUTH_ALLOWLIST_JSON` environment secret, not in JavaScript, SQL migrations, README or pull requests.

Each person receives their own Supabase Auth user and sets a **separate Staff Workspace password**, NOT their BKNS mailbox password. There is no public self-signup. `staff` can read `staff.html`; `senior` can read `staff.html` and `senior.html` from the private bucket. RLS evaluates the signed `auth.uid()` and a server-administered membership row — the frontend's role label is not authority.

## Provisioning (one-time, project owner only)

1. Create a NEW Supabase project owned by COLORA. Do not choose a preexisting project with unrelated broad Storage policies. Record its `https://<project-ref>.supabase.co` URL, **publishable** `sb_publishable_...` key, and server-only **secret** `sb_secret_...` key. Never paste the secret into Git, chat, the browser or the public website.
2. In Supabase Dashboard **Authentication → Providers**, enable Email, require email verification, and **disable public sign-ups**. Configure a password minimum of at least 12 characters, login rate limits and email enumeration protection. Consider MFA especially for Senior. Under **URL Configuration**, set `https://staff.colora.vn` as Site URL and an allowed redirect.
3. In SQL Editor apply `supabase/migrations/202611020001_colora_staff_auth.sql` against the project. This creates an initially empty private allowlist table, the `colora_staff_members` role table, a provisioning trigger, and a PRIVATE Storage bucket with **read-only RLS**. Verify that `storage.buckets.public=false` and there are no extra broad policies giving `authenticated` blanket read access to this bucket. Do not add any anonymous policy.
4. Configure Supabase custom SMTP from a dedicated COLORA/BKNS sender mailbox. Do not reuse staff inbox passwords inside website code. Set up Supabase **Invite User / Recovery email templates**. The frontend supports both normal invite links (implicit token in fragment) and a custom URL such as `https://staff.colora.vn/?token_hash={{ .TokenHash }}&type=invite`. That URL requires the corresponding custom email template.
5. **Invitation:** when Supabase and SMTP are configured, set `COLORA_AUTH_ALLOWLIST_JSON` to exactly five private `[email, role]` pairs (3 staff, 2 senior), then run `node scripts/invite-colora-staff.mjs` from a trusted admin terminal with `SUPABASE_URL` and `SUPABASE_SECRET_KEY` configured. The script first populates the protected allowlist, then sends invitations. The script invites EXACTLY five approved addresses. Email ownership is established through the invite token. Individual passwords are entered only by the employee on the secure website. Confirm all five accounts become active.
6. Set **GitHub environment secrets** under `github-pages`: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (public, nevertheless stored here for build consistency), `SUPABASE_SECRET_KEY` (server-only), and keep `SENIOR_JD_PASSWORD` only for temporary archive decryption. Do not expose the secret key in any repo variable or JavaScript. Set the **GitHub repository variable** `STAFF_AUTH_MODE=accounts` ONLY after the above prerequisites are complete.
7. Run GitHub Actions → **Deploy COLORA individual accounts (opt-in)** → Run workflow. The build creates two unencrypted pages *inside the trusted runner only*, publishes them to **private Supabase Storage**, verifies both are denied to anonymous fetches, wipes plaintext, and publishes only public assets and `index.html` login to GitHub Pages. The old Pages workflow skips deployment when `STAFF_AUTH_MODE=accounts`.
8. Verify in **two separate browser profiles**: unlisted email/password denied, Staff identities log in to the normal workspace and **cannot download `senior.html`**, each Senior logs in and can open JD without a second shared password. Test signout, invite, reset and revocation; reload and re-login. Only then notify employees.

To revoke access, use Supabase Auth admin to ban/delete user and/or set `colora_staff_members.active=false`. Existing browser memory or downloaded/printed content cannot be remotely wiped after it was delivered. Existing local JD drafts are device/browser-origin-local, not migrated to a server. Back up drafts before retiring an older JD app.

## Architecture

```text
Browser / staff.colora.vn (GitHub Pages)
  └─ account-login.js: company email + individual Staff password
        ├─ Supabase Auth: password hash, email verification, rate limits
        ├─ Supabase Postgres: RLS role lookup by signed auth.uid()
        └─ Supabase Private Storage, JWT + SQL RLS
              ├─ staff.html  ← active Staff + Senior
              └─ senior.html ← active Senior ONLY
  └─ original Staff editor loaded in memory as a same-origin iframe
       └─ existing JD editor localStorage and PDF features unchanged
```

The legacy public StatiCrypt `index.html`, `senior-gateway.json`, and `/apps/jd/index.html` are **not** included in the account-based public Pages artifact. No shared employee password remains embedded in the new public UI. The five users' passwords never touch GitHub. The publishable key and project URL are intentionally public. **The secret key must never be published.**

**Security limitations:** The original `COLORA-JD` source repository and historical public commits may still expose previously published JD template content; deploying this gateway does not erase that. Audit and restrict or retire those old sources separately. Training JS, downloadable JSON, logos and unencrypted frontend assets remain public — only private role-specific HTML is gated here. This design protects access to page content **at delivery time**, not confidentiality after an authorized browser has received it. It is not a substitute for a private HR database.

## Rollback

If account deployment fails, set GitHub repository variable `STAFF_AUTH_MODE=legacy` (or remove it) and manually re-run **Deploy COLORA Staff Portal** (`pages.yml`). Existing shared Staff/Senior passwords remain in protected GitHub environment secrets. Private Supabase content remains protected by RLS; remove it separately if abandoning. Do not change DNS, Haravan, MX or BKNS mailbox settings.

## Testing

PR CI checks that only one public HTML is present, both private HTML role payloads exist outside Pages, JD is absent from Staff HTML, and SQL matches the five approved identities. Production activation requires real browser tests against the provisioned Supabase project with all five invited accounts.

No app connection is required to author this repository code, but account provisioning and publishing are **blocked without the project and environment secrets**.
