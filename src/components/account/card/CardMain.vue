<template>
    <AccountHeader :prop_title=title />
    <div class="cardMain">
        <div class="main-container">
            <CardDailyRegister />
            <CardRemainAmtStatus />
            <CardRecentlyStatus />
        </div>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import AccountHeader from '../common/AccountHeader.vue';
    import CardDailyRegister from './mainComponent/CardDailyRegister.vue';
    import CardRemainAmtStatus from './mainComponent/CardRemainAmtStatus.vue';
    import CardRecentlyStatus from './mainComponent/CardRecentlyStatus.vue';

    const title = ref("카드내역 홈");
</script>

<style lang="scss">
@import '@@/__variables.scss';
.cardMain {
    overflow: auto;
    height: 95vh;
    .main-container {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        width: 80%;
        max-width: 1000px;
        margin: 0px auto 5px;
        

        .sub-container-big {
            width: 95%;
            height: auto;
            margin: 5px;
            padding: 10px;
            background-color: beige;

            @include semiMobile {
                max-width: 450px;
            }
        }

        .sub-container-small {
            width: 95%;
            max-width: 450px;
            height: auto;
            margin: 5px;
            padding: 10px;
            background-color: beige;
        }

        .options {
            width: inherit;
            margin: auto;
            padding-bottom: 5px;
            display: flex;
            justify-content: space-between;

            .title-label {
                padding-top: 4px;
                font-weight: 600;
            }

            .option-button {
                border-radius: 5px;
                color: white;
                background-color: rgb(0, 0, 50);
                padding: 3px 13px;
                cursor: pointer;
            }
        }
    }
}

.cardMain::-webkit-scrollbar { 
    display: none;  /* Safari and Chrome */
}
</style>