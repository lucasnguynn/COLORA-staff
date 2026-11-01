# COLORA Client Care Academy

**COLORA - COLOR YOUR AURA**

Static training website for foundational client-care knowledge, gemstone literacy, after-sales conversations and scenario-based assessment. Built for the COLORA team and adapted from the COLORA Client Care System V1.0 (31.10.2026). Academy V2.1 builds on V2.0 and expands the public learning prototype with research-backed stone reference, a Product Evidence Gate and written role-play. It is NOT a verified inventory, private CRM or employee certification system.

## Features

- Responsive COLORA design using ivory, navy and gold; Cormorant Garamond display and Open Sans body.
- Three tracks: Nền tảng, Client Advisor, Marketing.
- 13 microlearning modules, 18 situational response scripts and 66 MCQ questions with explanations.
- Six multi-step case simulations (18 decisions total) with rationale, safety notes and self-review.
- Public Product Intelligence: 10 GIA-referenced gem guides, seven cut-shape schematics, and seven SKU evidence areas. **None represents confirmed COLORA stock.**
- Advisor Role-play: three fictional client scenarios with free-writing practice, six-item weighted self-check rubric, model answer comparison and NO data upload.
- **Approved SKU Library:** publicly approved product projection only. Starts empty and never creates fictitious COLORA products.
- **Publication Control:** six-step release workflow and versioned public policy registry, initially empty until genuinely approved and publicly accessible.
- **Facilitator Review Lab:** supervised, manual 0–4 ratings against six weighted skills, safety gate, 80-point suggested threshold and anonymous JSON result export; no personal or customer data is collected or retained.
- **Release validation:** no deployment unless publication and UI regression checks pass.
- Instant-feedback practice: 10 random questions per attempt.
- Final assessment: 15 questions for foundation; 18 for the other tracks, with at least one question per module and shuffled answer positions. The current practice threshold is at least 80% AND no incorrectly answered selected critical question. This is a self-study measure, not a validated competence test.
- Self-reported 'read' markers, local-only quiz and case history, and JSON progress export.
- Search for lessons and scripts, with quick links to official COLORA policies.
- No framework, npm, backend or external tracking.

## Security and privacy

**This repository is PUBLIC.** Anyone can read the source, content and question bank. The portal has no actual authentication, access control, exam integrity or secure personnel LMS.

- Do NOT input or upload real customer names, phone numbers, emails, orders, case attachments, IDs or any personal information.
- localStorage saves selected role, lesson completion and results on the visitor's device only. Results may be modified by the visitor and must not be treated as official HR certification.
- The source intentionally contains no API keys, spreadsheets, private SOPs, customer records, tokens or contracts.
- A future private internal academy needs genuine server-side identity and role permissions before handling employee records or customer data.
- The noindex,nofollow tag is only a search discovery hint, NOT security.

## Start locally

Open index.html directly in a browser. Alternatively start a simple server:

    python3 -m http.server 8000

Visit http://localhost:8000.

Hash routes (such as #/home, #/learn and #/exam) remain compatible with GitHub Pages project paths and refreshes.

## Deploy with GitHub Pages

1. Open repository Settings > Pages.
2. Under Build and deployment, set Source to **GitHub Actions**.
3. The workflow in .github/workflows/deploy-pages.yml publishes the static website on updates to main, or manual dispatch.
4. Check Actions > Deploy COLORA Academy for a successful run; Settings > Pages provides the verified published URL.

Pages must be enabled in settings. The workflow alone does not guarantee the website has already gone live. GitHub Pages is PUBLIC when deployed.

## File organization

- content.js: training modules, scripts, questions and reference URLs. The correct answer index is zero-based (0 denotes the first option); critical questions require correct responses to pass the exam.
- intelligence.js: cited gemstone educational reference, cut guide, evidence gate and written practice rubric; not live inventory.
- schemas/sku-evidence.schema.json: draft/approval evidence data model for future authenticated Product Information Management.
- data/approved-public.js: the PUBLIC, approval-only product/policy manifest (empty until vetted).
- ops.js: approved product catalog, publication governance UI and manual assessor review. Client-side and stateless.
- docs/PUBLISHING_GUIDE.md: human authorization, sanitized projection and branch protection setup.
- tests/publication.cjs, tests/ops.cjs: release-schema and manual scoring regression checks.
- app.js: navigation, quiz engine, assessment, UI rendering and locally stored progress.
- styles.css: brand palette, typography, components and responsive layouts.
- index.html: shell, accessible navigation and metadata.
- favicon.svg: minimal faceted gemstone mark.
- .github/workflows/deploy-pages.yml: deployment workflow.

## Policies: source of truth

- Warranty: https://colora.vn/pages/chinh-sach-bao-hanh
- Returns: https://colora.vn/pages/chinh-sach-doi-tra
- Shipping: https://colora.vn/pages/chinh-sach-giao-hang
- Sizing and resizing: https://colora.vn/pages/size-resizing
- Complaints: https://colora.vn/pages/phan-anh-khieu-nai
- Privacy: https://colora.vn/pages/chinh-sach-bao-mat

**Audit finding (31 Oct 2026):** all six COLORA policy links redirected to the password-gated Coming Soon page; they were not publicly verifiable. Employees need an approved, dated internal copy of each policy before making promises about warranty, returns, repair, delivery or refunds. Verify these references and the latest policy version before using them with customers. This training website never overrides public policies or applicable consumer law. Do not copy unapproved draft metal fineness, gemstone treatment, coating specifications or services into customer communication.

## Pre-release review

- [ ] Check the latest official policy pages.
- [ ] Verify gemstone, treatment, metal and finish details per active SKU.
- [ ] Test Chrome/Safari on phone and desktop.
- [ ] Review quiz answers with Client Care Lead and QC.
- [ ] Enable Pages and verify a successful deployment.
- [ ] Decide whether a public educational website is appropriate or a private authenticated LMS is needed.

© COLORA.
## Follow-up audit backlog

- [ ] Review and approve specific policy versions and embed a version/date/source owner.
- [x] Add public gemstone reference, cut schematics and evidence checklist; [ ] attach real QC-approved SKU cards and real photo/video assets only after secure approval and rights checks.
- [ ] Improve question discrimination: replace obvious distractors, validate question quality, calibrate the hard-fail critical rule and test with real staff.
- [x] Add written role-play with manual self-assessment rubric; [ ] conduct supervised human assessment before recognizing independent client-advisor competence.
- [ ] Supply the actual COLORA vector logo; currently the portal uses a text wordmark, not a fabricated vector identity.
- [ ] Move to a private, access-controlled LMS to centralize authenticated results (rather than browser storage) if the academy is for formal employee training.
- [ ] Run automated browser/device accessibility checks after each deployment.

## V2.0 product proof controls

The GIA reference guides establish educational gem property descriptions only. They must not be used as proof of an exact COLORA piece's gem identity, treatments, metal, plating, safety or warranty. The required chain is: **verified SKU → controlled evidence → QC/product owner sign-off → dated approved claim → client-facing communication**.

The public product schema does not authorize placing real supplier records, pricing, private BOMs, QC details or personal data in GitHub. For live operations, house the evidence in a permissioned backend and expose only approved public fields. Do not enable any client-facing claim while its supporting record is draft or unverified.

Role-play drafts are never persisted or transmitted by the application. Self-check scoring evaluates which rubric boxes the visitor ticks, **not the actual quality of written text**. This is deliberate: adding an automatic numeric score without assessing the content would mislead employees. A manager's review remains necessary.

## V2.1: Preparing real Product Knowledge records

The public approved manifest is intentionally empty. No live COLORA SKU, metal fineness, gemstone treatment, finishing process or warranty term is assumed verified. Read **[the publishing guide](docs/PUBLISHING_GUIDE.md)** before adding records.

Review records in a secure non-public source-of-truth (BOM, QC, gem reports, approved policy version). Only project safe approved fields to `data/approved-public.js` via a reviewed PR. The publication check rejects non-approved records and many explicitly forbidden sensitive field names but **cannot prove human approval is authentic**. Configure branch protection/rulesets requiring PR and review in GitHub Settings. CODEOWNERS alone does not enforce reviews.

**Important:** Because this is a public website, even approved product catalog and policy register data are freely readable by visitors and GitHub users. Do not publish hidden pricing, vendor identities, source documents, private inventory, customer records or internal case logs.

**Facilitator Review** is an optional manual practice tool. The assessor selects an entirely fictional scenario, grades six criteria, and marks critical failures. The 80/100 threshold and critical floor of 3/4 are experimental, not psychometrically validated. Export deliberately excludes names, written responses and free-text notes, and cannot establish a user's identity. Real staff certification requires an authenticated LMS and supervised review.

### CI and deployment

`tests/publication.cjs` validates published record structures and claim approval flags.
`tests/ops.cjs` checks that unapproved records remain hidden and that rubric scoring stops on critical flags.
`tests/smoke.cjs` checks all legacy training routes and quizzes.

The GitHub Pages workflow runs **all three checks as a prerequisite** before it uploads the site. `Quality checks` also runs them on branches and PRs. A successful CI result means the code and data shape passed the checks, not that product claims or policies were fact-checked against private evidence.

