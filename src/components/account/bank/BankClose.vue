<template>
    <AccountHeader :prop_title=title />
    <div class="bank-close">
        <div class="bank-close-option">
            <div class="close-option-left">
                <select id="close-ym">
                    <option value="">선택하세요</option>
                    <option value="202401">2024년 01월</option>
                    <option value="202312">2023년 12월</option>
                    <option value="202311">2023년 11월</option>
                    <option value="202310">2023년 10월</option>
                    <option value="202309">2023년 09월</option>
                    <option value="202308">2023년 08월</option>
                    <option value="202307">2023년 07월</option>
                    <option value="202306">2023년 06월</option>
                    <option value="202305">2023년 05월</option>
                    <option value="202304">2023년 04월</option>
                    <option value="202303">2023년 03월</option>
                    <option value="202302">2023년 02월</option>
                    <option value="202301">2023년 01월</option>
                </select>
            </div>
            <div class="close-option-right">
                <button @click="selectData()">조회</button>
            </div>
        </div>
        <div class="bank-close-container">
            <ul>
                <li v-for="(closeData, idx) in closeDataList" :key="closeData.bankId">
                    <div :id="`close_${idx}`" class="bank-close-data">
                        <table class="usage-table">
                            <thead>
                                <tr>
                                    <th colspan="4" class="acc">
                                        <div class="acc-container">
                                            <div style="width: fit-content; padding-top: 10px">
                                                {{ closeData.bankNm }}
                                            </div>
                                            <div style="width: fit-content; padding-top: 10px">
                                                지출예정금액 : <strong>{{ closeData.limitAmt }} 원</strong>
                                            </div>
                                            <div style="width: fit-content; padding-top: 10px">
                                                지난달 잔금 : <strong>{{ closeData.lastAmt }} 원</strong>
                                            </div>
                                            <div style="width: fit-content">
                                                <button :id="`closeBtn_${idx}`" class="confirm-btn" :disabled="`${closeData.closeFlag}` != 'Y'" :style="{ 'background-color' : `${closeData.closeColor}`}" @click="processClose(closeData, idx)">확정하기</button>
                                            </div>
                                        </div>
                                    </th>
                                </tr>
                                <tr>
                                    <th style="width:80px;">분류</th>
                                    <th style="width:30%;">사용구분</th>
                                    <th style="width:40%;">금액</th>
                                    <th style="width:20%;">검토</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(profit, pidx) in closeData.profitData" :id="`profit_${idx}_${pidx}`" :key="`profit_${idx}_${pidx}`" style="background-color: #dffdf8">
                                    <td :rowspan="`(${closeData.profitSize > 1})? ${closeData.profitSize}: 1`"><input type="hidden" :id="`entryCd_${idx}_${pidx}`" :value="profit.entryCd" />수입</td>
                                    <td>{{ profit.usageNm }}</td>
                                    <td class="amount">+{{ profit.amount }} 원</td>
                                    <td class="check" @click="checkData(profit, idx, pidx)">{{  profit.confirmMsg  }}</td>
                                </tr>

                                <tr style="background-color: #ffde70">
                                    <td colspan="4" class="acc">
                                        <div class="acc-container">
                                            <div>
                                                수입 소계
                                            </div>
                                            <div>
                                                <strong>+{{ closeData.profitAcc }} 원</strong>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-for="(loss, lidx) in closeData.lossData" :id="`loss_${idx}_${lidx}`" :key="`loss_${idx}_${lidx}`" style="background-color: #ffdddd">
                                    <td :rowspan="`(${closeData.lossSize > 1})? ${closeData.lossSize}: 1`"><input type="hidden" :id="`entryCd_${idx}_${lidx}`" :value="loss.entryCd" />지출</td>
                                    <td>{{ loss.usageNm }}</td>
                                    <td class="amount">-{{ loss.amount }} 원</td>
                                    <td class="check" @click="checkData(loss, idx, lidx)">{{  loss.confirmMsg  }}</td>
                                </tr>
                                
                                <tr style="background-color: #ffde70">
                                    <td colspan="4" class="acc">
                                        <div class="acc-container">
                                            <div>
                                                지출 소계
                                            </div>
                                            <div>
                                                <strong>-{{ closeData.lossAcc }} 원</strong>
                                            </div>
                                        </div>
                                    </td>
                                </tr>

                                <tr style="background-color: #c6ffbe">
                                    <td colspan="4" class="acc">
                                        <div class="acc-container">
                                            <div>
                                                합계
                                            </div>
                                            <div>
                                                <strong>{{ closeData.resultAcc }} 원</strong>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr style="background-color: #c6ffbe">
                                    <td colspan="4" class="acc">
                                        <div class="acc-container">
                                            <div>
                                                최종잔금
                                            </div>
                                            <div>
                                                <strong>{{ closeData.curAmt }} 원</strong>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="close-detail" :id="`detail_${idx}`" name="close-detail" style="display:none">
                        <div class="close-detail-button">
                            <button :id="`detailCheckBtn_${idx}`" @click="saveDetailCheck(idx)">검토완료</button>
                        </div>
                        <table class="usage-table" style="margin-left: 59px; margin-bottom: 20px">
                            <thead>
                                <tr style="background-color: lightgrey;">
                                    <th style="width:140px">구분</th>
                                    <th style="width:90px">날짜</th>
                                    <th style="width:80px">시간</th>
                                    <th style="width:120px">금액</th>
                                    <th style="width:220px">적요</th>
                                    <th style="width:70px">확정체크</th>
                                    <th style="width:70px">낭비여부</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(detail, dIdx) in closeDetailList" :key="dIdx">
                                    <td><div style="text-wrap:no-wrap;text-overflow:ellipsis;">{{ detail.usageNm }}</div></td>
                                    <td>{{detail.ymd}}</td>
                                    <td>{{detail.times}}</td>
                                    <td>{{detail.amount}}</td>
                                    <td>{{detail.remark}}</td>
                                    <td><input :id="`confirm_${idx}_${dIdx}`" type="checkbox" :checked="`${detail.confirmStatus}` == 'CONFIRM'" /></td>
                                    <td><input :id="`waste_${idx}_${dIdx}`" type="checkbox" :checked="`${detail.wasteCheck}` == 'Y'"/></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
    import { getResourceItem, getResourceList } from '@/scripts/util/common/SettingResource.js';
    import AccountHeader from '../common/AccountHeader.vue';
    import { addComma } from '@/scripts/util/common/CommonUtils.js'

    /*********************
     ** GLOBAL VARIABLE **
     *********************/
    const title = ref("통장 월별결산");
    const closeDataList = ref([]);
    const closeDetailList = ref([]);

    /*********************
     ** LIFECYCLE FUNC. **
     *********************/
    onMounted(() => {
        const toDate = new Date();
        const yy = toDate.getFullYear();
        const mm = toDate.getMonth()+1;

        document.getElementById('close-ym').value = yy+(mm < 10? '0' : '')+mm;
    })

    /*********************
     ** MAIN   FUNCTION **
     *********************/
    const getBankYmData = (ym) => {
        const url = aibeesGlobal.API_SERVER_URL + "/close/list";
        const urlParam = "?type=BANK" + "&ym=" + ym;
        const callback = (res) => {
            if(res.data.RESULT == 'SUCCESS') {
                closeDataList.value = res.data.DATA;

                closeDataList.value.forEach((close, idx) => {
                    close.limitAmt = addComma(close.limitAmt);

                    if(typeof close.profitAcc  != 'undefined')
                        close.profitAcc = addComma(close.profitAcc);

                    if(typeof close.lossAcc  != 'undefined')
                        close.lossAcc = addComma(close.lossAcc);

                    if(typeof close.resultAcc  != 'undefined')
                        close.resultAcc = addComma(close.resultAcc);

                    if(typeof close.lastAmt  != 'undefined')
                        close.lastAmt = addComma(close.lastAmt);

                    if(typeof close.curAmt  != 'undefined')
                        close.curAmt = addComma(close.curAmt);

                    if(typeof close.profitData != 'undefined') {
                        close.profitData.forEach((profit) => {
                            profit.amount = addComma(profit.amount);
                        });
                    }

                    if(typeof close.lossData != 'undefined') {
                        close.lossData.forEach((loss) => {
                            loss.amount = addComma(loss.amount);
                        });
                    }

                    if(typeof close.lineData != 'undefined' && close.lineData != null) {
                        let canClose = true;
                        close.lineData.forEach((line) => {
                            if(line.confirmCnt != line.count) {
                                canClose = false;
                            }
                        });
                        if(canClose) {
                            close['closeFlag'] = 'Y';
                            close['closeColor'] = '#000032';
                        }
                    }

                });

            } else {
                alert(res.data.RESULT + " / " + res.data.message);
            }
        }
        axiosGet(url + urlParam, callback);
    }

    /*********************
     ** EVENT  FUNCTION **
     *********************/
    const selectData = () => {
        getBankYmData(document.getElementById('close-ym').value);
    }

    const saveDetailCheck = (idx) => {
        const detailSize = closeDetailList.value.length;

        let confirmCnt = 0;
        for(let i = 0; i < detailSize; i++) {
            let detailData = closeDetailList.value[i];
            const confirmYn = document.getElementById('confirm_' + idx + '_' + i).checked;
            if(confirmYn == true) {
                confirmCnt++;
            }
            detailData['confirmStatus'] = (confirmYn? 'CONFIRM' : '');
            detailData['wasteCheck'] = document.getElementById('waste_' + idx + '_' + i).checked ? 'Y' : 'N';
        }

        if(confirmCnt != detailSize) {
            alert("모두 확정체크 해주세요");
            return false;
        } else {
            const confirmAlert = confirm("확정하시겠습니까?");
            if(confirmAlert) {
                const url = aibeesGlobal.API_SERVER_URL + "/close/detail"
                const data = {
                    'type' : 'BANK',
                    'data' : closeDetailList.value
                };
                const callback = (res) => {
                    if("SUCCESS" == res.data.RESULT) {
                        // TODO : 검토하기 -> 검토완료, 버튼 비활성화
                        selectData();
                        document.getElementById('detail_'+idx).style.display = 'none';
                    } else {
                        alert(res.data.message);
                    }
                };

                axiosPost(url, data, callback);
            }
        }
    }

    const processClose = (data, idx) => {
        if(data.closeFlag == 'N') {
            alert("확정 불가. 검토부터 진행필요");
            return false;
        }

        const confirmData = {
            'type': 'BANK',
            'data': {
                'bankId': data.bankId,
                'ym': data.ym,
                'lastAmount': data.curAmt, // 이번 달 최종잔액
                'profitAmount': data.profitAcc,
                'lossAmount': data.lossAcc,
                'incomeAmount': data.resultAcc
            }
        }

        if(confirm("확정하시겠습니까")) {
            const url = aibeesGlobal.API_SERVER_URL + "/close/confirm";
            const callback = (res) => {
                if(res.data.status == 200) {
                    const btnObj = document.getElementById('closeBtn_'+idx);
                    btnObj.textContent = '확정완료'
                    btnObj.style.backgroundColor = '#7a7aa6';
                }
            }
            axiosPost(url, confirmData, callback);
        }
    }

    const checkData = (param, idx, didx) => {
        const entryCd = param.entryCd;
        let trPrefix;
        if(entryCd == '0') {
            trPrefix = 'profit';
        } else {
            trPrefix = 'loss';
        }

        document.getElementsByName('close-detail').forEach(d => d.style.display = 'none');
        document.getElementById('detail_'+idx).style.display = 'block';

        if(param.count == param.confirmCnt) {
            document.getElementById('detailCheckBtn_'+idx).disabled = true;
            document.getElementById('detailCheckBtn_'+idx).style.backgroundColor = '#7a7aa6';
        } else {
            document.getElementById('detailCheckBtn_'+idx).disabled = false;
            document.getElementById('detailCheckBtn_'+idx).style.backgroundColor = '#000032';
        }

        const url = aibeesGlobal.API_SERVER_URL + "/close/detail/list";
        const data = {
            'type': 'BANK',
            'bankId': param.bankId,
            'entryCd': param.entryCd,
            'usageCd': param.usageCd,
            'ym': param.ym
        }
        const callback = (res) => {
            if("SUCCESS" == res.data.RESULT) {
                closeDetailList.value = res.data.DATA;

                for(let i = 0; i < res.data.DATA.length; i++) {
                    document.getElementById('confirm_'+idx+'_'+i).readOnly = true;
                    document.getElementById('waste_'+idx+'_'+i).readOnly = true;
                }
            } else {
                alert(res.data.message);
            }
        }
        axiosPost(url, data, callback);
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
            select {
                border: none;
                width: 120px;
                height: 30px;
                margin-top: 5px;
                border-radius: 4px;
            }
        }
        .close-option-right {
        }
     }

    .bank-close-container {
        ul {
            list-style: none;
            padding-block: 0;
            padding-inline: 0;
            margin-block: 0;
            li {
                .bank-close-data {
                    text-align: left;
                    .bank-name-input {
                        border: none;
                        font-size: 15px;
                    }

                    .usage-table {
                        user-select: none;
                        margin: 20px auto;
                        border: 2px solid black;
                        border-collapse: collapse;
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
                }

                .close-detail {
                    width: 100%;
                    margin: auto;
                    border-bottom: 1px solid grey;
                    .close-detail-button {
                        text-align: right;
                        button {
                            margin-right: 52px;
                        }
                    }

                    table {
                        margin: 3px auto;
                    }
                }
            }
        }
    }
}
</style>