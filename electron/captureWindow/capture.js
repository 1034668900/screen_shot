import { captureRender } from "./captureRender.js";

const DomsName = [
  "capture-bg",
  "capture-mask",
  "capture-canvas",
  "tool-bar",
  "operate-download",
  "operate-cancel",
  "operate-save",
];

const Doms = {};
let captureInstance;
let screenMaxWidth, screenMaxHeight, screenScaleFactor;

getDoms(DomsName);

function getDoms(DomsName) {
  DomsName.forEach((name) => {
    let domName = "#" + name;
    const dom = document.querySelector(domName);
    Doms[name] = dom;
  });
}

Doms["tool-bar"].addEventListener("click", async (e) => {
  console.log(`start ${e.target.id}`);
  switch (e.target.id) {
    case "operate-download":
      await captureInstance.downloadImage();
      break;
    case "operate-cancel":
      await captureInstance.closeCaptureWindow();
      break;
    case "operate-save":
      await captureInstance.saveImageToClipboard();
      await captureInstance.closeCaptureWindow();
      break;
  }
});

async function startCapture() {
  const windowSources = await getCaptureSources();
  // 窗口内容获取成功后在调整mask颜色，否则会影响原图
  Doms["capture-mask"].style.background = "rgba(0,0,0,0.6)";
  const imgURL = windowSources[0].thumbnail.toDataURL();
  captureInstance = new captureRender(
    Doms["capture-canvas"],
    Doms["capture-bg"],
    Doms["tool-bar"],
    imgURL,
    screenMaxWidth,
    screenMaxHeight,
    screenScaleFactor
  );
}

async function getCaptureSources() {
  return await window.electronAPI.getCaptureWindowSources();
}

async function getScreenSources() {
  return await window.electronAPI.getScreenSources();
}


window.electronAPI.onStartCapture(startCapture);

window.addEventListener("DOMContentLoaded", async () => {
  const screenSources = await getScreenSources();
  screenMaxWidth = screenSources.screenMaxWidth;
  screenMaxHeight = screenSources.screenMaxHeight;
  screenScaleFactor = screenSources.screenScaleFactor;
});

const operateDoms = ["operate-download", "operate-cancel", "operate-save"];

export { startCapture, operateDoms };
