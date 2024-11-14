<template>
    <AccountHeader :prop_title=title />
    <JournalPresetModal v-model:modalProp="presetModalProps" @presetConfirm="presetCheckCallback" />
    <JournalSearchHeaderNoModal v-model:modalProp="searchModalProps" @searchConfirm="searchByHeaderNoCallback" />
    <div class="journal-main">
        <div class="journal-info">
            <div class="container-block journal-main-buttons">
                <div><button @click="openSearchModal">조회</button></div>
                <div><button @click="saveJournal">저장</button></div>
                <div><button>검증(개발예정)</button></div>
                <div><button>삭제</button></div>
            </div>
            <div class="container-block journal-main-info">
                <div class="paragraph-block journal-info-one">
                    <div class="info-block journal-no">
                        <span>전표번호</span>
                        <div class="input-box"><input id="header_no" class="text-readonly" type="text" readonly /></div>
                    </div>
                    <div class="info-block jounrnal-date">
                        <span>전표일자</span>
                        <div class="input-box"><input id="header-date" class="text-required" type="date"
                                :pattern="datePattern" /></div>

                    </div>
                </div>
                <div class="paragraph-block journal-info-two">
                    <div class="info-block journal-source">
                        <span>출처</span>
                        <div class="input-box">
                            <select id="header-source" class="text-required" @change="setCategoryList()">
                                <option v-for="source in sourceOptionList" :key="source.value" :value="source.value">
                                    {{ source.sourceNm }} / {{ source.sourceCd }}
                                </option>
                            </select>
                        </div>

                    </div>
                    <div class="info-block jounrnal-category">
                        <span>범주</span>
                        <div class="input-box">
                            <select id="header-category" class="text-required">
                                <option v-for="cate in categoryOptionList" :key="cate.value" :value="cate.value">
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
                            <textarea id="header-remark" class="text-required"></textarea>
                        </div>
                    </div>
                </div>
                <div class="paragraph-block journal-info-four">
                    <div class="info-block journal-bankAcct">
                        <span>은행통장</span>
                        <div class="input-box">
                            <select id="header-bankAcct" class="text-required">
                                <option v-for="bank in bankAccountList" :key="bank.value" :value="bank.value">
                                    {{ bank.name }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="journal-grid">
            <div class="additional-option">
                <div class="option-left">
                    <button @click="addLine">라인추가</button>
                    <button>라인복사</button>
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
                    <tr v-for="(line, idx) in journalDetailData" :key="idx" :id="`line_` + idx">
                        <td>{{ idx }}</td>
                        <td>
                            <div class="grid-input"><input :id="`acctNm_${idx}`" readonly /></div>
                        </td>
                        <td>
                            <div class="grid-input">
                                <input type="hidden" :id="`acctCd_${idx}`" @change="setAcctNm(line.acctCd, idx)" />
                                <AutoSearch :input-id="`${idx}`" @searchConfirm="selectAcctCallback" />
                            </div>
                        </td>
                        <td>
                            <div class="grid-input"><input :id="`drAmount_${idx}`" :value="`${line.drAmount}`"
                                    @change="resetAppo('dr', 'cr', `${idx}`)" oninput="this.value = this.value.replace(/[^0-9.]/g, '')" />
                            </div>
                        </td>
                        <td>
                            <div class="grid-input"><input :id="`crAmount_${idx}`" :value="`${line.crAmount}`"
                                    @change="resetAppo('cr', 'dr', `${idx}`)" oninput="this.value = this.value.replace(/[^0-9.]/g, '')" />
                            </div>
                        </td>
                        <td>
                            <div class="grid-input"><input :id="`remark_${idx}`" :value="`${line.remark}`"
                                    style="text-align:left" /></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
import AutoSearch from '../../common/comp/AcctAutoSearch.vue'
import JournalPresetModal from './modal/JournalPresetModal.vue'
import JournalSearchHeaderNoModal from './modal/JournalHeaderNoSearchModal.vue'
import AccountHeader from '../common/AccountHeader.vue';
import { addComma } from '@/scripts/util/common/CommonUtils.js'
/*********************
 ** GLOBAL VARIABLE **
 *********************/
const title = ref("가계부 전표 입력(메인)");
const journalHeaderData = ref({});
const journalDetailData = ref([]);
const datePattern = ref("(?:19|20)(?:(?:[13579][26]|[02468][048])-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))|(?:[0-9]{2}-(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:29|30))|(?:(?:0[13578]|1[02])-31)))");
const bankAccountList = ref([]);
const sourceOptionList = ref([]);
const categoryOptionList = ref([]);

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
    const toDate = new Date();
    let dateValue = toDate.getFullYear();
    dateValue = dateValue + '-' + (toDate.getMonth() + 1);
    dateValue = dateValue + '-' + (toDate.getDate().toString().length == 1 ? ('0' + toDate.getDate()) : toDate.getDate());
    document.getElementById('header-date').value = dateValue;

    setBankList();
    setSourceList();
})

/*********************
 ** SETUP  FUNCTION **
 *********************/

const setBankList = () => {
        const url = aibeesGlobal.API_SERVER_URL + "/account/bank/info/list";

        const callback = (res) => {
            if(res.data.message == 'SUCCESS') {
                res.data.data.forEach(data => {
                    const tmp = {
                        'value': data.bankId,
                        'name': '('+data.bankAcct.substr(-4, data.bankAcct.length)+') ' + data.bankNm
                    }
                    bankAccountList.value.push(tmp);

                })
                bankAccountList.value.unshift({ 'value': '0000', 'name': '(0000) 해당없음' })
            } else {
                alert(res.data.message);
            }
        }
        axiosGet(url, callback);
    }

const setSourceList = () => {
    const url = aibeesGlobal.API_SERVER_URL + '/system/sources';
    const callback = (res) => {
        if (res.data.message = 'SUCCESS') {
            console.log(res.data.data);
            sourceOptionList.value = res.data.data;
        } else {
            alert(res.data.message);
        }
    }

    axiosGet(url, callback);
}

const setCategoryList = () => {
    const sourceCd = document.getElementById('header-source').value;

    if (typeof sourceCd === 'undefined' || sourceCd === null || sourceCd === '') {
        return false;
    }

    const url = aibeesGlobal.API_SERVER_URL + '/system/categories?sourceCd=' + sourceCd.replaceAll(' ', '').split('/')[1];
    const callback = (res) => {
        if (res.data.message = 'SUCCESS') {
            console.log(res.data.data)
            categoryOptionList.value = res.data.data;
        } else {
            alert(res.data.message);
        }
    }

    axiosGet(url, callback);
}

/*********************
 ** BUTTON FUNCTION **
 *********************/
const search = () => {

}

const searchByHeaderNo = (headerNo) => {
    // document.getElementById('header_no').value = headerNo;

}

const saveJournal = () => {
    const jeLineList = [];

    for (let i = 0; i < journalDetailData.value.length; i++) {
        const tmp = {
            'lineNo': i,
            'acctCd': document.getElementById('acctCd_'+i).value,
            'acctNm': document.getElementById('acctNm_'+i).value,
            'amountDr': document.getElementById('drAmount_'+i).value,
            'amountCr': document.getElementById('crAmount_'+i).value,
            'remark': document.getElementById('remark_'+i).value
        }
        jeLineList.push(tmp);
    }
    const sourceCd = document.getElementById('header-source').value.replaceAll(' ', '').split('/')[1];
    const categoryCd = document.getElementById('header-category').value.replaceAll(' ', '').split('/')[1];

    const saveData = {
        'jeDate': document.getElementById('header-date').value,
        'trxType': 'INSERT',
        'bankId': document.getElementById('header-bankAcct').value,
        'sourceCd': sourceCd,
        'categoryCd': categoryCd,
        'remark': document.getElementById('header-remark').value,
        'jeLineList': jeLineList
    }

    console.log(saveData);

    const url = aibeesGlobal.API_SERVER_URL + '/account/journal';
    const callback = (res) => {
        if (res.data.message = 'SUCCESS') {
            alert("저장완료");
        } else {
            alert(res.data.message);
        }
    }
    axiosPost(url, saveData, callback);
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

const selectAcctCallback = (acct, idx) => {
    document.getElementById('acctCd_' + idx).value = acct.acctCd;
    document.getElementById('acctNm_' + idx).value = acct.acctNm;
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
        'drAmount': 0,
        'crAmount': 0,
        'remark': '',
        'additionalOpt': {
            'usage': ''
        }
    };

    journalDetailData.value.push(newData);
}

/*********************
 ** CHANGE FUNCTION **
 *********************/
const resetAppo = (source, target, idx) => {
    const currNum = document.getElementById(source + 'Amount_' + idx).value;
    const commaNum = addComma(Number(currNum.replace(',', '')));
    
    document.getElementById(source + 'Amount_' + idx).value = commaNum;
    document.getElementById(target + 'Amount_' + idx).value = 0;
}

const setAcctNm = (acctCd, idx) => {

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

    .journal-grid {
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
                }

                select {
                    width: 100%;
                    height: 100%;
                    border: none;
                    text-align: center;
                }
            }
        }
    }
}</style>