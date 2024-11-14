<template>
    <AccountHeader :prop_title=title />
    <div class="sysAcctCd">
        <div class="sysAcctCd-buttons">

        </div>
        
        <div class="sysAcctCd-search">

        </div>

        <div class="sysAcctCd-container">

        </div>
    </div>
</template>

<script setup>
// import declaration
import { ref, onBeforeMount, onMounted } from 'vue'
import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
import { getResourceItem, getResourceList } from '@/scripts/util/common/SettingResource.js';
import AccountHeader from '../common/AccountHeader.vue';

/******************************
 ******* Const  Variable ******
 ******************************/
const title = ref('시스템설정-계정과목관리');
</script>

<style lang="scss" scoped>

</style>