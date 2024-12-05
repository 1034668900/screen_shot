import { app, BrowserWindow, ipcMain, globalShortcut, screen } from "electron";
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
  checkAndApplyScreenShareAccessPrivilege,
  hasScreenShareAcceessPrivilege,
  showNotification,
  createTray,
  type ScreenData
} from "./utils";

const isDarwin = platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow: BrowserWindow | null;
let screenData: ScreenData[];
let screenShotData: { id:  number, width?: number, height?: number, dpiScale?: number, name: string} [];
let captureWindows: BrowserWindow[] = [];
let countOfCaptureWindowToShot: number = 0;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 450,
    height: 600,
    skipTaskbar: false,
    alwaysOnTop: false,
    show: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../dist-electron/preload.js"),
    },
  });
  mainWindow.setSkipTaskbar(false);
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
  screen.on("display-metrics-changed",async () => {
    // 屏幕尺寸缩放后重新初始化屏幕数据和预创建的截图窗口
    captureWindows = [];
    preloadCaptureWindows();
  })
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});



async function init() {
  await getScreenData();
  addEventListenerOfMain();
  createWindow();
  checkAndApplyScreenShareAccessPrivilege(mainWindow);
  createTray(mainWindow);
  registerShortcut();
}

function getCaptureWindowById(id: number): BrowserWindow | undefined {
  return captureWindows.find(captureWindow => captureWindow.id === id)
}

/**
 * screenshot.listDisplays API 获取的屏幕Id与electorn.screen.getAllDisplays API 获取的屏幕Id不一致，需要根据屏幕名做统一
 * electron.screen 模块得到的 scaleFactor是屏幕的最大缩放因子,不会随着widows用户对屏幕缩放比例的选择而改变，因此需要调整
 */
async function getScreenData() {
  screenData = getAllDisplays();
  screenShotData = await screenshot.listDisplays();
  screenShotData.forEach(data => {
    screenData.map((screenData) => {
      if (isDarwin) {
        if (screenData.label === data.name || screenData.label === '内建视网膜显示器') {
          screenData.id = data.id as number;
        }
      }else {
        const { width, height } = screenData.bounds;
        if(data.width === undefined || data.height === undefined || data.dpiScale === undefined)return;
        // 分别采取两种不同的计算匹配
        if(width === data.width / data.dpiScale && height === data.height/data.dpiScale){
          screenData.scaleFactor = data.dpiScale as number;
          screenData.id = data.id;
        }else if(Math.floor(width * screenData.scaleFactor) === data.width && Math.floor(height * screenData.scaleFactor) === data.height){
          screenData.id = data.id;
        }else if(Math.ceil(width * screenData.scaleFactor) === data.width && Math.ceil(height * screenData.scaleFactor) === data.height){
          screenData.id = data.id;
        }
      }
    })
  })
}

function closeCaptureWindows() {
  captureWindows.forEach(captureWindow => captureWindow.close());
  captureWindows = [];
}

function getScreenDataBywId(id: number) {
  return screenData.find(item => item.wId === id);
}

async function startScreenShot() {
  if (!hasScreenShareAcceessPrivilege()) {
    return showNotification('请先授权应用捕获屏幕权限！')
  }
  captureWindows.forEach(captureWindow => {
    const bounds = getScreenDataBywId(captureWindow.id)?.bounds;
    handleScreenShot(captureWindow, bounds);
  })
}

function addEventListenerOfMain(): void {
  ipcMain.handle("screen:shot", () => {
    startScreenShot();
  });
  ipcMain.handle("captureWindow:sources", async (event, screenId) => {
    return await getCaptureWindowSources(screenId);
  });
  ipcMain.handle("window:hide", () => {
    mainWindow?.hide();
    console.log("------> hide allWindow success!");
  });
  ipcMain.handle("window:minimize", () => {
    mainWindow?.minimize();
    console.log("------> minimize allWindow success!");
  });
  ipcMain.handle("capturewindow:hide", async () => {
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
      closeCaptureWindows();
      preloadCaptureWindows();
      console.log("------> download:image success!");
    } catch (error) {
      console.error("download:image is error");
    }
  });
  ipcMain.handle("clearOtherCanvas", (event, id) => {
    captureWindows.forEach(captureWindow => {
      if (captureWindow.id !== id) {
        captureWindow.webContents.send("clear:canvas");
      }
    })
  })
  ipcMain.on("captureWindowShow:ready", () => {
    countOfCaptureWindowToShot++;
    if (countOfCaptureWindowToShot === captureWindows.length) {
      captureWindows.forEach(captureWindow => {
        captureWindow.webContents.send("captureWindow:show");
      });
    }
  })
}

async function preloadCaptureWindows() {
  await getScreenData();
  try {
    screenData.map(async item => {
      const captureWindow = await createCaptureWindow(isDarwin);
      item.wId = captureWindow.id;
      captureWindow.webContents.send("transport-screen-and-window-data", JSON.stringify({screenData:item,captureWindowId: captureWindow.id}));
      captureWindows.push(captureWindow);
      countOfCaptureWindowToShot = 0;
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
      if (countOfCaptureWindowToShot === captureWindows.length) return;
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