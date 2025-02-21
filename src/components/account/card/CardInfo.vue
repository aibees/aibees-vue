<template>
    <AccountHeader :prop_title=title />
    <div class="cardinfo">
        <div class="cardinfo-buttons">
            <button class="buttons" @click="insertRow()">추가</button>
            <button class="buttons" @click="selectData()">조회</button>
            <button class="buttons" @click="saveData()">저장</button>
        </div>
        <div class="cardinfo-container">
            <table id="cardinfo-table">
                <thead>
                    <tr>
                        <th style="width:40px">삭제</th>
                        <th style="width:60px">카드ID</th>
                        <th style="width:100px">회사이름</th>
                        <th style="width:180px">카드명</th>
                        <th style="width:150px">연결은행</th>
                        <th style="width:90px">마감일</th>
                        <th style="width:90px">결제일</th>
                        <th style="width:130px">만료년월</th>
                        <th style="width:100px">사용한도</th>
                        <th style="width:100px">신용카드여부</th>
                        <th style="width:100px">사용여부</th>
                        <th style="width:100px">메인노출여부</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, idx) in pageData.cardList" :key="idx">
                        <td>
                            <input 
                                :id="`status_${idx}`" 
                                type="checkbox" 
                                style="width:90%; 
                                height: auto" 
                                @change="checkBoxEvt(idx)" />
                        </td>
                        <td>
                            <input 
                                :id="`cardNo_${idx}`" 
                                v-model="data.cardNo" 
                                class="cardNoInput"
                                :readonly="data.trxType != 'INSERT'" 
                                maxlength="4" />
                        </td>
                        <td>
                            <MSelect 
                                :id="`cardComp_${idx}`"  
                                v-model="data.cardComp"
                                :option="option.comp" />
                        </td>
                        <td>
                            <input 
                                :id="`cardName_${idx}`" 
                                v-model="data.cardName" />
                        </td>
                        <td>
                            <MSelect 
                                :id="`cardName_${idx}`" 
                                v-model="data.bankId" 
                                :option="option.bank" />
                        </td>
                        <td>
                            <input 
                                :id="`deadlineDate_${idx}`" 
                                v-model="data.deadlineDate" 
                                class="dateInput deadlineDateInput" 
                                maxlength="2" />일
                        </td>
                        <td>
                            <input 
                                :id="`paymentDate_${idx}`" 
                                v-model="data.paymentDate" 
                                class="dateInput paymentDateInput"
                                maxlength="2" />일
                        </td>
                        <td>
                            <input 
                                :id="`expiredYm_${idx}`"
                                v-model="data.expiredYm"
                                type="month" />
                        </td>
                        <td>
                            <input 
                                :id="`limitAmt_${idx}`" 
                                v-model="data.limitAmt"
                                class="amtInput"
                                style="" />원
                        </td>
                        <td>
                            <MSelect 
                                :id="`creditYn_${idx}`"
                                v-model="data.creditYn"
                                :option="option.yn" />
                        </td>
                        <td>
                            <MSelect 
                                :id="`useYn_${idx}`"
                                v-model="data.useYn"
                                :option="option.yn" />
                        </td>
                        <td>
                            <MSelect 
                                :id="`exposeMain_${idx}`"
                                v-model="data.exposeMain"
                                :option="option.yn" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    // import declaration
    import { ref, onMounted, reactive } from 'vue'
    import AccountHeader from '../common/AccountHeader.vue';
    import mariaApi from '../../../scripts/util/mariaApi';
    import MSelect from '../../common/comp/MSelect.vue';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const title = ref('카드정보관리');
    const pageData = reactive({
        cardList: []
    });

    const option = reactive({
        bank: [],
        comp: [],
        yn: [{'value': 'Y', 'name': 'Y'}, {'value': 'N', 'name': 'N'}]
    })

    onMounted(async () => {
        await getCardCompOptionList();
        await getBankIdOptionList();
        await getCardInfoList();
    });

    /**
     * 삭제 체크박스 클릭 이벤트
     * @param {*} idx 
     */
    const checkBoxEvt = (idx) => {
        const checked = document.getElementById('status_' + idx).checked;
        
        if (checked) {
            if (pageData.cardList[idx].trxType == 'INSERT') {
                pageData.cardList.splice(idx, 1);
            } else {
                pageData.cardList[idx].trxType ='DELETE';
            }
        } else {
            pageData.cardList[idx].trxType =''
        }
    }

    /**
     * 연결은행 옵션 조회
     */
    const getBankIdOptionList = async () => {
        const { data } = await mariaApi.get('/account/bank/infos');
        data.forEach(d => {
            option.bank.push({ value: d.bankId, name: d.bankNm });
        });
    }

    /**
     * 카드 회사이름 옵션 조회
     */
    const getCardCompOptionList = async () => {
        option.comp = [
            { 'value': '', 'name': '' },
            { 'value': 'HANACARD', 'name': '하나카드' },
            { 'value': 'HYUNDAICARD', 'name': '현대카드' },
            { 'value': 'SAMSUNGCARD', 'name': '삼성카드' }
        ]
    }

    /**
     * 카드 보유내역 조회
     */
    const getCardInfoList = async () => {
        const { data } = await mariaApi.get('/account/card/infos');
        pageData.cardList = data;
        pageData.cardList.forEach(d => {
            d['trxType'] = '';
        });
    }

    /**
     * 조회버튼 클릭 이벤트
     */
    const selectData = () => {
        getCardInfoList();
    }

    const insertRow = () => {
        const newData = {   
            'status': false,
            'trxType': 'INSERT',
            'cardNo': '',
            'payway': '',
            'cardName': '',
            'bankId': '',
            'deadlineDate': '',
            'paymentDate': '',
            'expiredYm': '2999-12',
            'creditYn': '',
            'useYn': '',
            'company': '',
            'limitAmt': 0,
            'exposeMain': ''
        }

        pageData.cardList.push(newData);
    }

    const saveData = async () => {
        let validFlag = true;
        const isReal = confirm("저장하실건가");

        if(!isReal) {
            return false;
        }

        pageData.cardList.forEach(card => {
            validFlag = dataValidate(card);
        })

        if (!validFlag) {
            return false;
        }

        await mariaApi.post('/account/card/infos', {'cardInfoReqs': pageData.cardList});
        await getCardInfoList();
    }

    const dataValidate = async (data) => {
        if (data.bankId === '') {
            alert("카드ID는 필수");
            return false;
        }

        if (data.cardComp === '') {
            alert("회사명은 필수");
            return false;
        }
        return true;
    }
</script>

<style lang="scss" scoped>
.cardinfo {
    width: 1300px;
    margin: auto;

    .cardinfo-buttons {
        display: flex;
        justify-content: right;
        width: 100%;
        height: 40px;
        background-color: beige;

        button {
            margin: 5px 20px;
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

    .cardinfo-container {
        table {
            font-size: 13px;
            width: -webkit-fill-available;
            border-spacing: 0px;
            border-collapse: collapse;
            th {
                background-color: lightgrey;
                border: 1px solid grey;
            }
            td {
                height: 25px;
                border: 1px solid grey;
                border-bottom: 2px solid black;

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

                .dateInput {
                    width: 80%;
                }

                .amtInput {
                    width: 80%; 
                    text-align: right;
                }
            }
        }
    }
}
</style>