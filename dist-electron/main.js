"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs/promises");
const os = require("os");
async function createCaptureWindow(isDarwin2, width, height) {
  let captureWindow2 = new electron.BrowserWindow({
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
      preload: path.join(__dirname, "preload.js")
    }
  });
  captureWindow2.setOpacity(1);
  captureWindow2.setAlwaysOnTop(true, "screen-saver");
  captureWindow2.setFullScreenable(false);
  captureWindow2.setVisibleOnAllWorkspaces(true);
  captureWindow2.on("closed", () => {
    captureWindow2 = null;
  });
  await captureWindow2.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow2;
}
const isDarwin = os.platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow;
let captureWindow;
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
      preload: path.join(__dirname, "../dist-electron/preload.js")
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
  captureWindow = await createCaptureWindow(
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
function handleSaveImageToClipboard(ImageDataURL) {
  const image = electron.nativeImage.createFromDataURL(ImageDataURL);
  electron.clipboard.writeImage(image);
}
async function handleDownloadImage(ImageDataURL) {
  try {
    if (!captureWindow)
      return;
    const matches = ImageDataURL.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URL");
    }
    const [, ext, base64Data] = matches;
    const buffer = Buffer.from(base64Data, "base64");
    const { filePath, canceled } = await electron.dialog.showSaveDialog(captureWindow, {
      title: "Download Image",
      defaultPath: `image.${ext}`
    });
    if (canceled) {
      captureWindow.close();
    }
    await fs.writeFile(filePath, buffer);
    captureWindow.close();
  } catch (error) {
    throw error;
  }
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("screen:shot", handleScreenShot);
  electron.ipcMain.handle("window:close", () => {
    console.log("close mainWindow success!");
    mainWindow == null ? void 0 : mainWindow.close();
  });
  electron.ipcMain.handle("captureWindow:close", () => {
    console.log("close captureWindow success!");
    captureWindow == null ? void 0 : captureWindow.close();
  });
  electron.ipcMain.handle("captureWindow:sources", getCaptureWindowSources);
  electron.ipcMain.handle("screen:sources", () => {
    console.log("get screen:sources success!");
    return { screenMaxWidth, screenMaxHeight, screenScaleFactor };
  });
  electron.ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  electron.ipcMain.handle("download:image", (event, ImageDataURL) => {
    handleDownloadImage(ImageDataURL);
  });
}
