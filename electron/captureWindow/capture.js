import {captureRender} from "./utils.js";

const DomNames = [
    "#capture-bg",
    "#capture-mask",
    "#capture-canvas",
    "#capture-tools",
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
    const { screenMaxWidth, screenMaxHeight, screenScaleFactory } = await getScreenSources();
    const windowSources = await getCaptureSources();
    const imgURL = windowSources[0].thumbnail.toDataURL();
    new captureRender(Doms["capture-canvas"], Doms["capture-bg"], imgURL, screenMaxWidth, screenMaxHeight, screenScaleFactory)
}

async function getCaptureSources() {
    return await window.electronAPI.getCaptureWindowSources();
}

async function getScreenSources() {
    return await window.electronAPI.getScreenSources();
}
