import { app, BrowserWindow, ipcMain, desktopCapturer, screen } from "electron";
import { screenShot, createCaptureWindow } from "./captureWindow/screenShot";
import path from "path";
import { platform } from "os";
const isDarwin = platform() === "darwin";
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let mainWindow: BrowserWindow | null;
let captureWindow: BrowserWindow | null;
let screenMaxWidth: number;
let screenMaxHeight: number;
let screenScaleFactor: number;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 450,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../electron/preload.ts"),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

app.whenReady().then(() => {
  addEventListenerOfMain();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const { size, scaleFactor } = screen.getPrimaryDisplay();
  screenMaxWidth = size.width;
  screenMaxHeight = size.height;
  screenScaleFactor = scaleFactor;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

async function handleScreenShot() {
  const captureWindow = await createCaptureWindow(
    isDarwin,
    screenMaxWidth,
    screenMaxHeight
  );
  // const screenSource = screenShot(captureWindow);
  // captureWindow.show();
  // captureWindow.webContents.openDevTools();
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

function addEventListenerOfMain(): void {
  ipcMain.handle("screen:shot", handleScreenShot);
  ipcMain.handle("window:close", () => {
    mainWindow?.close();
  });
  ipcMain.handle("captureWindow:close", () => {
    captureWindow?.close();
  });
  ipcMain.handle("captureWindow:sources", getCaptureWindowSources);
  ipcMain.handle("screen:sources", () => {
    return { screenMaxWidth, screenMaxHeight, screenScaleFactor };
  });
}
