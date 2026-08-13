/* ============================================================
   RegCompass — Electron main process (desktop app shell)
   ------------------------------------------------------------
   Loads the same index.html the web/PWA version uses. The app
   is fully offline; external regulatory links open in the
   user's default browser rather than inside the app window.
   ============================================================ */

'use strict';

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1180,
    height: 820,
    minWidth: 380,
    minHeight: 600,
    autoHideMenuBar: true,
    backgroundColor: '#f4f7fb',
    icon: path.join(__dirname, '..', 'icons', 'icon-256.png'),
    webPreferences: {
      contextIsolation: true, // renderer has no Node access — safest default
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Open every external link (FDA, EUR-Lex, …) in the system browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
