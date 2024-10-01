import { contextBridge, ipcRenderer } from 'electron'

console.log("preloadjs")
contextBridge.exposeInMainWorld('electron', {
  startDrag: () => {
    ipcRenderer.send('feng', 'heihei')
  }
})