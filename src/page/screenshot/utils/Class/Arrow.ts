import Point from "./Point";
import Rect from "./Rect";

export default class Arrow extends Rect {
    endX = 0;
    endY = 0;
    arrowHeadLen = 20;
    angle = 0;
    arrowHeadX1 = 0;
    arrowHeadY1 = 0;
    arrowHeadX2 = 0;
    arrowHeadY2 = 0;
    points = [
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH)
    ];
    dragStart = false;
    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        super(canvas, w, h);
    }

    getHeadArrow() {
        this.angle = Math.atan2(this.endY - this.startY, this.endX - this.startX);
        this.arrowHeadX1 = this.endX - this.arrowHeadLen * Math.cos(this.angle - Math.PI / 6);
        this.arrowHeadY1 = this.endY - this.arrowHeadLen * Math.sin(this.angle - Math.PI / 6);
        this.arrowHeadX2 = this.endX - this.arrowHeadLen * Math.cos(this.angle + Math.PI / 6);
        this.arrowHeadY2 = this.endY - this.arrowHeadLen * Math.sin(this.angle + Math.PI / 6);
    }
    fillRectHandle(i = 0, x: number, y: number) {
        if (!this.ctx) return;
        this.ctx.fillRect(x, y, this.pointW, this.pointH);
        this.points.forEach((point, index) => {
            if (i === index) {
                point.x = x;
                point.y = y;
                point.i = i;
            }
        });
    }
    drawPoint() {
        if (!this.ctx) return;
        const { startX: sx, startY: sy, pointH: h, pointW: w, endY: ey, endX: ex } = this;
        const x1 = sx - w / 2;
        const y1 = sy - h / 2;
        const x2 = ex - w / 2;
        const y2 = ey - h / 2;
        // this.ctx.fillStyle = this.strokeColor;
        // this.ctx.strokeStyle = '#fff';
        this.ctx.fillStyle = this.showPoint ? this.strokeColor : this.hidePointColor;
        // this.ctx.strokeRect(x1, y1, w, h);
        this.fillRectHandle(0, x1, y1);
        this.fillRectHandle(1, x2, y2);
        // this.ctx.strokeRect(x2, y2, w, h);
    }
    path() {
        if (!this.ctx) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY);
        this.ctx.lineTo(this.endX, this.endY);
        this.ctx.stroke();
        this.getHeadArrow();

        this.ctx.beginPath();
        this.ctx.moveTo(this.endX, this.endY);
        this.ctx.lineTo(this.arrowHeadX1, this.arrowHeadY1);
        this.ctx.moveTo(this.endX, this.endY);
        this.ctx.lineTo(this.arrowHeadX2, this.arrowHeadY2);
        this.ctx.stroke();
    }
    getRectBorder(x: number, y: number) {
        // 计算点到线段的最短距离
        const threshold = 2;
        const { startX, startY, endX, endY } = this;
        const dx = endX - startX;
        const dy = endY - startY;
        const t = ((x - startX) * dx + (y - startY) * dy) / (dx * dx + dy * dy);
        const nearestX = startX + t * dx;
        const nearestY = startY + t * dy;
        const distance = Math.sqrt((x - nearestX) * 2 + (y - nearestY) * 2);
        return distance <= threshold;
    }
    is2Point(x: number | undefined, y: number | undefined) {
        return this.points.some(v => v.getRectRange(x, y));
    }
    draw() {
        if (!this.ctx) return;
        this.drawPoint();
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash([]);
        this.path();
    }
    getDirection(moveX: number, from: number, to: number) {
        if (moveX <= from) {
            return from;
        } else if (moveX >= to) {
            return to;
        } else {
            return moveX;
        }
    }
    compare2point(x: number, y: number) {
        const p = this.points.filter(v => v.getRectRange(x, y))[0].getOrigin();
        this.dragStart = p.x === this.startX && p.y === this.startY;
    }
    setHistory() {
        this.history.push({
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY
        })
    }
    getHistory(item: any) {
        this.startX = item.startX;
        this.startY = item.startY;
        this.endX = item.endX;
        this.endY = item.endY;
    }
    getResult(content: OffscreenCanvasRenderingContext2D) {
        content.strokeStyle = this.strokeColor;
        content.lineWidth = this.lineWidth;
        content.beginPath();
        content.moveTo(this.startX, this.startY);
        content.lineTo(this.endX, this.endY);
        content.stroke();
        this.getHeadArrow();

        content.beginPath();
        content.moveTo(this.endX, this.endY);
        content.lineTo(this.arrowHeadX1, this.arrowHeadY1);
        content.moveTo(this.endX, this.endY);
        content.lineTo(this.arrowHeadX2, this.arrowHeadY2);
        content.stroke();
    }
}