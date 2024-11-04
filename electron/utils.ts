import { type BrowserWindow, desktopCapturer, nativeImage, clipboard, dialog, globalShortcut } from "electron";
import fs from "fs/promises";
import { platform } from "os";
import { createCaptureWindow } from "./captureWindow/createCaptureWindow";

async function handleScreenShot(captureWindow: BrowserWindow | null) {
  if (!captureWindow) return;
  captureWindow.show();
  captureWindow.webContents.send("start-capture");
}

async function getCaptureWindowSources(screenWidth: number, screenHeight: number, scaleFactor: number) {
  try {
    return await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: {
        width: screenWidth * scaleFactor,
        height: screenHeight * scaleFactor,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

function handleSaveImageToClipboard(ImageDataURL: string) {
  const image = nativeImage.createFromDataURL(ImageDataURL);
  clipboard.writeImage(image);
}

async function handleDownloadImage(captureWindow: BrowserWindow, ImageDataURL: string, createCaptureWindowProps: CreateCaptureWindowProps): Promise<BrowserWindow> {
  try {
    if (captureWindow) {
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
      if (canceled) {
        return await resetCaptureWindow(captureWindow, createCaptureWindowProps);
      }
      await fs.writeFile(filePath, buffer);
    }
    return await resetCaptureWindow(captureWindow, createCaptureWindowProps);
  } catch (error) {
    console.log(error);
    return await resetCaptureWindow(captureWindow, createCaptureWindowProps);
  }
}

async function resetCaptureWindow(captureWindow: BrowserWindow | null, createCaptureWindowProps: CreateCaptureWindowProps): Promise<BrowserWindow> {
  captureWindow && captureWindow.close();
  return await createCaptureWindow(createCaptureWindowProps)
}

function registerShortcut(captureWindow: BrowserWindow | null) {
  if (platform() === "darwin") {
    console.log("------> registerShotcut success!");
    globalShortcut.register("Command+P", () => {
      handleScreenShot(captureWindow);
    });
  } else {
    globalShortcut.register("Ctrl+P", () => {
      handleScreenShot(captureWindow);
    });
    // 测试快捷键，关闭捕获窗口
    globalShortcut.register("Ctrl+Shift+A", () => {
      captureWindow?.hide();
    });
  }
}

export type CreateCaptureWindowProps = {
  isDarwin: boolean;
  screenWidth: number;
  screenHeight: number;
}

export { getCaptureWindowSources, handleSaveImageToClipboard, handleDownloadImage, resetCaptureWindow, registerShortcut, handleScreenShot };
