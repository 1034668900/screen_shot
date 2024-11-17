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
    console.log("@@@relative",bounds);
    this.init();
  }
  async init() {
    this.$bg.style.backgroundImage = `url(${this.imgSrc})`;
    this.$bg.style.backgroundSize = `${this.width}px,${this.height}px`;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = await this.onloadImage(this.imgSrc);
<<<<<<< Updated upstream
    canvas.width = img.width;
    canvas.height = img.height;
=======
    canvas.width = this.width * this.scaleFactor;
    canvas.height = this.height * this.scaleFactor;
>>>>>>> Stashed changes
    ctx.drawImage(img, 0, 0);
    // 存储原始背景，为后续截取作准备
    this.$originBackground = ctx;
    this.addListenerForWindow();
    console.log("@@@@@canvas",ctx.getImageData(0,0,200,200));
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
      console.log("@@@@@Emove\\",this.endX,this.endY
      );

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
    const margin = 1;
    const canvasWidth = width;
    const canvasHeight = height;

    this.shotRect = { startX, startY, width, height };
    this.$canvas.width = canvasWidth * scaleFactor;
    this.$canvas.height = canvasHeight * scaleFactor;
    this.$canvas.style.position = "absolute";
    this.$canvas.style.left = `${startX}px`;
    this.$canvas.style.top = `${startY}px`;
    this.$canvas.style.display = "block";
    this.$canvas.style.width = `${canvasWidth}px`;
    this.$canvas.style.height = `${canvasHeight}px`;
    this.$canvas.style.border = "1px solid red";
    if (width && height) {
      const imgDataURL = this.$originBackground.getImageData(
        startX * scaleFactor,
        startY * scaleFactor,
        width * scaleFactor,
        height * scaleFactor
      );
      this.ctx.putImageData(
        imgDataURL,
        margin * scaleFactor,
        margin * scaleFactor
      );
    }
    // this.ctx.fillStyle = "#FFFFFF";
    // this.ctx.strokeStyle = "#67BADE";
    // this.ctx.lineWidth = 2 * scaleFactor;
    // this.ctx.strokeRect(
    //   0 * scaleFactor,
    //   margin * scaleFactor,
    //   width * scaleFactor,
    //   height * scaleFactor
    // );
  }
  hideToolBar() {
    this.$toolBar.style.display = "none";
  }
  getShotRectImageURL() {
    const { startX, startY, width, height } = this.shotRect;
    const scaleFactor = this.scaleFactor;
    if (width && height) {
      const imgDataURL = this.$originBackground.getImageData(
        startX * scaleFactor,
        startY * scaleFactor,
        width * scaleFactor,
        height * scaleFactor
      );
      const canvas = document.createElement("canvas");
      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imgDataURL, 0, 0);
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
