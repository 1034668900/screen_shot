import { BrowserWindow } from "electron";
import path from "path";
import type { CreateCaptureWindowProps } from "../utils.ts";

export async function createCaptureWindow(createCaptureWindowProps: CreateCaptureWindowProps): Promise<BrowserWindow> {
  const { x, y, screenWidth, screenHeight, isDarwin } = createCaptureWindowProps;
  let captureWindow: BrowserWindow = new BrowserWindow({
    frame: false,
    fullscreen: !isDarwin,
    width: screenWidth,
    height: screenHeight,
    x,
    y,
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
    captureWindow.destroy();
  })
  captureWindow.hide();
  await captureWindow.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow;
}
