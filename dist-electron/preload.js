"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  screenShot: () => ipcRenderer.invoke("screen:shot"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  getCaptureWindowSources: () => ipcRenderer.invoke("captureWindow:sources"),
  getScreenSources: () => ipcRenderer.invoke("screen:sources")
});
