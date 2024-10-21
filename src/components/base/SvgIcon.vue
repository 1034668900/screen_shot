<template>
  <span class="no-drag" @click="handleClick">
    <component :style="styleSize" ref="iconElement" :is="icon" :class="svgClass" class="svg-icon"></component>
  </span>
</template>

<script lang="ts" setup>
import type { Component } from 'vue';
import { defineProps, defineEmits, computed } from 'vue';

interface Props {
  icon ?: Component;
  size ?: string | number;
  svgClass ?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(["click"]);
console.log("class",props.svgClass);

const styleSize = computed((): string => {
  return `width: ${props.size}px ; height: ${props.size}px`;
})

const handleClick = (event:any) => {
  emit("click",event)
}
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>