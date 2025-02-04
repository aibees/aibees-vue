<template>
    <AccountHeader :prop_title=title />
    <div class="bankinfo">
        <div class="bankinfo-buttons">
            <button class="buttons" @click="insertRow()">추가</button>
            <button class="buttons" @click="selectData()">조회</button>
            <button class="buttons" @click="saveData()">저장</button>
        </div>
        <div class="bankinfo-container">
            <table class="bankinfo-table">
                <thead>
                    <tr>
                        <th style="width:40px">삭제</th>
                        <th style="width:100px">계좌ID</th>
                        <th>계좌명</th>
                        <th style="width:150px">은행</th>
                        <th style="width:120px">유형</th>
                        <th style="width:180px">사용한도</th>
                        <th style="width:150px">사용시작일자</th>
                        <th style="width:100px">사용여부</th>
                        <th style="width:100px">노출여부</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, idx) in dataList" :key="data.bankId">
                        <td><input type="checkbox" :id="`status_${idx}`" style="width:90%; height: auto" @change="checkBoxEvt(idx)" /></td>
                        <td><input class="bankIdInput" :id="`bankId_${idx}`" :value="`${data.bankId}`" :readonly="data.bankId != ''" maxlength="6" /></td>
                        <td><input :id="`bankName_${idx}`" :value="`${data.bankNm}`" /></td>
                        <td>
                            <select :id="`bankCd_${idx}`">
                                <option v-for="bank in bankOptionList" :key="bank.value" :value="bank.value" :selected="bank.value == `${data.bankCd}`">{{ bank.name }}</option>
                            </select>
                        </td>
                        <td>
                            <select :id="`bankType_${idx}`">
                                <option v-for="types in bankTypeOptList" :key="types.value" :value="types.value" :selected="types.value == `${data.bankType}`">{{ types.name }}</option>
                            </select>
                        </td>
                        <td><input :id="`limitAmt_${idx}`" :value="`${data.limitAmt}`" style="width: 80%; text-align: right" /> 원</td>
                        <td><input type="date" :id="`startDate_${idx}`" :value="`${data.startDate}`"/></td>
                        <td>
                            <select :id="`useYn_${idx}`">
                                <option v-for="yn in ynOptionList" :key="yn.value" :value="yn.value" :selected="yn.value == `${data.useYn}`">{{ yn.name }}</option>
                            </select>
                        </td>
                        <td>
                            <select :id="`displayYn_${idx}`">
                                <option v-for="yn in ynOptionList" :key="yn.value" :value="yn.value" :selected="yn.value == `${data.displayYn}`">{{ yn.name }}</option>
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
    import mariaApi from '../../../scripts/util/mariaApi';
    import AccountHeader from '../common/AccountHeader.vue';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const title = ref('계좌정보관리');
    const dataList = ref([]);
    const bankOptionList = ref([]);
    const bankTypeOptList = ref([]);
    const ynOptionList = ref([{'value': 'Y', 'name': 'Y'}, {'value': 'N', 'name': 'N'}]);

    onMounted(() => {
        getBankCdOptionList();
        getBankInfoList();
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
            dataList.value[idx].trxType = '';
        }
    }

    const getBankCdOptionList = () => {
        bankOptionList.value = [
            { 'value': '88', 'name': '신한은행' },
            { 'value': '87', 'name': '제일은행' },
            { 'value': '82', 'name': '카카오뱅크' },
            { 'value': '81', 'name': '하나은행' }
        ];

        bankTypeOptList.value = [
            { 'value': '입출금', 'name': '입출금' },
            { 'value': '예적금', 'name': '예적금' },
            { 'value': 'IRP', 'name': 'IRP' }
        ]
    }

    const getBankInfoList = async () => {

        const { data } = await mariaApi.get('/account/bank/infos');

        dataList.value = data;
        dataList.value.forEach(data => {
            data['trxType'] = '';
            data['startDate'] = toDateForm(data['startDate']);
        });
    }

    const selectData = () => {
        getBankInfoList();
    }

    const insertRow = () => {
        const newData = {   
            'trxType': 'INSERT',
            'status': false,
            'bankId': '',
            'bankNm': '',
            'bankCd': '',
            'bankAcct': '',
            'bankType': '',
            'limitAmt': '0',
            'startDate': '',
            'useYn': 'Y',
            'displayYn': 'Y'
        }

        dataList.value.push(newData);
    }

    const saveData = async () => {

        const dataSize = dataList.value.length;

        for(let i = 0; i < dataSize; i++) {
            const data = dataList.value[i];
            data['trxType'] = document.getElementById('status_'+i).checked;
            data['bankId'] = document.getElementById('bankId_'+i).value;
            data['bankNm'] = document.getElementById('bankName_'+i).value;
            data['bankCd'] = document.getElementById('bankCd_'+i).value;
            data['bankType'] = document.getElementById('bankType_'+i).value;
            data['limitAmt'] = document.getElementById('limitAmt_'+i).value;
            data['startDate'] = document.getElementById('startDate_'+i).value;
            data['useYn'] = document.getElementById('useYn_'+i).value;
            data['displayYn'] = document.getElementById('displayYn_' + i).value;
        }

        const isReal = confirm("저장하실건가");

        if(!isReal) {
            return false;
        }
        const saveParam = {
            'bankInfoReqs': dataList.value
        }
        const { data } = await mariaApi.post('/account/bank/infos', saveParam);
        console.log(data);
        selectData();
    }

    const toDateForm = (ymd) => {
        const yy = ymd.substr(0, 4);
        const mm = ymd.substr(4, 2);
        const dd = ymd.substr(6, 2);
        const result = yy + '-' + mm + '-' + dd;
        return result;
    }
</script>

<style lang="scss" scoped>
.bankinfo {
    width: 1300px;
    margin: auto;

    .bankinfo-buttons {
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

    .bankinfo-container {
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