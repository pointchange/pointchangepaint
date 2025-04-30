<script setup lang="ts">
    import { useScreenCut } from '@screenshot/store/screenCut'
    import { useColorGroup } from '@screenshot/utils/useFunction/color';
    import { NButton, NPopover, NSpace, NSlider, NText } from 'naive-ui'
    const props = defineProps(['shapeStr', 'slider', 'des'])
    const shapeStore = useScreenCut();
    const { colorGroup } = useColorGroup();
    function lineWidthChange(value: number) {
        shapeStore.lineWidth = value;
        if (props.shapeStr === 'mosaic') {
            shapeStore.mosaicInfo.size = value;
            return;
        }
        shapeStore.shape.working.lineWidth = shapeStore.lineWidth;
    }
    function selectColor(v: string) {
        shapeStore.lineColor = v;
        shapeStore.shape.working.strokeColor = shapeStore.lineColor;
    }
</script>
<template>
    <n-popover placement="bottom" trigger="click" :show="shapeStore.activeShape[shapeStr]">
        <template #trigger>
            <slot></slot>
        </template>
        <n-space align="center">
            <n-text>{{ des }}</n-text>
            <n-slider class="fontsize_slider" v-model:value="shapeStore.lineWidth" :step="shapeStr === 'mosaic' ? 2 : 1"
                :min="slider.min" :max="slider.max" @update:value="lineWidthChange" />
            <n-button v-for="c in colorGroup" :type="c.type" :key="c.value" :circle="shapeStore.lineColor === c.value"
                @click="selectColor(c.value)">
                {{ c.label }}
            </n-button>
            <input type="color" v-model="shapeStore.lineColor"
                @input="(e: Event) => selectColor((e.target as HTMLInputElement).value)">
        </n-space>
    </n-popover>
</template>
<style scoped>
    .fontsize_slider {
        width: 150px;
    }
</style>