import Arrow from "./Arrow";

export default class Line extends Arrow {
    endX = 0;
    endY = 0;
    maxX = 0;
    maxY = 0;
    minX = 0;
    minY = 0;
    currentPathX: number[];
    currentPathY: number[];
    path2d = new Path2D();
    tempPath2d = [] as { id: string, path: Path2D }[];
    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        super(canvas, w, h);
        this.currentPathX = [];
        this.currentPathY = [];
    }
    line() {
        if (!this.ctx) return;
        this.ctx.beginPath();
        if (!(this.startX > 0 && this.startY > 0)) return;
        if (!(this.currentPathX.length > 0 && this.currentPathY.length > 0)) return;
        if (this.currentPathX.length > 0 && this.currentPathY.length > 0) {
            for (let i = 0; i < this.currentPathX.length; i++) {
                this.ctx.lineTo(this.currentPathX[i], this.currentPathY[i]);
            }
        } else {
            this.ctx.moveTo(this.startX, this.startY);
        }

        this.ctx.stroke();
    }
    checkPointinPath(x: number, y: number) {
        return this.ctx?.isPointInStroke(this.path2d, x, y);
    }
    addXY(x: number, y: number) {
        this.currentPathX.push(x);
        this.currentPathY.push(y);
        this.path2d.lineTo(x, y);
    }
    draw() {
        if (!this.ctx) return;
        this.ctx.setLineDash([]);
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.lineWidth;
        this.line();
        if (this.currentPathX.length > 0 && this.currentPathY.length > 0) {
            this.getMaxMin();
            this.ctx.strokeStyle = this.showPoint ? this.strokeColor : this.hidePointColor;
            this.ctx.setLineDash([5, 15]);
            this.ctx.strokeRect(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
        }
    }
    compareMax(a: number, b: number) {
        return Math.max(a, b);
    }
    compareMin(a: number, b: number) {
        return Math.min(a, b);
    }
    getMaxMin() {
        const xArr = this.currentPathX.toSorted((a, b) => a - b);
        const yArr = this.currentPathY.toSorted((a, b) => a - b);
        const xLen = xArr.length - 1;
        const yLen = yArr.length - 1;
        this.minX = xArr[0];
        this.maxX = xArr[xLen];
        this.minY = yArr[0];
        this.maxY = yArr[yLen];
    }
    getRectBorder(x: number, y: number) {
        return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
    }
    setHistory() {
        this.history.push({
            currentPathX: [...this.currentPathX],
            currentPathY: [...this.currentPathY],
        });
        this.path2d = new Path2D();
        if (this.currentPathX.length > 0 && this.currentPathY.length > 0) {
            for (let i = 0; i < this.currentPathX.length; i++) {
                this.path2d.lineTo(this.currentPathX[i], this.currentPathY[i]);
            }
        } else {
            this.path2d.moveTo(this.startX, this.startY);
        }
    }
    getHistory(item: any) {
        this.currentPathX = item.currentPathX;
        this.currentPathY = item.currentPathY;
        this.path2d = new Path2D();
        if (this.currentPathX.length > 0 && this.currentPathY.length > 0) {
            for (let i = 0; i < this.currentPathX.length; i++) {
                this.path2d.lineTo(this.currentPathX[i], this.currentPathY[i]);
            }
        } else {
            this.path2d.moveTo(this.startX, this.startY);
        }
    }
    getResult(content: OffscreenCanvasRenderingContext2D) {
        content.strokeStyle = this.strokeColor;
        content.lineWidth = this.lineWidth;
        content.beginPath();
        if (!(this.startX > 0 && this.startY > 0)) return;
        if (!(this.currentPathX.length > 0 && this.currentPathY.length > 0)) return;
        if (this.currentPathX.length > 0 && this.currentPathY.length > 0) {
            for (let i = 0; i < this.currentPathX.length; i++) {
                content.lineTo(this.currentPathX[i], this.currentPathY[i]);
            }
        } else {
            content.moveTo(this.startX, this.startY);
        }
        content.stroke();
    }
}