<template>
    <AccountHeader :prop_title=title />
    <div class="bank-close">
        <div class="bank-close-option">
            <div class="close-option-left">
                <div class="option-item">
                    <MLabelInput
                        :id="`journal-no`"
                        label="마감년월"
                        type="month"
                        v-model="searchParam.ym"
                        style="margin: 5px 0px;" />
                </div>
                <div class="option-item">
                    <MLabelSelect
                        id="journal-bank"
                        :option="options.bank"
                        label="은행"
                        size="sm"
                        v-model="searchParam.bankId"
                        style="margin: 5px 0px;" />
                </div>
            </div>
            <div class="close-option-right">
                <button @click="getCloseData">조회</button>
                <button id="closeBtn" style="display: none" @click="closeProcess">마감</button>
            </div>
        </div>
        <div class="bank-close-container">
            <div class="before-container">
                <div class="container-title">
                    <div class="text">
                        전월 통장실적
                    </div>
                </div>
                <table class="container-table">
                    <thead>
                        <tr>
                            <th>년월</th>
                            <th>은행명</th>
                            <th>수입금액</th>
                            <th>지출금액</th>
                            <th>증감금액</th>
                            <th>마감금액</th>
                            <th>마감여부</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="lines">{{ resultData.before.ym }}</td>
                            <td class="lines">{{ resultData.before.bankNm }}</td>
                            <td class="lines">{{ resultData.before.profitAmount }}</td>
                            <td class="lines">{{ resultData.before.lossAmount }}</td>
                            <td class="lines">{{ resultData.before.diffAmount }}</td>
                            <td class="lines">{{ resultData.before.lastAmount }}</td>
                            <td class="lines">{{ resultData.before.closedYn }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="container-foot">
                
                </div>
            </div>
            <div class="revenue-container">
                <div class="container-title">
                    <div class="text">
                        수입 (Revenue) 리스트
                    </div>
                </div>
                <table class="container-table">
                    <thead>
                        <tr>
                            <th style="width:200px;">거래날짜</th>
                            <th>적요</th>
                            <th style="width:160px;">은행</th>
                            <th style="width:140px;">거래금액</th>
                            <th style="width:140px;">계정과목</th>
                        </tr>
                    </thead>
                </table>
                <div class="body-scroll">
                    <table>
                        <tbody>
                            <tr v-for="(cr, idx) in resultData.crList" :key="idx">
                                <td class="lines" style="width: 200px">
                                    {{ cr.transactionDate }}
                                </td>
                                <td class="lines" style="text-align: left;">
                                    {{ cr.remark }}
                                </td>
                                <td class="lines" style="width: 160px;">
                                    {{ cr.bankNm }}
                                </td>
                                <td class="lines" style="width: 140px; text-align: right; padding-right: 13px;">
                                    {{ cr.amountCr }} 원
                                </td>
                                <td class="lines" style="width: 140px; text-align: left; padding-left: 13px;">
                                    {{ cr.acctNm }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="container-foot">
                    합계금액 : {{ resultData.summary.crSum }} 원
                </div>
            </div>
            <div class="expense-container">
                <div class="container-title">
                    <div class="text">
                        지출 (Expense) 리스트
                    </div>
                </div>
                <table class="container-table">
                    <thead>
                        <tr>
                            <th style="width:200px;">거래날짜</th>
                            <th>적요</th>
                            <th style="width:160px;">은행</th>
                            <th style="width:140px;">거래금액</th>
                            <th style="width:140px;">계정과목</th>
                        </tr>
                    </thead>
                    
                </table>
                <div class="body-scroll">
                    <table>
                        <tbody>
                            <tr v-for="(dr, idx) in resultData.drList" :key="idx">
                                <td class="lines" style="width: 200px">
                                    {{ dr.transactionDate }}
                                </td>
                                <td class="lines" style="text-align: left;">
                                    {{ dr.remark }}
                                </td>
                                <td class="lines" style="width: 160px;">
                                    {{ dr.bankNm }}
                                </td>
                                <td class="lines" style="width: 140px; text-align: right; padding-right: 13px;">
                                    {{ dr.amountDr }} 원
                                </td>
                                <td class="lines" style="width: 140px; text-align: left; padding-left: 13px;">
                                    {{ dr.acctNm }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="container-foot">
                    합계금액 : {{ resultData.summary.drSum }} 원
                </div>
            </div>
            <div class="after-container">
                <div class="container-title">
                    <div class="text">
                        마감정보 합계
                    </div>
                </div>
                <table class="container-table">
                    <thead>
                        <tr>
                            <th>년월</th>
                            <th>은행명</th>
                            <th>수입금액</th>
                            <th>지출금액</th>
                            <th>증감금액</th>
                            <th>마감금액</th>
                            <th>마감여부</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="lines">{{ searchParam.ym.replace('-', ' / ') }}</td>
                            <td class="lines">{{ resultData.before.bankNm }}</td>
                            <td class="lines">{{ resultData.summary.crSum }}</td>
                            <td class="lines">{{ resultData.summary.drSum }}</td>
                            <td id="resultDiff" class="lines">{{ resultData.summary.diff }}</td>
                            <td class="lines" style="font-weight: 650; border: 2px solid black;">{{ resultData.summary.last }}</td>
                            <td class="lines">{{ resultData.summary.ymClosing }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="container-foot">
                
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, reactive } from 'vue'
    import mariaApi from '../../../scripts/util/mariaApi';
    import AccountHeader from '../common/AccountHeader.vue';
    import { addComma, removeComma } from '@/scripts/util/common/CommonUtils.js'
    import MLabelInput from '../../common/comp/MLabelInput.vue';
    import MLabelSelect from '../../common/comp/MLabelSelect.vue';

    /*********************
     ** GLOBAL VARIABLE **
     *********************/
    const title = ref("통장 월별결산");

    // select 등 option list
    const options = reactive({
        bank: []
    })

    // 검색조건 parameter
    const searchParam = reactive({
        ym: '',
        bankId: ''
    })

    const resultData = reactive({
        before: {},
        drList: [],
        crList: [],
        summary: {
            bankId: '',
            ym: '',
            drSum: 0,
            crSum: 0,
            diff:0,
            last: 0,
            ymClosing: 'N'
        }
    })

    /*********************
     ** LIFECYCLE FUNC. **
     *********************/
    onMounted(() => {
        searchParam.ym = getToday();
        setBankList();
    })
    /**********************
     ** OPTION  FUNCTION **
     **********************/
    const getToday = () => {
        const toDate = new Date();
        let dateValue = toDate.getFullYear();
        let month = toDate.getMonth() + 1;
        if (month.toString().length < 2) {
            month = '0' + month;
        }
        return dateValue + '-' + month;
    }

    const ymFormatting = (ym) => {
        return ym.slice(0, 4) + " / " + ym.slice(4, 6);
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

    /*********************
     ** MAIN   FUNCTION **
     *********************/
    const validate = () => {
        if (searchParam.ym === '') {
            alert("마감년월 선택해야합니다.");
            return false;
        }
        if (searchParam.bankId === '') {
            alert("은행 선택 핅수");
            return false;
        }
        return true;
    }

    const getCloseData = async () => {
        if (!validate()) {
            return false;
        }
        const { data } = await mariaApi.get('/api/account/bank/closing', {params: searchParam});

        resultData.before = data.beforeClosing;

        let cS = 0;
        let dS = 0;

        resultData.before.ym = ymFormatting(data.beforeClosing.ym);
        resultData.before.profitAmount = addComma(data.beforeClosing.profitAmount);
        resultData.before.lossAmount = addComma(data.beforeClosing.lossAmount);
        resultData.before.diffAmount = addComma(data.beforeClosing.diffAmount);
        resultData.before.lastAmount = addComma(data.beforeClosing.lastAmount);

        data.crList.forEach(c => {
            cS += c['amountCr'];
            c['bankNm'] = data.beforeClosing.bankNm;
            c['transactionDate'] = c['transactionDate'].replace('T', ' ');
            c['amountCr'] = addComma(c['amountCr']);
        });
        data.drList.forEach(d => {
            dS += d['amountDr'];
            d['bankNm'] = data.beforeClosing.bankNm;
            d['transactionDate'] = d['transactionDate'].replace('T', ' ');
            d['amountDr'] = addComma(d['amountDr']);
        });

        resultData.summary.ym = data.beforeClosing.ym;
        resultData.summary.ymClosing = data.ymClosing;
        resultData.summary.bankId = data.beforeClosing.bankId;
        resultData.summary.crSum = addComma(cS);
        resultData.summary.drSum = addComma(dS);
        resultData.summary.diff = addComma(cS - dS);
        resultData.summary.last = addComma(removeComma(data.beforeClosing.lastAmount) + cS - dS);

        console.log("cs : " + cS);
        console.log("dS : " + dS);

        let diffObj = document.getElementById('resultDiff');
        if (cS > dS) {
            if (diffObj.classList.contains('red')) {
                diffObj.classList.remove('red');
            }
            diffObj.classList.add('green');
        } else {

            if (diffObj.classList.contains('green')) {
                diffObj.classList.remove('green');
            }
            diffObj.classList.add('red');
        }

        console.log("data.beforeClosing.ymClosing : " + data.ymClosing);
        if (resultData.before.closedYn === 'N' || data.ymClosing === 'N') {
            document.getElementById('closeBtn').style.display = 'block';
        } else {
            document.getElementById('closeBtn').style.display = 'none';
        }

        resultData.crList = data.crList;
        resultData.drList = data.drList;
    }

    const closeProcess = async () => {
        let confirmMsg = '';
            confirmMsg += ('[마감대상 : ' + searchParam.ym.replace('-', ' / ') + '월] ');
            confirmMsg += ('마감금액 : ' + resultData.summary.last + '원\n');
            confirmMsg += '실계좌에서 재확인 후 진행하세요.';
        const isConfirm = confirm(confirmMsg);

        if (!isConfirm) {
            return false;
        }

        const dataParam = {
            'ym': searchParam.ym.replace('-', ''),
            'bankId': resultData.summary.bankId,
            'profitAmount': removeComma(resultData.summary.crSum),
            'lossAmount': removeComma(resultData.summary.drSum),
            'diffAmount': removeComma(resultData.summary.diff),
            'lastAmount': removeComma(resultData.summary.last),
        }

        await mariaApi.post('/api/account/bank/closing', dataParam);

        await getCloseData();
    }
</script>

<style lang="scss" scoped>

button {
    margin: 5px 10px;
    height: 30px;
    padding: 2px 10px;
    border: none;
    border-radius: 5px;
    background-color: #000032;
    color: white;
    font-weight: 750;
    cursor: pointer;
}

.confirm-btn {
    background-color: #7a7aa6;
}

.body-scroll {
    height: 220px;
    overflow-y: auto;
}

.green {
    color: rgb(57, 186, 57);
    font-weight: 650;
    background-color: rgb(200, 255, 200);
}

.red {
    color: red;
    font-weight: 650;
    background-color: rgb(255, 235, 235);
}

.usage-table {
    user-select: none;
    margin: 20px auto;
    border: 2px solid black;
    border-collapse: collapse;
    table-layout: fixed;
    thead {
        
        tr th {
            text-align: center;
            border: 1px dashed grey;
        }

        .acc {
            border: 1px solid grey;
            .acc-container {
                display: flex;
                justify-content: space-between;
                padding: 0px 10px;
            }
        }
    }
    tbody {
        td {
            border: 1px dashed grey;
        }

        .amount {
            text-align: right;
            padding-right: 10px;
        }

        .percentage {
            text-align: center;
        }

        .acc {
            border: 1px solid grey;
            .acc-container {
                display: flex;
                justify-content: space-between;
                padding: 0px 10px;
            }
        }

        .check {
            text-align: center;
        }
    }
}
.bank-close {
    width: 88vw;
    max-width: 1400px;
    margin: auto;

    .bank-close-option {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 40px;
        background-color: beige;

        .close-option-left {
            display: flex;
            justify-content: left;
            .option-item {
                margin-left: 15px;
            }
        }
        .close-option-right {
            display: flex;
            justify-content: right;
        }
    }

    .bank-close-container {
        .container-title {
            width: 100%;
            height: 27px;
            padding-top: 7px;
            background-color: #e8e8ff;
            font-weight: 650;
            text-align: left;

            .text {
                margin-left: 20px;
            }
        }

        .container-foot {
            width: 100%;
            margin-top: 7px;
            margin-bottom: 18px;
            text-align: right;
            .text {
                margin-left: 20px;
            }
        }
        .before-container {

        }
        .revenue-container {

        }
        .expense-container {

        }
        .after-container {

        }

        table {
            width: 100%;
            border-collapse: collapse;
            thead {
                background-color: antiquewhite;
            }
            tbody {
                .lines {
                    border-bottom: 1px solid grey;
                }
            }
        }
    }
}
</style>