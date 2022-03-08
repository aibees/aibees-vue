<template>
  <Header msg="Store" />

  <div id="search-tab">
    여기에 검색 탭 들어갈거에요
    <button > 검색 </button>
  </div>
  <StoreList />
</template>


<script setup>
  import Header from '@/components/common/commonView/Header.vue'
  import StoreList from './sub/StoreList.vue'

  defineProps({
    msg: String,
    Header: Header,
    StoreList: StoreList
  })

</script>

<style lang="scss" scoped>
    #search-tab {
      margin: 50px 0px;
    }
</style>
