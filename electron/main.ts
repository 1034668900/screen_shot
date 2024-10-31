import {
  app,
  BrowserWindow,
  ipcMain,
  desktopCapturer,
  screen,
  nativeImage,
  clipboard,
  dialog,
  globalShortcut
} from "electron";
import { createCaptureWindow } from "./captureWindow/createCaptureWindow";
import path from "path";
import fs from "fs/promises";
import { platform } from "os";

const isDarwin = platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow: BrowserWindow | null;
let captureWindow: BrowserWindow | null;
let screenMaxWidth: number;
let screenMaxHeight: number;
let screenScaleFactor: number;

const createWindow = async () => {
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

  captureWindow = await createCaptureWindow(
    isDarwin,
    screenMaxWidth,
    screenMaxHeight
  );
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

app.whenReady().then(() => {
  const { size, scaleFactor } = screen.getPrimaryDisplay();
  screenMaxWidth = size.width;
  screenMaxHeight = size.height;
  screenScaleFactor = scaleFactor;
  addEventListenerOfMain();
  createWindow();
  registerShortcut();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

async function handleScreenShot() {
  if (!captureWindow) return;
  captureWindow.show();
  captureWindow.webContents.send("start-capture");

}

async function getCaptureWindowSources() {
  return await desktopCapturer.getSources({
    types: ["screen"],
    thumbnailSize: {
      width: screenMaxWidth * screenScaleFactor,
      height: screenMaxHeight * screenScaleFactor,
    },
  });
}

function handleSaveImageToClipboard(ImageDataURL: string) {
  const image = nativeImage.createFromDataURL(ImageDataURL);
  clipboard.writeImage(image);
}

async function handleDownloadImage(ImageDataURL: string) {
  try {
    if (!captureWindow) return;
    const matches = ImageDataURL.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid data URL");
    }
    const [, ext, base64Data] = matches;
    const buffer = Buffer.from(base64Data, "base64");
    const { filePath, canceled } = await dialog.showSaveDialog(captureWindow, {
      title: "Download Image",
      defaultPath: `FengCh-${Date.now()}.${ext}`,
    });
    if (canceled) {
      resetCaptureWindow();
      return;
    }
    await fs.writeFile(filePath, buffer);
    resetCaptureWindow();
  } catch (error) {
    throw error;
  }
}

function addEventListenerOfMain(): void {
  ipcMain.handle("screen:shot", handleScreenShot);
  ipcMain.handle("captureWindow:sources", getCaptureWindowSources);
  ipcMain.handle("window:close", () => {
    console.log("close mainWindow success!");
    mainWindow?.close();
    captureWindow?.close();
  });
  ipcMain.handle("captureWindow:close", () => {
    console.log("close captureWindow success!");
    resetCaptureWindow();
  });
  ipcMain.handle("screen:sources", () => {
    console.log("get screen:sources success!");
    return { screenMaxWidth, screenMaxHeight, screenScaleFactor };
  });
  ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  ipcMain.handle("download:image", (event, ImageDataURL) => {
    handleDownloadImage(ImageDataURL);
  });
}

// 解决 captureWindow 隐藏后保留上次截图内容的问题
async function resetCaptureWindow() {
  if (!captureWindow) return;
  console.log("resetCaptureWindow success!");
  captureWindow.close();
  captureWindow = await createCaptureWindow(isDarwin, screenMaxWidth, screenMaxHeight);
}

function registerShortcut() {
  if (platform() === "darwin") {
    globalShortcut.register("Command+P", () => {
      handleScreenShot();
    })
  } else {
    globalShortcut.register("Ctrl+P", () => {
      handleScreenShot();
    })
  }

}
