"use strict";const{contextBridge:n,ipcRenderer:e}=require("electron");n.exposeInMainWorld("electronAPI",{screenShot:()=>e.invoke("screen:shot"),closeWindow:()=>e.invoke("window:close"),getCaptureWindowSources:()=>e.invoke("captureWindow:sources"),getScreenSources:()=>e.invoke("screen:sources"),saveImageToClipboard:o=>e.invoke("saveClipboard:image",o),closeCaptureWindow:()=>e.invoke("captureWindow:close"),downloadImage:o=>e.invoke("download:image",o)});
