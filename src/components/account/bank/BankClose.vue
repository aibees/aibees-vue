<template>
    <AccountHeader :prop_title=title />
    <div class="bank-close">
        <div class="bank-close-option">
            <div class="close-option-left">
                <input type="month" id="close-ym" />
            </div>
            <div class="close-option-right">
                <button @click="selectData()">조회</button>
            </div>
        </div>
        <div class="bank-close-container">
            <ul>
                <!-- 은행 구분항목 별 수입 및 지출 검토 -->
                <li v-for="(closeData, idx) in closeDataList" :key="closeData.bankId">
                    <div :id="`close_${idx}`" class="bank-close-data">
                        <table class="usage-table">
                            <thead>
                                <tr>
                                    <th colspan="4" class="acc">
                                        <div class="acc-container"> <!-- 누적금액 표시 -->
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
                                                <button :id="`closeBtn_${idx}`" class="confirm-btn" :disabled="`${closeData.completeDisabledFlag}` == 'Y'" :style="{ 'background-color' : `${closeData.closeColor}`}" @click="processClose(closeData, idx)">
                                                    {{ closeData.completeBtn }}
                                                </button>
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
                                    <td><input type="hidden" :id="`entryCd_${idx}_${pidx}`" :value="profit.entryCd" />수입</td>
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
                                    <td><input type="hidden" :id="`entryCd_${idx}_${lidx}`" :value="loss.entryCd" />지출</td>
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
                                    <td><input :id="`confirm_${idx}_${dIdx}`" type="checkbox" v-model="detail.confirmStatus" /></td>
                                    <td><input :id="`waste_${idx}_${dIdx}`" type="checkbox" v-model="detail.wasteCheck"/></td>
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

        document.getElementById('close-ym').value = yy+(mm < 10? '0' : '')+'-'+mm;
        console.log(document.getElementById('close-ym').value);
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

                closeDataList.value.forEach((close) => {
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
                    if(typeof close.completeFlag != 'undefined' && close.completeFlag == 'Y') {
                        close['closeColor'] = '#002bff';
                    }

                    if(close.completeFlag == 'Y' || close.closeFlag != 'Y') { // 확정이 완료된 건이거나 검토가 완료되지 않은 건은 disabled
                        close['completeDisabledFlag'] = 'Y';
                    } else {
                        close['completeDisabledFlag'] = 'N';
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
            const confirmAlert = confirm("검토 완료하시겠습니까?");
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
                console.log(res);
                if(res.status == 200) {
                    const btnObj = document.getElementById('closeBtn_'+idx);
                    btnObj.textContent = '확정완료'
                    btnObj.style.backgroundColor = '#7a7aa6';

                    selectData();
                }
            }
            axiosPost(url, confirmData, callback);
        }
    }

    /**
     * 항목 별 검토하기 누를 시 디테일 조회 및 하단 검토화면 노출
     * @param param :해당항목 라인데이터
     * @param idx :은행 별 idx
     * @param didx :은행데이터 안에서 라인 별 idx
     */
    const checkData = (param, idx, didx) => {
        const entryCd = param.entryCd;
        let trPrefix;
        if(entryCd == '0') {
            trPrefix = 'profit';
        } else {
            trPrefix = 'loss';
        }

        // 각 은행에 대한 closeDetail이 있기에 다른 은행 선택 시 남아있는 경우가 있어서 모두 display none 처리 후 선택된 detail 창을 노출
        document.getElementsByName('close-detail').forEach(d => d.style.display = 'none');
        document.getElementById('detail_'+idx).style.display = 'block';

        // 검토완료 버튼 활성화 여부
        if(param.count == param.confirmCnt) { // 모두 검토 완료되었으면
            document.getElementById('detailCheckBtn_'+idx).disabled = true;
            document.getElementById('detailCheckBtn_'+idx).style.backgroundColor = '#7a7aa6';
        } else { // 검토 진행 중이라면
            document.getElementById('detailCheckBtn_'+idx).disabled = false;
            document.getElementById('detailCheckBtn_'+idx).style.backgroundColor = '#000032';
        }

        // 검토대상 디테일리스트 조회
        const url = aibeesGlobal.API_SERVER_URL + "/close/detail/list";
        const data = {
            'type': 'BANK',
            'bankId': param.bankId,
            'entryCd': param.entryCd,
            'usageCd': param.usageCd,
            'ym': param.ym
        }
        const callback = (res) => {
            if("SUCCESS" == res.data.RESULT) { // 정상적으로 조회해왔다면
                closeDetailList.value = res.data.DATA;
                console.log("closeDetailList : ");
                console.log(closeDetailList.value);

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
            margin-left: 5px;
            #close-ym {
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