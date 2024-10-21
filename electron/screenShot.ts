
import { BrowserWindow, desktopCapturer } from "electron";
import path from "path";

async function handleGetWindowSources(): Promise<string> {
    const sources = await desktopCapturer.getSources({ types: ["window","screen"] });
    const fullScreen = sources.filter(source => source.id === "screen:0:0")[0];
    const fullScreenContentDataURL = fullScreen.thumbnail.toDataURL();
    return fullScreenContentDataURL;
}

export async function screenShot (maskWindow: BrowserWindow | null){
    if(!screenShot)return;
    const screenContentDataURL = await handleGetWindowSources();
    maskWindow?.show();
    return screenContentDataURL;
}

export function createMaskWindow () : BrowserWindow {
    const maskWindow = new BrowserWindow({
        frame: false,
        fullscreen: true,
        transparent: true,
        backgroundColor: "rgba(0,0,0,.6)",
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
          preload: path.join(__dirname,"../electron/maskWindow/maskWindowPreload.ts")
        }
      })
      maskWindow.loadFile(path.join(__dirname,"../electron/maskWindow/maskWindowHTML.html"))
    return maskWindow
}