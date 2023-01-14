<template>
  <Header msg="Store" />

  <StoreSearch />
  <StoreList />
</template>


<script setup>
  import Header from '@/components/common/commonView/Header.vue'
  import StoreList from './sub/StoreList.vue'
  import StoreSearch from './sub/StoreSearch.vue'

  defineProps({
    msg: String,
    Header: Header,
    StoreList: StoreList,
    StoreSearch: StoreSearch
  })

</script>

<style lang="scss" scoped>
    #search-tab {
      margin: 50px 0px;
    }
</style>
