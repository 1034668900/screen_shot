import { operateDoms } from './capture.js';

class captureRender extends Event {
  isMouseDownNonCanvas = false; // 鼠标点击非canvas区域标志位
  isDragCanvas = false; // 鼠标拖拽 canvas 的标志位
  isDragCanvasLeftTopAngle = false; // 鼠标拖拽canvas左上角的标志位
  isDragCanvasRightTopAngle = false; // 鼠标拖拽canvas右上角的标志位
  isDragCanvasLeftBottomAngle = false; // 鼠标拖拽canvas左下角的标志位
  isDragCanvasRightBottomAngle = false; // 鼠标拖拽canvas右下角的标志位
  isCapture = false;
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

  init(
    $canvas,
    $bg,
    $toolBar,
    $topLeftAngle,
    $topRightAngle,
    $bottomLeftAngle,
    $bottomRightAngle,
    imgDataURL,
    screenData
  ) {
    const { bounds, scaleFactor, size } = screenData;
    this.$canvas = $canvas;
    this.ctx = $canvas.getContext('2d', { willReadFrequently: true });
    this.$bg = $bg;
    this.$toolBar = $toolBar;
    this.$topLeftAngle = $topLeftAngle;
    this.$topRightAngle = $topRightAngle;
    this.$bottomLeftAngle = $bottomLeftAngle;
    this.$bottomRightAngle = $bottomRightAngle;
    this.canvasOperateAngleLength = parseInt(
      getComputedStyle(this.$topLeftAngle).width
    );
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
    if (!this.isLegalOfRectSize()) this.hideAngleButton();
    else this.showAngleButton();
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

    this.$topRightAngle.style.left = `${
      startX + width - this.canvasOperateAngleLength + gap
    }px`;
    this.$topRightAngle.style.top = `${startY - gap}px`;
    this.$topRightAngle.style.cursor = `ne-resize`;
    this.$topRightAngle.style.borderTop = `${lineWidth}px solid ${lineColor}`;
    this.$topRightAngle.style.borderRight = `${lineWidth}px solid ${lineColor}`;

    this.$bottomLeftAngle.style.left = `${startX - gap}px`;
    this.$bottomLeftAngle.style.top = `${
      startY + height - this.canvasOperateAngleLength + gap
    }px`;
    this.$bottomLeftAngle.style.cursor = `sw-resize`;
    this.$bottomLeftAngle.style.borderBottom = `${lineWidth}px solid ${lineColor}`;
    this.$bottomLeftAngle.style.borderLeft = `${lineWidth}px solid ${lineColor}`;

    this.$bottomRightAngle.style.left = `${
      startX + width - this.canvasOperateAngleLength + gap
    }px`;
    this.$bottomRightAngle.style.top = `${
      startY + height - this.canvasOperateAngleLength + gap
    }px`;
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
    this.hideAngleButton();
    this.hideToolBar();
  }

  hideAngleButton() {
    this.$topLeftAngle.style.display = 'none';
    this.$topRightAngle.style.display = 'none';
    this.$bottomLeftAngle.style.display = 'none';
    this.$bottomRightAngle.style.display = 'none';
  }

  showAngleButton() {
    this.$topLeftAngle.style.display = 'block';
    this.$topRightAngle.style.display = 'block';
    this.$bottomLeftAngle.style.display = 'block';
    this.$bottomRightAngle.style.display = 'block';
  }

  isLegalOfRectSize() {
    return this.canvasWidth > 12 && this.canvasHeight > 12;
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

  isWantToMoveCanvas(x, y) {
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

  isWantToDragLeftTopCanvas(x, y) {
    const { startX, startY } = this.shotRect;
    const offset = 3;
    const width = parseInt(getComputedStyle(this.$topLeftAngle).width);
    const height = parseInt(getComputedStyle(this.$topLeftAngle).height);
    return (
      x >= startX - offset + this.relativeX &&
      y >= startY - offset + this.relativeY &&
      x <= startX + width + offset + this.relativeX &&
      y <= startY + height + offset + this.relativeY
    );
  }

  isWantToDragRightTopCanvas(x, y) {
    const { startX, startY, width: canvasWidth} = this.shotRect;
    const offset = 3;
    const width = parseInt(getComputedStyle(this.$topRightAngle).width);
    const height = parseInt(getComputedStyle(this.$topRightAngle).height);
    return (
      x >= startX + canvasWidth - width - offset + this.relativeX &&
      y >= startY - offset + this.relativeY &&
      y <= startY + height + offset + this.relativeY &&
      x <= startX + canvasWidth + width + offset + this.relativeX
    )
  }
  isWantToDragLeftBottomCanvas(x, y) {
    const { startX, startY, height: canvasHeight } = this.shotRect;
    const offset = 3;
    const width = parseInt(getComputedStyle(this.$topLeftAngle).width);
    const height = parseInt(getComputedStyle(this.$topLeftAngle).height);
    return (
      x >= startX - offset + this.relativeX &&
      y >= startY + canvasHeight - offset + this.relativeY &&
      x <= startX + width + offset + this.relativeX &&
      y <= startY + canvasHeight + height + offset + this.relativeY
    );
  }
  isWantToDragRightBottomCanvas(x, y) {
    const { startX, startY,width: canvasWidth, height: canvasHeight } = this.shotRect;
    const offset = 3;
    const width = parseInt(getComputedStyle(this.$topLeftAngle).width);
    const height = parseInt(getComputedStyle(this.$topLeftAngle).height);
    return (
      x >= startX + canvasWidth - width - offset + this.relativeX &&
      y >= startY + canvasHeight - offset + this.relativeY &&
      y <= startY + canvasHeight + height + offset + this.relativeY &&
      x <= startX + canvasWidth + width + offset + this.relativeX
    )
  }

  addListenerForCapture() {
    window.addEventListener('mousedown', this.captureMouseDown.bind(this));
    window.addEventListener('mousemove', this.captureMouseMove.bind(this));
    window.addEventListener('mouseup', this.captureMouseUp.bind(this));
  }

  // 鼠标在截图窗口内点击会因为点击的位置不同从而有不同的逻辑
  captureMouseDown(e) {
    if (operateDoms.includes(e.target.id)) return; // 鼠标点击在操作按钮上不触发以下逻辑
    this.resetStatusWhenMouseUp();
    // 鼠标点击 canvas 左上角
    if (this.isWantToDragLeftTopCanvas(e.screenX, e.screenY)) {
      this.dragLeftTopAngleMouseDown();
      return;
    }
    // 鼠标点击 canvas 右上角
    if (this.isWantToDragRightTopCanvas(e.screenX, e.screenY)) {
      this.dragRightTopAngleMouseDown();
      return;
    }
    // 鼠标点击 canvas 左下角
    if (this.isWantToDragLeftBottomCanvas(e.screenX, e.screenY)) {
      this.dragLeftBottomAngleMouseDown();
      return;
    }
    // 鼠标点击 canvas 右下角
    if (this.isWantToDragRightBottomCanvas(e.screenX, e.screenY)) {
      this.dragRightBottomAngleMouseDown();
      return;
    }
    // 鼠标点击 canvas 区域
    if (this.isWantToMoveCanvas(e.screenX, e.screenY)) {
      this.mouseDownOnDragCanvas(e);
      return;
    }
    // 鼠标点击非 canvas 区域
    this.isMouseDownNonCanvas = true;
    this.startX = e.screenX;
    this.startY = e.screenY;
    this.hideToolBar();
    this.clearCanvas();
  }

  captureMouseMove(e) {
    if (
      !this.isDragCanvasLeftTopAngle &&
      !this.isMouseDownNonCanvas &&
      !this.isDragCanvas &&
      !this.isDragCanvasRightTopAngle &&
      !this.isDragCanvasLeftBottomAngle &&
      !this.isDragCanvasRightBottomAngle) return;
    this.hideToolBar();
    // 鼠标按住 canvas 左上角移动
    if (this.isDragCanvasLeftTopAngle) {
      this.dragLeftTopAngleMouseMove(e);
    }
    // 鼠标按住 canvas 右上角移动
    if (this.isDragCanvasRightTopAngle) {
      this.dragRightTopAngleMouseMove(e);
    }
    // 鼠标按住 canvas 左上角移动
    if (this.isDragCanvasLeftBottomAngle) {
      this.dragLeftBottomAngleMouseMove(e);
    }
    // 鼠标按住 canvas 右下角移动
    if (this.isDragCanvasRightBottomAngle) {
      this.dragRightBottomAngleMouseMove(e);
    }
    if (this.isDragCanvas) {
      this.mouseMoveOnDragCanvas(e);
    }
    if (this.isMouseDownNonCanvas) {
      this.endX = e.screenX;
      this.endY = e.screenY;
      this.drawCanvas();
    }
  }

  captureMouseUp() {
    if (!this.isLegalOfRectSize()) return;
    this.resetStatusWhenMouseUp();
    this.showToolBar();
  }

  resetStatusWhenMouseUp() {
    this.isDragCanvas = false;
    this.isMouseDownNonCanvas = false;
    this.isDragCanvasLeftTopAngle = false;
    this.isDragCanvasRightTopAngle = false;
    this.isDragCanvasRightBottomAngle = false;
    this.isDragCanvasLeftBottomAngle = false;
  }

  mouseDownOnDragCanvas(e) {
    const { startX, startY } = this.shotRect;
    this.isDragCanvas = true;
    this.dragPointX = e.screenX;
    this.dragPointY = e.screenY;
    this.dragDiffWidth = this.dragPointX - startX;
    this.dragDiffHeight = this.dragPointY - startY;
    this.hideToolBar();
  }

  mouseMoveOnDragCanvas(e) {
    if (!this.isDragCanvas) return;
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

  // 拖拽左上角
  dragLeftTopAngleMouseDown() {
    this.isDragCanvasLeftTopAngle = true;
    this.stickPointX = this.endX + this.relativeX;
    this.stickPointY = this.endY + this.relativeY;
  }
  dragLeftTopAngleMouseMove(e) {
    this.startX = e.screenX;
    this.startY = e.screenY;
    this.endX = this.stickPointX;
    this.endY = this.stickPointY;
    this.drawCanvas();
  }

  // 拖拽右上角
  dragRightTopAngleMouseDown() {
    this.isDragCanvasRightTopAngle = true;
    const { startX, startY,height } = this.shotRect;
    this.stickPointX = startX + this.relativeX;
    this.stickPointY = startY + height + this.relativeY;
  }
  dragRightTopAngleMouseMove(e) {
    const width = e.screenX - this.stickPointX;
    const height = e.screenY - this.stickPointY;

    // 右上角正向拉
    if (width > 0 && height < 0) {
      this.startX = this.stickPointX;
      this.startY = this.stickPointY + height;
      this.endX = this.startX + width;
      this.endY = this.stickPointY;
    }
    // 右上角宽小于固定点， 高小于固定点
    if (width < 0 && height < 0) {
      this.endX = this.stickPointX;
      this.endY = this.stickPointY;
      this.startX = this.endX + width;
      this.startY = this.endY + height;
    }
    // 右上角反向拉
    if (width < 0 && height > 0) {
      this.endX = this.stickPointX;
      this.endY = this.stickPointY + height;
      this.startX = this.endX + width;
      this.startY = this.endY - height;
    }
    // 右上角宽大于固定点，高大于固定点
    if (width > 0 && height > 0) {
      this.startX = this.stickPointX;
      this.startY = this.stickPointY;
      this.endX = this.startX + width;
      this.endY = this.startY + height;
    }
    this.drawCanvas();
  }

  // 拖拽左下角
  dragLeftBottomAngleMouseDown() {
    this.isDragCanvasLeftBottomAngle = true;
    const { startX, startY, width } = this.shotRect;
    this.stickPointX = startX + width + this.relativeX;
    this.stickPointY = startY + this.relativeY;
  }
  dragLeftBottomAngleMouseMove(e) {
    const width = e.screenX - this.stickPointX;
    const height = e.screenY - this.stickPointY;

    if (width < 0 && height > 0) {
      this.startX = this.stickPointX + width;
      this.startY = this.stickPointY;
      this.endX = this.stickPointX;
      this.endY = this.stickPointY + height;
    }
    if (width < 0 && height < 0) {
      this.endX = this.stickPointX;
      this.endY = this.stickPointY;
      this.startX = this.endX + width;
      this.startY = this.endY + height;
    }
    if (width > 0 && height > 0) {
      this.startX = this.stickPointX;
      this.startY = this.stickPointY;
      this.endX = this.startX + width;
      this.endY = this.startY + height;
    }
    if (width > 0 && height < 0) {
      this.startX = this.stickPointX;
      this.startY = this.stickPointY + height;
      this.endX = this.startX + width;
      this.endY = this.startY - height;
    }
    this.drawCanvas();
  }

  // 拖拽右下角
  dragRightBottomAngleMouseDown() {
    this.isDragCanvasRightBottomAngle = true;
    const { startX, startY } = this.shotRect;
    this.stickPointX = startX + this.relativeX;
    this.stickPointY = startY + this.relativeY;
  }
  dragRightBottomAngleMouseMove(e) {
    const width = e.screenX - this.stickPointX;
    const height = e.screenY - this.stickPointY;

    if (width > 0 && height > 0) {
      this.startX = this.stickPointX;
      this.startY = this.stickPointY;
      this.endX = this.startX + width;
      this.endY = this.startY + height;
    }
    if (width < 0 && height < 0) {
      this.endX = this.stickPointX;
      this.endY = this.stickPointY;
      this.startX = this.endX + width;
      this.startY = this.endY + height;
    }
    if (width > 0 && height < 0) {
      this.startX = this.stickPointX;
      this.startY = this.stickPointY + height;
      this.endX = this.startY - height;
      this.endY = this.stickPointY
    }
    if (width < 0 && height > 0) {
      this.startY = this.stickPointY;
      this.endX = this.stickPointX;
      this.startX = this.endX + width;
      this.endY = this.startY + height;
    }
    this.drawCanvas();
  }
}

export { captureRender };
