class captureRender extends Event {
    constructor($canvas, $bg, imgSrc, screenMaxWidth, screenMaxHeight, scaleFactor) {
        super([arguments]);
        this.$canvas = $canvas;
        this.$bg = $bg;
        this.imgSrc = imgSrc;
        this.screenMaxWidth = screenMaxWidth;
        this.screenMaxHeight = screenMaxHeight;
        this.scaleFactor = scaleFactor;
        this.init();
    }
    async init() {
        this.$bg.style.backgroundImage = `url(${this.imgSrc})`;
        this.$bg.style.backgroundSize = `${this.screenMaxWidth}px ${this.screenMaxHeight}px`;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = await new Promise(resolve => {
            const img = new Image();
            img.src = this.imgSrc;
            if (img.complete) resolve(img);
            else img.onload = () => resolve(img);
        })

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        // 存储原始背景，为后续截取作准备
        this.$originBackground = ctx;
        this.onMouseMove();
    }
    // To-DO: 设计实现截图框并将其显示在画布上
    onMouseMove() {
        
    }
}

export {captureRender};