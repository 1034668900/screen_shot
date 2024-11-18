import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";
import { createCaptureWindow } from "./captureWindow/createCaptureWindow";
import path from "path";
import { platform } from "os";
import screenshot from "screenshot-desktop";
import {
  getCaptureWindowSources,
  handleSaveImageToClipboard,
  handleDownloadImage,
  handleScreenShot,
  getAllDisplays,
  type CreateCaptureWindowProps,
  type ScreenData
} from "./utils";

const isDarwin = platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow: BrowserWindow | null;
let createCaptureWindowProps: CreateCaptureWindowProps;
let screenData: ScreenData[];
let screenShotData: { id: number;  name: string}[];
let captureWindows: BrowserWindow[] = [];

const createWindow = () => {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 450,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../dist-electron/preload.js"),
    },
  });

  mainWindow.minimize();
  // 主窗口创建时预创建捕获窗口
  preloadCaptureWindows();

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

app.whenReady().then(() => {
  init();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

async function init() {
  await getScreenData();
  addEventListenerOfMain();
  createWindow();
  registerShortcut();
}

function getCaptureWindowById(id: number): BrowserWindow | undefined {
  return captureWindows.find(captureWindow => captureWindow.id === id)
}

/**
 * screenshot.listDisplays API 获取的屏幕Id与electorn.screen.getAllDisplays API 获取的屏幕Id不一致，需要根据屏幕名做统一
 */
async function getScreenData() {
  screenData = getAllDisplays();
  screenShotData = await screenshot.listDisplays();
  screenShotData.forEach(data => {
    screenData.map(screenData => {
      if (screenData.label === data.name) {
        screenData.id = data.id;
      }
    })
  })
}

function closeCaptureWindows() {
  captureWindows.forEach(captureWindow => captureWindow.close());
  captureWindows = [];
}

function startScreenShot() {
  captureWindows.forEach(captureWindow => {
    handleScreenShot(captureWindow);
  })
}

function addEventListenerOfMain(): void {
  ipcMain.handle("screen:shot", () => {
    startScreenShot();
  });
  ipcMain.handle("captureWindow:sources", async (event, screenId) => {
    return await getCaptureWindowSources(screenId);
  });
  ipcMain.handle("window:close", () => {
    closeCaptureWindows();
    mainWindow?.close();
    console.log("------> close allWindow success!");
  });
  ipcMain.handle("captureWindow:close", async () => {
    closeCaptureWindows();
    preloadCaptureWindows();
    console.log("------> close captureWindow success!");
  });
  ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("------> saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  ipcMain.handle("download:image", async (event,id, ImageDataURL) => {
    try {
      const captureWindow = getCaptureWindowById(id);
      if (!captureWindow) return;
      await handleDownloadImage(captureWindow, ImageDataURL);
      console.log("------> download:image success!");
      preloadCaptureWindows();
    } catch (error) {
      console.error("download:image is error");
    }
  });
}

async function preloadCaptureWindows() {
  try {
    screenData.forEach(async screenData => {
      createCaptureWindowProps = {
        isDarwin,
        x: screenData.bounds.x,
        y: screenData.bounds.y,
        screenWidth: screenData.size.width,
        screenHeight: screenData.size.height
      }
      const captureWindow = await createCaptureWindow(createCaptureWindowProps);
      captureWindow.webContents.send("transport-screen-and-window-data", JSON.stringify({screenData,captureWindowId: captureWindow.id}));
      captureWindows.push(captureWindow);
    })
    console.log("------> preloadCaptureWindiow is success!");
  } catch (error) {
    console.error("------> preloadCaptureWindiow is error!");
  }
}

function registerShortcut() {
  if (platform() === "darwin") {
    console.log("------> registerShotcut success!");
    globalShortcut.register("Command+P", () => {
      startScreenShot();
    });
    globalShortcut.register("Command+Shift+P", () => {
      closeCaptureWindows();
      preloadCaptureWindows();
    });
  } else {
    globalShortcut.register("Ctrl+P", () => {
      startScreenShot();
    });
  }
  globalShortcut.register("Esc", () => {
    closeCaptureWindows();
    preloadCaptureWindows();
  });
}