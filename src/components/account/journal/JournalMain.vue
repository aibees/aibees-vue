<template>
    <AccountHeader :prop_title=title />
    <JournalPresetModal v-model:modalProp="presetModalProps" @presetConfirm="presetCheckCallback" />
    <JournalSearchHeaderNoModal v-model:modalProp="searchModalProps" @searchConfirm="searchByHeaderNoCallback" />
    <div class="journal-main">
        <div class="journal-info">
            <div class="container-block journal-main-buttons">
                <div><button @click="reset">새로작성하기</button></div>
                <div><button @click="openSearchModal">조회</button></div>
                <div><button @click="saveJournal">저장</button></div>
                <div><button>검증(개발예정)</button></div>
                <div><button>삭제</button></div>
            </div>
            <div class="container-block journal-main-info">
                <div class="paragraph-block journal-info-one">
                    <div class="info-block journal-no">
                        <span>전표번호</span>
                        <div class="input-box">
                            <input 
                                id="header_no" 
                                class="text-readonly" 
                                :value="journalHeaderData.jeHeaderNo" 
                                type="text"
                                readonly />
                        </div>
                    </div>
                    <div class="info-block jounrnal-date">
                        <span>전표일자</span>
                        <div class="input-box">
                            <input 
                                id="header-date" 
                                class="text-required" 
                                type="date"
                                v-model="journalHeaderData.jeDate" />
                        </div>
                    </div>
                </div>
                <div class="paragraph-block journal-info-two">
                    <div class="info-block journal-source">
                        <span>출처</span>
                        <div class="input-box">
                            <select id="header-source" class="text-required" @change="setCategoryList()" v-model="journalHeaderData.sourceCd">
                                <option v-for="source in options.source" :key="source.sourceCd" :value="source.sourceCd">
                                    {{ source.sourceNm }} / {{ source.sourceCd }}
                                </option>
                            </select>
                        </div>

                    </div>
                    <div class="info-block jounrnal-category">
                        <span>범주</span>
                        <div class="input-box">
                            <select id="header-category" class="text-required" v-model="journalHeaderData.categoryCd">
                                <option v-for="cate in options.category" :key="cate.categoryCd" :value="cate.categoryCd">
                                    {{ cate.categoryNm }} / {{ cate.categoryCd }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="paragraph-block journal-info-three">
                    <div class="info-block journal-remark">
                        <span>적요</span>
                        <div class="area-box">
                            <textarea 
                                id="header-remark" 
                                class="text-required"
                                v-model="journalHeaderData.remark">
                            </textarea>
                        </div>
                    </div>
                </div>
                <div class="paragraph-block journal-info-four">
                    <div class="info-block journal-bankAcct">
                        <span>은행통장</span>
                        <div class="input-box">
                            <select id="header-bankAcct" class="text-required" v-model="journalHeaderData.bankId">
                                <option v-for="bank in options.bank" :key="bank.bankId" :value="bank.bankId">
                                    {{ bank.bankNm }} / {{ bank.bankId }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="journal-validation">
            <div>
                [전표상태] {{ journalHeaderData.status }}
            </div>
            <div>
                [차변]  {{ DebitSum }} / [대변] {{ CreditSum }}
            </div>
            
        </div>
        <div class="journal-grid">
            <div class="additional-option">
                <div class="option-left">
                    <button
                        @click="addLine"
                        :disabled="journalHeaderData.status !== 'INIT'">
                        라인추가
                    </button>
                    <button
                        @click="removeLine"
                        :disabled="journalHeaderData.status !== 'INIT'">
                        라인삭제
                    </button>
                    <button
                        :disabled="journalHeaderData.status !== 'INIT'">
                        라인복사
                    </button>
                </div>
                <div class="option-right">
                    <button @click="openPresetModal">사전정의유형</button>
                </div>

            </div>
            <table id="journal-table">
                <thead>
                    <tr>
                        <th style="width:5%">No.</th>
                        <th style="width:20%">acctNm</th>
                        <th style="width:10%">acctCd</th>
                        <th style="width:15%">차변(Debit)</th>
                        <th style="width:15%">대변(Credit)</th>
                        <th style="width:35%">remark</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(line, idx) in journalDetailData" name="grid-line" :key="idx" :id="`line_` + idx" @click="selectTr(idx)">
                        <td>{{ idx }}</td>
                        <td>
                            <div class="grid-input"><input :id="`acctNm_${idx}`" :value="`${line.acctNm}`" readonly /></div>
                        </td>
                        <td>
                            <div class="grid-input">
                                <input type="hidden" :id="`acctCd_${idx}`" :value="`${line.acctCd}`" />
                                <AutoSearch :input-id="`${idx}`" @searchConfirm="selectAcctCallback" />
                            </div>
                        </td>
                        <td>
                            <!-- <div class="grid-input"><input name="drAmount" :id="`drAmount_${idx}`" autocomplete="off" -->
                            <div class="grid-input"><input name="drAmount" :id="`drAmount_${idx}`" :value="`${line.amountDr}`" autocomplete="off"
                                    @change="resetAppo('dr', 'cr', `${idx}`)" oninput="this.value = this.value.replace(/[^0-9.]/g, '')" />
                            </div>
                        </td>
                        <td>
                            <!-- <div class="grid-input"><input name="crAmount" :id="`crAmount_${idx}`" autocomplete="off" -->
                            <div class="grid-input"><input name="crAmount" :id="`crAmount_${idx}`" :value="`${line.amountCr}`" autocomplete="off"
                                    @change="resetAppo('cr', 'dr', `${idx}`)" oninput="this.value = this.value.replace(/[^0-9.]/g, '')" />
                            </div>
                        </td>
                        <td>
                            <div class="grid-input"><input :id="`remark_${idx}`" :value="`${line.remark}`" @input="inputRemark($event, idx)"
                                    style="text-align:left" /></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="journal-attribute">
            <div class="attribute-container">
                hello
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
import AutoSearch from '../../common/comp/MAutoSearch.vue'
import JournalPresetModal from './modal/JournalPresetModal.vue'
import JournalSearchHeaderNoModal from './modal/JournalHeaderNoSearchModal.vue'
import AccountHeader from '../common/AccountHeader.vue';
import mariaApi from '../../../scripts/util/mariaApi'
import { addComma, removeComma } from '@/scripts/util/common/CommonUtils.js'

/*********************
 ** GLOBAL VARIABLE **
 *********************/
const title = ref("가계부 전표 입력(메인)");
let journalHeaderData = reactive({
    'jeHeaderId': -1,
    'jeHeaderNo': '',
    'jeDate': '',
    'remark': '',
    'sourceCd': '',
    'categoryCd': '',
    'bankId': '',
    'internalYn': 'N',
    'status': 'INIT'
})

const options = reactive({
    bank: [],
    source: [],
    category: []
});

const journalDetailData = ref([]);

// 차대변 검증용 변수
const CreditSum = ref('0');
const DebitSum = ref('0');

/*********************
 ** MODAL  VARIABLE **
 *********************/
const presetModalProps = ref({
    'open': false
});

const searchModalProps = ref({
    'open': false
});

/*********************
 **   LIFE  CYCLE   **
 *********************/
onMounted(() => {
    setBankList();
    setSourceList();
    journalHeaderData.jeDate = getToday();
})

/*********************
 ** SETUP  FUNCTION **
 *********************/

 // 오늘 날짜 구해오기
const getToday = () => {
    const toDate = new Date();
    let dateValue = toDate.getFullYear();
    dateValue = dateValue + '-' + ((toDate.getMonth()+1).toString().length == 1 ? ('0' + (toDate.getMonth()+1)) : (toDate.getMonth()+1));
    dateValue = dateValue + '-' + (toDate.getDate().toString().length == 1 ? ('0' + toDate.getDate()) : toDate.getDate());
    
    return dateValue;
}

/**
 * 은행 Select Option 조회
 */
const setBankList = async () => {
    const { data } = await mariaApi.get('/account/bank/infos');
    options.bank = data;
    options.bank.unshift({ 'bankId': '', 'bankNm': '선택해주세요' });
}

    /**
     * Source (출처) Select Options 조회
     */
const setSourceList = async () => {
    const { data } = await mariaApi.get('/system/sources');
    options.source = data;
    options.source.unshift({ 'sourceCd': '', 'sourceNm': '선택해주세요' });
}

/**
 * 출처 별 Category(범주) Select Options 조회
 */
const setCategoryList = async () => {
    let sourceCd = journalHeaderData.sourceCd;

    if (typeof sourceCd === 'undefined' || sourceCd === null || sourceCd === '') {
        options.category = [];
        return false;
    }
    
    const { data } = await mariaApi.get('/system/categories/' + sourceCd.replaceAll(' ', ''));
    options.category = data;
    options.category.unshift({ 'categoryCd': '', 'categoryNm': '선택해주세요' });
}

/*********************
 ** BUTTON FUNCTION **
 *********************/
// 변수 초기화
const reset = () => {
    journalDetailData.value = [];
    journalHeaderData = reactive({
        'jeHeaderId': -1,
        'jeHeaderNo': '',
        'jeDate': getToday(),
        'remark': '',
        'sourceCd': '',
        'categoryCd': '',
        'bankId': '0000',
        'internalYn': 'N',
        'status': 'INIT'
    })
    CreditSum.value = 0;
    DebitSum.value = 0;
}

/**
 * 전표번호(Je Header No)로 조회
 * @param {*} headerNo 
 */
const searchByHeaderNo = async (headerNo) => {

    const { data } = mariaApi.get(`/account/journal/${headerNo}`);

    const url = aibeesGlobal.API_SERVER_URL + '/account/journal/' + headerNo;
    const callback = (res) => {
        const resultData = res.data.data;
        console.log(resultData);
        // header Data
        journalHeaderData.jeHeaderId = resultData.jeHeaderId;
        journalHeaderData.jeHeaderNo = resultData.jeHeaderNo;
        journalHeaderData.jeDate = resultData.jeDate;
        journalHeaderData.remark = resultData.remark;
        journalHeaderData.bankId = resultData.bankId;
        journalHeaderData.internalYn = resultData.internalYn;
        journalHeaderData.sourceCd = resultData.sourceCd;
        journalHeaderData.status = resultData.status;
        setCategoryList();
        journalHeaderData.categoryCd = resultData.categoryCd;
        
        // line Data
        journalDetailData.value = resultData.jeLineList;
        
    }
    axiosGet(url, callback);
}

/**
 * 전표 저장
 */
const saveJournal = () => {

    // validation 검증
    if (!journalValidate()) {
        return false;
    }

    // Line Data 조정
    journalDetailData.value.forEach(data => {
        data.amountDr = removeComma(data.amountDr);
        data.amountCr = removeComma(data.amountCr);
    });

    const saveData = {
        'jeDate': journalHeaderData.jeDate,
        'trxType': 'INSERT',
        'bankId': journalHeaderData.bankId,
        'sourceCd': journalHeaderData.sourceCd,
        'categoryCd': journalHeaderData.categoryCd,
        'remark': journalHeaderData.remark,
        'jeLineList': journalDetailData.value,
        'internalYn': journalHeaderData.internalYn
    }

    const url = aibeesGlobal.API_SERVER_URL + '/account/journal';
    const callback = (res) => {
        if (res.data.success) {
            alert("저장완료");
            searchByHeaderNo(res.data.data.jeHeaderNo);
        } else {
            alert(res.data.message);
        }
    }
    axiosPost(url, saveData, callback);
}

const journalValidate = () => {
    if (CreditSum.value !== DebitSum.value) {
        alert("차/대변 금액이 불일치합니다.");
        return false;
    }

    if (journalHeaderData.remark === '') {
        alert("적요는 필수입니다.");
        return false;
    }

    return true;
}

const selectTr = (idx) => {
    document.getElementsByName('grid-line').forEach(obj => { obj.style.backgroundColor = 'white' });
    document.getElementById('line_'+idx).style.backgroundColor = '#fff7d1';
}

/***********************
 ** CALLBACK FUNCTION **
 ***********************/
const searchByHeaderNoCallback = (headerNo) => {
    searchByHeaderNo(headerNo);
}

const presetCheckCallback = (presetCd) => {
    document.getElementById('header-remark').value = presetCd;
}

/**
 * AcctAutoSearch에서 검색, 선택된 계정코드 업데이트
 * @param {*} acct 
 * @param {*} idx 
 */
const selectAcctCallback = (acct, idx) => {
    const dataInLine = journalDetailData.value[idx];
    dataInLine.acctCd = acct.acctCd;
    dataInLine.acctNm = acct.acctNm;

    if (acct.additionalFalg === 'Y') {
        createAdditionalLine(acct);
    }
}

const createAdditionalLine = (acct) => {
    
}

/*********************
 ** BUTTON FUNCTION **
 *********************/
const openPresetModal = () => {
    presetModalProps.value.open = !presetModalProps.value.open;
}

const openSearchModal = () => {
    searchModalProps.value.open = !searchModalProps.value.open;
}

const addLine = () => {
    const newData = {
        'acctCd': '',
        'acctNm': '',
        'amountDr': '',
        'amountCr': '',
        'remark': '',
        'additionalOpt': {
            'usage': ''
        }
    };

    journalDetailData.value.push(newData);
}

const removeLine = () => {
    journalDetailData.value.pop();
}

/*********************
 ** CHANGE FUNCTION **
 *********************/
/**
 * 차변/대변 금액 입력 업데이트
 * 한 차변이 입력되면 상대 변 초기화
 * 상단 차/대면 합산 업데이트
 * @param {*} source 
 * @param {*} target 
 * @param {*} idx 
 */
const resetAppo = (source, target, idx) => {
    const currNum = document.getElementById(source + 'Amount_' + idx).value;
    const amount = removeComma(currNum);
    
    if (source === 'dr') {
        const dataInLine = journalDetailData.value[idx];
        dataInLine.amountDr = addComma(amount);
        dataInLine.amountCr = '0';
    }
    if (source === 'cr') {
        const dataInLine = journalDetailData.value[idx];
        dataInLine.amountCr = addComma(amount);
        dataInLine.amountDr = '0';
    }

    let debit = 0;
    let credit = 0;

    journalDetailData.value.forEach(data => {
        debit = debit + removeComma(data.amountDr);
        credit = credit + removeComma(data.amountCr);
        DebitSum.value = addComma(debit);
        CreditSum.value = addComma(credit);
    })
}

const inputRemark = (event, idx) => {
    const dataInLine = journalDetailData.value[idx];
    dataInLine.remark = event.target.value;
}

const checkNumber = (event) => {
    if (event.key === ','
        || event.key >= 0 && event.key <= 9) {
        return true;
    }

    return false;
}

</script>

<style lang="scss" scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

button {
    padding: 3px 15px;
    margin: 7px 5px 0px;
    border: none;
    border-radius: 5px;
    background-color: white;
}

.text-readonly {
    background-color: rgb(221, 221, 221);
}

.text-required {
    background-color: #fff9da;
}

.grid-input {
    height: 100%;

    input {
        height: 100%;
    }
}

.journal-main {
    width: 90%;
    margin: auto;
    font-size: 14px;

    .journal-info {
        .container-block {
            border-radius: 5px;
            margin: 10px 0px;
            background-color: rgb(230, 230, 230);
        }

        .journal-main-buttons {
            display: flex;
            justify-content: right;
            height: 36px;
        }

        .journal-main-info {
            display: flex;
            justify-content: left;
            padding-top: 7px;
            height: 70px;

            .paragraph-block {
                margin-right: 10px;
            }

            .info-block {
                display: flex;
                margin: 7px 20px 7px 5px;

                span {
                    width: 60px;
                    text-align: left;
                    margin-right: 5px;
                }

                .input-box {
                    width: 130px;
                    height: 20px;
                    border: 1px solid grey;
                    border-radius: 2px;

                    input {
                        border: none;
                        border-radius: 2px;
                        width: 100%;
                        height: 100%;
                        padding-inline: 0;
                        padding-block: 0;
                    }

                    select {
                        border: none;
                        border-radius: 2px;
                        width: 100%;
                        height: 100%;
                        padding-inline: 0;
                        padding-block: 0;
                    }
                }

                .area-box {
                    height: 45px;

                    textarea {
                        height: 100%;
                        resize: none;
                    }
                }
            }
        }
    }

    .journal-validation {
        display: flex;
        justify-content: space-between;
        border-radius: 5px;
        margin: 10px 0px;
        background-color: rgb(230, 230, 230);
        height: 27px;
        text-align: right;
        padding-top: 8px;
        padding-left: 20px;
        padding-right: 20px;
    }

    .journal-grid {
        height: 600px;
        overflow: scroll;
        .additional-option {
            height: 35px;
            background-color: rgb(230, 230, 230);
            display: flex;
            justify-content: space-between;



            .option-left {
                margin-left: 20px;
            }

            .option-right {
                margin-right: 20px;
            }
        }

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

    .journal-attribute {
        height: 150px;
        border-radius: 5px;
        margin: 10px 0px;
        background-color: rgb(230, 230, 230);

        .attribute-container {
            display: flex;
            margin: auto;
            padding: 20px 40px;
            background-color: blue;
        }
    }
}</style>