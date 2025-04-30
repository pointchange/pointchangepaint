<script lang="ts" setup>
    import { NSpace, NSlider, NButton, NPopover, NIcon } from 'naive-ui';
    import { usePaint } from '@screenshot/store/paint';
    import { onMounted, onUnmounted } from 'vue';
    import { useColorGroup } from '@screenshot/utils/useFunction/color';
    const { colorGroup } = useColorGroup();

    const paint = usePaint();
    onMounted(() => {
        paint.operation.show = false;
        window.onmousedown = (e) => {
            const value = e.button;
            if (value == 2 || value == 3) {
                paint.operation.show = true;
                paint.operation.x = e.clientX;
                paint.operation.y = e.clientY;
            }
        }
    })
    onUnmounted(() => {
        window.onmousedown = null;
    })
</script>
<template>
    <n-popover :show="paint.operation.show" :x="paint.operation.x" :y="paint.operation.y" trigger="manual">
        <n-space vertical>
            <NSlider v-model:value="paint.lineWidth" :min="1.0" :max="60.0" :step="0.1"
                v-on:update-value="(v) => paint.userChangePaintStyle(v)">
            </NSlider>
            <n-space align="center">
                <n-button v-for="item in colorGroup" :color="item.value" :key="item.value" type="default"
                    @click="() => paint.userChangePaintStyle(0, item.value)"></n-button>
                <input type="color" v-model="paint.strokeColor"
                    @input="(e: Event) => paint.userChangePaintStyle(0, (e.target as HTMLInputElement).value)">
            </n-space>
        </n-space>
    </n-popover>
</template>
<style scoped></style>