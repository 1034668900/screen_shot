class captureRender extends Event {
  isMouseDown = false;
  startX = 0;
  startY = 0;
  endX = 0;
  endY = 0;
  shotRect = null;

  constructor(
    $canvas,
    $bg,
    $toolBar,
    imgSrc,
    screenMaxWidth,
    screenMaxHeight,
    screenScaleFactor
  ) {
    super([arguments]);

    this.$canvas = $canvas;
    this.ctx = $canvas.getContext("2d");

    this.$bg = $bg;
    this.$toolBar = $toolBar;
    this.toolBarWidth = parseInt(getComputedStyle(this.$toolBar).width);
    this.imgSrc = imgSrc;
    this.screenMaxWidth = screenMaxWidth;
    this.screenMaxHeight = screenMaxHeight;
    this.screenScaleFactor = screenScaleFactor;
    this.init();
  }
  async init() {
    this.$bg.style.backgroundImage = `url(${this.imgSrc})`;
    this.$bg.style.backgroundSize = `${this.screenMaxWidth}px ${this.screenMaxHeight}px`;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = await new Promise((resolve) => {
      const img = new Image();
      img.src = this.imgSrc;
      if (img.complete) resolve(img);
      else img.onload = () => resolve(img);
    });

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    document.body.appendChild(canvas);
    // 存储原始背景，为后续截取作准备
    this.$originBackground = ctx;
    this.addListenerForWindow();
  }
  // To-DO: 设计实现截图框并将其显示在画布上

  addListenerForWindow() {
    window.addEventListener("mousedown", (e) => {
      this.isMouseDown = true;
      this.startX = e.screenX;
      this.startY = e.screenY;
      this.hideToolBar();
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.isMouseDown) return;
      this.endX = e.screenX;
      this.endY = e.screenY;
      this.drawRectangle();
    });
    window.addEventListener("mouseup", (e) => {
      this.isMouseDown = false;
      this.showToolBar();
    });
  }
  drawRectangle() {
    const startX = Math.min(this.startX, this.endX);
    const startY = Math.min(this.startY, this.endY);
    const endX = Math.max(this.startX, this.endX);
    const endY = Math.max(this.startY, this.endY);
    this.endX = endX;
    this.endY = endY;
    const width = endX - startX;
    const height = endY - startY;
    const screenScaleFactor = this.screenScaleFactor;
    const margin = 7;

    this.shotRect = { startX, startY, width, height };

    this.$canvas.width = (width + margin * 2) * screenScaleFactor;
    this.$canvas.height = (height + margin * 2) * screenScaleFactor;
    this.$canvas.style.position = "absolute";
    this.$canvas.style.left = `${startX - margin}px`;
    this.$canvas.style.top = `${startY - margin}px`;
    this.$canvas.style.display = "block";
    this.$canvas.style.width = `${width + margin * 2}px`;
    this.$canvas.style.height = `${height + margin * 2}px`;
    if (width && height) {
      const imageDataURL = this.$originBackground.getImageData(
        startX * screenScaleFactor,
        startY * screenScaleFactor,
        width * screenScaleFactor,
        height * screenScaleFactor
      );
      this.ctx.putImageData(
        imageDataURL,
        margin * screenScaleFactor,
        margin * screenScaleFactor
      );
    }
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.strokeStyle = "#67BADE";
    this.ctx.lineWidth = 2 * screenScaleFactor;
    this.ctx.strokeRect(
      margin * screenScaleFactor,
      margin * screenScaleFactor,
      width * screenScaleFactor,
      height * screenScaleFactor
    );
  }
  showToolBar() {
    this.$toolBar.style.left = `${this.endX - this.toolBarWidth}px`;
    this.$toolBar.style.top = `${this.endY + 10}px`;
    this.$toolBar.style.display = "flex";
  }
  hideToolBar() {
    this.$toolBar.style.display = "none";
  }
  getShotRectImageURL() {
    const { startX, startY, width, height } = this.shotRect;
    const screenScaleFactor = this.screenScaleFactor;
    if (width && height) {
      const imageDataURL = this.$originBackground.getImageData(
        startX * screenScaleFactor,
        startY * screenScaleFactor,
        width * screenScaleFactor,
        height * screenScaleFactor
      );
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      ctx.putImageData(imageDataURL, 0, 0);
      return canvas.toDataURL();
    }
    return null;
  }
}

export { captureRender };
