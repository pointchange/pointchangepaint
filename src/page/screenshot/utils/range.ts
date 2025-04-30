function notOffScreen(x: number, w: number, from: number, to: number) {
    w = Math.abs(w);
    if (x <= from) {
        return from;
    } else if (x + w >= to) {
        return to - w;
    } else {
        return x;
    }
}
function notOffMask(currentPosition: number, from: number, to: number) {
    if (currentPosition >= from + to) {
        return from + to;
    } else if (currentPosition <= from) {
        return from;
    } else {
        return currentPosition;
    }
}
type Obj = {
    currentPosition: number
    shapeWH: number
    from: number
    to: number
    moveXY: number
    fnStartXY: number
}
function notOffMaskInDargChunk({ currentPosition, shapeWH, from, to, moveXY, fnStartXY }: Obj) {
    if (currentPosition <= from && fnStartXY + shapeWH <= from) {
        return from - fnStartXY;
    } else if (currentPosition >= to && fnStartXY + shapeWH >= to) {
        return to - fnStartXY;
    } else {
        return shapeWH + moveXY;
    }
}
export {
    notOffScreen, notOffMask, notOffMaskInDargChunk
}