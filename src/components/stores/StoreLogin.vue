<script setup>
import { ref } from 'vue'

defineProps({
  msg: String
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <p>
    스마트스토어 관리페이지 로그인
  </p>
</template>

<style scoped>
</style>
