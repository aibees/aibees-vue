<template>
    <AccountHeader :prop_title=title />
    
    <div class="journal-cashflow">
        <div class="container button-container">
            <div><button @click="getData">조회</button></div>
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
                    <div class="sum-revenue accum">합계 : {{ revenueAmt }} 원</div>
                    <br/>
                    <div class="sumByAcct">
                        <div class="acct-group" v-for="(group, idx) in revenueData" :key="idx">
                            <div class="acct">
                                <span>{{ group.parentAcctNm }} / {{ group.parentAcctCd }}</span>
                                <span> </span>
                            </div>
                            <div class="acct" v-for="(item, idx) in group.subAcct" :id="item.acctCd" @click="viewDetail(item.acctCd)">
                                <span>&emsp;ㄴ{{ item.acctNm }} / {{ item.acctCd }}</span>
                                <span>{{ item.amount }} 원</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flow flow-expense">
                    <p>비용</p>
                    <div class="sum-expense accum">합계 : {{ expenseAmt }} 원</div>
                    <br/>
                    <div class="sumByAcct">
                        <div class="acct-group" v-for="(group, idx) in expenseData" :key="idx">
                            <div class="acct">
                                <span>{{ group.parentAcctNm }} / {{ group.parentAcctCd }}</span>
                                <span> </span>
                            </div>
                            <div class="acct" v-for="(item, idx) in group.subAcct" :id="item.acctCd" @click="viewDetail(item.acctCd)">
                                <span>&emsp;ㄴ{{ item.acctNm }} / {{ item.acctCd }}</span>
                                <span>{{ item.amount }} 원</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="container detail-container">
                <div class="detail-body" v-for="(detail, idx) in detailData" :key="idx">
                    <span class="remark">{{ detail.remark }}</span>
                    <div class="detail-view">
                        <div class="time">{{ detail.transactionDate }}</div>
                        <span class="amount">{{ detail.amount }} 원</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import mariaApi from '../../../scripts/util/mariaApi';
import AccountHeader from '../common/AccountHeader.vue';
import { addComma, removeComma } from '@/scripts/util/common/CommonUtils.js';
/*********************
 ** GLOBAL VARIABLE **
 *********************/
const title = ref("가계부 현금흐름표");
const searchParams = reactive({
    ym: ''
});

let curSelectedTr = '';

const revenueData = ref({});
const revenueAmt = ref("");

const expenseData = ref({});
const expenseAmt = ref("");

const detailData = ref([]);

/*********************
 **   LIFE  CYCLE   **
 *********************/
onMounted(async () => {
    searchParams.ym = getToday();
    await getData();
});

/*********************
 ** SETUP  FUNCTION **
 *********************/
 // 오늘 날짜 구해오기
const getToday = () => {
    const toDate = new Date();
    let dateValue = toDate.getFullYear();
    let month = toDate.getMonth() + 1;
    if (month.toString().length < 2) {
        month = '0' + month;
    }
    return dateValue + '-' + month;
}

const getData = async () => {
    const ym = searchParams.ym;
    const revenue = await getRevenueData(ym);
    console.log(revenue);
    revenueData.value = revenue;
    const expense = await getExpenseData(ym);
    expenseData.value = expense;
    console.log(expense);
}

const getRevenueData = async (ym) => {
    const result = [];
    const parents = new Map();
    const { data } = await mariaApi.get(`/account/cashflow/${ym}/revenue`);

    data.forEach(d => {
        d['amount'] = addComma(d.crAmount + (-1 * d.drAmount));
        const parentKey = d.parentAcctNm + '/' + d.parentAcctCd;
        let subArr;
        if (parents.has(parentKey)) {
            subArr = parents.get(parentKey);
            subArr.push(d);
        } else {
            subArr = [d];
        }
        parents.set(parentKey, subArr);
    });

    let allAmount = 0;
    parents.forEach(p => {
        const summing = p.reduce((acc, cur) => { return acc + removeComma(cur.amount) }, 0)

        allAmount += summing;
        const groupedSet = {
            'parentAcctCd': p[0].parentAcctCd,
            'parentAcctNm': p[0].parentAcctNm,
            'subAcct': p,
            'groupAmt': addComma(summing)
        }
        result.push(groupedSet);
    });
    revenueAmt.value = addComma(allAmount);

    return result;
}

const getExpenseData = async (ym) => {
    const result = [];
    const parents = new Map();
    const { data } = await mariaApi.get(`/account/cashflow/${ym}/expense`);

    data.forEach(d => {
        d['amount'] = addComma(d.drAmount + (-1 * d.crAmount));
        const parentKey = d.parentAcctNm + '/' + d.parentAcctCd;
        let subArr;
        if (parents.has(parentKey)) {
            subArr = parents.get(parentKey);
            subArr.push(d);
        } else {
            subArr = [d];
        }
        parents.set(parentKey, subArr);
    });

    let allAmount = 0;
    parents.forEach(p => {
        const summing = p.reduce((acc, cur) => { return acc + removeComma(cur.amount) }, 0)

        allAmount += summing;
        const groupedSet = {
            'parentAcctCd': p[0].parentAcctCd,
            'parentAcctNm': p[0].parentAcctNm,
            'subAcct': p,
            'groupAmt': addComma(summing)
        }
        result.push(groupedSet);
    })
    expenseAmt.value = addComma(allAmount);

    return result;
}

const viewDetail = async (acctCd) => {
    if (curSelectedTr != '') {
        document.getElementById(curSelectedTr).classList.remove('acct-active');
    }

    curSelectedTr = acctCd;
    const tr = document.getElementById(acctCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }

    const ym = searchParams.ym;
    const { data } = await mariaApi.get(`/account/cashflow/detail/${ym}/${acctCd}`);
    detailData.value = data;
    detailData.value.forEach(data => {
        data['amount'] = addComma(data.crAmount + data.drAmount);
    });
}
</script>

<style lang="scss" scoped>
.acct-active {
    font-weight: bolder;
    filter: brightness(50%);
}

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
            background-color: white;
            border: 2px solid rgb(230, 230, 230);
            width: 28%;

            .detail-body {
                margin-bottom: 20px;
                border-bottom: 1px solid black;
                .detail-view {
                    display: flex;
                    justify-content: space-between;
                }

                .time {
                    font-size: small;
                }

                .remark {
                    text-align: left;
                }
            }
        }
    }
}
</style>