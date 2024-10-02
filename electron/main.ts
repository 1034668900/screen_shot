import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path';

ipcMain.on('message-from-renderer', (event, data) => {
  console.log(data.someData); // 输出: Hello from Vue3!  
  // 处理消息的逻辑...  
});


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null;

const createWindow = () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: path.join(__dirname,"../electron/preload.ts")
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

}

app.whenReady().then(createWindow)
