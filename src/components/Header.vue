<template>
    <div id="header" class="dragable window-title">
        <span class="title">screen shot 1.0.0</span>
        <div class="operate-area">
            <SvgIcon class="icon-button" :icon="minimize" size="15" @click="handleMinimize"></SvgIcon>
            <SvgIcon class="icon-button" :icon="close" size="15" @click="handleClose"></SvgIcon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import SvgIcon from './base/SvgIcon.vue';
import close from './icons/close.vue';
import minimize from './icons/minimize.vue';

const handleClose = () => {
    window.electronAPI.closeWindow();
}
const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
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

    .icon-button {
        margin: 0.5rem;
    }
}

.dragable {
    -webkit-use-select: none;
}
</style>