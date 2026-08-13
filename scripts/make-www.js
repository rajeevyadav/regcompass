#!/usr/bin/env node
/**
 * Copies the web app into www/ for Capacitor (mobile builds).
 * Capacitor needs a clean web directory without the Electron,
 * CI and documentation files, so we assemble one here.
 *
 * Usage: node scripts/make-www.js   (or: npm run cap:copy)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'www');

const INCLUDE = ['index.html', 'manifest.webmanifest', 'sw.js', 'css', 'js', 'icons'];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

for (const entry of INCLUDE) {
  const src = path.join(ROOT, entry);
  const dest = path.join(OUT, entry);
  fs.cpSync(src, dest, { recursive: true });
}

// The icon generator script is not needed inside the app bundle.
fs.rmSync(path.join(OUT, 'icons', 'make_icons.py'), { force: true });

console.log('www/ assembled for Capacitor.');
