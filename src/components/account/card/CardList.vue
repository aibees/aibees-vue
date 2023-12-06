<template>
    <AccountHeader :prop_title=title />
    <div class="card-list-option">
        <div id="option-title" class="option-item">
            <div>필터</div>
            <div id="xmark" @click="openOptionLayer()"><font-awesome-icons :icon="['fa-solid', 'fa-circle-xmark']" /></div>
        </div>

        <div id="option-card">
            <div class="option-label">카드 선택</div>
            <select id="card-selector" class="option-item" v-model="OptionDefault">
                <option v-for="info in cardInfoList" :key="info.card_no" :value="info.card_no">{{ info.card_name }}</option>
            </select>
        </div>

        <div id="option-period">
            <div class="option-label">기간 선택</div>
            <div id="option-period-selector" class="option-item">
                <div name="option-period-select" class="option-month" id="month-one" @click="selectPeriodOption($event)">1개월</div>
                <div name="option-period-select" class="option-month" id="month-three" @click="selectPeriodOption($event)">3개월</div>
                <div name="option-period-select" class="option-month" id="month-choose" @click="selectPeriodOption($event)">직접선택</div>
            </div>

            <div id="option-date" class="option-item">
                <input type="date" id="fromDate"  style="width: 110px; height: 30px; border-radius: 5px;" disabled />
                <input type="date" id="toDate" style="width: 110px; height: 30px; border-radius: 5px;" disabled />
            </div>
        </div>

        <div id="option-usage">
            <div class="option-label">분류 선택</div>
            <select id="usage-selector" class="option-item" v-model="OptionDefault">
                <option v-for="usage in useTypeMap" :key="usage.value" :value="usage.value" :color="usage.color" :selected="`option == -1`">{{ usage.name }}</option>
            </select>
        </div>

        <div id="option-remark">
            <div class="option-label">적요 검색</div>
            <input type="text" id="option-remark-input" class="option-item" />
        </div>

        <div id="option-amount">
            <div class="option-label">금액 구간</div>

            <div id="option-amount-input" class="option-item">
                <input type="number" id="amountFrom"  style="width: 90px; height: 30px; border-radius: 5px;"/>
                 ~ 
                <input type="number" id="amountTo" style="width: 90px; height: 30px; border-radius: 5px;"/>
            </div>
        </div>

        <div id="option-button" class="option-item" style="margin-bottom: 30px;" @click="searchData()">
            적 용
        </div>
    </div>
    <div class="card-list">
        <div class="card-list-search">
            <div class="filter-content">
                필터 적용됨
            </div>
            <div class="filter-icon">
                <img id="icon-img" src="@/assets/account/icon_filter.png" @click="openOptionLayer()" />
            </div>
        </div>
        <div class="card-list-grid">
            <ul>
                <li v-for="(state, idx) in statementList" :key="idx">
                    <div class="statement-item">
                        <div class="item-info">
                            <strong>{{ state.remark }}</strong>
                            <div class="item-subinfo">
                                <strong style="font-weight: 850; font-size:12px;">{{ state.ymd }}</strong> · {{ state.times }} <span class="usage" :style="{'background-color': '#'+state.usageColor}">{{ state.usageNm }}</span>
                            </div>
                        </div>
                        <div class="item-amount">
                            <div>{{ state.amount }} 원</div>
                            <div style="font-size: 14px;font-weight: 500">{{ state.cardNm }}</div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import {ref, onMounted} from 'vue';
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import { getResourceItem, getResourceList } from '@/scripts/util/common/SettingResource.js';
    import AccountHeader from '../common/AccountHeader.vue';

    const title = ref('카드내역 조회');
    const cardInfoList = ref([]);
    const useTypeMap = ref({});
    const OptionDefault = ref("-1");
    const statementList = ref([]);

    onMounted(() => {
        // usage Option List
        getUsageOption();
        // card Option List
        getCardOption();

        // default date option
        const today = new Date();
        document.getElementById('toDate').value = createDateValue(today);
        today.setMonth(today.getMonth()-1);
        document.getElementById('fromDate').value = createDateValue(today);
    });

    /******************************
     ******** main Function *******
     ******************************/
    const searchData = () => {
        const url = aibeesGlobal.API_SERVER_URL + '/account/list/card'
        const param = {
            'cardNo'    : document.getElementById('card-selector').value,
            'ymdFrom'   : document.getElementById('fromDate').value.replaceAll('-', ''),
            'ymdTo'     : document.getElementById('toDate').value.replaceAll('-', ''),
            'usage'     : document.getElementById('usage-selector').value,
            'remark'    : document.getElementById('option-remark-input').value,
            'amountFrom': document.getElementById('amountFrom').value,
            'amountTo'  : document.getElementById('amountTo').value,
        }

        const callback = (res) => {
            console.log(res.data);
            statementList.value = res.data;
        }

        document.querySelector('.card-list-option').classList.toggle('active');
        axiosPost(url, param, callback);
    }

    /******************************
     ******* Event  Function ******
     ******************************/
    const getCardOption = () => {
        const url = aibeesGlobal.API_SERVER_URL + "/account/option?type=CARD&opt=cardInfo";
        const callback = (res) => {
            cardInfoList.value = res.data;
        }
        axiosGet(url, callback);
    }

    const getUsageOption = () => {
        const usageData = {};
        
        getResourceList('ACCOUNT', 'COMBO', 'USAGE')
        .forEach(data => {
            let usageColor = '#FFFFFF';
            if(data.attribute03 != null && data.attribute03 != '' && typeof data.attribute03 != "undefined") {
                usageColor = '#' + data.attribute03;
            }
            
            usageData[data.code] = {
                'name'  : data.name,
                'value' : data.code,
                'color' : usageColor
            }
        });
        useTypeMap.value = usageData;
    }

    const openOptionLayer = () => {
        document.querySelector('.card-list-option').classList.toggle('active')
    }

    const selectPeriodOption = (e) => {
        // 선택자 구분값
        const selected = document.getElementById(e.target.id);
        const selectedName = selected.getAttribute('name');
        
        // 디자인 변경
        document.getElementsByName(selectedName).forEach((s) => {
            s.style.backgroundColor = 'white';
        });
        selected.style.backgroundColor='beige';

        // 날짜값 변경
        const today = new Date();

        if(e.target.id == 'month-one') {
            document.getElementById('toDate').value = createDateValue(today);
            today.setMonth(today.getMonth()-1);
            document.getElementById('fromDate').value = createDateValue(today);
            document.getElementById('toDate').disabled = true;
            document.getElementById('fromDate').disabled = true;

        } else if(e.target.id == 'month-three') {
            document.getElementById('toDate').value = createDateValue(today);
            today.setMonth(today.getMonth()-3);
            document.getElementById('fromDate').value = createDateValue(today);
            document.getElementById('toDate').disabled = true;
            document.getElementById('fromDate').disabled = true;

        } else if(e.target.id == 'month-choose') {
            document.getElementById('toDate').disabled = false;
            document.getElementById('fromDate').disabled = false;
            document.getElementById('toDate').value = '';
            document.getElementById('fromDate').value = '';

        }
    }

    const createDateValue = (obj) => {
        const mm = obj.getMonth()+1;
        const dd = obj.getDate();
        return obj.getFullYear()+'-'+(mm < 10 ?  '0' : '')+mm+'-'+(dd < 10 ?  '0' : '')+dd;
    }
</script>

<style lang="scss" scoped>
.card-list-option {
    position: absolute;
    visibility: hidden;
    left: 50%;
    transform:translateX(-50%);
    width: 300px;
    height: 0px;
    background-color: white;
    border: 1px solid lightgrey;
    border-radius: 5px;
    transition-duration: 0.6s;
    user-select: none;

    .option-label {
        width: 80%;
        margin: auto;
        font-weight: 750;
        font-size: 15px;
        border-bottom: 1px solid lightgrey;
    }

    .option-item {
        width: 80%;
        height: 30px;
        border-radius: 5px;
        font-weight: 750;
        padding-top: 7px;
        margin: 20px auto;
    }

    #option-title {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 770;

        #xmark svg {
            width: auto;
            height: 1.5em;
        }

    }

    #option-card {
        #card-selector {
            margin-top: 5px;
            text-align: center;
        }
    }

    #option-period {
        #option-period-selector {
            height: fit-content;
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
            margin-bottom: 5px;

            .option-month {
                width: 75px;
                height: 48px;
                padding-top: 25px;
                border: 2px solid black;
                border-radius: 5px; 
            }
        }

        #option-date {
            display: flex;
            justify-content: space-between;
        }
    }

    #option-amount {
        #option-amount-input {
            display: flex;
            justify-content: space-between;
        }
    }

    #option-button {
        width: 80%;
        height: 30px;
        margin: auto;
        border-radius: 5px;
        font-weight: 750;
        padding-top: 7px;
        color: white;
        background-color: rgb(0, 0, 50);
    }

    #option-button:hover {
        background-color: rgb(0, 0, 200);
        cursor: pointer;
    }
}

.card-list-option.active {
    visibility: visible;
    height: fit-content;
}

.card-list {
    font-family: "Nanum Gothic";
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;

    .card-list-search {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 30px;
        text-align: left;
        font-size: 11px;
        font-weight: 850;
        background-color: beige;

        .filter-content {
            margin-top: 6px;
            margin-left: 20px;
        }

        .filter-icon {
            margin-right: 20px;
            img{
                margin-top: 2px;
                width: auto;
                height: 25px;
                cursor: pointer;
            }
        }
    }

    .card-list-grid {
        width: 100%;
        height: 90vh;
        overflow-y: auto;

        ul {
            margin-inline: 0px;
            margin-block: 0px;
            padding-inline: 0px;
            list-style: none;
            li {
                display: block;
                height: 90px;
                border-bottom: 1px solid #efefef;
                .statement-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px;

                    .item-info {
                        width: 60%;
                        text-align: left;
                        font-size: 14px;

                        .item-subinfo {
                            margin-top: 5px;
                            color: rgb(90, 90, 90);
                            font-size: 12px;

                            .usage {
                                border-radius: 15px;
                                padding: 2px 5px;
                                margin-left: 10px;
                            }
                        }
                    }

                    .item-amount {
                        float: right;
                        text-align: right;
                        font-size: 16px;
                        font-weight: 750;
                    }
                }
            }
        }
    }
}
</style>