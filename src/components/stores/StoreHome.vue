<script setup>
import { ref } from 'vue'

defineProps({
  msg: String
})

const count = ref(0)
</script>

<template>
  <img alt="Vue logo" src="../../assets/cameu_logo.png" />
  <h1>{{ msg }}</h1>

  <p>
    스마트스토어 관리페이지
  </p>
</template>

<style scoped>
    img {
        width: 300px;
        height: 300px;
    }
</style>
