<template>
    <div id="naver_id_login">
        <button @click="login();">네이버 로그인</button>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    const client_id = 'JUKKdnSZR3y6gSbRHWoC ';
    const redirectURI = encodeURI('http://localhost:9010/home');
    const state = 'RANDOM_STATE';

</script>

<style lang="scss" scoped>

</style>