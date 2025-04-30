import Rect from "./Rect";

export default class BgCanvas extends Rect {

    maskColor = '';
    img = new Image();
    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        super(canvas, w, h);
    }
    drawImg(img: HTMLImageElement) {
        this.img = img;
        this.ctx?.drawImage(img, 0, 0, this.w, this.h);
    }
    mask() {
        if (!this.ctx) return;
        this.ctx.fillStyle = this.maskColor;
        this.ctx.fillRect(0, 0, this.w, this.h);
    }

    rect() {
        if (!this.ctx) return;
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.strokeRect(this.startX, this.startY, this.width, this.height);
        this.ctx.clearRect(this.startX, this.startY, this.width, this.height);
    }

    drawing() {
        if (!this.ctx) return;
        this.mask();
        this.rect();
        this.point();
        this.get8PointMin();
    }

    reset() {
        this.startX = 0;
        this.startY = 0;
        this.width = 0;
        this.height = 0;
    }
    getNotMaskRangeData() {
        return {
            x: this.originX,
            dx: Math.abs(this.width),
            y: this.originY,
            dy: Math.abs(this.height)
        }
    }
    isMaskRange(currentX: number, currentY: number) {
        const { x, dx, y, dy } = this.getNotMaskRangeData();
        return currentX >= x && currentX <= x + dx && currentY >= y && currentY <= y + dy;
    }

    getResult(content: OffscreenCanvasRenderingContext2D, str = 'bg') {
        if (str === 'bg') {
            content.drawImage(this.img, 0, 0, this.w, this.h);
            return null;
        } else {
            let [startX, startY, width, height] = [this.startX, this.startY, this.width, this.height];
            return { startX, startY, width, height };
        }
    }
}

