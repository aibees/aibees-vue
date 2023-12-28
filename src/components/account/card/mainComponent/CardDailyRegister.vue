<template>
    <div class="card-daily sub-container-big">
        <div class="options">
            <label class="title-label">카드 건 별 제출</label>
            <button class="option-button" @click="submitCardText()">제출</button>
        </div>
        <textarea id="card-daily-text" class="card-daily-text" @change="dailyTextChk();"></textarea>
    </div>
</template>

<script setup>
    import { inject } from 'vue';
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    const emitter = inject('emitter');

    const submitCardText = () => {
        const txt = document.getElementById('card-daily-text').value;
        const data ={
            'text': txt,
            'type': "CARD"
        };
        const url = aibeesGlobal.API_SERVER_URL + '/account/card/paytext';
        const callback = (res) => {
            const result = res.data;
            if(result == 'FAIL') {
                alert(result.message);
            } else {
                document.getElementById('card-daily-text').value = '';
                // emit event bus
                emitter.emit('searchMainData');
            }
        }

        axiosPost(url, data, callback);
    }

    const dailyTextChk = () => {
        const txt = document.getElementById('card-daily-text').value;
        document.getElementById('card-daily-text').value = txt.replaceAll('[Web발신]\n', '');
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