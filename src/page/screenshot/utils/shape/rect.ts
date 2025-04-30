import pinia from "@screenshot/store";
import { useScreenCut } from "@screenshot/store/screenCut";
import { operated, removeDocumentListen } from "../operate";
import { notOffMask, notOffMaskInDargChunk, notOffScreen } from "../range";
import Rect from "../Class/Rect";
import Circle from "../Class/Circle";
const shapeStore = useScreenCut(pinia);
const s = shapeStore.shape;

function createRect(drawRef: HTMLCanvasElement, operationHandle: Function, shape = 'rect') {
    document.onmousedown = (e) => {
        if (document.body.style.cursor !== 'default') return;
        if (shape === 'rect') {
            s.working = new Rect(drawRef, shapeStore.screenX, shapeStore.screenY);
            s.working.describe = 'rect';
        } else {
            s.working = new Circle(drawRef, shapeStore.screenX, shapeStore.screenY);
            s.working.describe = 'circle';
        }
        const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
        s.working.strokeColor = shapeStore.lineColor;
        s.working.lineWidth = shapeStore.lineWidth;
        shapeStore.cancelSelectShape()
        let startX = e.clientX;
        let startY = e.clientY;
        if (s.working.describe !== 'line') {
            s.working.startX = startX;
            s.working.startY = startY;
        }
        let onceOperate = false;
        document.onmousemove = (e) => {
            if (!onceOperate) {
                onceOperate = true;
                s.working.draw();
                shapeStore.addShape();
            }
            let { clientX: currentX, clientY: currentY } = e;
            let reasonableRangeX = notOffMask(currentX, x, dx);
            let reasonableRangeY = notOffMask(currentY, y, dy);
            let moveX = reasonableRangeX - s.working.startX;
            let moveY = reasonableRangeY - s.working.startY;
            s.working.width = moveX;
            s.working.height = moveY;
        };

        document.onmouseup = () => {
            shapeStore.addHistory();
            removeDocumentListen();
            operationHandle();
        };
    }
}
function getReversePointIndex(i: number) {
    return i < 4 ? i + 4 : i - 4;
}
function changeWH(fn: Function, pointIndex: number, obj: { width: number; height: number; }) {
    fn();
    switch (pointIndex) {
        case 2: case 3:
            obj.width = obj.width > 0 ? obj.width : -obj.width;
            obj.height = obj.height > 0 ? -obj.height : obj.height;
            break;
        case 4: case 5:
            obj.width = Math.abs(obj.width);
            obj.height = Math.abs(obj.height);
            break;
        case 6: case 7:
            obj.width = obj.width > 0 ? -obj.width : obj.width;
            obj.height = obj.height > 0 ? obj.height : -obj.height;
            break;
        default:
            obj.width = obj.width > 0 ? -obj.width : obj.width;
            obj.height = obj.height > 0 ? -obj.height : obj.height;
            break;
    }
}
function rectMove({ clientX, clientY }: {
    clientX: number,
    clientY: number,
}, shape: any, i: number, operationHandle: Function) {
    document.onmousedown = () => {
        if (document.body.style.cursor !== 'move') return;
        shapeStore.shapeWorkingStyle(shape);
        const { originX, originY } = shape;
        shape.startX = shape.originX;
        shape.startY = shape.originY;
        shape.width = Math.abs(shape.width);
        shape.height = Math.abs(shape.height);
        if (shape.getRectBorder(clientX, clientY)) {
            document.onmousemove = (e) => {
                const moveX = originX + e.clientX - clientX;
                const moveY = originY + e.clientY - clientY;
                const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();

                shape.startX = notOffScreen(moveX, shape.width, x, x + dx);
                shape.startY = notOffScreen(moveY, shape.height, y, y + dy);
            }
            document.onmouseup = () => {
                operated(s.shapes, shape, i);
                removeDocumentListen();
                operationHandle();
            }
        }
    }
    if (shape.is8Point(clientX, clientY) && shape.showPoint) {
        shape.sortPoints().forEach((p: { getRectRange: (arg0: number, arg1: number) => any; }, index: number) => {
            if (p.getRectRange(clientX, clientY)) {
                const pointIndex = index;
                document.body.style.cursor = `${shape.pointCursorstr[index]}-resize`;

                document.onmousedown = (e) => {
                    shapeStore.shapeWorkingStyle(shape);

                    const { clientX, clientY } = e;
                    let startX = clientX;
                    let startY = clientY;
                    let reversePointIndex = 0;

                    if (pointIndex === 1 || pointIndex === 3 || pointIndex === 5 || pointIndex === 7) {
                        reversePointIndex = pointIndex - 1;
                    } else {
                        reversePointIndex = pointIndex;
                    }
                    reversePointIndex = getReversePointIndex(reversePointIndex)
                    const rectCircle = shape.sortPoints()[reversePointIndex].getOrigin();
                    const fnStartX = rectCircle.x;
                    const fnStartY = rectCircle.y;

                    const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
                    let isMoveChunk = false;
                    document.onmousemove = (e) => {
                        let { clientX: currentX, clientY: currentY } = e;
                        shape.startX = fnStartX;
                        shape.startY = fnStartY;

                        if (!isMoveChunk) {
                            changeWH(() => {
                                isMoveChunk = true;

                            }, pointIndex, shape);

                        }
                        const moveX = currentX - startX;
                        const moveY = currentY - startY;

                        if (pointIndex === 1 || pointIndex === 5) {
                            shape.height = notOffMaskInDargChunk({
                                currentPosition: currentY,
                                shapeWH: shape.height,
                                from: y,
                                to: y + dy,
                                moveXY: moveY,
                                fnStartXY: fnStartY
                            })


                        } else if (pointIndex === 3 || pointIndex === 7) {
                            shape.width = notOffMaskInDargChunk({
                                currentPosition: currentX,
                                shapeWH: shape.width,
                                from: x,
                                to: x + dx,
                                moveXY: moveX,
                                fnStartXY: fnStartX
                            })
                        } else {
                            shape.width = notOffMaskInDargChunk({
                                currentPosition: currentX,
                                shapeWH: shape.width,
                                from: x,
                                to: x + dx,
                                moveXY: moveX,
                                fnStartXY: fnStartX
                            })
                            shape.height = notOffMaskInDargChunk({
                                currentPosition: currentY,
                                shapeWH: shape.height,
                                from: y,
                                to: y + dy,
                                moveXY: moveY,
                                fnStartXY: fnStartY
                            })
                        }
                        startX = currentX;
                        startY = currentY;
                    };
                    document.onmouseup = () => {
                        operated(s.shapes, shape, i);
                        isMoveChunk = false;
                        removeDocumentListen()
                        document.onmousemove = () => {
                            operationHandle();
                        };
                    };
                }
            }
        });
    }
}
export {
    createRect,
    rectMove,
    getReversePointIndex,
    changeWH
}