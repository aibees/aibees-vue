<script setup>
import "vue3-toastify/dist/index.css";
defineProps({
  msg: String
})

</script>

<template>
  <div class="container">
    <div id="left">
      <router-link to="/cafe"><img src="@/assets/cameu_logo.png" /></router-link>
    </div>
    <div id="right">
      <router-link to="/store"><img src="@/assets/store_logo.png" /></router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  @import '@@/home.scss'
</style>
