import { app, BrowserWindow, ipcMain, desktopCapturer } from "electron";
import path from "path";

process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let win: BrowserWindow | null;
const createWindow = () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../electron/preload.ts"),
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

app.whenReady().then(() => {
  addEventListenerOfMain();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

async function handleGetWindowSources(): Promise<string> {
  const sources = await desktopCapturer.getSources({ types: ["window"] });
  return "nihao";
}

function addEventListenerOfMain(): void {
  ipcMain.handle("sources:window", handleGetWindowSources);
  ipcMain.handle("window:close", () => {
    win?.close();
  });
}
