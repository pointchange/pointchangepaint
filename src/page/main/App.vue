<script setup lang="ts">
  import { NIcon, NSpace, NTabPane, NTabs, NCard, NImage, type ImageRenderToolbarProps, NEmpty, NRadioButton, NRadioGroup, NConfigProvider, darkTheme, NLayout, NLayoutHeader, NLayoutContent, NTime, NTooltip, NButton, NText, NButtonGroup } from 'naive-ui'
  import {
    ScreenCut20Regular, Eyedropper20Filled, DrawText20Filled, Dismiss20Regular, Copy20Regular, ArrowSync20Regular, Subtract16Regular,
    Square20Regular, SquareMultiple16Regular
  } from '@vicons/fluent'
  import { onBeforeMount, onMounted, ref, toRaw } from 'vue';
  import { useScreenshot } from './store/screenCut';
  import { useColor } from './store/color';
  import { useThemeStore } from './store/theme';
  import { usePaintStore } from './store/paint';

  const imgStore = useScreenshot();
  const colorStore = useColor();
  const themeStore = useThemeStore();
  const paintStore = usePaintStore();
  const btns = [
    {
      id: 'screencut',
      name: '截图',
      icon: ScreenCut20Regular,
    },
    {
      id: 'eyedrop',
      name: '取色器',
      icon: Eyedropper20Filled,
    },
    {
      id: 'paint',
      name: '画图',
      icon: DrawText20Filled,
    },
  ]
  function clickHandle(str: string) {
    window.electronAPI.startSecondWin(str);
  }
  const leaveWin = ref(false);

  onBeforeMount(() => {
    window.electronAPI.onSetPosition(toRaw(themeStore.position))
  })
  onMounted(() => {
    imgStore.init();
    window.electronAPI.getColor((_e, c) => {
      colorStore.addColor(c);
    })
    window.electronAPI.completeScreenCut((_e, file) => {
      imgStore.add(file);
    });
    window.electronAPI.onGetPosition((_e, obj) => {
      themeStore.position = obj;
    })
    window.electronAPI.onLeaveWin((_e, bool) => {
      leaveWin.value = !bool;
    })
  })
  const renderToolbar = ({ nodes }: ImageRenderToolbarProps) => {
    return [
      nodes.rotateCounterclockwise,
      nodes.rotateClockwise,
      nodes.zoomOut,
      nodes.zoomIn,
      nodes.close
    ]
  }
  const theme = ref([
    {
      value: 'light',
      label: '白天'
    },
    {
      value: 'dark',
      label: '黑夜'
    },
  ]);
  const loadingReset = ref(false);
  function resetHandle() {
    loadingReset.value = true;
    imgStore.$reset();
    colorStore.$reset();
    themeStore.$reset();
    loadingReset.value = false;
  }
  function closeAppHandler() {
    window.electronAPI.onCloseWin();
  }
  let isFullWinScreen = ref(false);
  function fullScreenHandler() {
    isFullWinScreen.value = !isFullWinScreen.value;
    window.electronAPI.onFullScreenWin(isFullWinScreen.value);
  }

  function minimizableHandler() {
    window.electronAPI.onMinimizableWin();
  }

</script>

<template>
  <n-config-provider :theme="themeStore.theme === 'light' ? undefined : darkTheme">
    <n-layout class="n-layout-container">
      <n-layout-header class="app-header" :style="{
        opacity: leaveWin ? 0.8 : 1
      }">
        <n-space justify="space-between">
          <n-button-group class="no_darg">
            <n-tooltip trigger="hover" v-for="item in btns" :key="item.id">
              <template #trigger>
                <n-button quaternary @click="clickHandle(item.id)">
                  <template #icon>
                    <n-icon size="32" :component="item.icon" />
                  </template>
                </n-button>
              </template>
              {{ item.name }}
            </n-tooltip>
          </n-button-group>

          <n-button-group class="no_darg">
            <n-tooltip trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-button quaternary size="small" @click="minimizableHandler">
                  <template #icon>
                    <n-icon>
                      <Subtract16Regular />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <span>最小化</span>
            </n-tooltip>
            <n-tooltip trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-button quaternary size="small" @click="fullScreenHandler">
                  <template #icon>
                    <n-icon>
                      <Square20Regular v-show="!isFullWinScreen" />
                      <SquareMultiple16Regular v-show="isFullWinScreen" />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <span>{{ !isFullWinScreen ? '最大化' : '恢复' }}</span>
            </n-tooltip>
            <n-tooltip trigger="hover" :show-arrow="false">
              <template #trigger>
                <n-button class="app-close" quaternary size="small" @click="closeAppHandler">
                  <template #icon>
                    <n-icon>
                      <Dismiss20Regular />
                    </n-icon>
                  </template>
                </n-button>
              </template>
              <span>关闭</span>
            </n-tooltip>
          </n-button-group>
        </n-space>
      </n-layout-header>
      <n-layout-content :native-scrollbar="false" content-style="padding: 16px;">
        <n-tabs type="line" animated>
          <n-tab-pane name="screenCut" tab="截图">
            <div class="img-container">
              <template v-if="imgStore.src.length > 0">
                <n-card size="small" embedded hoverable closable v-for="item in imgStore.src"
                  @close="() => imgStore.delete(item.path)">
                  <template #header>
                    <n-time :time="item.birthtime" />
                  </template>
                  <n-image :render-toolbar="renderToolbar" lazy width="100%" :key="item.path"
                    :src="imgStore.protocol + item.path" />
                </n-card>
              </template>
              <n-empty v-else description="你什么也找不到"></n-empty>
            </div>
          </n-tab-pane>
          <n-tab-pane name="eyedropper" tab="取色">
            <!-- Clock20Regular DeleteDismiss20Regular Navigation20Regular Grid20Regular Dismiss20Regular DocumentOnePage20Regular AppFolder20Regular-->
            <div class="tags-group" v-if="colorStore.colors.length > 0">
              <span class="tags" v-for="c in colorStore.colors" :key="c.id" :style="{
                backgroundColor: c.color
              }" @dblclick="() => colorStore.copy(c.color)">
                <span class="color-text">{{ c.color }}</span>
                <n-space>
                  <n-icon class="tags-icon-close" :component="ArrowSync20Regular"
                    @click="() => colorStore.switchColorFormat(c.color)" />
                  <n-icon class="tags-icon-close" :component="Copy20Regular" @click="() => colorStore.copy(c.color)" />
                  <n-icon class="tags-icon-close" :component="Dismiss20Regular"
                    @click="() => colorStore.deleteColor(c.id)" />
                </n-space>
              </span>
            </div>
            <n-empty v-else description="无色"></n-empty>
            <!-- </n-space> -->
          </n-tab-pane>
          <n-tab-pane name="paint" tab="画图">
            <div v-if="paintStore.paints.length > 0" class="paint">

            </div>
            <n-empty v-else description="你什么也找不到"></n-empty>
          </n-tab-pane>
          <n-tab-pane name="setting" tab="设置">
            <n-space vertical>
              <n-radio-group v-model:value="themeStore.theme" name="themegroup">
                <n-radio-button v-for="t in theme" :key="t.value" :value="t.value" :label="t.label" />
              </n-radio-group>
              <n-button type="error" :loading="loadingReset" @click="resetHandle">重置所有状态</n-button>
              <n-text>© 2025 pointchange </n-text>
              <n-text>仅用于学习与交流 </n-text>
            </n-space>
          </n-tab-pane>
        </n-tabs>
      </n-layout-content>
    </n-layout>
  </n-config-provider>

</template>
<style>

  .n-config-provider,
  .n-layout-container {
    height: 100%;
  }

  .app-header {
    -webkit-app-region: drag;
  }

  .no_darg {
    -webkit-app-region: no-drag;
  }

  .app-close:hover {
    background-color: red !important;
    color: #fff !important;
  }

  .btns {
    font-size: 24px;
  }

  .n-tooltip-icon {
    padding: 0 .2rem;
  }

  .n-tooltip-icon:hover {
    background-color: var(--n-item-text-color-active);
    cursor: pointer;
  }

  .tags-group {
    display: grid;
    gap: .4rem;
    width: 100%;
  }

  .tags {
    margin: .4rem 0;
    padding: .8rem .4rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: .4rem;
  }

  .tags:hover {
    cursor: pointer;
    border-radius: 1rem;
    transition: border-radius .1s linear;
  }

  .tags:hover .tags-icon-close {
    visibility: visible;
  }

  .color-text {
    color: rgba(255, 255, 255, .9);
    text-shadow: 0 0 2px #000;
    letter-spacing: 2px;
  }

  .tags-icon-close {
    padding: .1rem;
    font-size: 1rem;
    visibility: hidden;
    border: 1px solid #222;
    border-radius: 2px;
  }

  .tags-icon-close:hover {
    background-color: rgba(255, 255, 255, .6);
    border-radius: 50%;
    transition: border-radius .1s linear;
  }

</style>
