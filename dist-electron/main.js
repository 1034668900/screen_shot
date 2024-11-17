"use strict";
const electron = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs/promises");
async function createCaptureWindow(createCaptureWindowProps2) {
  const { x, y, screenWidth, screenHeight, isDarwin: isDarwin2 } = createCaptureWindowProps2;
  let captureWindow2 = new electron.BrowserWindow({
    frame: false,
    fullscreen: !isDarwin2,
    width: screenWidth,
    height: screenHeight,
    x,
    y,
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
<<<<<<< Updated upstream
  captureWindow2.setOpacity(1);
  captureWindow2.setAlwaysOnTop(true, "screen-saver");
  captureWindow2.setFullScreenable(false);
  captureWindow2.setVisibleOnAllWorkspaces(true);
  captureWindow2.on("closed", () => {
    captureWindow2.destroy();
=======
  console.log("@@@@create", screenWidth, screenHeight);
  captureWindow.on("closed", () => {
    captureWindow.destroy();
>>>>>>> Stashed changes
  });
  captureWindow2.hide();
  await captureWindow2.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow2;
}
function handleScreenShot(captureWindow2) {
  if (!captureWindow2)
    return;
  captureWindow2.webContents.send("start-capture");
  captureWindow2.show();
}
async function getCaptureWindowSources(screenWidth, screenHeight, scaleFactor) {
  try {
    return await electron.desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: {
        width: screenWidth * scaleFactor,
        height: screenHeight * scaleFactor
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
async function handleDownloadImage(captureWindow2, ImageDataURL) {
  try {
    if (!captureWindow2)
      return false;
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
    if (canceled)
      return;
    await fs.writeFile(filePath, buffer);
  } catch (error) {
    console.log(error);
  }
}
function getAllDisplays() {
  const screens = electron.screen.getAllDisplays();
  let screenDatas2 = [];
  screens.forEach((screen2) => {
    let tempScreenData = {
      id: screen2.id,
      size: screen2.size,
      bounds: screen2.bounds,
      scaleFactor: Math.ceil(screen2.scaleFactor)
    };
    screenDatas2.push(tempScreenData);
  });
  return screenDatas2;
}
const isDarwin = os.platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow;
let captureWindow;
let createCaptureWindowProps;
let screenDatas;
let captureWindows = [];
const createWindow = () => {
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
  preloadCaptureWindows();
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
function init() {
  screenDatas = getAllDisplays();
  addEventListenerOfMain();
  createWindow();
  registerShortcut();
}
function getCaptureWindowById(id) {
  return captureWindows.find((captureWindow2) => captureWindow2.id === id);
}
function closeCaptureWindows() {
  captureWindows.forEach((captureWindow2) => captureWindow2.close());
  captureWindows = [];
}
function startScreenShot() {
  captureWindows.forEach((captureWindow2) => {
    handleScreenShot(captureWindow2);
  });
}
function addEventListenerOfMain() {
  electron.ipcMain.handle("screen:shot", () => {
    startScreenShot();
  });
  electron.ipcMain.handle("captureWindow:sources", async (event, screenId, screenWidth, screenHeight, screenScaleFactor) => {
    return new Promise(async (resolve2) => {
      const captureWindows2 = await getCaptureWindowSources(screenWidth, screenHeight, screenScaleFactor);
      const captureWindow2 = captureWindows2 == null ? void 0 : captureWindows2.find((captureWindow3) => captureWindow3.display_id == screenId);
      console.log("------> get captureWindow:sources success!", screenId, screenWidth, screenHeight, screenScaleFactor);
      resolve2(captureWindow2);
    });
  });
  electron.ipcMain.handle("window:close", () => {
    console.log("------> close allWindow success!");
    closeCaptureWindows();
    mainWindow == null ? void 0 : mainWindow.close();
  });
  electron.ipcMain.handle("captureWindow:close", async () => {
    console.log("------> close captureWindow success!");
    closeCaptureWindows();
    preloadCaptureWindows();
  });
  electron.ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("------> saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  electron.ipcMain.handle("download:image", async (event, id, ImageDataURL) => {
    try {
      const captureWindow2 = getCaptureWindowById(id);
      if (!captureWindow2)
        return;
      await handleDownloadImage(captureWindow2, ImageDataURL);
      console.log("------> download:image success!");
      preloadCaptureWindows();
    } catch (error) {
      console.error("download:image is error");
    }
  });
}
async function preloadCaptureWindows() {
  try {
    screenDatas.forEach(async (screenData) => {
      createCaptureWindowProps = {
        isDarwin,
        x: screenData.bounds.x,
        y: screenData.bounds.y,
        screenWidth: screenData.size.width,
        screenHeight: screenData.size.height
      };
      const captureWindow2 = await createCaptureWindow(createCaptureWindowProps);
      captureWindow2.webContents.send("transport-screen-and-window-data", JSON.stringify({ screenData, captureWindowId: captureWindow2.id }));
      captureWindows.push(captureWindow2);
    });
    console.log("------> preloadCaptureWindiow is success!");
  } catch (error) {
  }
}
function registerShortcut() {
  if (os.platform() === "darwin") {
    console.log("------> registerShotcut success!");
    electron.globalShortcut.register("Command+P", () => {
      startScreenShot();
    });
    electron.globalShortcut.register("Command+Shift+P", () => {
      closeCaptureWindows();
    });
  } else {
    electron.globalShortcut.register("Ctrl+P", () => {
      handleScreenShot(captureWindow);
    });
<<<<<<< Updated upstream
    electron.globalShortcut.register("Ctrl+Shift+A", () => {
=======
    electron.globalShortcut.register("Esc", () => {
      closeCaptureWindows();
      preloadCaptureWindows();
>>>>>>> Stashed changes
    });
  }
}
