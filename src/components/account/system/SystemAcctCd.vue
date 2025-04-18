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
                        <li class="list-item" v-for="(acct, idx) in dataList.first" :key="idx" :id="acct.acctCd" @click="selectFirst(acct.acctCd)">
                            {{ acct.acctNm }} / {{ acct.acctCd }}
                        </li>
                    </ul>
                </div>
            </div>
            <div class="list-container second">
                <div class="sysAcctCd-buttons">
                    <button class="buttons" @click="insertSecondRow()">추가</button>
                    <button class="buttons" @click="saveSecondData()">저장</button>
                    <button class="buttons" @click="saveSecondData()">삭제</button>
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(acct, idx) in dataList.second" :key="idx" :id="acct.acctCd" @click="selectSecond(acct.acctCd)">
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
                    <button class="buttons" @click="saveSecondData()">삭제</button>
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(acct, idx) in dataList.last" :key="idx" :id="acct.acctCd">
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
import { ref, onMounted, reactive } from 'vue'
import AccountHeader from '../common/AccountHeader.vue';
import mariaApi from '../../../scripts/util/mariaApi';

/******************************
 ******* Const  Variable ******
 ******************************/
const title = ref('시스템설정-계정과목관리');

let curFirstSelect = '';
let curSecondSelect = '';
let curLastSelect = '';
let curTrxStatus = '';
let curTrxPos = '';

const dataList = reactive({
    first: [],
    second: [],
    last: []
});

/******************************
 *******   life  cycle   ******
 ******************************/
onMounted(async () => {
    await getFirstData();
});

/******************************
 ******* custom function ******
 ******************************/
/**
 * 첫번째 depth 계정코드 조회
 */
const getFirstData = async () => {
    const { data } = await mariaApi.get('/api/account/acct/first');
    dataList.first = data;
} 

/**
 * 첫번째 depth 계정코드 선택
 * @param {*} firstAcctCd 
 */
const selectFirst = (firstAcctCd) => {
    if (curTrxStatus != '') {
        const isContinue = confirm('변경사항 취소하는건가?');
        if(!isContinue) {
            return false;
        }
    }

    // last depth 초기화
    if (curLastSelect != '') {
        document.getElementById(curLastSelect).classList.remove('acct-active');
        curLastSelect = '';
    }
    // second depth 초기화
    if (curSecondSelect != '') {
        document.getElementById(curSecondSelect).classList.remove('acct-active');
        curSecondSelect = '';
    }
    // first depth 초기화
    if (curFirstSelect != '') {
        document.getElementById(curFirstSelect).classList.remove('acct-active');
    }

    curFirstSelect = firstAcctCd;
    const tr = document.getElementById(firstAcctCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }

    dataList.last = [];
    dataList.second = [];
    getSecondData(firstAcctCd);
}

/**
 * 첫번째 계정을 parameter로 하여 두번째 depth 계정코드 조회
 * param : first AcctCd
 * @param {*} acctCd 
 */
const getSecondData = async (firstAcctCd) => {
    const param = {
        'acctCd': firstAcctCd
    }
    const { data } = await mariaApi.get('/api/account/acct/second', { params: param });
    dataList.second = data;
    dataList.second.forEach(data => {
        data['trxType'] = '';
        data['acctLevel'] = 'SECOND';
    });
}

/**
 * Second Depth 계정코드명을 수정하면(나중에는 mgmt도) 상태값 변경
 * @param {*} idx 
 */
const secondChanged = (idx) => {
    if (dataList.second[idx].trxType == '') {
        dataList.second[idx].trxType = 'UPDATE';
    }
    curTrxStatus = 'UPDATE';
    curTrxPos = 'SECOND';
}

/**
 * 두번째 계정 선택한 것에 대한 동작
 * secondeAcctCd : 두번째 depth acctcd
 * @param {*} secondAcctCd 
 */
const selectSecond = async (secondAcctCd) => {

    // 이미 last depth가 선택되어 있는상태면 초기화
    if (curLastSelect != '') {
        document.getElementById(curLastSelect).classList.remove('acct-active');
        curLastSelect = '';
    }
    
    // 이미 second depth가 선택되어 있는상태면 초기화
    if (curSecondSelect != '') {
        document.getElementById(curSecondSelect).classList.remove('acct-active');
    }

    curSecondSelect = secondAcctCd;
    const tr = document.getElementById(secondAcctCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }

    getLastData(secondAcctCd);
}

/**
 * 두번째 depth 계정코드를 선택하면 그 하위 Last 계정코드 조회
 * @param {*} secondAcctCd 
 */
const getLastData = async (secondAcctCd) => {
    const param = {
        'acctCd': secondAcctCd
    }
    const { data } = await mariaApi.get('/api/account/acct/last', { params: param });
    dataList.last = data;
    dataList.last.forEach(data => {
        data['trxType'] = '';
        data['acctLevel'] = 'LAST';
    });
}

/**
 * Last Depth 계정코드명을 수정하면(나중에는 mgmt도) 상태값 변경
 * @param {*} idx 
 */
const lastChanged = (idx) => {
    if (dataList.last[idx].trxType == '') {
        dataList.last[idx].trxType = 'UPDATE';
    }
    curTrxStatus = 'UPDATE';
    curTrxPos = 'LAST';
}

/******************************
 ******* button function ******
 ******************************/
const insertSecondRow = () => {
    if (curFirstSelect == '') {
        alert("첫번째부터");
        return false;
    }

    if (curTrxStatus != '') {
        const isContinue = confirm('변경사항 취소하는건가?');
        if(!isContinue) {
            getSecondData(curFirstSelect);
            initTrx();
            return false;
        }
    }

    const parentAcctCd = Number(curFirstSelect.slice(0, 3));
    const maxAcctCd = dataList.second.length == 0
        ? parentAcctCd
        : Number(dataList.second[dataList.second.length-1].acctCd.slice(0, 3));

    const newAcctCd = Math.max(
        parentAcctCd, maxAcctCd
    ) + 1;

    const data = {
        'acctCd': newAcctCd + '000',
        'acctNm': '',
        'trxType': 'INSERT',
        'finalFlag': 'N',
        'acctLevel': 'SECOND',
        'parentAcctCd': curFirstSelect
    }
    dataList.second.push(data);
    curTrxStatus = 'INSERT';
    curTrxPos = 'SECOND';
}

const insertLastRow = () => {
    if (curSecondSelect == '') {
        alert("두번째부터");
        return false;
    }

    if (curTrxStatus != '') {
        const isContinue = confirm('변경사항 취소하는건가?');
        if(!isContinue) {
            getLastData(curSecondSelect);
            initTrx();
            return false;
        }
    }

    const parentAcctCd = Number(curSecondSelect);
    const maxAcctCd = dataList.last.length == 0
        ? parentAcctCd
        : Number(dataList.last[dataList.last.length-1].acctCd);

    let newAcctCd = Math.max(
        parentAcctCd, maxAcctCd
    ) + 1;

    if (newAcctCd % 10 == 0) {
        newAcctCd++;
    }

    const data = {
        'acctCd': newAcctCd,
        'acctLevel': "LAST",
        'acctNm': '',
        'trxType': 'INSERT',
        'parentAcctCd': curSecondSelect
    }
    dataList.last.push(data);
    curTrxStatus = 'INSERT';
    curTrxPos = 'LAST';
}

const saveSecondData = async () => {
    if (curTrxPos != 'SECOND') {
        alert("잘못된 저장");
        return false;
    }

    const bodyParam = {
        'acctLevel': 'SECOND',
        'data': dataList.second
    }

    const { data } = await mariaApi.post('/api/account/acct/setting', bodyParam);
    getSecondData(curFirstSelect);
    initTrx();
}

const saveLastData = async () => {
    if (curTrxPos != 'LAST') {
        alert("잘못된 저장");
        return false;
    }

    const bodyParam = {
        'acctLevel': 'LAST',
        'data': dataList.last
    }

    const { data } = await mariaApi.post('/api/account/acct/setting', bodyParam);
    initTrx();
}

const initTrx = () => {
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
                            width: 100px;
                            border: none;
                            background-color: transparent;
                        }
                    }
                }
            }
        }

        .first {

        }

        .second {
            width: 300px;
        }

        .last {
            width: 300px;
        }
    }
}
</style>