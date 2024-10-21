"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  screenShot: () => ipcRenderer.invoke("screen:shot"),
  closeWindow: () => ipcRenderer.invoke("window:close")
});
