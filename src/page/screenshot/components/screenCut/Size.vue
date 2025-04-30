<script setup lang="ts">
    import BgCanvas from '@screenshot/utils/Class/BgCanvas';
    import { reactive } from 'vue';
    defineProps(['isShowSize'])
    const sizeInfo = reactive({
        content: {
            width: 0,
            height: 0
        },
        x: 0,
        y: 0,
        height: 16,
        distance: 4,
    })
    function setSizeXY(mask: BgCanvas) {
        const { width: w, height: h, originY, originX } = mask;
        sizeInfo.content.width = Math.abs(w);
        sizeInfo.content.height = Math.abs(h);
        const { distance, height } = sizeInfo;
        sizeInfo.y = originY - height - distance > 0 ? originY - height - distance : originY + distance;
        sizeInfo.x = originX > 0 ? originX : originX + distance * 2;
    }
    defineExpose({
        setSizeXY
    })
</script>
<template>
    <div class="size" v-show="isShowSize" :style="{
        top: sizeInfo.y + 'px',
        left: sizeInfo.x + 'px',
    }">{{ sizeInfo.content.width + ' x ' + sizeInfo.content.height }}</div>
</template>
<style scoped>
    .size {
        position: absolute;
        color: #00ff00;
    }
</style>