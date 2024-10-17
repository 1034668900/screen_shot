<template>
    <div id="header" class="dragable window-title">
        <SvgIcon :icon="close" size="15" class="no-drag" svgClass="svg-color" @click="handleClose"></SvgIcon>
    </div>
</template>

<script lang="ts" setup>
import SvgIcon from './base/SvgIcon.vue';
import close from './icons/close.vue';

const handleClose = () => {
    console.log("adada")
}
</script>

<style lang="scss" scoped>
#header {
    width: 100%;
    height: 2rem;
}

.dragable {
    -webkit-use-select: none;
}
</style>