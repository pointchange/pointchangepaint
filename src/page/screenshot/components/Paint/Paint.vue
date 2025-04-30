<script setup lang="ts">
    import { usePaint } from '@screenshot/store/paint';
    import { useScreenCut } from '@screenshot/store/screenCut';
    import Line from '@screenshot/utils/Class/Line';
    import { removeDocumentListen } from '@screenshot/utils/operate';
    import { onMounted, onUnmounted, useTemplateRef } from 'vue';
    import Operation from './Operation.vue';
    const shapeStore = useScreenCut();
    const paint = usePaint();
    const s = paint.s;
    const canvasRef = useTemplateRef('canvasRef');
    function drawing() {
        requestAnimationFrame(drawing);
        if (!canvasRef.value) return;
        canvasRef.value?.getContext('2d')?.clearRect(0, 0, shapeStore.screenX, shapeStore.screenY);
        if (s.line.length <= 0) return;
        for (const line of s.line) {
            line.draw();
        }
    }
    function paintStart() {
        canvasRef.value?.getContext('2d')?.clearRect(0, 0, shapeStore.screenX, shapeStore.screenY);
    }
    function paintEnd() {
        paint.operation.show = false;
        s.line.length = 0;
        s.working = null as unknown as Line;
    }
    onMounted(() => {
        window.electronAPI.getInfo((_e, { mode }) => {
            if (mode === 'paint') {
                paintStart();
            }
        })
        document.onkeyup = (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete' || ((e.key === 'z' || e.key === 'Z') && e.ctrlKey)) {
                undo()
            }
            if (e.key === 'c' || e.key === "C") {
                clear();
            }
        };
        window.electronAPI.onExitSecondWindow(() => {
            paintEnd();
        })
    })
    onUnmounted(() => {
        document.onkeyup = null;
    });
    let firstDown = false;
    function createLine(e: MouseEvent) {
        const target = e.target as HTMLCanvasElement;
        target.onmousedown = e => {
            paint.resetPaintStyle();
            paint.operation.show = false;
            const value = e.button;
            if (value == 2 || value == 3) return;
            s.working = new Line(target, shapeStore.screenX, shapeStore.screenY);
            paint.changePaintStyle(s.working);
            let startX = e.clientX;
            let startY = e.clientY;
            s.working.path2d.moveTo(startX, startY);
            let onceOperate = false;
            if (!firstDown) {
                drawing();
                firstDown = true;
            }
            const startLineLength = s.line.length;
            target.onmousemove = (e) => {
                if (!onceOperate) {
                    onceOperate = true;
                    s.working.startX = startX;
                    s.working.startY = startY;
                    s.line.push(s.working);
                }
                let { clientX: currentX, clientY: currentY } = e;

                s.working.addXY(currentX, currentY);
            }
            target.onmouseup = (e) => {
                const { clientX, clientY } = e
                if (clientX - startX === 0 && clientY - startY === 0 && startLineLength !== s.line.length) {
                    s.line.pop();
                }
                target.onmousemove = null;
                s.working.setHistory();
            }
        }

    }
    function undo() {
        const lastIndex = s.line.length - 1;
        if (lastIndex < 0) return;
        const lastShape = s.line[lastIndex];
        const lastHistoryIndex = lastShape.history.length - 1;
        if (lastHistoryIndex > 0) {
            const h = lastShape.history[lastHistoryIndex - 1];
            lastShape.getHistory(h);
            lastShape.history.pop();
        } else {
            s.line.pop();
        }
    }
    function clear() {
        if (s.line.length <= 0) return;
        s.line.length = 0;
    }
    function getLine(x: number, y: number) {
        if (s.line.length === 0) null;
        for (let i = s.line.length - 1; i >= 0; i--) {
            const line = s.line[i];
            const bool = line.checkPointinPath(x, y);
            if (bool) {
                return line;
            }
        }
        return null;
    }
    function moveLine(e: MouseEvent) {
        const target = e.target as HTMLCanvasElement;
        let selected = getLine(e.clientX, e.clientY);
        if (selected) {
            target.style.cursor = 'move';
            const shape = selected;
            target.onmousedown = (e) => {
                s.working = shape;
                paint.operation.show = false;
                const value = e.button;
                if (value == 2 || value == 3) return;
                const { clientX: startX, clientY: startY } = e;
                paint.readLineStyle(shape);
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
                    cy = 0,
                    x = 0,
                    y = 0,
                    dx = shapeStore.screenX,
                    dy = shapeStore.screenY;
                target.onmousemove = (e) => {
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
                target.onmouseup = () => {
                    target.onmousemove = null;
                    s.working.setHistory();
                }
            }
        } else {
            target.style.cursor = 'default';
            createLine(e)
        }
    }
</script>
<template>
    <div class="draw-line">
        <canvas ref="canvasRef" :width="shapeStore.screenX" :height="shapeStore.screenY" @mousemove="moveLine"></canvas>
        <Operation :moveLine="moveLine"></Operation>
    </div>
</template>
<style scoped>
    .draw-line {
        width: 100%;
        height: 100%;
    }
</style>
