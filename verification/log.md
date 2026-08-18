# RegCompass — Source / Link Verification Log

Verification of the primary-source links RegCompass cites, mirroring the
CyberCompass verification discipline. Synchronised quarterly review cadence —
see [`NEXT_REVIEW.md`](../NEXT_REVIEW.md) (next due **2026-11-18**).

## Scope & method

RegCompass is a **rule-based decision engine**: most regulatory references
(e.g. "GSPR 5", "IEC 62366-1", "Annex VIII Rules 1–22", "IMDRF N60",
"Article 6(1)") live as **text inside the decision logic** in
[`js/app.js`](../js/app.js), which is fully human-readable and auditable — they
are part of the rules, not hyperlinks. The **hyperlinked** primary/portal
sources the app points users to are the ones verified here.

For each link:
1. **Resolves** — the URL is requested and its final HTTP status recorded.
   Publishers behind anti-bot CDNs (EC `health.ec.europa.eu`, `imdrf.org`)
   return `403`/challenge to automated requests but resolve in a real browser;
   noted as **OK¹**.
2. **Correct source** — the link points to the authoritative body/document for
   the context in which it is cited.

**Status legend:** OK = resolves + correct source · OK¹ = correct canonical URL,
automated fetch blocked by CDN (browser-resolvable) · FIXED = was broken, corrected.

## Verified 2026-08-18 · verifier RY

| # | Cited for | Source | Link | Status |
|---|---|---|---|---|
| 1 | FDA classification / product code lookup | FDA Product Classification Database (CDRH) | accessdata.fda.gov/…/cfPCD/classification.cfm | OK |
| 2 | FDA pathway (510(k)) | FDA — Premarket Notification 510(k) | fda.gov/…/premarket-notification-510k | OK |
| 3 | FDA general device regulation | FDA — Medical Devices hub | fda.gov/medical-devices | OK |
| 4 | FDA study/market guidance | FDA — How to Study and Market Your Device | fda.gov/…/how-study-and-market-your-device | OK |
| 5 | SaMD module | FDA — Software as a Medical Device (SaMD) | fda.gov/…/software-medical-device-samd | OK |
| 6 | Cybersecurity module | FDA — Digital Health Cybersecurity | fda.gov/…/digital-health-center-excellence/cybersecurity | OK |
| 7 | EU MDR basis | Regulation (EU) 2017/745 (MDR) | eur-lex.europa.eu/eli/reg/2017/745/oj | OK |
| 8 | EU AI Act basis | Regulation (EU) 2024/1689 (AI Act) | eur-lex.europa.eu/eli/reg/2024/1689/oj | OK |
| 9 | EU AI Act module context | EC — AI regulatory framework | digital-strategy.ec.europa.eu/…/regulatory-framework-ai | OK |
| 10 | EU guidance (MDCG etc.) | EC — Medical devices guidance & useful information | health.ec.europa.eu/medical-devices-sector/guidance-and-useful-information_en | OK¹ |
| 11 | EUDAMED module | EU — EUDAMED database | ec.europa.eu/tools/eudamed/eudamed | OK |
| 12 | SaMD / IMDRF risk categorisation | IMDRF | imdrf.org | OK¹ |

**Internal / non-source links (also verified to resolve):**

| # | Purpose | Link | Status |
|---|---|---|---|
| 13 | Windows installer download | github.com/rajeevyadav/regcompass/releases/latest/download/RegCompass-Setup.exe | OK |
| 14 | Portable download | …/RegCompass-Portable.exe | OK |
| 15 | Releases page | github.com/rajeevyadav/regcompass/releases | OK |
| 16 | Companion tool cross-link | rajeevyadav.github.io/cybercompass | OK |

## Summary

**16 links — 14 OK, 2 OK¹ (EC guidance + IMDRF, CDN-blocked to automated fetch,
browser-resolvable). 0 broken, 0 unverified, 0 pulled.**

Several FDA/EC/IMDRF links are **portal/hub** pages rather than a single specific
document — appropriate here because RegCompass is a decision engine that points
users to the authoritative source for each module, with the detailed rule logic
auditable in `js/app.js`. This mirrors the "keep the portal link and say so"
handling used in the CyberCompass verification.

## Notes / flags

- **Textual regulatory references** in the rules (GSPR clauses, IEC 62366-1,
  Annex VIII rules, IMDRF N-series, AI-Act articles) are not hyperlinks and are
  out of scope for *link* verification; they are auditable in `js/app.js`. If the
  Director wants those turned into verified hyperlinks (as CyberCompass does at
  clause level), that would be a separate directive.
- No dead or moved links found in this pass.

## Next scheduled review

**Due 2026-11-18** (quarterly, per `NEXT_REVIEW.md`). Lighter pass: re-check
these links + regulatory-change awareness (MDR/IVDR timelines, AI-Act phase-in,
FDA guidance revisions). Directive-gated — no silent patches.
