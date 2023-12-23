<template>
    <div class="card-remain sub-container-small">
        <div class="options">
            <label class="title-label">이번 달 잔액 (Selected 3)</label>
        </div>

        <div v-for="(remain, idx) in remainData" :key="idx" class="card-remain-list">
            <div class="card-remain-item">
                <div class="card-name card-desc">{{ remain.cardNm }}</div>
                <div class="card-remain card-desc">가능잔액 : {{ remain.remainAmt }} 원</div>
                <div class="card-used card-desc">사용금액 : <strong>{{ remain.usedAmt }}</strong> / {{ remain.limitedAmt }} 원 ({{ remain.usedPercentage }}%)</div>
                
                <div class="percentage">
                    <div class="percentage-active" :style="{'width':remain.usedPercentage+'%'}">{{ remain.usedPercentage }}%</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, inject } from 'vue'
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import { addComma } from '@/scripts/util/common/CommonUtils.js'
    const emitter = inject('emitter');

    onMounted(() => {
        getRemainCardAmt();

        emitter.on('searchMainData', () => {
            getRemainCardAmt();
        })
    });

    const remainData = ref([]);

    const getRemainCardAmt = () => {
        const url = aibeesGlobal.API_SERVER_URL + "/account/card/status";
        const callback = (res) => {
            remainData.value = res.data;
            remainData.value.forEach(data => {
                data.remainAmt = addComma(data.remainAmt);
                data.usedAmt = addComma(data.usedAmt);
                data.limitedAmt = addComma(data.limitedAmt);
            })
        }
        axiosGet(url, callback);
    }

</script>

<style lang="scss" scoped>
.card-remain {
    .card-remain-list {
        .card-desc {
            width: 90%;
            margin: auto;
        }
        .card-name {
        }

        .card-remain {
            font-size: 18px;
            font-weight: 700;
        }

        .card-used {

        }

        .card-remain-item {
            text-align: left;
            margin-bottom: 20px;

            .percentage {
                width: 90%;
                height: 30px;
                margin: 10px auto;
                background-color: rgb(235, 235, 235);
                border: 1px solid lightgrey;
                overflow: hidden;

                .percentage-active {
                    height: 30px;
                    font-weight: 700;
                    text-align: center;
                    padding-top: 7px;
                    background-color: yellow
                }
            }
        }
    }
}
</style>