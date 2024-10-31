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
    height: 2rem;
    color: #898B95;
    border-bottom: 1px solid #BBC2CF;
    background-color: #E3DAE5;
    padding: 0 0.5rem;
    .title {
        font-weight: bold;
        font-family:cursive;
    }
}

.dragable {
    -webkit-use-select: none;
}
</style>