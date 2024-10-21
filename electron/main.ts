import { app, BrowserWindow, ipcMain, desktopCapturer } from "electron";
import { screenShot, createMaskWindow } from "./screenShot";
import path from "path";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let mainWindow: BrowserWindow | null;
let maskWindow: BrowserWindow | null;
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
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  })

});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function handleScreenShot (){
  console.log("createMaskWindow",__dirname);
  const maskWindow = createMaskWindow();
  // const screenSource = screenShot(maskWindow);
  // maskWindow.show();
  maskWindow.webContents.openDevTools();
}

function addEventListenerOfMain(): void {
  ipcMain.handle("screen:shot", handleScreenShot);
  ipcMain.handle("window:close", () => {
    mainWindow?.close();
  });
  ipcMain.handle("maskWindow:close", () => {
    maskWindow?.close();
  })

}
