"use strict";
const electron = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
async function createCaptureWindow(createCaptureWindowProps2) {
  const { screenWidth: screenWidth2, screenHeight: screenHeight2, isDarwin: isDarwin2 } = createCaptureWindowProps2;
  let captureWindow2 = new electron.BrowserWindow({
    frame: false,
    fullscreen: !isDarwin2,
    width: screenWidth2,
    height: screenHeight2,
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
      webSecurity: false,
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
  captureWindow2.hide();
  await captureWindow2.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow2;
}
async function handleScreenShot(captureWindow2) {
  if (!captureWindow2)
    return;
  captureWindow2.show();
  captureWindow2.webContents.send("start-capture");
}
async function getCaptureWindowSources(screenWidth2, screenHeight2, scaleFactor) {
  try {
    return await electron.desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: {
        width: screenWidth2 * scaleFactor,
        height: screenHeight2 * scaleFactor
      }
    });
  } catch (error) {
    console.log(error);
  }
}
function handleSaveImageToClipboard(ImageDataURL) {
  const image = electron.nativeImage.createFromDataURL(ImageDataURL);
  electron.clipboard.writeImage(image);
}
async function handleDownloadImage(captureWindow2, ImageDataURL, createCaptureWindowProps2) {
  try {
    if (captureWindow2) {
      const matches = ImageDataURL.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!matches) {
        throw new Error("Invalid data URL");
      }
      const [, ext, base64Data] = matches;
      const buffer = Buffer.from(base64Data, "base64");
      const { filePath, canceled } = await electron.dialog.showSaveDialog(captureWindow2, {
        title: "Download Image",
        defaultPath: `FengCh-${Date.now()}.${ext}`
      });
      if (canceled) {
        return await resetCaptureWindow(captureWindow2, createCaptureWindowProps2);
      }
      await fs.writeFile(filePath, buffer);
    }
    return await resetCaptureWindow(captureWindow2, createCaptureWindowProps2);
  } catch (error) {
    console.log(error);
    return await resetCaptureWindow(captureWindow2, createCaptureWindowProps2);
  }
}
async function resetCaptureWindow(captureWindow2, createCaptureWindowProps2) {
  captureWindow2 && captureWindow2.close();
  return await createCaptureWindow(createCaptureWindowProps2);
}
function registerShortcut(captureWindow2) {
  if (os.platform() === "darwin") {
    console.log("------> registerShotcut success!");
    electron.globalShortcut.register("Command+P", () => {
      handleScreenShot(captureWindow2);
    });
  } else {
    electron.globalShortcut.register("Ctrl+P", () => {
      handleScreenShot(captureWindow2);
    });
    electron.globalShortcut.register("Ctrl+Shift+A", () => {
      captureWindow2 == null ? void 0 : captureWindow2.hide();
    });
  }
}
const isDarwin = os.platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow;
let captureWindow;
let screenWidth;
let screenHeight;
let screenScaleFactor;
let createCaptureWindowProps;
const createWindow = async () => {
  mainWindow = new electron.BrowserWindow({
    frame: false,
    width: 450,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../dist-electron/preload.js")
    }
  });
  captureWindow = await createCaptureWindow(createCaptureWindowProps);
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};
electron.app.whenReady().then(() => {
  init();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    electron.app.quit();
});
async function init() {
  const { size, scaleFactor } = electron.screen.getPrimaryDisplay();
  screenWidth = size.width;
  screenHeight = size.height;
  screenScaleFactor = Math.ceil(scaleFactor);
  createCaptureWindowProps = { isDarwin, screenWidth, screenHeight };
  addEventListenerOfMain();
  await createWindow();
  registerShortcut(captureWindow);
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("screen:shot", () => {
    handleScreenShot(captureWindow);
  });
  electron.ipcMain.handle("captureWindow:sources", () => {
    console.log("------> get captureWindow:sources success!");
    return getCaptureWindowSources(
      screenWidth,
      screenHeight,
      screenScaleFactor
    );
  });
  electron.ipcMain.handle("window:close", () => {
    console.log("------> close mainWindow success!");
    mainWindow == null ? void 0 : mainWindow.close();
    captureWindow == null ? void 0 : captureWindow.close();
  });
  electron.ipcMain.handle("captureWindow:close", async () => {
    console.log("------> close captureWindow success!");
    captureWindow = await resetCaptureWindow(captureWindow, createCaptureWindowProps);
  });
  electron.ipcMain.handle("screen:sources", () => {
    console.log("------> get screen:sources success!");
    return { screenWidth, screenHeight, screenScaleFactor };
  });
  electron.ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("------> saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  electron.ipcMain.handle("download:image", async (event, ImageDataURL) => {
    console.log("------> download:image success!");
    captureWindow = await handleDownloadImage(captureWindow, ImageDataURL, createCaptureWindowProps);
  });
}
