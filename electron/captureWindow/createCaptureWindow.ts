import { BrowserWindow } from "electron";
import path from "path";

export async function createCaptureWindow(
  isDarwin: boolean,
  width: number,
  height: number
): Promise<BrowserWindow> {
  let captureWindow: null | BrowserWindow = new BrowserWindow({
    frame: false,
    fullscreen: !isDarwin,
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    resizable: false,
    movable: false,
    autoHideMenuBar: true,
    enableLargerThanScreen: true,//mac
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    },
  });
  captureWindow.setOpacity(1);
  captureWindow.setAlwaysOnTop(true, "screen-saver");
  captureWindow.setFullScreenable(false);
  captureWindow.setVisibleOnAllWorkspaces(true);
  captureWindow.on("closed", () => { 
    captureWindow = null;
  })
  captureWindow.hide();
  await captureWindow.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow;
}
