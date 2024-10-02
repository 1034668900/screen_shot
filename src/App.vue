<script setup lang="ts">
const alertWindow = () => {
  alert("xixi")
}
console.log("window",window)
</script>

<template>
<div>
  <button @click="alertWindow">send</button>
</div>
</template>

<style scoped></style>