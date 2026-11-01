# COLORA Learning Studio V10.2 | Verified Knowledge & Applied Competency

**Status: Technical release. NOT an approved certification, SKU passport, or evidence of employee competence.**

## 1. V10.2 fixes delivered

### Version-aware assessment
- Every new exam and completed attempt stores `assessmentVersion=10.2` and `bankId=colora-v10.2-20261031`. The latter is an **explicit release identifier**, not a cryptographic content digest.
- Home, Exam intro, Result and employee export choose **only current-version attempts**.
- Older attempts remain in local browser history; the Exam page notes the old score as historical, not a current pass. Existing in-progress V10.1 exams are invalidated when moving to V10.2 to avoid mixed answer keys.
- Same public static limits: no identity validation, answer security or server persistence.

### Share CORE learning progress across roles
- V10.1 stored practice answers under `BASIC:<id>`, `CARE:<id>`, `MKT:<id>` regardless of question role.
- V10.2 stores every **CORE** question answer under `CORE:<id>`. Role Mastery remains role-scoped and Applied Cases remain practice items for the selected role.
- Migration reads earlier role-scoped CORE answers, selects the latest timestamped record as current and preserves the earliest **known** first-attempt indicator.
- Because questions ON-045 and ON-074 were materially rewritten (including ON-074's correct key), their **old practice outcomes are archived** under `legacyPractice` and no longer counted as current. The same applies to previously revised Applied Cases. Original role-scoped records are retained as legacy local data, not erased; a migrated first-attempt result that cannot be established is treated as unknown.
- Migration runs only **after the current question bank is loaded**, so the role of each question can be determined safely. Progress only persists in the same browser.

### Course learning objectives and customer understanding
- **17 distinct, observable learning objectives** replace the generic shared sentence in 15 chapters.
- Essentials include **117 points across 17 chapters** from 203 total lesson points. Additional points about self-reward, Desire and Relationship are now foundational, not only advanced.
- Added **four CUG simulated exercises** in chapters 09, 10, 11: metal fineness versus tarnish resistance, personal meaning versus wearer preferences, perceived value objections, and diagnosing an online journey. Each has a scenario, trainee task, and optional example response.
- Improved ON-045 (respect the giver's chosen meaning without assuming the wearer's preference) and ON-074 (explain a SKU's actual value based on approved evidence rather than just material weight).
- No fabricated customer cases, SKU passports, market statistics or purported employee responses.

### Controlled material claim
- The previous teaching point that directly said `100% post-consumer recycled` was replaced. **Recycled silver** is the confirmed founder-facing description; pre-/post-consumer categorization, percentages, CoC chain claims and specific finished-product certifications require traceable records for the applicable lots/SKUs.
- COLORA SILVER remains the approved brand-facing metal system with the launch alloy GENIA276 Ag 930‰ and stated proprietary plating. No unverified durability/lifetime promise is introduced.

## 2. Release QA acceptance

The automated validator must verify:
1. 303 items; 86 Essentials; 81 eligible Essential questions (5 withheld pending content approval); 48-question exam allocations across all 17 chapters, three roles and four pillars.
2. 17 unique measurable chapter goals; 117 Essential learning points; four CUG sample cases; no direct '100% post-consumer recycled' claim in chapter 12.
3. Version-specific results: old attempts cannot be treated as current scores, old result history remains, current results require the matching version and bank identifier.
4. Shared CORE progress when role changes; role-specific Mastery progress is retained; previously answered AC cases with changed content are not treated as valid.
5. Unchanged controls: frozen exam role, critical safety answers, threshold, 7/30-day practice recheck logic and option shuffling.

## 3. Content governance still open

**All 86 Essential items remain PENDING_HUMAN_REVIEW.** The five excluded items are FN-033/034/035 (draft mission, vision, values) and GM-048/053 (pending stone QC SOP).

The founder and designated brand/product reviewers must decide approval and source boundaries. For each item, record document ID/version, scope of claim, owner and review date **before** changing its status.

The public GitHub repository is not a suitable place for unreleased proprietary metal plating formulas, supplier contracts, customer information, HR records, or private CAD/SKU records. This release only changes public-safe training content.

## 4. Product/visual proof gap

This repository still does not have verified on-body/front/side/back/macros of actual finished COLORA SKUs. The next visual competency assessment should use the existing [Product Passport template](PRODUCT_PASSPORT_TEMPLATE.md) after image rights and SKU approvals, not generated images presented as proof. Images of loose gemstones do not prove finish, scale, setting, or finished-product comfort.

## 5. Recommended human pilot

- Give five to ten staff, if available, a short pre-test, V10.2 Essentials learning, and a delayed test.
- Ask each to introduce COLORA in 45 seconds, explain COLORA SILVER without overclaiming, classify a hypothetical customer's missing knowledge, and describe correct aftercare escalation.
- Have product staff compare actual approved product photos and CAD against DNA. Do not treat mockup alone as QC approval.
- Use disagreement on an item's best answer to **edit the question**, not automatically penalize an employee who reasoned from missing evidence.
- Do not claim scientific validation from automated GitHub Actions.

## 6. Remaining limitations

- LocalStorage is not identity-proof or centrally auditable.
- Version IDs are manually incremented; content changes require a new revision ID. There is no cryptographic assessment hash today.
- Source links on colora.vn may still be behind the Coming Soon page.
- V10.2 does **not** approve the wording of mission/vision/values, a gemstone QC SOP, warranty details, or claims about RJC being a finished-product certificate.
