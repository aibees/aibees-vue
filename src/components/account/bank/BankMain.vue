<template>
    <AccountHeader :prop_title=title />
    <div class="bankMain">
        <div class="main-container">
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import AccountHeader from '../common/AccountHeader.vue';

    const title = ref("은행통장내역 홈");
</script>

<style lang="scss">
@import '@@/__variables.scss';
.bankMain {

    .main-container {
        
    }
}

.bankMain::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
}
</style>