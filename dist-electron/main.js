"use strict";
const electron = require("electron");
const path = require("path");
function createMaskWindow() {
  const maskWindow = new electron.BrowserWindow({
    frame: false,
    fullscreen: true,
    transparent: true,
    backgroundColor: "rgba(0,0,0,.6)",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "../electron/maskWindow/maskWindowPreload.ts")
    }
  });
  maskWindow.loadFile(path.join(__dirname, "../electron/maskWindow/maskWindowHTML.html"));
  return maskWindow;
}
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow;
const createWindow = () => {
  mainWindow = new electron.BrowserWindow({
    frame: false,
    width: 450,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../electron/preload.ts")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
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
function handleScreenShot() {
  console.log("createMaskWindow", __dirname);
  const maskWindow2 = createMaskWindow();
  maskWindow2.webContents.openDevTools();
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("screen:shot", handleScreenShot);
  electron.ipcMain.handle("window:close", () => {
    mainWindow == null ? void 0 : mainWindow.close();
  });
  electron.ipcMain.handle("maskWindow:close", () => {
  });
}
