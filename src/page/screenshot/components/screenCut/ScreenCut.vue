<script setup lang="ts">
    import { nextTick, onMounted, onUnmounted, reactive, ref, useTemplateRef, watch } from 'vue';
    import { NButton, NButtonGroup, NIcon, NPopover, NSpace, NModal, NCard, NImage, createDiscreteApi, NScrollbar, NQrCode, NSpin, type ImageRenderToolbarProps, NTooltip } from 'naive-ui'
    import { ArrowHookUpLeft20Regular, Share20Regular, Checkmark20Filled, Dismiss24Regular, ImageSearch20Regular, Clipboard20Regular, ImageArrowForward24Regular } from '@vicons/fluent'
    import BgCanvas from '@screenshot/utils/Class/BgCanvas';
    import Text from './Text.vue';
    import Size from './Size.vue';
    import Amp from './Amp.vue';
    import { useScreenCut } from '@screenshot/store/screenCut';
    import Popover from './Popover.vue';
    import { operationShapeBtns } from '@screenshot/utils/operationShapeBtns';
    import { notOffScreen } from '@screenshot/utils/range';
    import Mosaicvue from './Mosaic.vue';
    import { removeDocumentListen } from '@screenshot/utils/operate';
    import { arrowMove, createArrow } from '@screenshot/utils/shape/arrow';
    import { changeWH, createRect, getReversePointIndex, rectMove } from '@screenshot/utils/shape/rect';
    import { createLine, lineMove } from '@screenshot/utils/shape/line';
    const shapeStore = useScreenCut();
    const s = shapeStore.shape;
    const screenX = window.screen.width;
    const screenY = window.screen.height;
    let id = 0;
    let image = document.createElement('img'),
        bg: BgCanvas,
        mask: BgCanvas,
        isDownRect = false,
        blob: Blob | undefined;
    const bgRef = useTemplateRef('bgRef');
    const maskRef = useTemplateRef('maskRef');
    const drawRef = useTemplateRef('drawRef');
    const oprantionRef = useTemplateRef('oprantionRef');
    const drawLineRef = useTemplateRef('drawLineRef');
    const textRef = useTemplateRef('textRef');
    const sizeRef = useTemplateRef('sizeRef');
    const ampRef = useTemplateRef('ampRef');
    const mosaicRef = useTemplateRef('mosaicRef');
    const isShowSize = ref(false);
    const isShowAmp = ref(false);
    const isShowOperation = ref(false);
    let isCheckRectRange = true;
    let isMoveChunk = false;
    const showPopover = ref(false);

    const operation = reactive({
        x: 0,
        y: 0,
        dx: 0,
        dy: 16,
        width: 0,
        height: 0,
        left: 0,
        top: 0
    });
    const showModal = ref(false);

    function draw() {
        id = requestAnimationFrame(draw);
        maskRef.value?.getContext('2d')?.clearRect(0, 0, screenX, screenY);
        mask.drawing();
        drawRef.value?.getContext('2d')?.clearRect(0, 0, screenX, screenY);
        if (s.shapes.length === 0) return;
        for (const ss of s.shapes) {
            if (ss.describe !== 'mosaic') {
                ss.draw();
            }
        }
    }
    function screenCutStart() {

        isShowSize.value = false;
        isDownRect = false;
        isShowOperation.value = false;
        isCheckRectRange = true;
        mask.reset();
        mask.maskColor = "rgba(0, 0, 0, .4)"
        mask.strokeColor = '#00ff00';
        drawMask();
        draw()
    }
    function screenCutEnd() {
        cancelAnimationFrame(id);
        removeDocumentListen();
        bgRef.value?.getContext('2d')?.clearRect(0, 0, screenX, screenY);
        maskRef.value?.getContext('2d')?.clearRect(0, 0, screenX, screenY);
        drawRef.value?.getContext('2d')?.clearRect(0, 0, screenX, screenY);
        drawLineRef.value?.getContext('2d')?.clearRect(0, 0, screenX, screenY);
        document.body.style.cursor = 'default';
        shapeStore.mosaicHandle();
        showPopover.value = false;
        isShowOperation.value = false;
        showModal.value = false;
        showQr.value = false;
        blob = undefined;
        shapeStore.resetShape();
        shapeStore.resetTextInfo();
        shapeStore.resetShapeStyle();
        shapeStore.resetMosaicInfo();
        isCheckRectRange = true;
        shapeStore.selectShape();
    }
    watch(
        isShowOperation,
        async () => {
            await nextTick();
            if (!oprantionRef.value) return;
            const { height, width } = window.getComputedStyle(oprantionRef.value)
            operation.height = +height.split('px')[0];
            operation.width = +width.split('px')[0];
            setOperation()
        },
        { once: true }
    )
    onMounted(() => {
        if (!bgRef.value) return;
        bg = new BgCanvas(bgRef.value, screenX, screenY);
        if (!maskRef.value) return;
        shapeStore.mask = mask = new BgCanvas(maskRef.value, screenX, screenY);
        window.electronAPI.getInfo((_e, obj) => {
            shapeStore.path = obj.path;
            image.src = shapeStore.imageProtocol + obj.path;
            image.onload = () => {
                bg.drawImg(image);
                screenCutStart()
            }
        })
        window.electronAPI.onExitSecondWindow(() => {
            screenCutEnd();
        })
    })
    function drawMask() {
        document.onmousedown = (e) => {
            isShowSize.value = true;
            isShowAmp.value = true;
            isShowOperation.value = false;
            mask.showPoint = true;
            mask.startX = e.clientX;
            mask.startY = e.clientY;
            document.onmousemove = (e) => {
                mask.width = e.clientX - mask.startX;
                mask.height = e.clientY - mask.startY;
                ampRef.value?.moveAmp(e.clientX, e.clientY);
                ampRef.value?.setAmpImg(e.clientX, e.clientY, image);
                sizeRef.value?.setSizeXY(mask);
            };
            document.onmouseup = () => {
                isShowOperation.value = true;
                isShowAmp.value = false;
                isShowSize.value = true;
                removeDocumentListen();
                document.onmousemove = (e) => {
                    checkRectRange(e);
                };
                setOperation();
            };
        };
    }

    function setOperation() {
        const { originX, originY, height } = mask;
        const { width: ow, height: oh, dy } = operation
        const h = Math.abs(height);

        if (originX + ow < screenX) {
            operation.x = originX
        } else {
            operation.x = screenX - ow
        }

        if (originY + h + oh + dy < screenY) {
            operation.y = originY + h + dy;
        } else {
            // 竖直 y ∈ (0,screenY); 
            operation.y = originY - oh - dy * 2
            if (operation.y <= 0) {
                operation.x = screenX / 2 - ow / 2;
                operation.y = screenY / 2 - oh / 2;
            }
        }
    }

    function checkRectRange(e: MouseEvent) {
        if (!isCheckRectRange) return;
        const { clientX, clientY } = e;

        if (mask.getRectRange(clientX, clientY)) {
            document.body.style.cursor = 'move';
            if (isDownRect) return;
            isDownRect = true;
            document.onmousedown = (e) => {
                downRect(e, mask);
            }

        } else {
            isDownRect = false;
            document.body.style.cursor = 'default';
            mask.sortPoints().forEach((p, index: number) => {
                if (!p.getRectRange(clientX, clientY)) return;
                document.body.style.cursor = `${mask.pointCursorstr[index]}-resize`;
                const pointIndex = index;
                document.onmousedown = (e) => {
                    downChunk(e, mask, pointIndex);
                }

            });
        }
    }
    function downChunk(e: MouseEvent, fn: any, pointIndex: number) {
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
        const { x, y } = fn.sortPoints()[reversePointIndex].getOrigin();
        document.onmousemove = (e) => {
            // if (!isMoveChunk) {
            //     isShowAmp.value = true;
            // }
            isShowOperation.value = false;
            const { clientX, clientY } = e;

            //改变原点
            // mask.startX=?
            // mask.startY=?
            const moveX = clientX - startX;
            const moveY = clientY - startY;
            fn.startX = x;
            fn.startY = y;

            if (!isMoveChunk) {
                changeWH(() => {
                    isShowAmp.value = true;
                    isMoveChunk = true;
                }, pointIndex, fn);
            }

            if (pointIndex === 1 || pointIndex === 5) {
                fn.height += moveY;

            } else if (pointIndex === 3 || pointIndex === 7) {
                fn.width += moveX;
            }
            else {
                fn.width += moveX;
                fn.height += moveY;
            }

            ampRef.value?.moveAmp(clientX, clientY);
            ampRef.value?.setAmpImg(clientX, clientY, image);
            startX = clientX;
            startY = clientY;
            sizeRef.value?.setSizeXY(mask);
        };
        document.onmouseup = () => {
            isMoveChunk = false;
            isShowAmp.value = false;
            removeDocumentListen()
            document.onmousemove = (e) => {
                isDownRect = false;
                checkRectRange(e);
            };
            setOperation()
            isShowOperation.value = true;
        };
    }

    function downRect(e: MouseEvent, fn: any) {
        if (document.body.style.cursor !== 'move') return;
        const { clientX, clientY } = e;
        const startX = clientX;
        const startY = clientY;
        const { originX, originY } = fn;

        fn.startX = fn.originX
        fn.startY = fn.originY
        fn.width = Math.abs(fn.width)
        fn.height = Math.abs(fn.height)

        document.onmousemove = (e) => {
            const { clientX, clientY } = e
            const moveX = originX + clientX - startX;
            const moveY = originY + clientY - startY;
            isShowOperation.value = false;
            fn.startX = notOffScreen(moveX, fn.width, 0, screenX);
            fn.startY = notOffScreen(moveY, fn.height, 0, screenY);
            sizeRef.value?.setSizeXY(mask)
        };
        document.onmouseup = () => {
            isDownRect = false;
            removeDocumentListen();
            document.onmousemove = (e) => {
                checkRectRange(e);
            };
            setOperation()
            isShowOperation.value = true;
        };
    }

    onUnmounted(() => {
        image.onload = null;
        removeDocumentListen();
    })

    function operationHandle() {
        document.onmousemove = (e) => {
            const { clientX, clientY } = e;
            if (!mask.isMaskRange(clientX, clientY)) return;
            const shapeAndIndex = shapeStore.getShape(clientX, clientY);
            if (shapeAndIndex) {
                const { s: shape, i } = shapeAndIndex;
                document.body.style.cursor = 'move';
                switch (shape.describe) {
                    case 'arrow':
                        arrowMove(
                            [clientX, clientY],
                            shape, i, operationHandle
                        )
                        break;
                    case 'line':
                        lineMove(shape, i, operationHandle);
                        return;
                    case 'text':
                        textRef.value?.textMove(shape, i, operationHandle);
                        return;
                    default:
                        rectMove(
                            { clientX, clientY },
                            shape, i,
                            operationHandle
                        )
                        break;
                }
            } else {
                document.body.style.cursor = 'default';
                if (!drawRef.value) return;
                switch (s.des) {
                    case 'rect':
                        createRect(drawRef.value, operationHandle);
                        return;
                    case 'circle':
                        createRect(drawRef.value, operationHandle, 'circle');
                        return;
                    case 'arrow':
                        createArrow(drawRef.value, operationHandle);
                        return;
                    case 'line':
                        createLine(drawRef.value, operationHandle);
                        return;
                    case 'mosaic':
                        if (!bgRef.value) return;
                        mosaicRef.value?.create(bgRef.value, operationHandle);
                        return;
                    case 'text':
                        textRef.value?.createText(drawRef.value, operationHandle);
                        return;
                    default:
                        return;
                }
            }
        }
    }

    function shapeHandle(str: string) {
        if (str !== 'text') {
            shapeStore.textInfo.show = false;
        }
        if (str === 'mosaic') {
            const mosaicInfo = shapeStore.mosaicInfo;
            mosaicInfo.show = true;
            shapeStore.lineWidth = shapeStore.mosaicInfo.size;
            window.onmousemove = (e: MouseEvent) => {
                const { clientX, clientY } = e;
                [mosaicInfo.x, mosaicInfo.y] = [clientX, clientY];
            }
        } else {
            shapeStore.mosaicHandle();
        }
        shapeStore.cancelSelectShape()
        removeDocumentListen();
        isShowOperation.value = true;
        isCheckRectRange = !isCheckRectRange;
        document.body.style.cursor = 'default';
        s.des = str;
        shapeStore.selectShape(str);
        operationHandle();
    }

    function exitScreenCut() {
        window.electronAPI.onExitScreenCut(false);
    }
    const canvasUrl = ref('');
    async function complete() {
        if (!blob) {
            blob = await getImageBlob() as Blob;
        }
        const buffer = await blob.arrayBuffer();
        window.electronAPI.imageSave(buffer);
        window.electronAPI.onExitScreenCut(true);
    }
    async function getImageBlob() {
        const offscreen = new OffscreenCanvas(shapeStore.screenX, shapeStore.screenY);
        const otx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!otx) return;
        const { startX, startY, width, height } = mask.getResult(otx, 'mask')!;
        const mosaicArr = s.shapes.filter((v: { describe: string; }) => v.describe === 'mosaic');
        const len = mosaicArr.length;
        if (mosaicArr.length > 0) {
            mosaicArr[len - 1].getResult(otx);
        } else {
            bg.getResult(otx);
        }
        for (let i = 0; i < s.shapes.length; i++) {
            const shape = s.shapes[i];
            if (shape.describe !== 'mosaic') {
                shape.getResult(otx);
            }
        }
        const imgData = otx.getImageData(startX, startY, width, height);
        const os = new OffscreenCanvas(Math.abs(width), Math.abs(height));
        os.getContext('2d')?.putImageData(imgData, 0, 0);
        return await os.convertToBlob();
    }
    async function preView() {
        blob = await getImageBlob() as Blob;
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        canvasUrl.value = url;
        showModal.value = true;
        removeDocumentListen();
    }
    const copyHandleLoading = ref(false);
    async function copyHandle() {
        copyHandleLoading.value = true;
        if (!blob) return;
        const buffer = await blob.arrayBuffer();
        const bool = await window.electronAPI.imageCopy(buffer);
        copyHandleLoading.value = false;
        const { message } = createDiscreteApi(['message']);
        if (bool) {
            message.success('复制成功');
        } else {
            message.error('复制失败');
        }
    }
    async function saveAsHandle() {
        if (!blob) return;
        const buffer = await blob.arrayBuffer();
        window.electronAPI.imageSaveAs(buffer);
    }
    const qrCodeText = ref('');
    const showQr = ref(false);
    const address = reactive({
        port: 0,
        ip: '',
        openShareNet: false,
        error: ''
    });
    async function shareHandle() {
        showQr.value = true;
        if (!blob) return;
        const buffer = await blob.arrayBuffer();
        const result = await window.electronAPI.imageShare(buffer);
        if (/Error/i.test(result)) {
            address.error = result;
            return;
        }
        qrCodeText.value = result.address;
        address.port = result.port;
        address.ip = result.ip;
        address.openShareNet = true;
        showQr.value = false;
    }
    const renderToolbar = ({ nodes }: ImageRenderToolbarProps) => {
        return [
            nodes.rotateCounterclockwise,
            nodes.rotateClockwise,
            nodes.zoomOut,
            nodes.zoomIn,
            nodes.close
        ]
    };
    const otherBtns = [
        {
            id: 'undo',
            name: '撤回',
            icon: ArrowHookUpLeft20Regular,
            handle: () => shapeStore.undo()
        },
        {
            id: 'preView',
            name: '预览',
            icon: ImageSearch20Regular,
            handle: preView
        },
        {
            id: 'exit',
            name: '退出',
            icon: Dismiss24Regular,
            handle: exitScreenCut
        },
        {
            id: 'complete',
            name: '完成',
            icon: Checkmark20Filled,
            handle: complete
        }
    ];

</script>
<template>
    <div class="draw">
        <canvas ref="bgRef" :width="screenX" :height="screenY"></canvas>
        <canvas ref="maskRef" :width="screenX" :height="screenY"></canvas>
        <canvas ref="drawRef" :width="screenX" :height="screenY"></canvas>
        <canvas ref="drawLineRef" :width="screenX" :height="screenY"></canvas>

        <Size ref="sizeRef" :isShowSize="isShowSize" />

        <Amp ref="ampRef" :isShowAmp="isShowAmp" />

        <div ref="oprantionRef" class="opration" v-show="isShowOperation" :style="{
            top: operation.y + 'px',
            left: operation.x + 'px'
        }">

            <n-space>
                <n-button-group>
                    <Popover v-for="item in operationShapeBtns" :key="item.name" :shapeStr="item.name"
                        :slider="item.slider" :des="item.des">
                        <n-button @click="shapeHandle(item.name)">
                            <template #icon>
                                <n-icon :component="item.icon"></n-icon>
                            </template>
                        </n-button>
                    </Popover>
                </n-button-group>
                <n-button-group>
                    <n-tooltip trigger="hover" v-for="item in otherBtns" :key="item.id">
                        <template #trigger>
                            <n-button @click="item.handle">
                                <template #icon>
                                    <n-icon :component="item.icon"></n-icon>
                                </template>
                            </n-button>
                        </template>
                        {{ item.name }}
                    </n-tooltip>
                </n-button-group>
            </n-space>
        </div>
        <Text ref="textRef" :operationHandle="operationHandle" :mask="mask" />
        <Mosaicvue ref="mosaicRef" />
        <n-modal v-model:show="showModal">
            <n-card style="width: 600px" title="预览图片" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <template #header-extra>
                    <n-button @click="() => showModal = false">
                        <template #icon>
                            <n-icon>
                                <Dismiss24Regular />
                            </n-icon>
                        </template>
                    </n-button>
                </template>
                <n-scrollbar style="max-height: 600px">
                    <n-image :render-toolbar="renderToolbar" width="100%" height="100%" object-fit="contain"
                        :src="canvasUrl" />
                </n-scrollbar>
                <template #footer>
                    <n-space>
                        <n-tooltip>
                            <template #trigger>
                                <n-button :loading="copyHandleLoading" @click="copyHandle">
                                    <template #icon>
                                        <n-icon>
                                            <Clipboard20Regular />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            复制
                        </n-tooltip>
                        <n-popover trigger="click">
                            <template #trigger>
                                <n-button @click="shareHandle">
                                    <template #icon>
                                        <n-icon>
                                            <Share20Regular />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            <n-card title="局域网共享">
                                <template #cover>
                                    <n-spin :show="showQr">
                                        <div style="display: flex; justify-content: center; align-items: center;">
                                            <n-qr-code :value="qrCodeText" />
                                        </div>
                                    </n-spin>
                                </template>
                                <div v-if="address.error">{{ address.error }}</div>
                                <n-space v-else vertical>
                                    <div>状态：{{ address.openShareNet ? '运行' : '停止' }} </div>
                                    <div>ip: {{ address.ip }} </div>
                                    <div>端口: {{ address.port }} </div>
                                    <div>网址: {{ qrCodeText }} </div>
                                </n-space>
                            </n-card>
                        </n-popover>
                        <n-tooltip>
                            <template #trigger>
                                <n-button @click="saveAsHandle">
                                    <template #icon>
                                        <n-icon>
                                            <ImageArrowForward24Regular />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            另存为……
                        </n-tooltip>
                        <n-tooltip>
                            <template #trigger>
                                <n-button @click="complete">
                                    <template #icon>
                                        <n-icon>
                                            <Checkmark20Filled />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            完成
                        </n-tooltip>
                    </n-space>
                </template>
            </n-card>
        </n-modal>
    </div>
</template>
<style>
    .draw {
        width: 100%;
        height: 100%;
    }

    canvas {
        position: absolute;
    }

    .opration {
        position: absolute;
        z-index: 4;
        background-color: #fff;
    }
</style>