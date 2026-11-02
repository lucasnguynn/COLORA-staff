# COLORA Staff — migrate code to private GitHub without breaking free hosting

Status: **not yet migrated**. Repository visibility changes and new repository
creation must be done by the GitHub owner. Keep `staff.colora.vn` working until
the replacement deployment is verified.

## Confirmed constraints

1. On GitHub Free, switching the **current** Pages repository to Private
   automatically unpublishes its website. This is documented by GitHub:
   https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility
2. GitHub Pages from a private source repository requires a plan such as
   GitHub Pro / Team / Enterprise. The account plan has not been verified.
3. Making the repository Private does **not** hide browser-delivered assets
   from web visitors. Current publicly retrievable training JSON, JS, CSS,
   account-envelopes and public verification metadata stay accessible on the
   deployed site. Never publish real HR/customer/supplier/private financial data.
4. Making this repository Private also does **not** make its previous public
   forks or archived copies private. FOUR other original source repos
   (`COLORA-JD`, `QnA-COLORA`, `CSKH-COLORA`, `QR-V1`) remain Public until
   independently reviewed and switched.
5. This repository's original history has already been Public. Creating a
   fresh public release repository with only generated assets avoids copying
   that history into the *new* public publishing repository, but cannot recall
   past downloads.

## Route A — Your GitHub account already has private-repository Pages

Only after confirming your plan *and* validating backup/recovery, the owner
may change this existing repository in GitHub → Settings → Danger Zone →
Change repository visibility → Private. Check GitHub Pages plan eligibility,
domain verification and HTTPS before and after the change. Keep the published
artifact allowlist: even Private source code produces a PUBLIC site.

Do not invoke this route for GitHub Free.

## Route B — GitHub Free, recommended no-new-provider architecture

Keep only **one small, clean-history PUBLIC Pages repository**. Put all
buildable Staff source, the source JD snapshot, workflows, tests and editable
learning documents in a new PRIVATE repository under the existing GitHub
account.

Suggested repositories:
- `COLORA-staff-source` — PRIVATE; full source and encrypted archived JD,
  secret-scanning checks, `validate`, build pipeline, production Secrets.
- `COLORA-staff-pages` — PUBLIC; strictly the final `account-release/public`
  contents. No build scripts, test fixtures, JSX/HTML source templates, HR
  drafts, credential JSON, staff names/emails, source history or Actions secrets.

A one-way release workflow in the PRIVATE repository must:
1. Build using protected environment secrets and a fresh isolated runner.
2. Run staff/senior login, UI, integrity and public-artifact allowlist tests.
3. Verify the final artifact has only the five encrypted account envelopes,
   public salt/verifier manifest and the intentional public static files.
4. Publish the *allowlisted artifact only* to the PUBLIC release repository,
   using a GitHub fine-grained PAT scoped ONLY to that release repository's
   **Contents: read/write** permission, stored as an environment secret in
   the PRIVATE source repository. Use a separate publishing step with least
   privilege. Do not pass the PAT to untrusted pull-request code.
5. In the PUBLIC release repo, publish from the clean release branch with
   GitHub Pages; protect its publishing branch and avoid public Actions logs
   containing secret or plaintext build material.
6. Verify the new public release URL, all five account login/logout paths,
   encrypted JD role gating, test QR/email signature and the expected commit
   fingerprint. Only then transfer the custom domain to the new Pages repo.
7. Verify `staff.colora.vn` and HTTPS; preserve original source repo as-is
   until the new hosting is confirmed. Update DNS only when required.

**Migration must be completed as an atomic planned cutover.** Do not make
the current source repository Private first: on GitHub Free the existing
website will stop serving. Avoid deleting/rebuilding the existing public repo
before its replacement is live.

The pre-existing `COLORA-staff` Ruleset can protect source PRs until
migration. Recreate appropriate Rulesets in both new repositories; repo-level
Rulesets do not transfer automatically with source copies.

## Current known limitations / blockers

- A GitHub code-writing connector alone cannot create repositories, change
  repository visibility or edit domain settings. These are owner-level UI/
  administrative operations.
- The existing `rotate-jd-password.yml` attempts a direct push to `main`,
  which conflicts with the enforced Pull Request Ruleset. It is an optional
  archive recovery workflow, not required for day-to-day Staff operation.
  Do not bypass the Ruleset for this: redesign rekey as a PR with only
  ciphertext after a verified backup, or leave the unused archive unchanged.
- `SENIOR_JD_PASSWORD` currently does not unlock the older JD source archive;
  production falls back to the reviewed pinned source. Existing JD drafts
  are stored *locally in the browser*, not in that source archive.
- Production source encryption uses individual email/password AES-GCM
  envelopes. Public KDF salt/verifier material is subject to OFFLINE guessing:
  use unique long random passwords and export JD drafts before password
  rotations. It does not support server-managed revocation.
- `scripts/security-audit.mjs` is a high-confidence tracked-file tripwire,
  not a complete git-history or vendor-code audit. Scan original history
  and public forks separately and rotate any real keys discovered.

## No-cost hardening checklist

- [ ] Owner GitHub 2FA (prefer passkey / hardware key).
- [ ] Review connected OAuth apps, collaborators, deploy keys and PATs.
- [ ] Ruleset active, targeting default branch and requiring `validate` PR.
- [ ] Configure `github-pages` environment secrets; never embed them in JS.
- [ ] Enable available Dependabot / dependency graph / secret scanning alerts.
- [ ] Verify `colora.vn` ownership for GitHub Pages domain takeover protection.
- [ ] Enforce HTTPS and avoid wildcard DNS.
- [ ] Backup and export JD before password, identity or browser changes.
- [ ] Do not save private operational records in publicly reachable assets.

Relevant official docs:
- GitHub Pages by plan:
  https://docs.github.com/en/pages/getting-started-with-github-pages
- Published Pages sites are public even with private source:
  https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Domain ownership validation:
  https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
- Actions billing on private repos:
  https://docs.github.com/en/actions/concepts/billing-and-usage
