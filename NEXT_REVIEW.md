# RegCompass — Regulatory Review Schedule

RegCompass cites primary regulatory sources (FDA, EU MDR/IVDR, EUR-Lex, EU AI
Act, and related guidance). Those sources move and get superseded over time. To
keep the tool trustworthy, a **lighter quarterly review** runs on a fixed
cadence, synchronized with CyberCompass for a single review window across both
tools.

## Next review

| Field | Value |
|---|---|
| **Next review due** | **2026-11-18** |
| Cadence | Every 3 months |
| Tracking | GitHub issue (labelled `review`) for the due date |

## What a quarterly review covers

A **link-check + awareness-check**, not a full re-read of every source (escalate
to a full re-read only if something looks off). Re-check the cited sources for:

1. **Dead / moved links** — every cited `href` still resolves.
2. **Superseded guidance** — has a cited FDA guidance or EU MDCG/AI-Act document
   been replaced or withdrawn?
3. **Regulatory change in progress / shifting deadlines** — e.g. FDA guidance
   revisions, EU MDR/IVDR transitional timelines, EU AI Act phase-in dates,
   EUDAMED module go-live dates.

## Process — directive-gated, always

**Every** finding goes through the normal directive process before any content
change lands — including "obviously correct" link updates. No silent patches,
ever. A review produces a findings report; the Director issues a directive; the
implementor applies and logs it.

## After each review

- Update the **Next review due** date above (+3 months → 2027-02-18).
- Open the next tracking issue.

---

_This cadence is maintained independently for RegCompass. A parallel, date-synced
rule exists for CyberCompass under its own directive sequence._
