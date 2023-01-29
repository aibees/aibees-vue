<template>
  <div class="aibees">
    <div class="aibees-header">
        <div class="aibees-header-title">
            {{  title }}
        </div>
        <div class="aibees-header-search">
            <span>
                <input id="fileSearch" type="text" placeholder="검색" v-model="searchInput" @keyup.enter="clickSearchBtn" />
                <button id="searchButton" class="btnSearch" @click="clickSearchBtn">
                    <font-awesome-icons :icon="['fa-solid', 'fa-magnifying-glass']" />
                </button>
            </span>
            <hr/>
        </div>
    </div>
  </div>
</template>

<script setup>
    import { ref, markRaw } from 'vue'
    let title = ref("MARIA");
    let searchInput = ref("");

    const clickSearchBtn = e => {
        alert("input : " + searchInput.value);

        searchInput.value = '';
    }
</script>

<style lang="scss" scoped>
    @import '@@/aibees/aibees_home.scss'
</style>