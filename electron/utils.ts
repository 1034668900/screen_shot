import { type BrowserWindow, nativeImage, clipboard, dialog, screen } from "electron";
import screenshot from "screenshot-desktop";
import fs from "fs/promises";

type Size = { width: number; height: number };

export type ScreenData = {
  id: number;
  size: Size;
  label: string;
  bounds: { x: number; y: number } & Size;
  scaleFactor: number;
}

function handleScreenShot(captureWindow: BrowserWindow | null) {
  if (!captureWindow) return;
  captureWindow.webContents.send("start-capture");
  captureWindow.show();
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
    await fs.writeFile(filePath, buffer);
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
      scaleFactor: Math.ceil(screen.scaleFactor)
    }
    screenDatas.push(tempScreenData);
  })
  return screenDatas;
}



export type CreateCaptureWindowProps = {
  isDarwin: boolean;
  screenWidth: number;
  screenHeight: number;
  x?: number;
  y?: number;
}

export { getCaptureWindowSources, handleSaveImageToClipboard, handleDownloadImage, handleScreenShot, getAllDisplays };
