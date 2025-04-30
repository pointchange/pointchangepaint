<script setup lang="ts">
    import { useScreenCut } from '@screenshot/store/screenCut';
    import { reactive, useTemplateRef } from 'vue';
    const sc = useScreenCut();
    defineProps(['isShowAmp']);
    const ampCanvasRef = useTemplateRef('ampCanvasRef');

    const ampInfo = reactive({
        width: 100,
        height: 100,
        x: 0,
        y: 0,
        dx: 50,
        dy: 50,
        scale: 40
    });
    function setAmpTopLeft(x: number, dx: number, w: number, screenX: number) {
        const border = 1;
        if (x + dx + w + border * 2 >= screenX) {
            return x - dx - w - border * 2;
        } else {
            return x + dx;
        }
    }
    function setAmpImg(x = 0, y = 0, image: HTMLImageElement) {
        if (ampCanvasRef.value) {
            const { width, height, scale } = ampInfo;
            ampCanvasRef.value.width = width;
            ampCanvasRef.value.height = height;
            const ampCtx = ampCanvasRef.value.getContext('2d', { willReadFrequently: true });
            if (!ampCtx) return;
            ampCtx.drawImage(image, x - scale / 2, y - scale / 2, scale, scale, 0, 0, width, height)
        }
    }
    function moveAmp(x: number, y: number) {
        ampInfo.x = x;
        ampInfo.y = y;
    }
    defineExpose({
        moveAmp, setAmpImg
    })
</script>
<template>
    <div class="amp" v-show="isShowAmp" :style="{
        top: setAmpTopLeft(ampInfo.y, ampInfo.dy, ampInfo.height, sc.screenY) + 'px',
        left: setAmpTopLeft(ampInfo.x, ampInfo.dx, ampInfo.width, sc.screenX) + 'px',
    }">
        <canvas ref="ampCanvasRef" width="100" heigth="100"></canvas>
    </div>
</template>
<style scoped>
    .amp {
        position: absolute;
        width: 100px;
        height: 100px;
        border: 1px solid #00ff00;
        z-index: 4;
    }

    .amp::before,
    .amp::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        border: 1px solid red;
        z-index: 4;
    }

    .amp::after {
        top: 0;
        left: 50%;
        transform-origin: top left;
        transform: rotate(90deg);
    }
</style>