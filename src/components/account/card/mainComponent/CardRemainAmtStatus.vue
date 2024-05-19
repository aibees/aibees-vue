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
                    <div class="percentage-value">{{ remain.usedPercentage }}%</div>
                    <div class="percentage-active" :style="{'width':remain.usedPercentage+'%', 'background-color':remain.backColor}"></div>
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
            remainData.value.forEach(remain => {
                remain.remainAmt = addComma(remain.remainAmt);
                remain.usedAmt = addComma(remain.usedAmt);
                remain.limitedAmt = addComma(remain.limitedAmt);
                
                const percentage = remain.usedPercentage;
                if(percentage <= 33) {
                    remain['backColor'] = 'green';
                } else if(percentage <= 66) {
                    remain['backColor'] = 'yellow';
                } else if(percentage <= 100) {
                    remain['backColor'] = 'red';
                } else {
                    remain['backColor'] = '#7a2b2b';
                }
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
                position: relative;
                width: 90%;
                height: 30px;
                margin: 10px auto;
                background-color: rgb(235, 235, 235);
                border: 1px solid lightgrey;
                overflow: hidden;

                .percentage-value {
                    position: absolute;
                    top: 6px;
                    left: 10px;
                    font-weight: 650;
                }
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