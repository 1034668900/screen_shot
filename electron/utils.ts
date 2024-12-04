import { type BrowserWindow, nativeImage, clipboard, dialog, screen, systemPreferences } from "electron";
import screenshot from "screenshot-desktop";
import fs from "fs/promises";
import type { PathLike } from "fs";
const execCommond = require("child_process").exec;


type Size = { width: number; height: number };
type Bounds = { x: number; y: number } & Size;
export type ScreenData = {
  id: number;
  size: Size;
  label: string;
  bounds: { x: number; y: number } & Size;
  scaleFactor: number;
  wId?: number;
}

function handleScreenShot(captureWindow: BrowserWindow | null, bounds: Bounds | undefined) {
  if (!captureWindow || !bounds) return;
  captureWindow.webContents.send("start-capture");
  captureWindow.setOpacity(1);
  captureWindow.setBounds(bounds);
  captureWindow.setIgnoreMouseEvents(false);
}

async function getCaptureWindowSources(screenId: number) {
  try {
    return await screenshot({ screen: screenId, format: "png" });
  } catch (error) {
    console.error("getCaptureWindowSources is error");
  }
}

function handleSaveImageToClipboard(ImageDataURL: string) {
  const image = nativeImage.createFromDataURL(ImageDataURL);
  clipboard.writeImage(image);
}

async function handleDownloadImage(captureWindow: BrowserWindow, ImageDataURL: string){
  try {
    if (!captureWindow) return false;
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
    if (canceled) return;
    await fs.writeFile(filePath as PathLike, buffer);
  } catch (error) {
    console.error("handleDownloadImage is error");
  }
}

function getAllDisplays(): ScreenData[] {
  const screens = screen.getAllDisplays();
  let screenDatas: ScreenData[] = [];
  screens.forEach(screen => {
    let tempScreenData: ScreenData = {
      id: screen.id,
      label: screen.label,
      size: screen.size,
      bounds: screen.bounds,
      scaleFactor: screen.scaleFactor
    }
    screenDatas.push(tempScreenData);
  })
  return screenDatas;
}

async function checkAndApplyScreenShareAccessPrivilege(mainWindow: BrowserWindow | null) {
  if (process.platform === "linux" || !mainWindow) return;
  const screenPrivilege = systemPreferences.getMediaAccessStatus("screen");

  if (screenPrivilege !== "granted") {
    const res = await dialog.showMessageBox(mainWindow, {
      title: '权限申请',
      message: '当前应用无屏幕捕获权限，即将跳转至授权页面，请授权后重新启动应用。',
      textWidth: 450,
    })
    if (res.response === 0) {
      execCommond(`open x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture`); 
    }
  }
}

export { getCaptureWindowSources, handleSaveImageToClipboard, handleDownloadImage, handleScreenShot, getAllDisplays, checkAndApplyScreenShareAccessPrivilege };
