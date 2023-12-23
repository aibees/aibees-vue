<template>
    <div class="card-recently sub-container-small">
        <div class="options">
            <label class="title-label">최근 사용내역 (Recently 5)</label>
        </div>
        <div class="card-recently-list">
            <ul>
                <li v-for="(recent, idx) in recentList" :key="idx">
                    <div class="statement-item">
                        <div class="item-info">
                            <strong>{{ recent.remark }}</strong>
                            <div class="item-subinfo">
                                <strong style="font-weight: 850; font-size:12px;">{{ recent.ymd }}</strong> · {{ recent.times }}
                            </div>
                        </div>
                        <div class="item-amount">
                            <div>{{ recent.amount }}</div>
                            <div style="font-size: 14px;font-weight: 500">{{ recent.cardNm }}</div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, inject } from 'vue'
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import { addComma } from '@/scripts/util/common/CommonUtils.js'
    const emitter = inject('emitter');

    const recentList = ref([]);

    onMounted(() => {
        // get recently used card statement
        getRecentCardStatement();

        emitter.on('searchMainData', () => {
            getRecentCardStatement();
        })
    })

    const getRecentCardStatement = () =>{
        const url = aibeesGlobal.API_SERVER_URL + "/account/card/recent"
        const callback = (res) => {
            res.data.forEach(d => {
                d.amount = addComma(d.amount);
            })
            recentList.value = res.data;
        }
        axiosGet(url, callback);
    }
</script>

<style lang="scss" scoped>
.card-recently {

    .card-recently-list {
        ul {
            margin-inline: 0px;
            margin-block: 0px;
            padding-inline: 0px;
            list-style: none;
            li {
                .statement-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px;

                    .item-info {
                        width: 60%;
                        text-align: left;
                        font-size: 14px;

                        .item-subinfo {
                            margin-top: 5px;
                            color: rgb(90, 90, 90);
                            font-size: 12px;

                            .usage {
                                border-radius: 15px;
                                padding: 2px 5px;
                                margin-left: 10px;
                            }
                        }
                    }

                    .item-amount {
                        float: right;
                        text-align: right;
                        font-size: 16px;
                        font-weight: 750;
                    }
                }
            }
        }
    }
}
</style>