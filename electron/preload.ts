const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  startScreenShot: () => ipcRenderer.invoke("screen:shot"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  getCaptureWindowSources: (screenId: number, screenWidth: number, screenHeight: number, screenScaleFactor: number) => ipcRenderer.invoke("captureWindow:sources",screenId,screenWidth, screenHeight,screenScaleFactor),
  saveImageToClipboard: (ImageDataURL: string) => ipcRenderer.invoke("saveClipboard:image", ImageDataURL),
  closeCaptureWindow: () => ipcRenderer.invoke("captureWindow:close"),
  downloadImage: (captureWindowId: number,ImageDataURL: string) => ipcRenderer.invoke("download:image",captureWindowId, ImageDataURL),
  clearOtherCanvas: (id: number) => ipcRenderer.invoke("clearOtherCanvas", id),
  transportScreenAndWindowData: (getData: Function) => ipcRenderer.on("transport-screen-and-window-data", (event, data) => {
    getData(data);
  }),
  readyToShow: () => ipcRenderer.send("captureWindowShow:ready"),
  onStartCapture: (startCapture: Function) => ipcRenderer.on("start-capture", () => {
    startCapture();
  }),
  onClearCanvas: (cb: Function) => ipcRenderer.on("clear:canvas", () => { 
    cb();
  }),
  onStartShow: (cb: Function) => ipcRenderer.on("captureWindow:show", () => { 
    cb();
  })
})