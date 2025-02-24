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

onMounted(() => {
    setSourceList();
    setCategoryList();
    setDate();
})

const reset = () => {
    searchParam.acctCds = [];
}

onMounted(async () => {
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
    console.log(searchParam);
}

/**
 * 은행코드 조회
 */
const setBankList = async () => {
    const { data } = await mariaApi.get('/account/bank/infos');
    options.bank.unshift({ 'value': '', 'name': '선택해주세요' });
    data.forEach(d => {
        options.bank.push({ "value": d.bankId, "name": d.bankNm });
    })
}

/**
 * Source (출처) Select Options 조회
 */
const setSourceList = async () => {
    const { data } = await mariaApi.get('/system/sources');
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

    const { data } = await mariaApi.get('/system/categories/' + sourceCd.replaceAll(' ', ''));
    data.forEach(d => {
        console.log(d);
        options.category.push({ 'value': d.categoryCd, 'name': d.categoryNm });
    });
}

const searchData = async () => {
    console.log(searchParam);
}

</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss" scoped>

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
    }
}

</style>