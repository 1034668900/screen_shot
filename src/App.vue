<template>
  <div class="app-container">
    <div class="header-area">
      <Header />
    </div>
    <div class="operate-area">
      <button @click="handleScreenShot">截图</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "./components/Header.vue";

const handleScreenShot = () => {
  window.electronAPI.screenShot();
};
</script>



<style scoped>
.app-container {
  height: 100%;
  background-color: #ebebef;
}
.operate-area {
  padding: 1rem 1rem;
}
</style>

<style>
* {
  margin: 0;
  padding: 0;
}

body {
  width: 100vw;
  height: 100vh;
}

#app {
  width: 100%;
  height: 100%;
}

</style>
