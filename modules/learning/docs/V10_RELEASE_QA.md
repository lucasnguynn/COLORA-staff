# COLORA Learning Studio V10 | QA, Content Authority & Release Notes

Status: **Technical QA ≠ Employee Certification**. Published static website is a self-training tool.

## What was repaired after independent V9 audit

1. **All 12 Applied Cases rewritten** with credible, work-like alternatives. Correct option longest in only 2/12, shortest in 2/12 (V9: 12/12 longest). Each answer retains its original key to avoid mismatched scoring. These are simulated cases, not customer evidence.
2. **Essentials / Advanced split inside lessons:** 203 teaching points now divided into **114 selected Essentials points** and 89 additional advanced points, across 17 chapters. Users still have access to all 203 through the Advanced track. Selected points are explicitly listed by index in the lesson JSON.
3. **Role-focused recommendations operational:** modules from `curriculum.role_advanced_chapters` are now prioritized and marked as recommended by role.
4. **Exam option order randomized** and stored with the attempt, while scoring uses stable underlying answer indices. Public JSON remains readable: not secure proctoring.
5. **Progress terms corrected:** 'Đã trả lời' is not 'đã hiểu'. Current correctness and review-needed counts shown separately. A correct item can become eligible for retrieval practice after 7 days, subject to browser-local data.
6. **Legacy learning records:** V9 profile, non-AC practice answers and teach-back entries are copied on first V10 visit, if available in the same browser. V9 exam scores are kept as legacy metadata rather than counted as V10 passes. No central sync.
7. **Sources:** explicitly warn when a colora.vn reference can be unavailable behind Coming Soon/password; approved internal documents should be used for staff learning.

## Source authority & claim approval

| Class | Use in staff training | Can be publicly claimed? | Approval gate |
|---|---|---|---|
| Founder-approved brand doctrine (tagline/philosophy) | Yes | Subject to context | Approved brand manual |
| Launch material: COLORA SILVER, GENIA276 Ag 930‰ | Yes | Only if traceable to actual launch products | Product Master / supplier evidence |
| Proprietary plating performance | Explain that brand has a proprietary process | Only tested, documented properties | Technical SKU dossier, legal claim check |
| RJC recycled certification / supplier chain of custody | Teach distinctions | Exact certified material and scope only | Actual RJC/supplier document |
| Mission, vision, three-value phrase as currently paraphrased | Strategy interpretation, explicitly labeled | Not as verbatim official statement | Founder approval of wording |
| Target age 22–38, motives, price band 2.3–8m VND | Strategic hypotheses/plans | Not as verified buyer statistics | Research validation |
| Policy / care / shipping | Teach general precautions | Only current policy/version | Policy owner sign-off |
| Gemstone treatment/identity | Teach gemological concepts | Only SKU-verified facts | Per-stone/lot paperwork |
| Product Passport & real photos | Template only today | Only SKU-verified assets | SKU approval + image rights |

**Open issue:** most internal source URLs for chapters 01–12 point to colora.vn; these pages may route to the Coming Soon password page. Do not represent an inaccessible public URL as sufficient supporting evidence. Provide employee-accessible approved internal documents when available. No confidential supplier cost, buyer information or unreleased proprietary plating specifications should be uploaded to public GitHub.

## Deployment acceptance tests

- 303 unique questions; 86 Essential ids and 17 chapters; 12 Applied Cases.
- All 17 lesson modules have a separately selected Essentials point subset.
- 3 role tracks with highlighted advanced recommendations.
- Exam: 32 Essentials + 8 Applied Cases + 8 role questions, 48 questions, 55 minutes; per-pillar thresholds and 3 safety gates remain as suggested self-learning logic.
- Key/option permutation consistency tested; 120 randomized exam allocations verified.
- Static deployment, no authentication or server-based certification; personal progress stored only in browser.

## Remaining work (explicitly not claimed as finished)

1. **Human review of the 86 Essential stems, answers, explanation quality, and official claim authority**, with item-by-item signed approval.
2. **Product Passport, front/side/back/on-body photos of actual finished SKUs**, exact stone treatment and finish data.
3. **Pilot with staff:** first-attempt accuracy, distractor selections, difficulty/discrimination, delayed recall, teach-back rubrics.
4. **Policy source revision control** and secure internal distribution of documents.
5. **Assessment privacy and authenticity** if COLORA later requires employee certification (not offered by a public static site).

These tasks should not be bypassed just because the GitHub CI passes.
