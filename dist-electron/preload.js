"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  screenShot: () => ipcRenderer.invoke("screen:shot"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  getCaptureWindowSources: () => ipcRenderer.invoke("captureWindow:sources"),
  getScreenSources: () => ipcRenderer.invoke("screen:sources"),
  saveImageToClipboard: (ImageDataURL) => ipcRenderer.invoke("saveClipboard:image", ImageDataURL),
  closeCaptureWindow: () => ipcRenderer.invoke("captureWindow:close"),
  downloadImage: (ImageDataURL) => ipcRenderer.invoke("download:image", ImageDataURL),
  onStartCapture: (startCapture) => ipcRenderer.on("start-capture", (event, arg) => {
    startCapture();
  })
});
