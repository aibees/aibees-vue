<script setup>

    defineProps({
        msg: String
    })
</script>

<template>
    <div id="header">
        <span>{{ msg }}</span>
    </div>
</template>

<style lang="scss" scoped>
    #header {
        width: 100%;
        height: 60px;
        border: 2px solid #000000;
        background-color: #aaffaa;
    }
</style>