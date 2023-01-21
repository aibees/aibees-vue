<template>
  <div class="aibees">
    <div class="aibees-header">
        <div class="aibees-header-title">
            {{  title }}
        </div>
        <div class="aibees-header-search">
            검색
        </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, markRaw } from 'vue'
    let title = ref("MARIA");

</script>

<style lang="scss" scoped>
    @import '@@/aibees/aibees_home.scss'
</style>