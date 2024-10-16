const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  getWindowSource: () => ipcRenderer.invoke("sources:window"),
  closeWindow: () => ipcRenderer.invoke("window:close")
})
