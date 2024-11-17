import { app, BrowserWindow, ipcMain, screen, globalShortcut, clipboard } from "electron";
import { createCaptureWindow } from "./captureWindow/createCaptureWindow";
import path from "path";
import { platform } from "os";
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
let captureWindow: BrowserWindow;
let createCaptureWindowProps: CreateCaptureWindowProps;
let screenDatas: ScreenData[];
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

function init() {
  screenDatas = getAllDisplays();
  addEventListenerOfMain();
  createWindow();
  registerShortcut();
}

function getCaptureWindowById(id: number): BrowserWindow | undefined {
  return captureWindows.find(captureWindow => captureWindow.id === id)
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
  ipcMain.handle("captureWindow:sources", async (event,screenId, screenWidth, screenHeight,screenScaleFactor) => {
    return new Promise(async resolve => {
      const captureWindowsSource = await getCaptureWindowSources( screenWidth, screenHeight, screenScaleFactor );
      const captureWindowSource = captureWindowsSource?.find(captureWindowSource => captureWindowSource.display_id == screenId);
      console.log("------> get captureWindow:sources success!");
      resolve(captureWindowSource);
    })
  });
  ipcMain.handle("window:close", () => {
    console.log("------> close allWindow success!");
    closeCaptureWindows();
    mainWindow?.close();
  });
  ipcMain.handle("captureWindow:close", async () => {
    console.log("------> close captureWindow success!");
    closeCaptureWindows();
    preloadCaptureWindows();
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
    screenDatas.forEach(async screenData => {
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
    // 测试快捷键，关闭捕获窗口
    globalShortcut.register("Esc", () => {
      closeCaptureWindows();
      preloadCaptureWindows();
    });
  }
}