<script setup lang="ts">
    import { useScreenCut } from '@screenshot/store/screenCut';
    import Mosaic from '@screenshot/utils/Class/Mosaic';
    import { removeDocumentListen } from '@screenshot/utils/operate';
    const shapeStore = useScreenCut();

    function create(bgRef: HTMLCanvasElement, operationHandle: Function) {
        document.onmousedown = () => {
            const s = shapeStore.shape;
            s.working = new Mosaic(bgRef, shapeStore.screenX, shapeStore.screenY);
            s.working.describe = 'mosaic';
            shapeStore.addHistory();
            shapeStore.lineWidth = shapeStore.mosaicInfo.size;
            s.working.lineWidth = shapeStore.mosaicInfo.size;
            const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
            document.onmousemove = (e) => {
                const cx = s.working.getDirection(e.clientX, x, x + dx);
                const cy = s.working.getDirection(e.clientY, y, y + dy);
                s.working.createMosaic(cx, cy);
            }
            document.onmouseup = () => {
                shapeStore.addShape();
                removeDocumentListen();
                operationHandle();
            };
        }
    }
    defineExpose({
        create
    })
</script>
<template>
    <div v-show="shapeStore.mosaicInfo.show" :style="{
        top: shapeStore.mosaicInfo.y + 'px',
        left: shapeStore.mosaicInfo.x + 'px',
        width: shapeStore.mosaicInfo.size + 'px',
        height: shapeStore.mosaicInfo.size + 'px',
    }">
    </div>
</template>
<style scoped>
    div {
        position: fixed;
        width: 10px;
        height: 10px;
        border: 1px solid #666;
        background-color: #fff;
        opacity: 0.6;
        transform: translate(-50%, -50%);
    }
</style>