# Publishing RegCompass

Step-by-step guide for putting RegCompass on GitHub, serving it as a website/PWA, releasing the Windows exe, and (optionally) publishing to the app stores.

---

## 1. Put it on GitHub

```bash
cd regcompass
git init
git add .
git commit -m "RegCompass v1.0.0"
```

Create a new repository on github.com (e.g. `regcompass`, public), then:

```bash
git remote add origin https://github.com/rajeevyadav/regcompass.git
git branch -M main
git push -u origin main
```

> If your GitHub username is not `rajeevyadav`, also update the `homepage` field in `package.json`.

## 2. Turn on the website + PWA (GitHub Pages)

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under *Build and deployment*, set **Source: Deploy from a branch**, branch **main**, folder **/(root)**. Save.
3. After a minute the app is live at `https://rajeevyadav.github.io/regcompass/`.

That URL **is** the free mobile app: anyone opening it on Android or iPhone can use “Add to Home Screen” and it installs with the RegCompass icon and works fully offline. Share that link — no store accounts, no fees.

## 3. Release the Windows exe (automatic)

The GitHub Actions workflow builds the exe for you — you never need a Windows machine.

```bash
git tag v1.0.0
git push origin v1.0.0
```

That's it. Within ~10 minutes the **Releases** page of the repo will contain:

- `RegCompass-Setup-1.0.0.exe` — normal one-click installer
- `RegCompass-Portable-1.0.0.exe` — single file, runs without installing

For the next version: bump `"version"` in `package.json` and `CACHE_VERSION` in `sw.js`, commit, then tag `v1.0.1` and push the tag.

> **Note on SmartScreen:** the exe is unsigned (code-signing certificates cost money), so Windows may show a “Windows protected your PC” prompt the first time. Users click *More info → Run anyway*. Mention this on the Releases page.

## 4. Publish to Google Play (optional, $25 one-time)

Requires Android Studio on your computer.

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run cap:copy          # assembles www/ from the web app
npx cap add android
npm run cap:android       # opens the project in Android Studio
```

In Android Studio: **Build → Generate Signed App Bundle**, create a keystore (keep it safe — you need the same one for every update), then upload the `.aab` at [play.google.com/console](https://play.google.com/console) ($25 one-time developer fee). Fill in the store listing, mark the app as free, complete the content questionnaire (no ads, no data collection — RegCompass collects nothing), and submit for review.

## 5. Publish to the Apple App Store (optional, $99/year + a Mac)

Requires Xcode on a Mac and an [Apple Developer](https://developer.apple.com) account.

```bash
npm install @capacitor/ios
npm run cap:copy
npx cap add ios
npm run cap:ios           # opens the project in Xcode
```

In Xcode: set your signing team, then **Product → Archive → Distribute App** to upload to App Store Connect, where you complete the listing and submit for review.

> Apple sometimes rejects thin “website wrapper” apps (guideline 4.2). RegCompass has a good case — it is a self-contained offline tool, not a web view of a site — but if it is rejected, the PWA route (section 2) still gives iPhone users a fully working installable app.

## 6. Store-listing text you can reuse

> **RegCompass — FDA & EU MDR Regulatory Navigator**
> Free decision-support toolkit for medical-device teams: FDA and EU MDR classification, SaMD/IMDRF categorisation, EU AI Act (2024/1689) high-risk screening, cybersecurity and human-factors checklists, GSPR tracking and EUDAMED completeness — with a printable summary report.
> Works completely offline. Contains no AI — every result comes from transparent, auditable decision rules. Collects no data. Decision-support only; does not replace professional regulatory advice, FDA interaction or Notified Body assessment.
