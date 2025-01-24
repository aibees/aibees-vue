<template>
    <AccountHeader :prop_title=title />
    
    <div class="journal-cashflow">
        <div class="container button-container">
            <div><button @click="openSearchModal">조회</button></div>
        </div>
        <div class="container search-container">
            <div class="info-block">
                <span>월별조회</span>
                <div class="input-box">
                    <input 
                        id="search-ym" 
                        class="text-required" 
                        type="month"
                        v-model="searchParams.ym" />
                </div>
            </div>
        </div>
        <!-- 메인 그리드 시작 -->
        <div class="main-container">
            <div class="container cashflow-container">
                <div class="flow flow-revenue">
                    <p>수익</p>
                    <div class="sum-revenue accum">합계 : 14,394,384 원</div>
                    <br/>
                    <div class="sumByAcct">
                        <div class="acct-group">
                            <div class="acct">
                                <span>급여 / 4010000</span>
                                <span> </span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="summary">
                                소계: 4,200,298 원
                            </div>
                        </div>
                        
                        <div class="acct-group">
                            <div class="acct">
                                <span>사내복지 / 4010000</span>
                                <span> </span>
                            </div>
                            <div class="acct">
                                <span>&emsp;업무지원비 / 4010001</span>
                                <span>795,940 원</span>
                            </div>
                            <div class="summary">
                                소계: 4,200,298 원
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flow flow-expense">
                    <p>비용</p>
                    <div class="sum-expense accum">합계 : 14,394,384 원</div>
                    <br/>
                    <div class="sumByAcct">
                        <div class="acct-group">
                            <div class="acct">
                                <span>변동지출 / 4010000</span>
                                <span> </span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="summary">
                                소계: 4,200,298 원
                            </div>
                        </div>
                        
                        <div class="acct-group">
                            <div class="acct">
                                <span>변동지출 / 4010000</span>
                                <span> </span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="summary">
                                소계: 4,200,298 원
                            </div>
                        </div>

                        <div class="acct-group">
                            <div class="acct">
                                <span>변동지출 / 4010000</span>
                                <span> </span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="acct">
                                <span>&emsp;정기급여 / 4010001</span>
                                <span>4,200,298 원</span>
                            </div>
                            <div class="summary">
                                소계: 4,200,298 원
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container detail-container">
                detail
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
import AccountHeader from '../common/AccountHeader.vue';
import { addComma, removeComma } from '@/scripts/util/common/CommonUtils.js'
/*********************
 ** GLOBAL VARIABLE **
 *********************/
 const title = ref("가계부 현금흐름표");
 const searchParams = reactive({
    ym: ''
 })

 /*********************
 **   LIFE  CYCLE   **
 *********************/
onMounted(() => {
    searchParams.ym = getToday();
});

/*********************
 ** SETUP  FUNCTION **
 *********************/
 // 오늘 날짜 구해오기
const getToday = () => {
    const toDate = new Date();
    let dateValue = toDate.getFullYear();
    dateValue = dateValue + '-' + (toDate.getMonth() + 1);
    
    return dateValue;
}
</script>

<style lang="scss" scoped>
button {
    padding: 3px 15px;
    margin: 7px 5px 0px;
    border: none;
    border-radius: 5px;
    background-color: white;
}

.input-box {
    width: 130px;
    height: 20px;
    border: 1px solid grey;
    border-radius: 2px;
    margin-left: 7px;

    input {
        border: none;
        border-radius: 2px;
        width: 100%;
        height: 100%;
        padding-inline: 0;
        padding-block: 0;
    }
}
.journal-cashflow {
    width: 90%;
    height: 75vh;
    min-width: 1100px;
    max-width: 1500px;
    margin: auto;

    .container {
        border-radius: 5px;
        margin: 10px 0px;
        background-color: rgb(230, 230, 230);
        padding:5px 10px;
    }

    .button-container {
        width: 100%;
        display: flex;
        justify-content: right;
        height: 36px;
    }

    .search-container {
        width: 100%;

        .info-block {
            display: flex;
            margin: 7px 20px 7px 5px;
        }
    }

    .main-container {
        width: 100%;
        margin: 10px 0px;
        padding:5px 10px;
        display: flex;
        justify-content: space-between;

        .cashflow-container {
            width: 67%;
            display: flex;
            justify-content: space-between;

            .flow {
                height: 100%;
                p {
                    width: 100%;
                    margin-block: 0px;
                    margin-top: 5px;
                    font-weight: 750;
                    padding-bottom: 4px;
                    border-bottom: 1px solid darkgrey;
                }

                .accum {
                    padding-bottom: 6px;
                    padding-top: 1em;
                    padding-right: 15px;
                    border-bottom: 1px solid darkgrey;
                    text-align: right;
                    
                }

                .sumByAcct {
                    .acct-group {
                        margin-bottom: 30px;
                        .acct {
                            display: flex;
                            justify-content: space-between;
                            padding: 5px 15px;
                            
                        }
                        .summary {
                            text-align: right;
                            font-size: 15px;
                            color: rgb(105, 105, 105);
                            margin-top: 20px;
                            padding: 7px 15px 7px 0;
                            border-top: 1px dashed rgb(145, 145, 145);
                            border-bottom: 1px dashed rgb(145, 145, 145);
                        }
                    }
                }
            }

            .flow-revenue {
                width: 50%;
                background-color: rgb(255, 255, 227);
                border-right: 1px solid darkgrey;

                .sum-revenue {
                    background-color: rgb(255, 255, 180);
                }
            }
            .flow-expense {
                width: 50%;
                background-color: rgb(219, 255, 210);

                .sum-expense {
                    background-color: rgb(154, 255, 129);
                }
            }
        }
        .detail-container {
            width: 27%;
        }
    }
}
</style>