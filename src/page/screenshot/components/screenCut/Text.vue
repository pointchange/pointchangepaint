<script setup lang="ts">
    import { useScreenCut } from '@screenshot/store/screenCut';
    import CanvasText from '@screenshot/utils/Class/Text';
    import { newline } from '@screenshot/utils/newline';
    import { operated, removeDocumentListen } from '@screenshot/utils/operate';
    import { notOffScreen } from '@screenshot/utils/range';
    import { nextTick, useTemplateRef, } from 'vue';
    const shapeStore = useScreenCut();
    const s = shapeStore.shape;
    const props = defineProps(['mask', 'operationHandle'])
    const textInfo = shapeStore.textInfo;
    const textareaRef = useTemplateRef('textareaRef');
    function resetTextInfo() {
        textInfo.x = 0;
        textInfo.y = 0;
        textInfo.show = false;
        textInfo.content = '';
        textInfo.resize = false;
    }
    let isOnce = false;
    function inputHandle() {
        if (!isOnce) {
            isOnce = true;
            removeDocumentListen();
            textInfo.resize = true;
        }
    }

    function blurHandle(e: Event) {
        removeDocumentListen();
        if (textInfo.content.trim() === '') return;
        const textEvent = e.target as HTMLTextAreaElement;
        const { offsetWidth } = textEvent;
        const { width, height, top, left } = textEvent.getBoundingClientRect();
        const { x, dx, y, dy } = props.mask.getNotMaskRangeData();
        const content = newline(textInfo.content, offsetWidth, s.working);
        isOnce = false;
        textInfo.show = false;
        textInfo.resize = false;
        if (width + left >= x + dx) {
            s.working.startX = x + dx - width;
        } else {
            s.working.startX = left;
        }
        if (height + top >= y + dy) {
            s.working.startY = y + dy - height;
        } else {
            s.working.startY = top;
        }
        s.working.width = width;
        s.working.height = height;
        s.working.content = content;
        s.working.draw();
        s.working.strokeColor = shapeStore.lineColor;
        s.working.lineWidth = shapeStore.lineWidth;
        shapeStore.addShape();
        shapeStore.addHistory();
        props.operationHandle();
    }
    function createText(drawRef: HTMLCanvasElement, operationHandle: Function) {
        document.onmousedown = (e) => {
            shapeStore.resetShapeStyle();
            const { clientX, clientY } = e;
            shapeStore.cancelSelectShape()
            const textInfo = shapeStore.textInfo;
            s.working = s.working = new CanvasText(drawRef, shapeStore.screenX, shapeStore.screenY);
            s.working.describe = 'text';
            shapeStore.lineWidth = shapeStore.fontSize;
            [textInfo.x, textInfo.y] = [clientX, clientY]
            textInfo.show = true;
            textInfo.content = '';

            document.onmouseup = async () => {
                removeDocumentListen();
                operationHandle();
                await nextTick();
                textareaRef.value?.focus();
            };
        }
    }
    function textMove(shape: any, i: number, operationHandle: Function) {
        document.onmousedown = (e) => {
            shapeStore.shapeWorkingStyle(shape);
            const { clientX, clientY } = e;
            const { x, dx, y, dy } = shapeStore.mask.getNotMaskRangeData();
            const startX = shape.startX;
            const startY = shape.startY;
            document.onmousemove = (e) => {
                const moveX = startX + e.clientX - clientX;
                const moveY = startY + e.clientY - clientY;
                shape.startX = notOffScreen(moveX, shape.width, x, x + dx);
                shape.startY = notOffScreen(moveY, shape.height, y, y + dy);
            }
            document.onmouseup = () => {
                operated(s.shapes, shape, i);
                removeDocumentListen();
                operationHandle();
            };
        }
        document.ondblclick = async () => {
            document.body.style.cursor = 'default';
            const textInfo = shapeStore.textInfo;
            textInfo.show = true;
            textInfo.x = shape.startX;
            textInfo.y = shape.startY;
            const content = newline(shape.content, shape.width, shape);
            textInfo.content = content;
            shape.content = '';
            shape.showPoint = false;
            await nextTick();
            textareaRef.value?.focus();
        }
    }
    defineExpose({
        resetTextInfo,
        textareaRef,
        createText,
        textMove
    })
</script>
<template>
    <textarea spellcheck="false" placeholder="输入内容即可拉伸" v-model="textInfo.content" v-show="textInfo.show"
        ref="textareaRef" class="textarea" :class="{ textarea_resize: !textInfo.resize }" :style="{
            top: textInfo.y + 'px',
            left: textInfo.x + 'px',
            color: shapeStore.lineColor,
            borderColor: shapeStore.lineColor,
            fontSize: shapeStore.lineWidth + 'px'
        }" @input="inputHandle" @blur="blurHandle"></textarea>
</template>
<style scoped>
    .textarea {
        position: absolute;
        box-sizing: border-box;
        color: #00ff00;
        font-size: 24px;
        font-family: sans-serif;
        border: 1px solid #00ff00;
        outline: none;
        background-color: transparent;
    }

    .textarea_resize {
        resize: none;
    }

</style>