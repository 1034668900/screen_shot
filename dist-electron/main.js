"use strict";
const electron = require("electron");
const path = require("path");
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let win;
const createWindow = () => {
  win = new electron.BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
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
electron.app.whenReady().then(() => {
  addEventListenerOfMain();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    electron.app.quit();
});
async function handleGetWindowSources() {
  await electron.desktopCapturer.getSources({ types: ["window"] });
  return "nihao";
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("sources:window", handleGetWindowSources);
  electron.ipcMain.handle("window:close", () => {
    win == null ? void 0 : win.close();
  });
}
