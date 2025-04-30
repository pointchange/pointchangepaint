import pinia from "@screenshot/store";
import { useScreenCut } from "@screenshot/store/screenCut";
import { operated, removeDocumentListen } from "../operate";
import Arrow from "../Class/Arrow";
import { notOffMask } from "../range";
const shapeStore = useScreenCut(pinia);
const s = shapeStore.shape;
function arrowUp(shape: any, i: number, operationHandle: Function) {
    document.onmouseup = () => {
        operated(shapeStore.shape.shapes, shape, i);
        removeDocumentListen();
        operationHandle()
    }
}
function arrowMove(xy: number[], shape: any, i: number, operationHandle: Function) {
    document.onmousedown = (e) => {
        shapeStore.shapeWorkingStyle(shape);
        const { clientX: startX, clientY: startY } = e;
        const sx = shape.startX;
        const sy = shape.startY;
        const ex = shape.endX;
        const ey = shape.endY;
        const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
        document.onmousemove = (e) => {
            const { clientX: currentX, clientY: currentY } = e;
            const moveX = sx + currentX - startX;
            const moveY = sy + currentY - startY;
            const moveEX = ex + currentX - startX;
            const moveEY = ey + currentY - startY;
            shape.startX = shape.getDirection(moveX, x, x + dx);
            shape.startY = shape.getDirection(moveY, y, y + dy);
            shape.endX = shape.getDirection(moveEX, x, x + dx);
            shape.endY = shape.getDirection(moveEY, y, y + dy);
        }
        arrowUp(shape, i, operationHandle);

    }
    if (shape.is2Point(...xy) && shape.showPoint) {
        document.body.style.cursor = 'grab';

        document.onmousedown = (e) => {
            shapeStore.shapeWorkingStyle(shape);

            const { clientX: startX, clientY: startY } = e;
            const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
            const ex = shape.endX;
            const ey = shape.endY;
            const sx = shape.startX;
            const sy = shape.startY;
            shape.compare2point(startX, startY);
            document.onmousemove = (e) => {
                const { clientX: currentX, clientY: currentY } = e;
                const moveX = currentX - startX;
                const moveY = currentY - startY;
                if (shape.dragStart) {
                    shape.startX = shape.getDirection(sx + moveX, x, x + dx);
                    shape.startY = shape.getDirection(sy + moveY, y, y + dy);
                } else {
                    shape.endX = shape.getDirection(ex + moveX, x, x + dx);
                    shape.endY = shape.getDirection(ey + moveY, y, y + dy);
                }
            }
            arrowUp(shape, i, operationHandle);
        }
    }
}
function createArrow(drawRef: HTMLCanvasElement, operationHandle: Function) {
    document.onmousedown = (e) => {
        if (document.body.style.cursor !== 'default') return;
        let startX = e.clientX;
        let startY = e.clientY;
        shapeStore.resetShapeStyle();
        const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
        s.working = new Arrow(drawRef, shapeStore.screenX, shapeStore.screenY);
        s.working.describe = 'arrow';
        s.working.strokeColor = shapeStore.lineColor;
        s.working.lineWidth = shapeStore.lineWidth;
        shapeStore.cancelSelectShape()
        let onceOperate = false;
        s.working.startX = startX;
        s.working.startY = startY;
        document.onmousemove = (e) => {
            if (!onceOperate) {
                onceOperate = true;
                s.working.draw();
                shapeStore.addShape();
            }
            let { clientX: currentX, clientY: currentY } = e;
            let reasonableRangeX = notOffMask(currentX, x, dx);
            let reasonableRangeY = notOffMask(currentY, y, dy);
            s.working.endX = reasonableRangeX;
            s.working.endY = reasonableRangeY;
        };

        document.onmouseup = () => {
            shapeStore.addHistory();
            removeDocumentListen();
            operationHandle();
        };
    }
}
export { arrowMove, createArrow }