import { BrowserWindow, desktopCapturer } from "electron";
import path from "path";

async function handleGetWindowSources(): Promise<string> {
  const sources = await desktopCapturer.getSources({
    types: ["window", "screen"],
  });
  const fullScreen = sources.filter((source) => source.id === "screen:0:0")[0];
  const fullScreenContentDataURL = fullScreen.thumbnail.toDataURL();
  return fullScreenContentDataURL;
}

export async function screenShot(captureWindow: BrowserWindow | null) {
  if (!screenShot) return;
  const screenContentDataURL = await handleGetWindowSources();
  captureWindow?.show();
  return screenContentDataURL;
}

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
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../electron/preload.ts")
    },
  });
  captureWindow.setAlwaysOnTop(true, "screen-saver");
  captureWindow.setFullScreenable(false);
  captureWindow.setVisibleOnAllWorkspaces(true);
  captureWindow.on("closed", () => { 
    captureWindow = null;
  })
  await captureWindow.loadFile(
    path.join(__dirname, "../electron/captureWindow/capture.html")
  );
  return captureWindow;
}
