import { captureRender } from './captureRender.js';

const DomsName = [
  'capture-bg',
  'capture-mask',
  'capture-canvas',
  'tool-bar',
  'operate-download',
  'operate-cancel',
  'operate-save',
];

const Doms = {};
const reader = new FileReader();
let imgBuffer = [];
let captureInstance, screenData, captureWindowId;

initDoms(DomsName);
initEvent();

function initDoms(DomsName) {
  DomsName.forEach((name) => {
    let domName = '#' + name;
    const dom = document.querySelector(domName);
    Doms[name] = dom;
  });

  Doms['tool-bar'].addEventListener('click', async (e) => {
    switch (e.target.id) {
      case 'operate-download':
        await captureInstance.downloadImage(captureWindowId);
        break;
      case 'operate-cancel':
        await captureInstance.closeCaptureWindow();
        break;
      case 'operate-save':
        await captureInstance.saveImageToClipboard();
        await captureInstance.closeCaptureWindow();
        break;
    }
    removeMouseOverListener();
  });
}

function initEvent() {
  window.electronAPI.onStartCapture(startCapture);
  window.electronAPI.onStartShow(handleStartShow);
  window.electronAPI.onClearCanvas(handleClearCanvas)
  window.electronAPI.transportScreenAndWindowData((args) => {
    const data = JSON.parse(args);
    screenData = data.screenData;
    captureWindowId = data.captureWindowId;
  });

  window.addEventListener('keydown', (e) => {
    if (!captureInstance?.isCapture) return;
    if (e.key === 'Enter') {
      captureInstance.saveImageToClipboard();
      captureInstance.closeCaptureWindow();
    }
  });


}

async function startCapture() {
  imgBuffer = await getCaptureSources();
  readyToShow();
}

function handleClearCanvas() {
  if (!captureInstance.isCapture) return;
  captureInstance.clearCanvas();
  captureInstance.hideToolBar();
}

function handleStartShow() {
  Doms['capture-mask'].style.background = 'rgba(0, 0, 0, .6)';
  const imgBlob = new Blob([imgBuffer], { type: 'image/png' });
  reader.readAsDataURL(imgBlob);
  reader.onloadend = () => {
    captureInstance = new captureRender(
      Doms['capture-canvas'],
      Doms['capture-bg'],
      Doms['tool-bar'],
      reader.result,
      screenData
    );
  };
  addMouseOverListener();
}

function addMouseOverListener() {
  document.body.addEventListener('mouseover', clearOtherCanvas)
}

function removeMouseOverListener() {
  document.body.removeEventListener('mouseover', clearOtherCanvas)
}


function clearOtherCanvas() {
  if(!captureInstance?.isCapture)return
  window.electronAPI.clearOtherCanvas(captureWindowId);
}

async function getCaptureSources() {
  return await window.electronAPI.getCaptureWindowSources(
    screenData.id,
    screenData.size.width,
    screenData.size.height,
    screenData.scaleFactor
  );
}

async function readyToShow() {
  await window.electronAPI.readyToShow();
}

export const operateDoms = [
  'operate-download',
  'operate-cancel',
  'operate-save',
];
