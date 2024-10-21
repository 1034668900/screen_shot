<template>
    <div id="header" class="dragable window-title">
        <span class="title">screen-shot</span>
        <SvgIcon :icon="close" size="15" @click="handleClose"></SvgIcon>
    </div>
</template>

<script lang="ts" setup>
import SvgIcon from './base/SvgIcon.vue';
import close from './icons/close.vue';

const handleClose = () => {
    window.electronAPI.closeWindow();
}
</script>

<style lang="scss" scoped>
#header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    color: black;
    border-bottom: 1px solid #808080;

    .title {
        font-weight: bold;
        font-family:cursive;
    }
}

.dragable {
    -webkit-use-select: none;
}
</style>