<template>
    <AccountHeader :prop_title=title />
    <div class="cardinfo">
        <div class="cardinfo-buttons">
            <button class="buttons" @click="selectData()">조회</button>
            <button class="buttons" @click="saveData()">저장</button>
        </div>
        <div class="cardinfo-container">
            <table id="cardinfo-table">
                <thead>
                    <th style="width:70px">계좌ID</th>
                    <th style="width:200px">계좌명</th>
                    <th style="width:120px">은행</th>
                    <th style="width:90px">유형</th>
                    <th style="width:150px">사용한도</th>
                    <th style="width:100px">사용시작일자</th>
                    <th style="width:100px">사용여부</th>
                </thead>
                <tbody>
                    <tr v-for="(data, idx) in dataList" :key="data.bankId">
                        <td :id="`bankId_${idx}`" class="bankId">{{ data.bankId }}</td>
                        <td><input :id="`bankName_${idx}`" :value="`${data.bankNm}`" /></td>
                        <td>
                            <select :id="`bankCd_${idx}`">
                                <option v-for="bank in bankOptionList" :key="bank.value" :value="bank.value" :selected="bank.value == `${data.bankCd}`">{{ bank.name }}</option>
                            </select>
                        </td>
                        <td><input :id="`bankType_${idx}`" :value="`${data.bankType}`" /></td>
                        <td><input :id="`limitAmt_${idx}`" :value="`${data.limitAmt}`" style="width: 80%; text-align: right" /> 원</td>
                        <td><input :id="`startDate_${idx}`" :value="`${data.startDate}`"/></td>
                        <td>
                            <select :id="`useYn_${idx}`">
                                <option v-for="yn in ynOptionList" :key="yn.value" :value="yn.value" :selected="yn.value == `${data.useYn}`">{{ yn.name }}</option>
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
    const title = ref('계좌정보관리');
    const dataList = ref([]);
    const bankOptionList = ref([]);
    const ynOptionList = ref([{'value': 'Y', 'name': 'Y'}, {'value': 'N', 'name': 'N'}]);

    onMounted(() => {
        getBankCdOptionList();
        getBankInfoList();
    });

    const getBankCdOptionList = () => {
        bankOptionList.value = [
            { 'value': '88', 'name': '신한은행' },
            { 'value': '87', 'name': '제일은행' },
            { 'value': '82', 'name': '카카오뱅크' },
            { 'value': '81', 'name': '하나은행' }
        ]
    }

    const getBankInfoList = () => {
        const url = aibeesGlobal.API_SERVER_URL + "/account/bank/info/list";

        const callback = (res) => {
            console.log(res.data);
            if(res.data.message == 'SUCCESS') {
                dataList.value = res.data.data
            } else {
                alert(res.data.message);
            }
        }
        axiosGet(url, callback);
    }

    const selectData = () => {
        getBankInfoList();
    }

    const saveData = () => {
        const dataSize = dataList.value.length;

        const isReal = confirm("저장하실건가");

        if(!isReal) {
            return false;
        }

        for(let i = 0; i < dataSize; i++) {
            const data = dataList.value[i];
            data['cardName'] = document.getElementById('cardName_'+i).value;
            data['bankCd'] = document.getElementById('bankCd_'+i).value;
            data['expiredYm'] = document.getElementById('expiredYm_'+i).value;
            data['limitAmt'] = document.getElementById('limitAmt_'+i).value;
            data['creditYn'] = document.getElementById('creditYn_'+i).value;
            data['useYn'] = document.getElementById('useYn_'+i).value;
            data['selectedMain'] = document.getElementById('selectedMain_'+i).value;
            data['company'] = document.getElementById('company_'+i).value;
        }
        console.log(dataList.value);
        const url = aibeesGlobal.API_SERVER_URL + "/account/info/transfer";
        const data = {
            'type': 'CARD',
            'data': dataList.value
        }
        const callback = (res) => {
            if(res.data.RESULT == 'SUCCESS') {
                alert("저장완료");
                getCardInfoList();
            } else {
                alert(res.data.RESULT + " / " + res.data.message);
            }
        }
        axiosPost(url, data, callback);
    }
</script>

<style lang="scss" scoped>
.cardinfo {
    width: 1250px;
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
        #cardinfo-table {
            width: 100%;
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