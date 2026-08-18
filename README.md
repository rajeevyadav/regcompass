# RegCompass

[![Latest release](https://img.shields.io/github/v/release/rajeevyadav/regcompass?label=version&color=2ea44f&cacheSeconds=300)](https://github.com/rajeevyadav/regcompass/releases/latest)
[![Download for Windows](https://img.shields.io/badge/Download-Windows%20installer-0078d6?logo=windows)](https://github.com/rajeevyadav/regcompass/releases/latest/download/RegCompass-Setup.exe)
[![Open the app](https://img.shields.io/badge/Open-web%20%2F%20mobile%20app-8250df)](https://rajeevyadav.github.io/regcompass/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

_Last updated: **2026-08-18** · Next regulatory review: **2026-11-18** (see [NEXT_REVIEW.md](NEXT_REVIEW.md))_

🌐 **Use it now in your browser: https://rajeevyadav.github.io/regcompass/**

**Free FDA & EU MDR regulatory navigator for medical devices.**
Classification, SaMD/AI, EU AI Act, cybersecurity, human factors, GSPR and EUDAMED readiness — in one offline app that runs in any browser, installs on Android and iPhone, and ships as a Windows desktop app.

> **Decision-support only.** RegCompass does not create compliance and does not replace professional regulatory advice, FDA interaction or Notified Body assessment. Always verify against official sources (FDA, EUR-Lex, MDCG, IMDRF, EUDAMED).

## No AI inside

RegCompass contains **no artificial-intelligence or machine-learning code**. Every result is produced by fixed, human-written decision rules that anyone can read and audit in [`js/app.js`](js/app.js). The app runs entirely on your device, works offline, and collects or transmits no data. (The EU AI Act module *assesses* AI-enabled devices — the app itself uses no AI.)

## Modules

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

## Use it

**In the browser / install on your phone (free, no app store needed)**

1. Open **https://rajeevyadav.github.io/regcompass/** in any browser.
2. Android (Chrome): menu → **Add to Home Screen** → it installs like a normal app and works offline.
3. iPhone (Safari): Share → **Add to Home Screen**.
4. Desktop Chrome/Edge: click the install icon in the address bar.

**Windows desktop (.exe)**

Download `RegCompass-Setup-x.y.z.exe` (installer) or `RegCompass-Portable-x.y.z.exe` (no install needed) from the [Releases](../../releases) page.

**Play Store / App Store**

The repo includes Capacitor scaffolding for native builds — see [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

## Project structure

```
regcompass/
├── index.html              ← the app (single page, all modules)
├── css/styles.css          ← clinical light theme + dark theme (CSS variables)
├── js/app.js               ← all logic — commented, auditable, no AI, no network
├── manifest.webmanifest    ← PWA install metadata
├── sw.js                   ← service worker (offline cache)
├── icons/                  ← app icons + generator script (make_icons.py)
├── electron/main.js        ← Windows/desktop shell
├── build/icon.ico          ← Windows exe icon
├── scripts/make-www.js     ← assembles www/ for Capacitor mobile builds
├── capacitor.config.json   ← native Android/iOS wrapper config
├── .github/workflows/      ← auto-builds the Windows exe on every version tag
└── docs/PUBLISHING.md      ← step-by-step: GitHub Pages, releases, app stores
```

## Development

No build step. Edit `index.html`, `css/styles.css` or `js/app.js` and refresh.

```bash
# run the web app locally
npx serve .            # or: python3 -m http.server

# run the desktop app
npm install
npm start

# build the Windows exe locally (on Windows)
npm run dist:win
```

When you change any app file, bump `CACHE_VERSION` in `sw.js` so installed PWAs pick up the update.

## Publishing

Full step-by-step instructions (GitHub Pages, cutting a release so the exe builds itself, and app-store publishing) are in [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

## License

[MIT](LICENSE) — with the reminder that regulatory compliance remains solely the manufacturer's responsibility.
