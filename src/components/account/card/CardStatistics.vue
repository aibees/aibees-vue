<template>
    <AccountHeader :prop_title=title />
  
  </template>
  
  <script setup>
    import { ref } from 'vue';
    import AccountHeader from '../common/AccountHeader.vue';
  
    const title = ref('결재내역 통계');
  
  </script>
  
  <style>
  
  </style>