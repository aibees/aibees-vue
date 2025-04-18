<template>
    <AccountHeader :prop_title=title />
    <div class="journal-search">
        <div class="journal-find">
            <div class="container-block journal-main-buttons">
                <div><button @click="reset">초기화</button></div>
                <div><button @click="searchData">조회</button></div>
            </div>
            <div class="container-block journal-main-search">
                <div class="paragraph-block journal-info-one">
                    <MLabelInput
                        :id="`journal-no`"
                        :label="`전표번호`"
                        v-model="searchParam.journalNo"
                        style="margin: 5px 0px;" />
                    <MLabelSelect 
                        :id="`source-cd`"
                        :label="`출처`"
                        :option="options.source"
                        v-model="searchParam.sourceCd"
                        @selected="setCategoryList"
                        style="margin: 5px 0px;" />
                    <MLabelSelect 
                        :id="`source-cd`"
                        :label="`범주`"
                        :option="options.category"
                        v-model="searchParam.categoryCd"
                        style="margin: 5px 0px;" />
                </div>
                
                <div class="paragraph-block journal-info-two">
                    <MDatePicker
                        :id="`journal-date-picker`"
                        :label="`조회기간`"
                        :size="`md`"
                        v-model="searchParam.date" 
                        style="margin: 5px 0px;" />

                    <MMultiSelect
                        id="journal-acctcd"
                        label="계정과목"
                        :option="options.bank"
                        size="md"
                        v-model="searchParam.acctCds" />

                    <MLabelSelect
                        id="journal-bank"
                        :option="options.bank"
                        label="은행"
                        size="md"
                        v-model="searchParam.bankId"
                        style="margin: 5px 0px;" />
                </div>
            </div>

            <div class="container-block journal-main-summary">
                <div class="summary">
                    <div class="summary-cnt" style="width: 100px;">
                        총  {{ summary.cnt }}건
                    </div>
                    <div class="summary-amt">
                        총  {{ summary.amt }}원
                    </div>
                </div>
            </div>
        </div>
        <div class="journal-grid">
            <table>
                <colgroup>
                    <col width="170px" />
                    <col width="350px" />
                    <col width="180px" />
                    <col width="120px" />
                    <col width="180px" />
                    <col width="100px" />
                    <col width="90px" />
                    <col width="60px" />
                </colgroup>
                <thead>
                    <tr>
                        <th>전표번호</th>
                        <th>적요</th>
                        <th>은행</th>
                        <th>거래금액</th>
                        <th>거래시간</th>
                        <th>출처</th>
                        <th>범주</th>
                        <th>상세</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data) in dataList" :key="data.jeHeaderNo">
                        <td>{{ data.jeHeaderNo }}</td>
                        <td style="text-align: left; padding-left: 10px;">{{ data.remark }}</td>
                        <td>{{ data.bankNm }}</td>
                        <td style="text-align: right; padding-right: 10px;">{{ data.amount }}</td>
                        <td>{{ data.transactionDate }}</td>
                        <td>{{ data.sourceNm }}</td>
                        <td>{{ data.categoryNm }}</td>
                        <td @click="openDetailPopup(data.jeHeaderNo)">상세보기</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
/*********************
 **     IMPORT      **
 *********************/
import { ref, onMounted, reactive } from 'vue'
import AccountHeader from '../common/AccountHeader.vue';
import mariaApi from '../../../scripts/util/mariaApi';
import MLabelInput from '../../common/comp/MLabelInput.vue';
import MLabelSelect from '../../common/comp/MLabelSelect.vue';
import MDatePicker from '../../common/comp/MDatePicker.vue';
import MMultiSelect from '../../common/comp/MMultiSelect.vue';
import { addComma, removeComma } from '@/scripts/util/common/CommonUtils.js';

/*********************
 ** GLOBAL VARIABLE **
 *********************/
const title = ref("가계부 전표 조회");
const dataList = ref([]);
const summary = reactive({
    cnt: '0',
    amt: '0'
})
const searchParam = reactive({
    journalNo: '',
    sourceCd: '',
    categoryCd: '',
    date: {
        start: '',
        end: ''
    },
    acctCds: [],
    bankId: ''
});
const options = reactive({
    bank: [],
    source: [],
    category: []
})

const reset = () => {
    searchParam.acctCds = [];
}

onMounted(async () => {
    setDate();
    await setBankList();
    await setSourceList();
});

/**
 * 오늘 날짜 조회 
 */
const getToday = () => {
    const toDate = new Date();
    let dateValue = toDate.getFullYear();
    dateValue = dateValue + '-' + ((toDate.getMonth()+1).toString().length == 1 ? ('0' + (toDate.getMonth()+1)) : (toDate.getMonth()+1));
    dateValue = dateValue + '-' + (toDate.getDate().toString().length == 1 ? ('0' + toDate.getDate()) : toDate.getDate());
    
    return dateValue;
}

const getMonthFirst = () => {
    const toDate = new Date();
    let dateValue = toDate.getFullYear();
    dateValue = dateValue + '-' + ((toDate.getMonth()+1).toString().length == 1 ? ('0' + (toDate.getMonth()+1)) : (toDate.getMonth()+1));
    return dateValue + '-01';
}

const setDate = () => {
    searchParam.date.start = getMonthFirst();
    searchParam.date.end = getToday();
}

/**
 * 은행코드 조회
 */
const setBankList = async () => {
    const { data } = await mariaApi.get('/api/account/bank/infos');
    options.bank.unshift({ 'value': '', 'name': '선택해주세요' });
    data.forEach(d => {
        options.bank.push({ "value": d.bankId, "name": `${d.bankNm} (${d.bankId})` });
    })
}

/**
 * Source (출처) Select Options 조회
 */
const setSourceList = async () => {
    options.source = [];
    const { data } = await mariaApi.get('/api/system/sources');
    options.source.unshift({ 'value': '', 'name': '선택해주세요' });
    data.forEach(d => {
        options.source.push({ 'value': d.sourceCd, 'name': d.sourceNm });
    });
}

const setCategoryList = async () => {
    const sourceCd = searchParam.sourceCd;
    options.category = [];
    options.category.unshift({ 'value': '', 'name': '선택해주세요' });

    if (typeof sourceCd === 'undefined' || sourceCd === null || sourceCd === '') {
        return false;
    }

    const { data } = await mariaApi.get('/api/system/categories/' + sourceCd.replaceAll(' ', ''));
    data.forEach(d => {
        options.category.push({ 'value': d.categoryCd, 'name': d.categoryNm });
    });
}

const searchData = async () => {
    const schParam = {
        bankId: searchParam.bankId,
        sourceCd: searchParam.sourceCd,
        categoryCd: searchParam.categoryCd,
        jeHeaderNo: searchParam.journalNo,
        acctCds: searchParam.acctCds,
        schStartDt: searchParam.date.start,
        schEndDt: searchParam.date.end
    }

    const { data } = await mariaApi.get('/api/account/journal', {params: schParam});
    
    let amtSum = 0;
    data.forEach(d => {
        amtSum += d['amount'];
        d['amount'] = addComma(d['amount']);
        d['transactionDate'] = d['transactionDate'].replaceAll('T', ' ');
    });

    summary.cnt = data.length;
    summary.amt = addComma(amtSum);
    dataList.value = data;
}

const openDetailPopup = (jeHeaderNo) => {
    alert("headerNo : " + jeHeaderNo);
}

</script>
<style lang="scss" scoped>

::-webkit-scrollbar {
  display: none;
}

button {
    padding: 3px 15px;
    margin: 7px 5px 0px;
    border: none;
    border-radius: 5px;
    background-color: white;
}

.multiselect__tags {
    min-height: 36px;
}

.journal-search {
    width: 90%;
    margin: auto;
    font-size: 14px;

    .journal-find {
        .container-block {
            border-radius: 5px;
            margin: 10px 0px;
            background-color: rgb(230, 230, 230);
            height: fit-content;
        }

        .journal-main-buttons {
            display: flex;
            justify-content: right;
            height: 36px;
        }

        .journal-main-search {
            display: flex;
            justify-content: left;
            padding: 7px;
            height: fit-content;

            .paragraph-block {
                margin-right: 10px;
            }

            .info-block {
                display: flex;
                margin: 7px 20px 7px 5px;
                padding-left: 10px;
            }
        }

        .journal-main-summary {
            padding-top: 7px;
            .summary {
                padding-right: 30px;
                display: flex;
                justify-content: right;
                padding-bottom: 8px;
            }
        }
    }

    .journal-grid {
        width: auto;
        height: 75vh;
        overflow: scroll;

        margin-bottom: 30px;
        table {
            font-size: 13px;
            width: 100%;
            border-spacing: 0px;
            border-collapse: collapse;

            th {
                background-color: rgb(230, 230, 230);
                border: 1px solid white;
            }

            tbody {
                tr {
                    td {
                        height: 25px;
                        border: 1px solid rgb(230, 230, 230);
                        border-bottom: 1px solid grey;

                        input {
                            width: 100%;
                            height: 100%;
                            border: none;
                            text-align: center;
                            padding: 0px;
                            padding-inline: 0px;
                            padding-block: 0px;
                            background: transparent;
                        }

                        select {
                            width: 100%;
                            height: 100%;
                            border: none;
                            text-align: center;
                            background: transparent;
                        }
                    }
                }

                tr:hover {
                    background-color: #fff7d1;
                }
            }
        }
    }
}

</style>