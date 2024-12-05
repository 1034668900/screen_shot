import { operateDoms } from './capture.js';

class captureRender extends Event {
  isMouseDown = false;
  isCapture = false;
  isDrag = false;
  relativeX = 0;
  relativeY = 0;
  startX = 0;
  startY = 0;
  endX = 0;
  endY = 0;
  dragPointX = 0;
  dragPointY = 0;
  dragDiffWidth = 0; // 拖拽点距离选中区域矩形起始点的距离
  dragDiffHeight = 0;
  canvasWidth = 0;
  canvasHeight = 0;
  screenWidth = 0;
  screenHeight = 0;
  screenEndX = 0;
  screenEndY = 0;
  shotRect = {};

  constructor(...args) {
    super([arguments]);
    this.init(...args);
  }

  init($canvas, $bg, $toolBar, $topLeftAngle, $topRightAngle, $bottomLeftAngle, $bottomRightAngle, imgDataURL, screenData) {
    const { bounds, scaleFactor, size } = screenData;
    this.$canvas = $canvas;
    this.ctx = $canvas.getContext('2d', { willReadFrequently: true });
    this.$bg = $bg;
    this.$toolBar = $toolBar;
    this.$topLeftAngle = $topLeftAngle;
    this.$topRightAngle = $topRightAngle;
    this.$bottomLeftAngle = $bottomLeftAngle;
    this.$bottomRightAngle = $bottomRightAngle;
    this.canvasOperateAngleLength = parseInt(getComputedStyle(this.$topLeftAngle).width);
    this.toolBarWidth = parseInt(getComputedStyle(this.$toolBar).width);
    this.toolBarHeight = parseInt(getComputedStyle(this.$toolBar).height);
    this.imgDataURL = imgDataURL;
    this.canvasWidth = size.width;
    this.canvasHeight = size.height;
    this.screenWidth = size.width;
    this.screenHeight = size.height;
    this.relativeX = bounds.x;
    this.relativeY = bounds.y;
    this.screenEndX = this.relativeX + this.screenWidth;
    this.screenEndY = this.relativeY + this.screenHeight;
    this.scaleFactor = scaleFactor;
    this.saveOriginImage();
  }

  async saveOriginImage() {
    this.$bg.style.backgroundImage = `url(${this.imgDataURL})`;
    this.$bg.style.backgroundSize = `${this.canvasWidth}px,${this.canvasHeight}px`;
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = await this.onloadImage(this.imgDataURL);
    canvas.width = this.canvasWidth * this.scaleFactor;
    canvas.height = this.canvasHeight * this.scaleFactor;
    ctx.drawImage(img, 0, 0);
    // 存储原始背景，为后续截取作准备
    this.$originBackground = ctx;
    this.addListenerForCapture();
    ctx = null;
    canvas = null;
  }

  async showToolBar() {
    const { startX, startY, width, height } = this.shotRect;
    const toolBarLeft =
      startY + height >= this.screenEndY - this.toolBarHeight
        ? startX + width + 5
        : startX + width - this.toolBarWidth;
    const toolBarTop =
      startY + height >= this.screenEndY - this.toolBarHeight
        ? startY + height - this.toolBarHeight
        : startY + height + 10;

    this.$toolBar.style.left = `${toolBarLeft}px`;
    this.$toolBar.style.top = `${toolBarTop}px`;
    this.$toolBar.style.display = 'flex';
    this.getShotRectImageURL();
  }

  async saveImageToClipboard() {
    await electronAPI.saveImageToClipboard(this.getShotRectImageURL());
  }

  async onloadImage(imgDataURL) {
    const img = new Image();
    img.src = imgDataURL;
    return new Promise((resolve) => {
      img.onload = () => resolve(img);
    });
  }

  judgePoinstIsInCanvas(x, y) {
    return (
      x >= this.relativeX &&
      x <= this.screenEndX &&
      y >= this.relativeY &&
      y <= this.screenEndY
    );
  }

  drawCanvas() {
    this.isCapture = true;

    const tempStartX = Math.min(this.startX, this.endX) - this.relativeX;
    const tempStartY = Math.min(this.startY, this.endY) - this.relativeY;
    const startX = tempStartX <= 0 ? 0 : tempStartX;
    const startY = tempStartY <= 0 ? 0 : tempStartY;

    const tempEndX = Math.max(this.startX, this.endX) - this.relativeX;
    const tempEndY = Math.max(this.startY, this.endY) - this.relativeY;
    const endX = tempEndX > this.screenWidth ? this.screenWidth : tempEndX;
    const endY = tempEndY > this.screenHeight ? this.screenHeight : tempEndY;

    const width = endX - startX;
    const height = endY - startY;

    // 同步结束位置数据是为了定位工具栏
    this.endX = endX;
    this.endY = endY;
    this.canvasWidth = width;
    this.canvasHeight = height;

    const margin = 2; // 捕获窗口的边框
    const scaleFactor = this.scaleFactor;
    const canvasWidth = width + 2 * margin;
    const canvasHeight = height + 2 * margin;

    this.shotRect = { startX, startY, width, height };
    this.$canvas.width = (width + margin * 2) * scaleFactor;
    this.$canvas.height = (height + margin * 2) * scaleFactor;
    this.$canvas.style.position = 'absolute';
    this.$canvas.style.left = `${startX - margin}px`;
    this.$canvas.style.top = `${startY - margin}px`;
    this.$canvas.style.display = 'block';
    this.$canvas.style.width = `${canvasWidth}px`;
    this.$canvas.style.height = `${canvasHeight}px`;
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
    // 绘制截图窗口边框
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#67BADE';
    this.ctx.lineWidth = margin * scaleFactor;
    this.ctx.strokeRect(
      margin * scaleFactor,
      margin * scaleFactor,
      width * scaleFactor,
      height * scaleFactor
    );
    this.drawCanvasAngle();
  }
  drawCanvasAngle() {
    const { startX, startY, width, height } = this.shotRect;
    const lineWidth = 3;
    const gap = 2;

    const lineColor = '#00B5FF';
    this.$topLeftAngle.style.left = `${startX - gap}px`;
    this.$topLeftAngle.style.top = `${startY - gap}px`;
    this.$topLeftAngle.style.cursor = `nw-resize`;
    this.$topLeftAngle.style.borderTop = `${lineWidth}px solid ${lineColor}`;
    this.$topLeftAngle.style.borderLeft = `${lineWidth}px solid ${lineColor}`;

    this.$topRightAngle.style.left = `${startX + width - this.canvasOperateAngleLength + gap}px`;
    this.$topRightAngle.style.top = `${startY - gap}px`;
    this.$topRightAngle.style.cursor = `ne-resize`;
    this.$topRightAngle.style.borderTop = `${lineWidth}px solid ${lineColor}`;
    this.$topRightAngle.style.borderRight = `${lineWidth}px solid ${lineColor}`;

    this.$bottomLeftAngle.style.left = `${startX - gap}px`;
    this.$bottomLeftAngle.style.top = `${startY + height - this.canvasOperateAngleLength + gap}px`;
    this.$bottomLeftAngle.style.cursor = `sw-resize`;
    this.$bottomLeftAngle.style.borderBottom = `${lineWidth}px solid ${lineColor}`;
    this.$bottomLeftAngle.style.borderLeft = `${lineWidth}px solid ${lineColor}`;

    this.$bottomRightAngle.style.left = `${startX + width - this.canvasOperateAngleLength + gap}px`;
    this.$bottomRightAngle.style.top = `${startY + height - this.canvasOperateAngleLength + gap}px`;
    this.$bottomRightAngle.style.cursor = `se-resize`;
    this.$bottomRightAngle.style.borderBottom = `${lineWidth}px solid ${lineColor}`;
    this.$bottomRightAngle.style.borderRight = `${lineWidth}px solid ${lineColor}`;
  }
  hideToolBar() {
    this.$toolBar.style.display = 'none';
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
    this.canvasWidth = 0;
    this.canvasHeight = 0;
    this.isCapture = false;
  }

  isLegalOfRectSize() {
    return this.canvasWidth > 5 && this.canvasHeight > 5;
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
      const canvas = document.createElement('canvas');
      canvas.width = width * scaleFactor;
      canvas.height = height * scaleFactor;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(imageDataURL, 0, 0);
      return canvas.toDataURL();
    }
    return null;
  }

  closeCaptureWindow() {
    electronAPI.closeCaptureWindow();
  }

  downloadImage(id) {
    electronAPI.downloadImage(id, this.getShotRectImageURL());
  }

  judgePoinstIsInCanvas(x, y) {
    const { startX, startY, width, height } = this.shotRect;
    const left = x - this.relativeX;
    const top = y - this.relativeY;
    return (
      left >= startX &&
      left <= startX + width &&
      top >= startY &&
      top <= startY + height
    );
  }

  addListenerForCapture() {
    window.addEventListener(
      'mousedown',
      this.captureMouseDown.bind(this)
    );
    window.addEventListener(
      'mousemove',
      this.captureMouseMove.bind(this)
    );
    window.addEventListener('mouseup', this.captureMouseUp.bind(this));
  }

  // 鼠标在截图窗口内点击、移动、抬起都有两种逻辑，一种是框选截图区域，一种是框选区域的拖拽，因此下列监听事件均做了区分处理
  captureMouseDown(e) {
    if (operateDoms.includes(e.target.id)) return; // 鼠标点击在操作按钮上不触发以下逻辑
    if (this.judgePoinstIsInCanvas(e.screenX, e.screenY)) {
      return this.mouseDownOnCanvas(e);
    }
    this.isMouseDown = true;
    this.startX = e.screenX;
    this.startY = e.screenY;
    this.hideToolBar();
    this.clearCanvas();
  }

  captureMouseMove(e) {
    if (this.judgePoinstIsInCanvas(e.screenX, e.screenY) || this.isDrag) {
      return this.mouseMoveOnCanvas(e);
    }
    if (!this.isMouseDown) return;
    this.endX = e.screenX;
    this.endY = e.screenY;
    this.drawCanvas();
  }

  captureMouseUp(e) {
    if (operateDoms.includes(e.target.id)) return;
    if (this.isDrag) {
      return this.mouseUpOnCanvas(e);
    }
    this.isMouseDown = false;
    if (this.isLegalOfRectSize()) {
      return this.showToolBar();
    }
    this.clearCanvas();
  }

  mouseDownOnCanvas(e) {
    const { startX, startY } = this.shotRect;
    this.isDrag = true;
    this.dragPointX = e.screenX;
    this.dragPointY = e.screenY;
    this.dragDiffWidth = this.dragPointX - startX;
    this.dragDiffHeight = this.dragPointY - startY;
    this.hideToolBar();
  }

  mouseMoveOnCanvas(e) {
    if (!this.isDrag) return;
    this.dragPointX = e.screenX;
    this.dragPointY = e.screenY;

    const tempStartX = this.dragPointX - this.dragDiffWidth + this.relativeX;
    const tempStartY = this.dragPointY - this.dragDiffHeight + this.relativeY;

    this.startX = tempStartX <= this.relativeX ? this.relativeX : tempStartX;
    this.startX =
      this.startX + this.canvasWidth >= this.screenEndX
        ? this.screenEndX - this.canvasWidth
        : this.startX;
    this.startY = tempStartY <= this.relativeY ? this.relativeY : tempStartY;
    this.startY =
      this.startY + this.canvasHeight >= this.screenEndY
        ? this.screenEndY - this.canvasHeight
        : this.startY;
    this.endX = this.startX + this.canvasWidth;
    this.endY = this.startY + this.canvasHeight;

    this.drawCanvas();
  }

  mouseUpOnCanvas(e) {
    this.isDrag = false;
    this.showToolBar();
  }
}

export { captureRender };
