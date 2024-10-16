"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  getWindowSource: () => ipcRenderer.invoke("sources:window")
});
