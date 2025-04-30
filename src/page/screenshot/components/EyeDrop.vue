<script setup lang="ts">
    import { ref } from 'vue';
    const opacity = ref(0.4);
    async function clickHandle() {
        opacity.value = 0;
        if (!window.EyeDropper) return;
        const eyeDropper = new window.EyeDropper();
        eyeDropper
            .open()
            .then((result: { sRGBHex: string; }) => {
                const color = result.sRGBHex;
                const type = "text/plain";
                const blob = new Blob([color], { type });
                const data = [new ClipboardItem({ [type]: blob })];
                navigator.clipboard.write(data);
                window.electronAPI.eyedropGetColor(color);
                opacity.value = 0.4;
            })
            .catch((e: any) => { });
    }
</script>
<template>
    <div class="eyedrop" @click="clickHandle" :style="{
        opacity
    }">
        请点击
    </div>
</template>
<style scoped>
    .eyedrop {
        width: 100%;
        height: 100%;
        font-size: 10rem;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        text-shadow: 0 0 10px #000;
        letter-spacing: .2rem;
    }
</style>