<template>
    <div id="naver_id_login">
        <button @click="login();">네이버 로그인</button>
    </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
    
    const client_id = 'JUKKdnSZR3y6gSbRHWoC ';
    const redirectURI = encodeURI('http://localhost:9010/home');
    const state = 'RANDOM_STATE';

    const loginUrl = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;

    onMounted(() => {
    })

    const login = () => {
        const url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id='+ client_id + '&redirect_uri=' + redirectURI + '&state=' + state;

            console.log("==================url====================");
            console.log(url);

            window.location.href=url;
    }
</script>

<style lang="scss" scoped>

</style>