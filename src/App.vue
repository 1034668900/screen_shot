<script setup lang="ts">

const getWindowSource = async () => {
  const res = await window.electronAPI.getWindowSource();
  console.log(res);
}
</script>

<template>
<div>
  <button @click="getWindowSource">send</button>
   hello
</div>
</template>

<style scoped></style>