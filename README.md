# RegCompass

**FDA & EU MDR Regulatory Navigator for medical devices**

[![Latest release](https://img.shields.io/github/v/release/rajeevyadav/regcompass?label=version&color=2ea44f&cacheSeconds=300)](https://github.com/rajeevyadav/regcompass/releases/latest)
[![Download for Windows](https://img.shields.io/badge/Download-Windows%20installer-0078d6?logo=windows)](https://github.com/rajeevyadav/regcompass/releases/latest/download/RegCompass-Setup.exe)
[![Open the app](https://img.shields.io/badge/Open-web%20%2F%20mobile%20app-8250df)](https://rajeevyadav.github.io/regcompass/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

_Last updated: **2026-08-18** · Next regulatory review: **2026-11-18** (see [NEXT_REVIEW.md](NEXT_REVIEW.md))_

🌐 **Use it now in your browser: https://rajeevyadav.github.io/regcompass/**

RegCompass is a free, offline decision-support navigator for **FDA** and **EU MDR**:
classification, SaMD/AI, the EU AI Act, cybersecurity, human factors, GSPR and EUDAMED
readiness — in one app that runs in any browser, installs on Android and iPhone, and ships
as a Windows desktop app. Deterministic, rule-based and fully auditable: **no AI in the
compliance logic**.

## Features

| Module | Markets | What it does |
|---|---|---|
| Classification Engine | FDA + EU | Estimates FDA class (I/II/III) & pathway (510(k) / De Novo / PMA) and EU MDR class (Annex VIII Rules 1–22), with a side-by-side divergence summary |
| SaMD / AI | FDA + EU | IMDRF risk categorisation (significance × condition state) with AI/ML and PCCP flags |
| EU AI Act | EU | Regulation (EU) 2024/1689 applicability, Article 6(1) high-risk determination and Article 8–17 provider-obligation tracker |
| Cybersecurity | FDA + EU | FDA premarket cyber checklist + MDCG 2019-16 / GSPR 17.2–17.3 checklist |
| Human Factors | FDA + EU | Use-related risk & usability engineering checklist (FDA HF guidance, GSPR 5, IEC 62366-1) |
| GSPR Matrix | EU | Condensed Annex I GSPR tracker with progress bar, local save and CSV export |
| EUDAMED | EU | Core UDI/device data completeness check |
| Report | Both | One-page summary of every module you ran, printable to PDF |

## Coverage

FDA and EU MDR. Decision-support only — it does not create compliance and does not replace
professional regulatory advice, FDA interaction or Notified Body assessment. Always verify
against official sources (FDA, EUR-Lex, MDCG, IMDRF, EUDAMED).

## How to use

**In the browser / install on your phone (free, no app store needed)**

1. Open **https://rajeevyadav.github.io/regcompass/** in any browser.
2. Android (Chrome): menu → **Add to Home Screen** — it installs like a normal app and
   works offline.
3. iPhone (Safari): Share → **Add to Home Screen**.
4. Desktop Chrome/Edge: click the install icon in the address bar.

**Windows desktop (.exe)**

Download **RegCompass-Setup.exe** (installer) or **RegCompass-Portable.exe** (no install)
from the [latest release](https://github.com/rajeevyadav/regcompass/releases/latest). The
installer is currently **unsigned** — on the SmartScreen prompt choose
**"More info → Run anyway"**, and confirm the download came from
`github.com/rajeevyadav/regcompass`.

## Run & build

No build step for the web version — edit `index.html`, `css/styles.css` or `js/app.js` and
refresh. The desktop app is a thin [Electron](https://www.electronjs.org/) wrapper that
loads the same `index.html`.

```bash
# run the web app locally (a service worker needs http, not file://)
npx serve .            # or:  python3 -m http.server

# run the desktop app
npm install
npm start

# build the Windows exe locally (on Windows)
npm run dist:win
```

When you change any app file, bump `CACHE_VERSION` in `sw.js` so installed PWAs pick up the
update. Full publishing steps (GitHub Pages, cutting a release so the exe builds itself, and
app-store builds via the bundled Capacitor scaffolding) are in
[`docs/PUBLISHING.md`](docs/PUBLISHING.md).

## No AI inside

The shipped page and its build tooling contain **no AI or machine-learning code** —
every result is produced by fixed, human-written rules you can read in this repository's
source ([`js/app.js`](js/app.js)). The app runs entirely on your device, works offline, and
transmits nothing. CI guardrails fail the build if an AI-provider reference, an ML
dependency, or an AI/bot commit-authorship trailer is ever introduced. (The EU AI Act
module *assesses* AI-enabled devices — the app itself uses no AI.)

## Verification

Every citation and link is checked against its primary official source; the audit trail
lives in [`verification/log.md`](verification/log.md). Sources move over time, so a lighter
review runs quarterly — see [`NEXT_REVIEW.md`](NEXT_REVIEW.md) (next due **2026-11-18**,
synchronised across the family). No silent edits — every change is reviewed and logged.

## Disclaimer

Decision-support only — provided "as is". RegCompass does not create compliance and does not
replace professional regulatory advice, FDA interaction or Notified Body assessment.
Classification and compliance remain solely the manufacturer's responsibility. Always verify
against the current official sources (FDA, EUR-Lex, MDCG, IMDRF, EUDAMED).

## Family

Part of the same family — same guardrails, same offline-first, no-black-box-AI philosophy:
[CyberCompass](https://rajeevyadav.github.io/cybercompass/) ·
[eIFUCompass](https://rajeevyadav.github.io/eifucompass/) ·
[ClinicalCompass](https://rajeevyadav.github.io/clinicalcompass/).

## License

MIT — see [`LICENSE`](LICENSE). Regulatory compliance remains solely the manufacturer's
responsibility.

Maintainer: **Rajeev Yadav** · rajeevyadav@gmail.com
