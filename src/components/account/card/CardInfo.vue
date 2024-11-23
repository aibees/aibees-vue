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
                        <th style="width:210px">카드명</th>
                        <th style="width:120px">연결은행</th>
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
                    <tr v-for="(data, idx) in dataList" :key="data.cardNo">
                        <td><input type="checkbox" :id="`status_${idx}`" style="width:90%; height: auto" @change="checkBoxEvt(idx)" /></td>
                        <td><input class="cardNoInput" :id="`cardNo_${idx}`" :value="`${data.cardNo}`" :readonly="data.cardNo != ''" maxlength="4" /></td>
                        <td>
                            <select :id="`cardComp_${idx}`">
                                <option v-for="comp in cardCompOptionList" :key="comp.value" :value="comp.value" :selected="comp.value == `${data.cardComp}`">{{ comp.name }}</option>
                            </select>
                        </td>
                        <td><input :id="`cardName_${idx}`" :value="`${data.cardName}`" /></td>
                        <td>
                            <select :id="`bankCd_${idx}`">
                                <option v-for="bank in bankOptionList" :key="bank.value" :value="bank.value" :selected="bank.value == `${data.bankCd}`">{{ bank.name }}</option>
                            </select>
                        </td>
                        <td><input class="deadlineDateInput" :id="`deadlineDate_${idx}`" :value="`${data.deadlineDate}`" style="width: 80%;" maxlength="2" />일</td>
                        <td><input class="paymentDateInput" :id="`paymentDate_${idx}`" :value="`${data.paymentDate}`" style="width: 80%;" maxlength="2" />일</td>
                        <td><input :id="`expiredYm_${idx}`" type="month" :value="`${data.expiredYm}`" /></td>
                        <td><input :id="`limitAmt_${idx}`" :value="`${data.limitAmt}`" style="width: 80%; text-align: right" /> 원</td>
                        <td>
                            <select :id="`creditYn_${idx}`">
                                <option v-for="yn in ynOptionList" :key="yn.value" :value="yn.value" :selected="yn.value == `${data.creditYn}`">{{ yn.name }}</option>
                            </select>
                        </td>
                        <td>
                            <select :id="`useYn_${idx}`">
                                <option v-for="yn in ynOptionList" :key="yn.value" :value="yn.value" :selected="yn.value == `${data.useYn}`">{{ yn.name }}</option>
                            </select>
                        </td>
                        <td>
                            <select :id="`exposeMain_${idx}`">
                                <option v-for="yn in ynOptionList" :key="yn.value" :value="yn.value" :selected="yn.value == `${data.exposeMain}`">{{ yn.name }}</option>
                            </select>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
    import { getResourceItem, getResourceList } from '@/scripts/util/common/SettingResource.js';
    import AccountHeader from '../common/AccountHeader.vue';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const title = ref('카드정보관리');
    const dataList = ref([]);
    const bankOptionList = ref([]);
    const cardCompOptionList = ref([]);
    const ynOptionList = ref([{'value': 'Y', 'name': 'Y'}, {'value': 'N', 'name': 'N'}]);

    onMounted(() => {
        getBankCdOptionList();
        getCardInfoList();
    });

    const checkBoxEvt = (idx) => {
        const checked = document.getElementById('status_' + idx).checked;
        
        if (checked) {
            if (dataList.value[idx].trxType == 'INSERT') {
                dataList.value.splice(idx, 1);
            } else {
                dataList.value[idx].trxType ='DELETE';
            }
        } else {
            dataList.value[idx].trxType =''
        }
    }

    const getBankCdOptionList = () => {
        bankOptionList.value = [
            { 'value': '88', 'name': '신한은행' },
            { 'value': '87', 'name': '제일은행' },
            { 'value': '82', 'name': '카카오뱅크' },
            { 'value': '81', 'name': '하나은행' }
        ]

        cardCompOptionList.value =[
            { 'value': '', 'name': '' },
            { 'value': 'C01', 'name': '현대카드' },
            { 'value': 'C02', 'name': '하나카드' },
            { 'value': 'C03', 'name': '삼성카드' }
        ]
    }

    const getCardInfoList = () => {
        const url = aibeesGlobal.API_SERVER_URL + "/account/card/infos";
        
        const callback = (res) => {
            if(res.data.message == 'SUCCESS') {
                dataList.value = res.data.data;
                dataList.value.forEach(data => {
                    data['trxType'] = '';
                })
            } else {
                alert(res.data.message);
            }
        }
        axiosGet(url, callback);
    }

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
            'bankCd': '',
            'deadlineDate': '',
            'paymentDate': '',
            'expiredYm': '2999-12',
            'creditYn': '',
            'useYn': '',
            'company': '',
            'limitAmt': 0,
            'exposeMain': ''
        }

        dataList.value.push(newData);
    }

    const saveData = () => {
        const dataSize = dataList.value.length;

        for(let i = 0; i < dataSize; i++) {
            const data = dataList.value[i];
            data['cardNo'] = document.getElementById('cardNo_'+i).value;
            data['cardComp'] = document.getElementById('cardComp_'+i).value;
            data['cardName'] = document.getElementById('cardName_'+i).value;
            data['status'] = document.getElementById('status_'+i).checked;
            data['bankCd'] = document.getElementById('bankCd_'+i).value;
            data['expiredYm'] = document.getElementById('expiredYm_'+i).value;
            data['limitAmt'] = document.getElementById('limitAmt_'+i).value;
            data['creditYn'] = document.getElementById('creditYn_'+i).value;
            data['useYn'] = document.getElementById('useYn_'+i).value;
            data['exposeMain'] = document.getElementById('exposeMain_'+i).value;
            data['deadlineDate'] = document.getElementById('deadlineDate_'+i).value;
            data['paymentDate'] = document.getElementById('paymentDate_'+i).value;
        }
        console.log(dataList.value);


        const isReal = confirm("저장하실건가");

        if(!isReal) {
            return false;
        }

        const url = aibeesGlobal.API_SERVER_URL + "/account/card/infos";
        const data = {
            'cardInfoReqs': dataList.value
        }
        const callback = (res) => {
            if(res.data.message == 'SUCCESS') {
                alert("저장완료");
                getCardInfoList();
            } else {
                alert(res.data.message);
            }
        }
        axiosPost(url, data, callback);
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
            }
        }
    }
}
</style>