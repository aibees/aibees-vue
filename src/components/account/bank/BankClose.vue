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
                                                <button disabled>확정하기</button>
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
                                <tr v-for="(profit, idx) in closeData.profitData" :key="`profit_${idx}`" style="background-color: #dffdf8">
                                    <td :rowspan="`(${closeData.profitSize > 1})? ${closeData.profitSize}: 1`">수입</td>
                                    <td>{{ profit.usageNm }}</td>
                                    <td class="amount">+{{ profit.amount }} 원</td>
                                    <td class="check" @click="checkData(profit)">검토하기</td>
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
                                <tr v-for="(loss, idx) in closeData.lossData" :key="`loss_${idx}`" style="background-color: #ffdddd">
                                    <td :rowspan="`(${closeData.lossSize > 1})? ${closeData.lossSize}: 1`">지출</td>
                                    <td>{{ loss.usageNm }}</td>
                                    <td class="amount">-{{ loss.amount }} 원</td>
                                    <td class="check" @click="checkData(loss)">검토하기</td>
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

    /*********************
     ** LIFECYCLE FUNC. **
     *********************/
    onMounted(() => {
        const toDate = new Date();
        const yy = toDate.getFullYear();
        const mm = toDate.getMonth()+1;
        console.log("date : " + yy + (mm < 10? '0' : '') + mm)

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
        const ym = document.getElementById('close-ym').value;
        getBankYmData(ym);
    }

    const closeData = () => {

    }

    const checkData = (data) => {
        alert("check");
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
            }
        }
    }
}
</style>