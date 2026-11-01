# COLORA Staff — original application source snapshots

These snapshots were imported once on 2026-11-01. Each commit SHA identifies the original `main` revision for later traceability, even if the original repositories are archived or removed. The deployed website does **not** fetch from those repositories.

| Application | Original revision | Local archive |
| --- | --- | --- |
| CSKH-COLORA | `f2d4ab4b3a790e62dec2b18cba5916355e89504f` | `modules/client-care/` (including docs, tests, schema, runtime source and assets) |
| QnA-COLORA | `269f5134906474d2e0a7f1b357d332fc4cd6732b` | `modules/learning/` (including full question banks, lessons, assets, scripts and docs) |
| QR-V1 | `b389d23cb1b47020cebfcf361eb103938359a7f3` | `modules/qr/` (HTML and complete supplied logo assets) |
| COLORA-JD | `e3017942eeb00c945341ca3e03d79b9c063fc085` | `modules/jd-source.enc.json` (whole source tarball encrypted under `SENIOR_JD_PASSWORD`) |

All original app files were preserved other than actual Git history (`.git`), private dotenv entries and irrelevant OS/system files. Original app GitHub workflow metadata is archived under each respective module's `.github/` where applicable, but **not executed** as a root Staff workflow. The JD repository contains no source-level GitHub Actions workflows.

**Security:** The three public non-sensitive source archives remain readable in this public repository. JD source is encrypted, and its generated webpage is encrypted again before publication. Access via shared passwords is not verified staff identity. Historical public JD access cannot be undone.

**Recovery:** Keep your own offline backup before deleting the old repositories. Rotating the senior secret requires first decrypting and re-encrypting `modules/jd-source.enc.json` using the old and new secret; do not rotate blindly.
