<script setup lang="ts">
  import ScreenCut from './components/screenCut/ScreenCut.vue';
  import EyeDrop from './components/EyeDrop.vue';
  import Paint from './components/Paint/Paint.vue';
  import { onMounted, ref } from 'vue';
  const pageStr = ref('screencut');
  onMounted(() => {
    window.electronAPI.getInfo((_e, { mode }) => {
      pageStr.value = mode;
    })
  })

</script>
<template>
  <ScreenCut v-show="pageStr === 'screencut'" />
  <EyeDrop v-show="pageStr === 'eyedrop'" />
  <Paint v-show="pageStr === 'paint'" />
</template>
<style scoped></style>