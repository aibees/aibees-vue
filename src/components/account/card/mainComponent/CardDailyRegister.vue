<template>
    <div class="card-daily sub-container-big">
        <div class="options">
            <label class="title-label">카드 건 별 제출</label>
            <button class="option-button" @click="submitCardText()">제출</button>
        </div>
        <textarea id="card-daily-text" class="card-daily-text" v-model="payText" @change="dailyTextChk();"></textarea>
    </div>
</template>

<script setup>
    import { inject, ref } from 'vue';
    import mariaApi from '../../../../scripts/util/mariaApi';

    const payText = ref("");

    const emitter = inject('emitter');

    const submitCardText = async () => {
        const { data } = await mariaApi.post('/api/account/card/txt', { payText: payText.value });
        console.log(data);
    }

    const dailyTextChk = () => {
        payText.value = payText.value.replaceAll('[Web발신]\n', '');
        document.getElementById('card-daily-text').value = payText.value;
    }
</script>

<style lang="scss" scoped>
.card-daily {
    .card-daily-text {
        width: 95%;
        height: 120px;
        line-height: 1.3;
        margin: auto;
        padding-left: 10px;
        padding-top: 5px;
        font-size: 13px;
        font-weight: 550;
        resize: none;
        border-radius: 5px;
        overflow: hidden;
    }
}
</style>