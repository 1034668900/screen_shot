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
let captureInstance, screenData, captureWindowId;

initDoms(DomsName);
initEvent();

function initDoms(DomsName) {
  DomsName.forEach((name) => {
    let domName = "#" + name;
    const dom = document.querySelector(domName);
    Doms[name] = dom;
  });

  Doms["tool-bar"].addEventListener("click", async (e) => {
    switch (e.target.id) {
      case "operate-download":
        await captureInstance.downloadImage(captureWindowId);
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
}

function initEvent() {
  window.electronAPI.onStartCapture(startCapture);

  window.electronAPI.transportScreenAndWindowData((args) => {
    const data = JSON.parse(args);
    screenData = data.screenData;
    captureWindowId = data.captureWindowId;
  });

  window.addEventListener("keydown", (e) => { 
    if (!captureInstance.isCapture) return;
    if (e.key === "Enter") {
      captureInstance.saveImageToClipboard();
      captureInstance.closeCaptureWindow();
    }
  });
}

async function startCapture() {
  const imgBuffer = await getCaptureSources();
  const imgBlob = new Blob([imgBuffer], {type:"image/png"});
  Doms["capture-mask"].style.background = "rgba(0, 0, 0, .6)";
  document.body.style.width = screenData.size.width + 'px';
  document.body.style.height = screenData.size.height + 'px';
  const reader = new FileReader();
  reader.onloadend = () => {
    captureInstance = new captureRender(
      Doms["capture-canvas"],
      Doms["capture-bg"],
      Doms["tool-bar"],
      reader.result,
      screenData
    );
  }
  reader.readAsDataURL(imgBlob);
}

async function getCaptureSources() {
  return await window.electronAPI.getCaptureWindowSources(
    screenData.id,
    screenData.size.width,
    screenData.size.height,
    screenData.scaleFactor
  );
}

export const operateDoms = [
  "operate-download",
  "operate-cancel",
  "operate-save",
];
