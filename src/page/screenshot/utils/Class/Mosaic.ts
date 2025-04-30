import Arrow from "./Arrow";

export default class Mosaic extends Arrow {
    imgData: ImageData | undefined;
    mosaicSize = 10;
    mosaicX = [] as number[];
    mosaicY = [] as number[];
    constructor(canvas: HTMLCanvasElement, w = 0, h = 0) {
        super(canvas, w, h);
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })
        if (!this.ctx) return;
        this.imgData = this.ctx.getImageData(0, 0, this.w, this.h);
    }
    createMosaic(x: number, y: number) {
        if (!this.imgData) return;
        this.mosaicSize = this.lineWidth;
        const mosaicSizeHalf = this.mosaicSize / 2;
        let color = this.getCurrentPixel(this.imgData, x, y);
        for (let i = 0; i < this.mosaicSize; i++) {
            for (let k = 0; k < this.mosaicSize; k++) {
                this.setCurrentPixel(this.imgData, x + i - mosaicSizeHalf, y + k - mosaicSizeHalf, color);
            }
        }
        this.ctx?.putImageData(this.imgData, 0, 0);
    }
    getCurrentPixel(imgData: ImageData, x: number, y: number) {
        const w = imgData.width;
        const d = imgData.data;
        let color = new Array(4);
        for (let i = 0; i < color.length; i++) {
            color[i] = d[4 * (y * w + x) + i];
        }
        return color;
    }
    setCurrentPixel(imgData: ImageData, x: number, y: number, color: any[]) {
        const w = imgData.width;
        const d = imgData.data;
        let emptyArr = new Array(4);
        for (let i = 0; i < emptyArr.length; i++) {
            d[4 * (y * w + x) + i] = color[i]
        }
    }
    setHistory() {
        if (!this.imgData) return;
        return { imgData: new ImageData(new Uint8ClampedArray(this.imgData.data), this.w, this.h) };
    }
    getHistory(item: any) {
        this.imgData = item.imgData;
        if (!this.imgData) return;
        this.ctx?.putImageData(item.imgData, 0, 0);
    }
    getResult(content: OffscreenCanvasRenderingContext2D): void {
        if (!this.imgData) return;
        content.putImageData(this.imgData, 0, 0);
    }
}