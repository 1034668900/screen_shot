<template>
  <div class="header-area">
    <Header />
  </div>
  <div class="operate-area">
    <button @click="handleScreenShot">截图</button>
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";

const handleScreenShot = () => {
  window.electronAPI.screenShot();
}
</script>

<style scoped>
.header-area {
  width: 100%;
  height: 100%;
}
.operate-area {
  padding: 1rem 0;
}
</style>
