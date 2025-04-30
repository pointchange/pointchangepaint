import Rect from "./Rect";

export default class CanvasText extends Rect {
    content = '';
    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        super(canvas, w, h);
    }

    text() {
        if (this.content.length === 0) return;
        if (!this.ctx) return;
        this.ctx.textBaseline = 'bottom';
        this.ctx.font = `${this.lineWidth}px sans-serif`;
        this.ctx.fillStyle = this.strokeColor;
        this.ctx.setLineDash([]);
        const text = this.ctx.measureText(this.content);
        const arr = this.content.split('\n');
        for (let i = 0; i < arr.length; i++) {
            this.ctx.fillText(arr[i], this.startX, this.startY + text.fontBoundingBoxAscent * (i + 1));
        }
        this.ctx.setLineDash([5, 15]);
        this.ctx.strokeStyle = this.showPoint ? this.strokeColor : this.hidePointColor;
        this.ctx.strokeRect(this.startX, this.startY, this.width, this.height);
    }
    draw() {
        this.text();
    }
    getRectBorder(x: number, y: number) {
        return x >= this.startX && x <= this.startX + this.width && y >= this.startY && y <= this.startY + this.height;
    }
    setHistory() {
        this.history.push({
            startX: this.startX,
            startY: this.startY,
            width: this.width,
            height: this.height,
        })
    }
    getHistory(item: any) {
        this.startX = item.startX;
        this.startY = item.startY;
        this.width = item.width;
        this.height = item.height;
    }
    getResult(content: OffscreenCanvasRenderingContext2D) {
        content.strokeStyle = this.strokeColor;
        content.lineWidth = this.lineWidth;
        content.textBaseline = 'bottom';
        content.font = `${this.lineWidth}px sans-serif`;
        content.fillStyle = this.strokeColor;
        content.setLineDash([]);
        const text = content.measureText(this.content);
        const arr = this.content.split('\n');
        for (let i = 0; i < arr.length; i++) {
            content.fillText(arr[i], this.startX, this.startY + text.fontBoundingBoxAscent * (i + 1));
        }
    }
}