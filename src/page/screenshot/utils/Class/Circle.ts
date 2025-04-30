import Rect from "./Rect";

export default class Circle extends Rect {
    rotation = 0
    startAngle = 0
    endAngle = 2 * Math.PI
    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        super(canvas, w, h);
    }

    ellipse() {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.ellipse(
            this.startX + this.width / 2,
            this.startY + this.height / 2,
            Math.abs(this.width / 2),
            Math.abs(this.height / 2),
            this.rotation,
            this.startAngle,
            this.endAngle
        );
        this.ctx.stroke();
    }
    draw() {
        if (!this.ctx) return;
        this.point();
        this.get8PointMin();
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash([]);
        this.ellipse();
        this.ctx.setLineDash([5, 15]);
        this.ctx.strokeStyle = this.showPoint ? this.strokeColor : this.hidePointColor;
        this.ctx.strokeRect(this.startX, this.startY, this.width, this.height);
    }
    getResult(content: OffscreenCanvasRenderingContext2D) {
        content.strokeStyle = this.strokeColor;
        content.lineWidth = this.lineWidth;
        content.beginPath();
        content.ellipse(
            this.startX + this.width / 2,
            this.startY + this.height / 2,
            Math.abs(this.width / 2),
            Math.abs(this.height / 2),
            this.rotation,
            this.startAngle,
            this.endAngle
        );
        content.stroke();
    }
}