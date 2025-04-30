export default class Point {
    x = 0
    y = 0
    i = 0
    w: number
    h: number
    rectX = 0
    rectY = 0
    constructor(w = 0, h = 0) {
        this.w = w;
        this.h = h;
    }
    getRectRange(x = 0, y = 0) {
        // return (x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h)
        return (x >= this.x - this.w && x <= this.x + this.w && y >= this.y - this.h && y <= this.y + this.h)
    }
    getOrigin() {
        return {
            x: this.x + this.w / 2,
            y: this.y + this.h / 2
        }
    }
}