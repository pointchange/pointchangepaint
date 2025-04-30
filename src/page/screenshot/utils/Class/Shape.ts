export default class Shape {
    shape = null as any;
    shapes = [] as any;
    working = null as any;
    des = '';
    constructor() {

    }
    addShape() {
        this.shapes.push(this.shape);
    }
    changeShapeStyle(lc = '', lw = 0) {
        if (lc) {
            this.working.strokeColor = lc;
        }
        if (lw) {
            this.working.lineWidth = lw;
        }
    }
    getShape(x: number, y: number) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            if (shape.getRectBorder(x, y)) {
                // this.working = shape;
                return shape;
            }
        }
        return null;
    }
    cancelSelectShape() {
        if (this.shapes.length > 0) {
            for (const ss of this.shapes) {
                ss.showPoint = false;
            }
        }
    }

    undo(str: string) {
        if (this.shapes.length === 0) return;
        const lastShape = this.shapes[this.shapes.length - 1];
        if (lastShape.history.length > 1) {
            const h = lastShape.history[lastShape.history.length - 2];
            lastShape.getHistory(h);
            lastShape.history.pop();
        } else {
            this.shapes.pop();
        }

        return;
        switch (str) {
            case 'rect':
                break;
            case 'clicle':
                break;

            case 'rect':
                break;
            case 'rect':
                break;
            case 'rect':
                break;
        }
    }
}