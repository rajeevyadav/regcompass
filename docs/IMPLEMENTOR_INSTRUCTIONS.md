# RegCompass — Implementor Instructions

**Target repo:** `https://github.com/rajeevyadav/regcompass`
**Goal of this pass:** push the code, lock the repo down, cut the v1.0.0 Windows release, and confirm the Windows download link on the site works.

Do the steps in order — later steps depend on earlier ones (the exe download link only works after the release is cut; the release workflow only exists after the code is pushed).

---

## 0. Prerequisites

- Push access to `github.com/rajeevyadav/regcompass` (it should already exist, created by the owner).
- Git installed locally.
- A GitHub account with **2-factor authentication enabled** (GitHub requires this for anyone pushing to a repo with security features on — turn it on under your GitHub avatar → Settings → Password and authentication, if not already on).
- No Windows machine needed — the `.exe` is built by GitHub's own Windows runners via GitHub Actions.

---

## 1. Push the code to GitHub

From the unzipped `regcompass/` folder:

```bash
cd regcompass
git init
git add .
git commit -m "RegCompass v1.0.0 — initial commit"
git branch -M main
git remote add origin https://github.com/rajeevyadav/regcompass.git
git push -u origin main
```

If the remote repo already has a README/license from GitHub's "create repo" wizard, `git push` will be rejected as non-fast-forward. In that case:

```bash
git pull --rebase origin main
# resolve any conflict in README.md (keep the version from this project), then:
git push -u origin main
```

**Verify:** open `https://github.com/rajeevyadav/regcompass` in a browser and confirm all files are there (`index.html`, `css/`, `js/`, `electron/`, `.github/`, etc.).

---

## 2. Turn on GitHub Pages (this makes it the free mobile/web app)

1. Repo → **Settings** → **Pages**.
2. *Build and deployment* → **Source: Deploy from a branch**.
3. **Branch: `main`**, folder **`/(root)`** → **Save**.
4. Wait ~1 minute, then confirm `https://rajeevyadav.github.io/regcompass/` loads the app.

This URL is the installable app for Android/iPhone — no store, no fee. Test "Add to Home Screen" on a phone if possible.

---

## 3. Lock the repo down (guard against misuse & attacks)

Do all of these in **Settings** unless noted otherwise. None of this requires touching code — it's all repo configuration.

### 3.1 Branch protection on `main`
Settings → **Branches** → **Add branch protection rule** → branch name pattern `main`:
- ✅ Require a pull request before merging
- ✅ Require approvals (1 is enough for a solo/small-team repo)
- ✅ Require review from Code Owners *(this repo already ships `.github/CODEOWNERS` naming `@rajeevyadav`)*
- ✅ Require status checks to pass before merging → select **CodeQL** once it has run once (see 3.4)
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings (uncheck "allow force pushes", uncheck "allow deletions")

This stops anyone — including a compromised contributor account — from pushing straight to `main` or force-rewriting history.

### 3.2 Restrict who can push
Settings → **Collaborators and teams** → keep this to people who need it. For a personal project, that's just you; add collaborators individually rather than making the repo org-wide-writable.

### 3.3 Secret scanning & push protection
Settings → **Code security** → enable:
- ✅ **Secret scanning** (catches accidentally committed API keys/tokens)
- ✅ **Push protection** (blocks a push *before* a secret lands in history)
- ✅ **Dependabot alerts** and ✅ **Dependabot security updates**

This repo has no secrets/API keys today (by design — it's 100% offline), so these are pure downside-insurance for the future.

### 3.4 CodeQL scanning (already wired up)
This repo includes `.github/workflows/codeql.yml`. It runs automatically on every push/PR to `main` and weekly. Nothing to configure — just check **Security → Code scanning** after the first push to confirm it ran green.

### 3.5 Dependabot (already wired up)
`.github/dependabot.yml` is included — it will open PRs when Electron/electron-builder or the GitHub Actions versions have security fixes. Review and merge those PRs when they appear; don't ignore them long-term.

### 3.6 Restrict GitHub Actions permissions
Settings → **Actions** → **General**:
- Under *Actions permissions*: **Allow [owner], and select non-[owner], actions and reusable workflows** (or "Allow select actions" and explicitly allow `actions/*` and `github/codeql-action/*`) — this stops a malicious PR from a stranger running an arbitrary third-party Action against your repo's secrets.
- Under *Workflow permissions*: set to **Read repository contents permission** (the release workflow already requests `contents: write` explicitly at the job level where it's needed — see `.github/workflows/release-windows.yml` — so the repo default should stay minimal).
- ✅ **Require approval for first-time contributors** running workflows.

### 3.7 Signed commits (optional but recommended for a solo maintainer too)
Settings → **Branches** → your `main` rule → ✅ **Require signed commits**. Set up commit signing locally with `git config commit.gpgsign true` and a GPG or SSH signing key (GitHub docs: *Signing commits*). This proves commits actually came from you if the repo ever gets scrutiny (e.g. someone questioning whether the "no AI inside" claim is true — signed history is evidence the code wasn't tampered with).

### 3.8 Repo visibility & metadata
- Keep the repo **Public** (required for free GitHub Pages + free Actions minutes + free CodeQL on the free tier).
- Settings → General → add **Topics**: `medical-devices`, `fda`, `mdr`, `regulatory`, `pwa`, `electron`, `offline-first` — helps legitimate users find it and signals it's a maintained real project (not squatting).
- Add a one-line **repo description** and the Pages URL as the **website** field (top of the repo page, gear icon next to "About").

### 3.9 License & disclaimer visibility
Already included: `LICENSE` (MIT) with the compliance-disclaimer note, and the in-app disclaimer/limitation-of-liability text. No action needed — just confirm `LICENSE` shows up in GitHub's own license badge on the repo homepage after push.

### 3.10 Issue/PR hygiene (already wired up)
`.github/ISSUE_TEMPLATE/` (bug report + regulatory-correction templates) and `.github/PULL_REQUEST_TEMPLATE.md` are included — they route contributions into a reviewable shape and discourage low-effort/spam issues.

---

## 4. Cut the v1.0.0 Windows release

The release workflow (`.github/workflows/release-windows.yml`) builds `RegCompass-Setup.exe` and `RegCompass-Portable.exe` automatically and attaches them to a GitHub Release whenever a version tag is pushed.

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then:
1. Go to the repo's **Actions** tab → confirm **Build Windows release** is running (takes ~5–10 minutes on GitHub's Windows runner).
2. Once green, go to **Releases** → you should see release `v1.0.0` with two assets attached:
   - `RegCompass-Setup.exe`
   - `RegCompass-Portable.exe`
3. Open the release and edit its notes if you want (optional) — e.g. paste the "store-listing text" from `docs/PUBLISHING.md` section 6.

**Important — filenames must stay exactly `RegCompass-Setup.exe` / `RegCompass-Portable.exe` on every future release.** `package.json`'s `build.nsis.artifactName` / `build.portable.artifactName` are already set that way (no version number in the filename) specifically so the download links below never go stale. Do not rename the artifacts in future releases unless you also update the links in `index.html`.

---

## 5. Confirm the Windows download link on the site works

`index.html` already contains the finished links (owner/repo were filled in for you):

- Header button (top-right, next to the theme toggle): `⬇ Windows`
- About page → "Windows desktop app" section: installer link, portable link, and a link to the full Releases page

Both point to GitHub's **stable "latest release" URL pattern**:

```
https://github.com/rajeevyadav/regcompass/releases/latest/download/RegCompass-Setup.exe
https://github.com/rajeevyadav/regcompass/releases/latest/download/RegCompass-Portable.exe
```

This URL always resolves to whatever the *newest* release's asset with that exact filename is — so once v1.0.0 is live, you never need to touch `index.html` again for future releases (v1.0.1, v1.1.0, …), as long as you keep using the same artifact filenames from step 4.

**To verify:** after step 4 completes, open `https://rajeevyadav.github.io/regcompass/` (or reload if Pages was already live), click the **⬇ Windows** button in the header, and confirm it downloads `RegCompass-Setup.exe` rather than 404ing. If it 404s, the release build (step 4) either hasn't finished yet or failed — check the Actions tab.

---

## 6. Final checklist

- [ ] Code pushed to `main`
- [ ] GitHub Pages live at `https://rajeevyadav.github.io/regcompass/`
- [ ] Branch protection on `main` (PR required, review required, no force-push)
- [ ] Secret scanning + push protection + Dependabot alerts enabled
- [ ] Actions permissions restricted, first-time-contributor approval required
- [ ] CodeQL workflow has run at least once successfully
- [ ] Repo topics + description + website URL set
- [ ] Tag `v1.0.0` pushed, Actions build succeeded, `RegCompass-Setup.exe` + `RegCompass-Portable.exe` attached to the Release
- [ ] Windows download button on the live site actually downloads the exe (not a 404)
- [ ] (Optional) Commit signing enabled for future commits

Once all boxes are checked, the app is fully live: installable free on Android/iPhone via the Pages URL, downloadable as a Windows exe from the same site, and the repo is hardened against the common misuse vectors (force-push history rewrites, leaked secrets, unreviewed merges, malicious third-party Actions, unpatched dependencies).
