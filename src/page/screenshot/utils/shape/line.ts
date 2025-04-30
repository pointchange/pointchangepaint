import pinia from "@screenshot/store";
import { useScreenCut } from "@screenshot/store/screenCut";
import { operated, removeDocumentListen } from "../operate";
import { notOffMask } from "../range";
import Line from "../Class/Line";

const shapeStore = useScreenCut(pinia);
const s = shapeStore.shape;
function createLine(drawRef: HTMLCanvasElement, operationHandle = () => { }) {
    document.onmousedown = (e) => {
        if (document.body.style.cursor !== 'default') return;
        s.working = new Line(drawRef, shapeStore.screenX, shapeStore.screenY);
        s.working.describe = 'line';
        s.working.strokeColor = shapeStore.lineColor;
        s.working.lineWidth = shapeStore.lineWidth;
        shapeStore.cancelSelectShape()
        let startX = e.clientX;
        let startY = e.clientY;
        const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();

        let onceOperate = false;
        let changeStartXYonce = false;
        document.onmousemove = (e) => {
            if (!onceOperate) {
                onceOperate = true;
                s.working.draw();
                shapeStore.addShape();
            }
            let { clientX: currentX, clientY: currentY } = e;
            let reasonableRangeX = notOffMask(currentX, x, dx);
            let reasonableRangeY = notOffMask(currentY, y, dy);
            if (!changeStartXYonce) {
                changeStartXYonce = true;
                s.working.startX = startX;
                s.working.startY = startY;
            }
            s.working.addXY(reasonableRangeX, reasonableRangeY);
        }
        document.onmouseup = () => {
            shapeStore.addHistory();
            removeDocumentListen();
            operationHandle();
        }
    }
}
function lineMove(shape: any, i: number, operationHandle: Function) {
    document.onmousedown = (e) => {
        const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
        const { clientX: startX, clientY: startY } = e;
        shapeStore.shapeWorkingStyle(shape);
        let arr1 = [] as number[];
        let arr2 = [] as number[];;
        for (let i = 0; i < shape.currentPathX.length; i++) {
            arr1.push(shape.currentPathX[i] - startX);
            arr2.push(shape.currentPathY[i] - startY);
        }
        const { minX, maxX, minY, maxY } = shape;
        let x1 = startX - minX,
            y1 = startY - minY,
            x2 = startX - maxX,
            y2 = startY - maxY,
            cx = 0,
            cy = 0;
        document.onmousemove = (e) => {
            const { clientX: currentX, clientY: currentY } = e;
            const moveX = minX + currentX - startX;
            const moveY = minY + currentY - startY;
            const moveEX = maxX + currentX - startX;
            const moveEY = maxY + currentY - startY;
            if (moveX <= x || moveEX >= x + dx) {
                if (moveY <= y) {
                    cy = y + y1;
                } else if (moveEY >= y + dy) {
                    cy = y + dy + y2;
                } else {
                    cy = currentY;
                }
            } else {
                if (moveY <= y || moveEY >= y + dy) {
                    if (moveX <= x) {
                        cx = x + x1;
                    } else if (moveEX >= x + dx) {
                        cx = x + dx + x2;
                    } else {
                        cx = currentX;
                    }
                } else {
                    cx = currentX;
                    cy = currentY;
                }
            }
            if (maxX - minX >= dx) {
                cx = 0 + startX;
            }
            if (maxY - minY >= dy) {
                cy = 0 + startY;
            }

            for (let i = 0; i < shape.currentPathX.length; i++) {
                shape.currentPathX[i] = arr1[i] + cx;
                shape.currentPathY[i] = arr2[i] + cy;
            }
        }
        document.onmouseup = () => {
            operated(s.shapes, shape, i);
            removeDocumentListen();
            operationHandle()
        }
    }
}

export {
    createLine,
    lineMove,
}