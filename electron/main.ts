import { app, BrowserWindow, ipcMain, screen } from "electron";
import { createCaptureWindow } from "./captureWindow/createCaptureWindow";
import path from "path";
import { platform } from "os";
import {
  getCaptureWindowSources,
  handleSaveImageToClipboard,
  handleDownloadImage,
  resetCaptureWindow,
  registerShortcut,
  handleScreenShot,
  type CreateCaptureWindowProps
} from "./utils";

const isDarwin = platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let mainWindow: BrowserWindow | null;
let captureWindow: BrowserWindow;
let screenWidth: number;
let screenHeight: number;
let screenScaleFactor: number;
let createCaptureWindowProps: CreateCaptureWindowProps;

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
  
  captureWindow = await createCaptureWindow(createCaptureWindowProps);
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
  const { size, scaleFactor } = screen.getPrimaryDisplay();
  screenWidth = size.width;
  screenHeight = size.height;
  screenScaleFactor = Math.ceil(scaleFactor);
  createCaptureWindowProps = { isDarwin, screenWidth, screenHeight };
  addEventListenerOfMain();
  await createWindow();
  registerShortcut(captureWindow);
}

function addEventListenerOfMain(): void {
  ipcMain.handle("screen:shot", () => {
    handleScreenShot(captureWindow);
  });
  ipcMain.handle("captureWindow:sources", () => {
    console.log("------> get captureWindow:sources success!");
    return getCaptureWindowSources(
      screenWidth,
      screenHeight,
      screenScaleFactor
    );
  });
  ipcMain.handle("window:close", () => {
    console.log("------> close mainWindow success!");
    mainWindow?.close();
    captureWindow?.close();
  });
  ipcMain.handle("captureWindow:close", async () => {
    console.log("------> close captureWindow success!");
    captureWindow = await resetCaptureWindow(captureWindow, createCaptureWindowProps);
  });
  ipcMain.handle("screen:sources", () => {
    console.log("------> get screen:sources success!");
    return { screenWidth, screenHeight, screenScaleFactor };
  });
  ipcMain.handle("saveClipboard:image", (event, ImageDataURL) => {
    console.log("------> saveClipboard:image success!");
    handleSaveImageToClipboard(ImageDataURL);
  });
  ipcMain.handle("download:image", async (event, ImageDataURL) => {
    console.log("------> download:image success!");
    captureWindow = await handleDownloadImage(captureWindow, ImageDataURL, createCaptureWindowProps);
  });
}
