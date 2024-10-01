"use strict";
const electron = require("electron");
const node_path = require("node:path");
electron.ipcMain.on("message-from-renderer", (event, data) => {
  console.log(data.someData);
});
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
let win;
const createWindow = () => {
  win = new electron.BrowserWindow({
    title: "Main window",
    webPreferences: {
      preload: "./preload.js",
      // 集成网页和 Node.js，也就是在渲染进程中，可以调用 Node.js 方法
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(node_path.join(process.env.DIST, "index.html"));
  }
};
electron.app.whenReady().then(createWindow);
