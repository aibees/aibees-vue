<script setup>
import { ref } from 'vue'

defineProps({
  msg: String
})

const count = ref(0)
</script>

<template>
  <img alt="Vue logo" src="../assets/logo.png" />
  <h1>{{ msg }}</h1>

  <p>
    Recommended IDE setup:
  </p>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
