"use strict";
const electron = require("electron");
const path = require("path");
const os = require("os");
async function createCaptureWindow(isDarwin2, width, height) {
  let captureWindow = new electron.BrowserWindow({
    frame: false,
    fullscreen: !isDarwin2,
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    resizable: false,
    movable: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,
    //mac
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../electron/preload.ts")
    }
  });
  captureWindow.setOpacity(1);
  captureWindow.setAlwaysOnTop(true, "screen-saver");
  captureWindow.setFullScreenable(false);
  captureWindow.setVisibleOnAllWorkspaces(true);
  captureWindow.on("closed", () => {
    captureWindow = null;
  });
  await captureWindow.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow;
}
const isDarwin = os.platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow;
let screenMaxWidth;
let screenMaxHeight;
let screenScaleFactor;
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
  const { size, scaleFactor } = electron.screen.getPrimaryDisplay();
  screenMaxWidth = size.width;
  screenMaxHeight = size.height;
  screenScaleFactor = scaleFactor;
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    electron.app.quit();
});
async function handleScreenShot() {
  await createCaptureWindow(
    isDarwin,
    screenMaxWidth,
    screenMaxHeight
  );
}
async function getCaptureWindowSources() {
  return await electron.desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: {
      width: screenMaxWidth * screenScaleFactor,
      height: screenMaxHeight * screenScaleFactor
    }
  });
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("screen:shot", handleScreenShot);
  electron.ipcMain.handle("window:close", () => {
    mainWindow == null ? void 0 : mainWindow.close();
  });
  electron.ipcMain.handle("captureWindow:close", () => {
  });
  electron.ipcMain.handle("captureWindow:sources", getCaptureWindowSources);
  electron.ipcMain.handle("screen:sources", () => {
    return { screenMaxWidth, screenMaxHeight, screenScaleFactor };
  });
}
