import { BrowserWindow } from "electron";
import path from "path";

export async function createCaptureWindow(isDarwin: boolean): Promise<BrowserWindow> {
  let captureWindow: BrowserWindow = new BrowserWindow({
    frame: false,
    fullscreen: !isDarwin,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    transparent: true,
    resizable: false,
    movable: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,//mac
    skipTaskbar: true,
    // alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
  });
  captureWindow.setOpacity(0);
  captureWindow.setIgnoreMouseEvents(true);
  // captureWindow.setAlwaysOnTop(true, "screen-saver", 999);
  captureWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true
  });
  captureWindow.on("closed", () => { 
    captureWindow.destroy();
  })
  await captureWindow.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow;
}