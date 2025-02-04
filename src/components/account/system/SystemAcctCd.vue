<template>
    <AccountHeader :prop_title=title />
    <div class="sysAcctCd">
        <div class="sysAcctCd-search">

        </div>

        <div class="sysAcctCd-container">
            <div class="list-container first">
                <div class="sysAcctCd-buttons">
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(acct, idx) in firstDataList" :key="idx" :id="acct.acctCd" @click="selectFirst(acct.acctCd)">
                            {{ acct.acctNm }} / {{ acct.acctCd }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="list-container second">
                <div class="sysAcctCd-buttons">
                    <button class="buttons" @click="insertSecondRow()">추가</button>
                    <button class="buttons" @click="saveSecondData()">저장</button>
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(acct, idx) in secondDataList" :key="idx" :id="acct.acctCd" @click="selectSecond(acct.acctCd)">
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`second_nm_${acct.acctCd}`" 
                                    v-model=acct.acctNm
                                    @change="secondChanged(idx)" />
                                </span>
                            /
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`second_cd_${acct.acctCd}`" 
                                    readonly
                                    v-model=acct.acctCd />
                                </span>
                        </li>
                    </ul>
                </div>

            </div>
            <div class="list-container last">
                <div class="sysAcctCd-buttons">
                    <button class="buttons" @click="insertLastRow()">추가</button>
                    <button class="buttons" @click="saveLastData()">저장</button>
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(acct, idx) in lastDataList" :key="idx" :id="acct.acctCd">
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`last_nm_${acct.acctCd}`" 
                                    v-model=acct.acctNm 
                                    @change="lastChanged(idx)"/>
                                </span>
                            /
                            <span><input class="inputs" :id="`last_cd_${acct.acctCd}`" v-model=acct.acctCd /></span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    </div>
</template>

<script setup>
// import declaration
import { ref, onBeforeMount, onMounted } from 'vue'

import AccountHeader from '../common/AccountHeader.vue';
import mariaApi from '../../../scripts/util/mariaApi';

/******************************
 ******* Const  Variable ******
 ******************************/
const title = ref('시스템설정-계정과목관리');

let curSelectedTr = '';
let curSecondSelect = '';
let curLastSelect = '';
let curTrxStatus = '';
let curTrxPos = '';

const firstDataList = ref([]);
const secondDataList = ref([]);
const lastDataList = ref([]);

/******************************
 *******   life  cycle   ******
 ******************************/
onMounted(async () => {
    await getFirstData();
});

/******************************
 ******* custom function ******
 ******************************/
const getFirstData = async () => {
    const { data } = await mariaApi.get('/account/acct/first');
    console.log(data);
    firstDataList.value = data;
}

const selectFirst = (acctCd) => {
    if (curTrxPos != '' || curTrxStatus != '') {
        const isContinue = confirm("아직 트랜잭션 저장중.. 초기화?");
        if (isContinue) {
            curTrxPos = '';
            curTrxStatus = '';
        } else {
            return false;
        }
    }

    if (curLastSelect != '') {
        document.getElementById(curLastSelect).classList.remove('acct-active');
        curLastSelect = '';
    }
    if (curSecondSelect != '') {
        document.getElementById(curSecondSelect).classList.remove('acct-active');
        curSecondSelect = '';
    }
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

    lastDataList.value = [];
    getSecondData(acctCd);
}

const getSecondData = async (acctCd) => {
    const param = {
        'acctCd': acctCd
    }
    const { data } = await mariaApi.get('/account/acct/second', { params: param });
    secondDataList.value = data;
    secondDataList.value.forEach(data => {
        data['trxType'] = '';
        data['acctLevel'] = 'SECOND';
    });
}

const secondChanged = (idx) => {
    if (secondDataList.value[idx].trxType == '') {
        secondDataList.value[idx].trxType = 'UPDATE';
    }
}

const selectSecond = async (acctCd) => {
    if (curTrxPos != '' || curTrxStatus != '') {
        const isContinue = confirm("아직 트랜잭션 저장중.. 초기화?");
        if (isContinue) {
            curTrxPos = '';
            curTrxStatus = '';
            secondDataList.value.pop();
        } else {
            return false;
        }
    }

    if (curLastSelect != '') {
        document.getElementById(curLastSelect).classList.remove('acct-active');
        curLastSelect = '';
    }
    if (curSecondSelect != '') {
        document.getElementById(curSecondSelect).classList.remove('acct-active');
    }

    curSecondSelect = acctCd;
    const tr = document.getElementById(acctCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }

    getLastData(acctCd);
}

const getLastData = async (acctCd) => {
    const param = {
        'acctCd': acctCd
    }
    const { data } = await mariaApi.get('/account/acct/last', { params: param });
    lastDataList.value = data;
    lastDataList.value.forEach(data => {
        data['trxType'] = '';
    });
}

const lastChanged = (idx) => {
    if (lastDataList.value[idx].trxType == '') {
        lastDataList.value[idx].trxType = 'UPDATE';
    }
}

/******************************
 ******* button function ******
 ******************************/
const insertSecondRow = () => {
    if (curSelectedTr == '') {
        alert("부모계정 선택부터");
        return false;
    }

    if (curTrxStatus != '') {
        alert("업뎃 끝나고 하시길");
        return false;
    }

    const parentAcctCd = Number(curSelectedTr.slice(0, 3));
    const maxAcctCd = secondDataList.value.length == 0
        ? parentAcctCd
        : Number(secondDataList.value[secondDataList.value.length-1].acctCd.slice(0, 3));

    const newAcctCd = Math.max(
        parentAcctCd, maxAcctCd
    ) + 1;

    const data = {
        'acctCd': newAcctCd + '0000',
        'acctNm': '',
        'trxType': 'INSERT',
        'finalFlag': 'N',
        'acctLevel': 'SECOND',
        'parentAcctCd': curSelectedTr
    }
    curTrxStatus = 'INSERT';
    curTrxPos = 'SECOND';
    secondDataList.value.push(data);
}

const insertLastRow = () => {
    if (curSecondSelect == '') {
        alert("부모계정 선택부터");
        return false;
    }

    if (curTrxStatus != '') {
        alert("업뎃 끝나고 하시길");
        return false;
    }

    const parentAcctCd = Number(curSecondSelect);
    const maxAcctCd = lastDataList.value.length == 0
        ? parentAcctCd
        : Number(lastDataList.value[lastDataList.value.length-1].acctCd);

    let newAcctCd = Math.max(
        parentAcctCd, maxAcctCd
    ) + 1;

    if (newAcctCd % 10 == 0) {
        newAcctCd++;
    }

    const data = {
        'acctCd': newAcctCd,
        'acctNm': '',
        'trxType': 'INSERT',
        'parentAcctCd': curSecondSelect
    }
    curTrxStatus = 'INSERT';
    curTrxPos = 'LAST';
    lastDataList.value.push(data);
}

const saveSecondData = async () => {
    if (curTrxPos != 'SECOND') {
        alert("잘못된 저장");
        return false;
    }

    const bodyParam = {
        'acctLevel': 'SECOND',
        'data': secondDataList.value
    }

    const { data } = await mariaApi.post('/account/acct/setting', bodyParam);
    console.log(data);

    curTrxPos = '';
    curTrxStatus = '';
    selectSecond(curSelectedTr);
}

const saveLastData = async () => {
    if (curTrxPos != 'LAST') {
        alert("잘못된 저장");
        return false;
    }

const bodyParam = {
    'acctLevel': 'LAST',
    'data': lastDataList.value
}

const { data } = await mariaApi.post('/account/acct/setting', bodyParam);
console.log(data);

curTrxPos = '';
curTrxStatus = '';
}
</script>

<style lang="scss" scoped>

.acct-active {
    font-weight: bolder;
    background-color: rgb(232, 245, 220);
    border: 1px solid black;
}

.sysAcctCd {
    .sysAcctCd-buttons {
        display: flex;
        justify-content: right;
        width: 100%;
        height: 40px;
        background-color: beige;

        button {
            margin: 5px 10px;
            width: 80px;
            height: 30px;
            padding: 2px 10px;
            border: none;
            border-radius: 5px;
            background-color: #000032;
            color: white;
            font-weight: 750;
            cursor: pointer;
        }

        button:hover {
            background-color: #2c2ccc;
        }
    }

    .sysAcctCd-search {
        width: auto;
        height: 60px;
        background-color: beige;
    }

    .sysAcctCd-container {
        display: flex;
        justify-content: left;
        .list-container {
            border-radius: 7px;
            width: 200px;
            height: 700px;
            margin: 10px 10px 5px;
            border: 1px solid lightgrey;

            .container-body {
                ul {
                    list-style: none;
                    margin-block: 0;
                    margin-inline: 0;
                    padding-inline: 0;
                    
                    .list-item {
                        padding: 10px 5px;

                        .inputs {
                            width: 70px;
                            border: none;
                            background-color: transparent;
                        }
                    }
                }
            }
        }

        .first {

        }
    }
}
</style>