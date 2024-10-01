// app 控制应用程序的事件生命周期（相当于应用程序）
// BrowserWindow 创建并控制浏览器窗口（相当于打开桌面弹框）
import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
 

ipcMain.on('message-from-renderer', (event, data) => {  
    console.log(data.someData); // 输出: Hello from Vue3!  
    // 处理消息的逻辑...  
  });

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'


// 定义全局变量，获取窗口实例
let win: BrowserWindow | null;
 
/**
 * 创建一个窗口
 */
const createWindow = () => {
  win = new BrowserWindow({
    title: 'Main window',
    webPreferences: {
      preload: './preload.js',
      // 集成网页和 Node.js，也就是在渲染进程中，可以调用 Node.js 方法
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  
    // 集成网页和 Node.js 后，需要加载
    // 这里接收的网址是指：Vite 启动后，会在本地运行一个服务，把这个服务网址丢进去就行
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(process.env.DIST as string, 'index.html'))
  }
  
}
 
// 初始化app（在 Electron 完成初始化时触发），挂载上面创建的 桌面应用程序窗口
app.whenReady().then(createWindow)
