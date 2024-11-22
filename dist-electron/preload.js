"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  startScreenShot: () => ipcRenderer.invoke("screen:shot"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  getCaptureWindowSources: (screenId, screenWidth, screenHeight, screenScaleFactor) => ipcRenderer.invoke("captureWindow:sources", screenId, screenWidth, screenHeight, screenScaleFactor),
  saveImageToClipboard: (ImageDataURL) => ipcRenderer.invoke("saveClipboard:image", ImageDataURL),
  closeCaptureWindow: () => ipcRenderer.invoke("captureWindow:close"),
  downloadImage: (captureWindowId, ImageDataURL) => ipcRenderer.invoke("download:image", captureWindowId, ImageDataURL),
  clearOtherCanvas: (id) => ipcRenderer.invoke("clearOtherCanvas", id),
  transportScreenAndWindowData: (getData) => ipcRenderer.on("transport-screen-and-window-data", (event, data) => {
    getData(data);
  }),
  readyToShow: () => ipcRenderer.send("captureWindowShow:ready"),
  onStartCapture: (startCapture) => ipcRenderer.on("start-capture", () => {
    startCapture();
  }),
  onClearCanvas: (cb) => ipcRenderer.on("clear:canvas", () => {
    cb();
  }),
  onStartShow: (cb) => ipcRenderer.on("captureWindow:show", () => {
    cb();
  })
});
