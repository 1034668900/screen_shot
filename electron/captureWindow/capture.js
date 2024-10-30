import {captureRender} from "./captureRender.js";

const DomsName = [
    "capture-bg",
    "capture-mask",
    "capture-canvas",
    "tool-bar",
    "operate-rotate",
    "operate-download",
    "operate-cancel",
    "operate-save",
];

export const operateDoms = [
    "operate-rotate",
    "operate-download",
    "operate-cancel",
    "operate-save",
]

const Doms = {};
let captureInstance;

getDoms(DomsName);

function getDoms(DomsName) {
    DomsName.forEach(name => {
        let domName = '#' + name;
        const dom = document.querySelector(domName);
        Doms[name] = dom;
    });
}

Doms["tool-bar"].addEventListener("click", async (e) => { 
    console.log(`start ${e.target.id}`);
    switch (e.target.id) {
        case "operate-rotate":
            break;
        case "operate-download":
            await captureInstance.downloadImage();
            break;
        case "operate-cancel":
            captureInstance.closeCaptureWindow();
            break;
        case "operate-save":
            await captureInstance.saveImageToClipboard();
            captureInstance.closeCaptureWindow();
            break;
    }
})

startCapture();
async function startCapture() {
    const { screenMaxWidth, screenMaxHeight, screenScaleFactor } = await getScreenSources();
    const windowSources = await getCaptureSources();
    // 窗口内容获取成功后在调整mask颜色，否则会影响原图
    Doms["capture-mask"].style.background = "rgba(0,0,0,0.6)";
    const imgURL = windowSources[0].thumbnail.toDataURL();
    captureInstance = new captureRender(Doms["capture-canvas"], Doms["capture-bg"], Doms["tool-bar"], imgURL, screenMaxWidth, screenMaxHeight, screenScaleFactor);
}

async function getCaptureSources() {
    return await window.electronAPI.getCaptureWindowSources();
}

async function getScreenSources() {
    return await window.electronAPI.getScreenSources();
}



