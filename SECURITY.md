# Security Policy

RegCompass is a client-side, offline, rule-based tool. It contains no
server, no user accounts, no telemetry, and no AI/ML code. That said,
supply-chain and packaging integrity still matter — especially for the
Windows installer — so please report anything that looks wrong.

## Supported versions

Only the latest tagged release receives security fixes. There is no
long-term-support branch.

## Reporting a vulnerability

**Do not open a public GitHub issue for security reports.**

Instead, use GitHub's private disclosure flow:

1. Go to the repository's **Security** tab.
2. Click **Report a vulnerability** (this uses [GitHub Private Vulnerability
   Reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) and opens a private advisory only the maintainer can see).
3. Describe the issue, the affected file(s)/version, and steps to reproduce.

If that option is not enabled yet, email the maintainer directly at the
address listed in `package.json` (`author`) instead of filing a public issue.

Expect an initial response within a few days. This is a small, unfunded
open-source project — please be patient.

## What counts as a valid report

Useful reports include:

- A dependency (Electron, electron-builder, npm packages) with a known CVE
  that actually affects how RegCompass uses it.
- A way to make the packaged Windows app execute arbitrary code, escape its
  sandbox, or load remote content it shouldn't (see `electron/main.js` —
  `nodeIntegration` is disabled and `contextIsolation` is on by design).
- A way to tamper with the release artifacts (e.g. a build pipeline
  weakness) so a downloaded `.exe` differs from what the source produces.
- XSS or injection in the web app itself (note: RegCompass takes no
  external input beyond the user's own form entries, stored only in
  `localStorage` on their own device).

Not in scope: the app "doesn't create legal compliance" — that's by design
and documented, not a vulnerability. Missing regulatory citations are a bug
report, not a security report — please use a normal GitHub issue for those.

## Verifying a downloaded release

Every release is built exclusively by the `Build Windows release` GitHub
Actions workflow (`.github/workflows/release-windows.yml`) from the tagged
source — never uploaded by hand. You can compare the workflow run's
checksum log against the file you downloaded, and confirm the release was
attached by the Actions bot rather than edited afterward, from the
release's page.
