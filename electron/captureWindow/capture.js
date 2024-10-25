
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

setBackground(Doms["capture-bg"])
async function setBackground(element) {
    if (!element) return;
    const mainScreen = await getCaptureSources();
    const imgURL = mainScreen[0].thumbnail.toDataURL();
    const {screenMaxWidth, screenMaxHeight, screenScaleFactory} = await getScreenSources();
    element.style.backgroundImage = `url(${imgURL})`
    element.style.backgroundSize = `${screenMaxWidth}px ${screenMaxHeight}px`
}

async function getCaptureSources() {
    return await window.electronAPI.getCaptureWindowSources();
}

async function getScreenSources() {
    return await window.electronAPI.getScreenSources();
}



