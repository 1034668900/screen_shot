const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  screenShot: () => ipcRenderer.invoke("screen:shot"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  getCaptureWindowSources: (screenId: number, screenWidth: number, screenHeight: number, screenScaleFactor: number) => ipcRenderer.invoke("captureWindow:sources",screenId,screenWidth, screenHeight,screenScaleFactor),
  saveImageToClipboard: (ImageDataURL: string) => ipcRenderer.invoke("saveClipboard:image", ImageDataURL),
  closeCaptureWindow: () => ipcRenderer.invoke("captureWindow:close"),
  downloadImage: (captureWindowId: number,ImageDataURL: string) => ipcRenderer.invoke("download:image",captureWindowId, ImageDataURL),
  transportScreenAndWindowData: (getData: Function) => ipcRenderer.on("transport-screen-and-window-data", (event, data) => {
    getData(data);
  }),
  onStartCapture: (startCapture: Function) => ipcRenderer.on("start-capture", () => {
    startCapture();
  }),
})