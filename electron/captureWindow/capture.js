import {captureRender} from "./utils.js";

const DomNames = [
    "#capture-bg",
    "#capture-mask",
    "#capture-canvas",
    "#tool-bar",
    "#operate-rotate",
    "#operate-download",
    "#operate-cancel",
    "#operate-save",
];

const Doms = {};
DomNames.forEach(name => {
    let domName = name.slice(1);
    const dom = document.querySelector(name);
    Doms[domName] = dom;
});



startCapture();
async function startCapture() {
    const { screenMaxWidth, screenMaxHeight, screenScaleFactor } = await getScreenSources();
    const windowSources = await getCaptureSources();
    // 窗口内容获取成功后在调整mask颜色，否则会影响原图
    Doms["capture-mask"].style.background = "rgba(0,0,0,0.6)";
    const imgURL = windowSources[0].thumbnail.toDataURL();
    new captureRender(Doms["capture-canvas"], Doms["capture-bg"], Doms["tool-bar"], imgURL, screenMaxWidth, screenMaxHeight, screenScaleFactor);
}

async function getCaptureSources() {
    return await window.electronAPI.getCaptureWindowSources();
}

async function getScreenSources() {
    return await window.electronAPI.getScreenSources();
}
