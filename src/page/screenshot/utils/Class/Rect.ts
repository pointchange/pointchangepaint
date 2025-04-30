import Point from "./Point";


export default class Rect {
    canvas: HTMLCanvasElement;
    w: number;
    h: number;
    ctx: CanvasRenderingContext2D | null;
    x = 0;
    y = 0;
    width = 0;
    height = 0;
    startX = 0;
    startY = 0;
    color = '#000';
    lineWidth = 4.0;
    pointW = 6;
    pointH = 6;
    strokeColor = '';
    pointCursorstr = [
        'nwse',
        'ns',
        'nesw',
        'ew',
        'nwse',
        'ns',
        'nesw',
        'ew',
    ];
    rectChunks = [
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
        new Point(this.pointW, this.pointH),
    ];
    originX = 0;
    originY = 0;
    showPoint = false;
    hidePointColor = 'transparent';
    describe = '';
    history = [] as any;

    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        this.canvas = canvas;
        this.w = w;
        this.h = h;
        this.ctx = this.canvas.getContext('2d');
        this.color = this.hidePointColor;
    }
    get8PointMin() {
        this.originX = this.rectChunks[0].x;
        this.originY = this.rectChunks[0].y;
        this.rectChunks.forEach(shape => {
            if (shape.y <= this.originY && shape.x <= this.originX) {
                this.originX = shape.x + this.pointW / 2;
                this.originY = shape.y + this.pointH / 2;
            }
        });
    }
    fillRectHandle(i = 0, x: number, y: number) {
        if (!this.ctx) return;
        this.ctx.fillRect(x, y, this.pointW, this.pointH);
        this.rectChunks.forEach((point, index) => {
            if (i === index) {
                point.x = x;
                point.y = y;
                point.i = i;
            }
        });
    }
    point() {
        if (!this.ctx) return;
        const dx = this.width;
        const dy = this.height;
        const x1 = this.startX - this.pointW / 2;
        const y1 = this.startY - this.pointH / 2;

        this.ctx.fillStyle = this.showPoint ? this.strokeColor : this.hidePointColor;
        // this.ctx.fillStyle = this.strokeColor;
        this.fillRectHandle(0, x1, y1);
        this.fillRectHandle(1, x1 + dx / 2, y1);
        this.fillRectHandle(2, x1 + dx, y1);
        this.fillRectHandle(3, x1 + dx, y1 + dy / 2);
        this.fillRectHandle(4, x1 + dx, y1 + dy);
        this.fillRectHandle(5, x1 + dx / 2, y1 + dy);
        this.fillRectHandle(6, x1, y1 + dy);
        this.fillRectHandle(7, x1, y1 + dy / 2);
    }
    draw() {
        if (!this.ctx) return;
        this.point();
        this.get8PointMin();
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;
        this.ctx.setLineDash([]);
        this.ctx.strokeRect(this.startX, this.startY, this.width, this.height);
    }
    getRectRange(x = 0, y = 0) {
        if (this.width > 0 && this.height < 0) {
            return (x > this.startX && x < this.startX + this.width && y < this.startY && y > this.startY + this.height)
        } else if (this.width < 0 && this.height < 0) {
            return (x < this.startX && x > this.startX + this.width && y < this.startY && y > this.startY + this.height)
        } else if (this.width < 0 && this.height > 0) {
            return (x < this.startX && x > this.startX + this.width && y > this.startY && y < this.startY + this.height)
        } else {
            return (x > this.startX && x < this.startX + this.width && y > this.startY && y < this.startY + this.height)
        }
    }
    getRange(x = 0, y = 0) {
        return (x === this.startX || x === this.startX + this.width || y === this.startY || y === this.startY + this.height)
    }
    getRectBorder(x: number, y: number) {
        const lw = this.lineWidth === 1 ? this.lineWidth : this.lineWidth / 2;

        const w = Math.abs(this.width);
        const h = Math.abs(this.height);
        const x1 = this.originX - lw;
        const x2 = this.originX + lw;
        const x3 = x2 + w - lw;
        const x4 = x2 + w + lw;

        const y1 = this.originY - lw;
        const y2 = this.originY + lw;
        const y3 = y2 + h - lw;
        const y4 = y2 + h + lw;

        const xL = x >= x1 && x <= x2;
        const xR = x >= x3 && x <= x4;

        const xOuter = x >= x1 && x <= x4;
        const xinner = x >= x2 && x <= x3;

        const yOuter = y >= y1 && y <= y4;
        const yinner = y >= y2 && y <= y3;

        const yT = y >= y1 && y <= y2;
        const yB = y >= y3 && y <= y4;

        return (xL && yOuter) || (xR && yinner) || (yT && xOuter) || (yB && xinner);
    }
    sortPoints() {
        // 01234567
        // 21076543
        // 45670123
        // 65432107
        let i = 0;
        if (this.width < 0 && this.height > 0) {
            i = 2;
        } else if (this.width < 0 && this.height < 0) {
            let arr1 = this.rectChunks.filter((_v, index) => index < 4);
            let arr2 = this.rectChunks.filter((_v, index) => index >= 4);
            return [...arr2, ...arr1];
        } else if (this.width > 0 && this.height < 0) {
            i = 6;
        } else {
            return this.rectChunks;
        }
        //分为两个数组 
        //再sort
        //再合并
        let arr1 = this.rectChunks.filter((_v, index) => index <= i).toSorted((a, b) => b.i - a.i);
        let arr2 = this.rectChunks.filter((_v, index) => index > i).toSorted((a, b) => b.i - a.i);
        return [...arr1, ...arr2];
    }
    is8Point(x: number | undefined, y: number | undefined) {
        return this.rectChunks.some(v => v.getRectRange(x, y));
    }
    setHistory() {
        this.history.push({
            startX: this.startX,
            startY: this.startY,
            width: this.width,
            height: this.height,
        })
    }
    getHistory(item: { startX: number; startY: number; width: number; height: number; }) {
        this.startX = item.startX;
        this.startY = item.startY;
        this.width = item.width;
        this.height = item.height;
    }
    getResult(content: OffscreenCanvasRenderingContext2D) {
        content.strokeStyle = this.strokeColor;
        content.lineWidth = this.lineWidth;
        content.strokeRect(this.startX, this.startY, this.width, this.height);
    }

}