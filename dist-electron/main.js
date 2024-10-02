"use strict";
const electron = require("electron");
const path = require("path");
electron.ipcMain.on("message-from-renderer", (event, data) => {
  console.log(data.someData);
});
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let win;
const createWindow = () => {
  win = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__dirname, "../electron/preload.ts")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};
electron.app.whenReady().then(createWindow);
