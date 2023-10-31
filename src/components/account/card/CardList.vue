<template>
  <AccountHeader :prop_title=title />

</template>

<script setup>
  import {ref} from 'vue';
  import AccountHeader from '../common/AccountHeader.vue';

  const title = ref('카드내역 조회');

</script>

<style>

</style>