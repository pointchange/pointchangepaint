import { defineStore } from 'pinia'

export const useScreenCut = defineStore('screenCut', {
    state: () => ({
        screenX: window.screen.width,
        screenY: window.screen.height,
        imageProtocol: 'local-img://',
        path: '',
        lineWidth: 2.0,
        lineColor: '#d03050',
        fontSize: 24,
        mask: null as any,
        shape: {
            working: null as any,
            shapes: [] as any,
            des: '',
        },
        activeShape: {
            rect: false,
            circle: false,
            arrow: false,
            mosaic: false,
            line: false,
            text: false,
        } as ActiveShape,
        textInfo: {
            x: 0,
            y: 0,
            show: false,
            content: '',
            resize: false,
        },
        mosaicInfo: {
            x: 0,
            y: 0,
            show: false,
            size: 10,
            saveImageData: [] as ImageData[]
        }
    }),
    actions: {
        resetShape() {
            this.shape.working = null;
            this.shape.shapes.length = 0;
            this.shape.des = '';
        },
        resetTextInfo() {
            this.textInfo.x = 0;
            this.textInfo.y = 0;
            this.textInfo.show = false;
            this.textInfo.content = '';
            this.textInfo.resize = false;
        },
        resetShapeStyle() {
            this.lineWidth = 2.0;
            this.lineColor = '#d03050';
        },
        resetMosaicInfo() {
            this.mosaicInfo.x = 0;
            this.mosaicInfo.y = 0;
            this.mosaicInfo.show = false;
            this.mosaicInfo.size = 10;
            this.mosaicInfo.saveImageData.length = 0;
        },
        addShape() {
            this.shape.shapes.push(this.shape.working);
        },
        addHistory() {
            if (this.shape.working.describe === 'mosaic') {
                const res = this.shape.working.setHistory();
                if (!Array.isArray(this.mosaicInfo.saveImageData)) {
                    this.mosaicInfo.saveImageData = [];
                }
                this.mosaicInfo.saveImageData.push(res);
                return;
            }
            this.shape.working.setHistory();
        },
        getShape(x: number, y: number) {
            for (let i = this.shape.shapes.length - 1; i >= 0; i--) {
                const s = this.shape.shapes[i];
                if (s.getRectBorder(x, y)) {
                    return { s, i };
                }
            }
            return null;
        },
        cancelSelectShape() {
            if (this.shape.shapes.length > 0) {
                for (const ss of this.shape.shapes) {
                    ss.showPoint = false;
                }
            }
        },
        selectShape(str = '', alawy = false) {
            for (const shape in this.activeShape) {
                if (str === shape) {
                    this.activeShape[shape] = alawy ? true : !this.activeShape[shape];
                } else {
                    this.activeShape[shape] = false;
                }
            }
        },
        shapeWorkingStyle(shape: any) {
            this.cancelSelectShape()
            if (!shape) return;
            this.selectShape(shape.describe, true);
            this.shape.working = shape;
            this.shape.working.showPoint = true;
            this.lineColor = this.shape.working.strokeColor;
            this.lineWidth = this.shape.working.lineWidth;
            this.mosaicHandle();
        },
        mosaicHandle() {
            this.mosaicInfo.show = false;
            window.onmousemove = null;
        },
        undo() {
            const lastIndex = this.shape.shapes.length - 1;
            if (lastIndex < 0) return;
            const lastShape = this.shape.shapes[lastIndex];
            if (this.shape.shapes[lastIndex].describe === 'mosaic') {
                this.shape.shapes.pop();
                if (!this.mosaicInfo.saveImageData) return;
                const lastMosaicIndex = this.mosaicInfo.saveImageData.length - 1;
                const imageData = this.mosaicInfo.saveImageData[lastMosaicIndex];
                lastShape.getHistory(imageData);
                this.mosaicInfo.saveImageData.pop();
                return;
            }
            const lastHistoryIndex = lastShape.history.length - 1;
            if (lastHistoryIndex > 0) {
                const h = lastShape.history[lastHistoryIndex - 1];
                lastShape.getHistory(h);
                lastShape.history.pop();
            } else {
                this.shape.shapes.pop();
            }
        }
    }
})
