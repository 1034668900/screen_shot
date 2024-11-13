import { operateDoms } from "./capture.js";
class captureRender extends Event {
  isMouseDown = false;
  relativeX = 0;
  relativeY = 0;
  startX = 0;
  startY = 0;
  endX = 0;
  endY = 0;
  shotRect = {};

  constructor(
    $canvas,
    $bg,
    $toolBar,
    imgSrc,
    screenData
  ) {
    super([arguments]);
    const { bounds, scaleFactor, size  } = screenData;
    this.$canvas = $canvas;
    this.ctx = $canvas.getContext("2d", {willReadFrequently : true});
    this.$bg = $bg;
    this.$toolBar = $toolBar;
    this.toolBarWidth = parseInt(getComputedStyle(this.$toolBar).width);
    this.imgSrc = imgSrc;
    this.width = size.width;
    this.height = size.height;
    this.relativeX = bounds.x;
    this.relativeY = bounds.y;
    this.scaleFactor = scaleFactor;
    this.init();
  }
  async init() {
    this.$bg.style.backgroundImage = `url(${this.imgSrc})`;
    this.$bg.style.backgroundSize = `${this.width}px ${this.height}px`;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = await this.onloadImage(this.imgSrc);
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    // 存储原始背景，为后续截取作准备
    this.$originBackground = ctx;
    this.addListenerForWindow();
  }
  async showToolBar() {
    this.$toolBar.style.left = `${this.endX - this.toolBarWidth}px`;
    this.$toolBar.style.top = `${this.endY + 10}px`;
    this.$toolBar.style.display = "flex";
    this.getShotRectImageURL();
  }
  async saveImageToClipboard() {
    await window.electronAPI.saveImageToClipboard(this.getShotRectImageURL())
  }
  async onloadImage(imgSrc) {
    const img = new Image();
    img.src = imgSrc;
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  }
  addListenerForWindow() {
    window.addEventListener("mousedown", (e) => {
      if (operateDoms.includes(e.target.id)) {
        return;
      }
      this.isMouseDown = true;
      this.startX = e.screenX;
      this.startY = e.screenY;
      this.hideToolBar();
    });
    window.addEventListener("mousemove", (e) => {
      if (operateDoms.includes(e.target.id)) {
        return;
      }
      if (!this.isMouseDown) return;
      this.endX = e.screenX;
      this.endY = e.screenY;
      this.drawRectangle();
    });
    window.addEventListener("mouseup", (e) => {
      if (operateDoms.includes(e.target.id)) {
        return;
      }
      this.isMouseDown = false;
      this.showToolBar();
    });
  }
  drawRectangle() {
    const startX = Math.min(this.startX, this.endX) - this.relativeX;
    const startY = Math.min(this.startY, this.endY) - this.relativeY;
    const endX = Math.max(this.startX, this.endX) - this.relativeX;
    const endY = Math.max(this.startY, this.endY) - this.relativeY;
    this.endX = endX;
    this.endY = endY;
    const width = endX - startX;
    const height = endY - startY;
    const scaleFactor = this.scaleFactor;
    const margin = 7;

    this.shotRect = { startX, startY, width, height };
    this.$canvas.width = (width + margin * 2) * scaleFactor;
    this.$canvas.height = (height + margin * 2) * scaleFactor;
    this.$canvas.style.position = "absolute";
    this.$canvas.style.left = `${startX - margin}px`;
    this.$canvas.style.top = `${startY - margin}px`;
    this.$canvas.style.display = "block";
    this.$canvas.style.width = `${width + margin * 2}px`;
    this.$canvas.style.height = `${height + margin * 2}px`;
    if (width && height) {
      const imageDataURL = this.$originBackground.getImageData(
        startX * scaleFactor,
        startY * scaleFactor,
        width * scaleFactor,
        height * scaleFactor
      );
      this.ctx.putImageData(
        imageDataURL,
        margin * scaleFactor,
        margin * scaleFactor
      );
    }
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.strokeStyle = "#67BADE";
    this.ctx.lineWidth = 2 * scaleFactor;
    this.ctx.strokeRect(
      margin * scaleFactor,
      margin * scaleFactor,
      width * scaleFactor,
      height * scaleFactor
    );
  }
  hideToolBar() {
    this.$toolBar.style.display = "none";
  }
  getShotRectImageURL() {
    const { startX, startY, width, height } = this.shotRect;
    const scaleFactor = this.scaleFactor;
    if (width && height) {
      const imageDataURL = this.$originBackground.getImageData(
        startX * scaleFactor,
        startY * scaleFactor,
        width * scaleFactor,
        height * scaleFactor
      );
      const canvas = document.createElement("canvas");
      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imageDataURL, 0, 0);
      return canvas.toDataURL();
    }
    return null;
  }
  closeCaptureWindow() {
    window.electronAPI.closeCaptureWindow();
  }
  downloadImage(id) {
    window.electronAPI.downloadImage(id, this.getShotRectImageURL());
  }
}

export { captureRender };
