<!-- 
    계정과목 다중선택 Component
 -->
<template>
    <div class="maria-label-multiselect" :style="`width:${setWidth()}`">
        <div class="labels" :hidden="props.label === '' || props.label === undefined">{{ props.label }}</div>
        <div class="select-input">
            <div class="tags-list">
                {{ selectedData.length }}개 선택됨
            </div>
            <div class="sch-btn" @click="openSelector">
                <font-awesome-icons id="glass" :icon="['fa-solid', 'fa-magnifying-glass']" />
            </div>
        </div>
    </div>
    <div class="sch-selector" :hidden="!modalData.open">
        <div class="sch-input">
            <div class="sch-label">검색어</div>
            <div class="sch-input-group">
                <input id="sch-input" type="text" v-model="modalData.schText" @keydown.enter="search" />
                
                <div class="sch-btn-acct" @click="search">
                    <font-awesome-icons id="glass" :icon="['fa-solid', 'fa-magnifying-glass']" />
                </div>
            </div>
        </div>
        <div class="sch-body">
            <div class="acct-box acct-left">
                <ul>
                    <li v-for="(sample, idx) in sampleData" :key="idx" class="item" :id="`sample_${sample.acctCd}`" @click="selectSample(sample, idx)">
                        {{ sample.acctNm }} ({{ sample.acctCd }})
                    </li>
                </ul>
            </div>
            <div class="acct-button">
                <div class="button-shape" @click="toSelected">
                    <font-awesome-icons id="glass" :icon="['fa-solid', 'fa-caret-right']" />
                </div>
                <div class="button-shape" @click="fromSelected">
                    <font-awesome-icons id="glass" :icon="['fa-solid', 'fa-caret-left']" />
                </div>
                
                
            </div>
            <div class="acct-box acct-right">
                <ul>
                    <li v-for="(selected, idx) in selectedData" :key="idx" class="item" :id="`selected_${selected.acctCd}`" @click="selectSelected(selected, idx)">
                        {{ selected.acctNm }} ({{ selected.acctCd }})
                    </li>
                </ul>
            </div>
        </div>
        <div class="sch-footer">
            <button @click="close">닫기</button>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import mariaApi from '@scripts/util/mariaApi.js';

const props = defineProps({
    id: String,
    label: String,
    size: String,
    option: Array
});

const selectedData = defineModel();
const sampleData = ref([]);

const modalData = reactive({
    open: false,
    schText: '',
    selectedSample: null,
    selectedSelected: null,
    selectedSampleIdx: -1,
    selectedSelectedIdx: -1,
    data: []
});

const setWidth = () => {
    if (props.size === undefined) {
        return '300px';
    } else if (props.size === 'lg') {
        return '350px';
    } else if (props.size === 'md') {
        return '300px';
    } else if (props.size === 'sm') {
        return '250px';
    } else {
        return '300px';
    }
}

const openSelector = () => {
    if (modalData.open) {
        modalData.open = false;
    } else {
        modalData.open = true;
    }
}

const search = async () => {
    const schParam = {
        enabledFlag: 'Y',
        finalFlag: 'Y',
        searchTxt: modalData.schText
    }
    const { data } = await mariaApi.get(`/api/account/acct`, { params: schParam });
    console.log(data);
    sampleData.value = data;
}

/**
 * 닫기
 */
const close = () => {
    modalData.open = false;
}

/**
 * sample 선택하기
 * @param {*} obj 
 */
const selectSample = (obj, idx) => {
    if (modalData.selectedSample != null)  {
        document.getElementById('sample_' + modalData.selectedSample.acctCd).classList.remove('acct-active');
    }

    const tr = document.getElementById('sample_' + obj.acctCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }
    modalData.selectedSample = obj;
    modalData.selectedSampleIdx = idx;
}

/**
 * selected 선택하기
 * @param {*} idx 
 */
const selectSelected = (obj, idx) => {
    if (modalData.selectedSelected != null) {
        document.getElementById('selected_' + modalData.selectedSelected.acctCd).classList.remove('acct-active');
    }
    
    const tr = document.getElementById('selected_' + obj.acctCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }
    modalData.selectedSelected = obj;
    modalData.selectedSelectedIdx = idx;
}

const toSelected = () => {
    if (selectedData.value.find((el) => el.acctCd === modalData.selectedSample.acctCd) == undefined) {
        selectedData.value.push(modalData.selectedSample);
    }
}

const fromSelected = () => {
    if (selectedData.value.length < 1) {
        return false;
    }
    document.getElementById('selected_' + modalData.selectedSelected.acctCd).classList.remove('acct-active');
    selectedData.value.splice(modalData.selectedSelectedIdx, 1);
    modalData.selectedSelected = null;
    modalData.selectedSelectedIdx = -1;
}
</script>

<style lang="scss" scoped>
.acct-active {
    font-weight: bolder;
    background-color: rgb(165, 214, 255);
    border: 1px solid black;
}

.maria-label-multiselect {
    display: flex;
    justify-content: left;
    height: 30px;

    .labels {
        width: fit-content;
        white-space: nowrap;
        padding-top: 4px;
        padding-left: 4px;
        padding-right: 4px;
        background-color: white;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        border: 1px solid lightgrey;
    }

    .select-input {
        position: relative;
        width: 100%;
        border: 1px solid lightgrey;
        background-color: white;
        padding-block : 0;
        padding-inline: 0;
        padding-left: 5px;

        .tags-list {
            position: absolute;
            width: 80%;
            top: 4px;
            left: 10px;
            text-align: left;
        }

        .sch-btn {
            position: absolute;
            right: 0px;
            width: 30px;
            height: 30px;

            #glass {
                padding-top: 7px;
            }
        }
    }
}

.sch-selector {
    position: absolute;
    width: 420px;
    height: 325px;
    border: 1px solid grey;
    background-color: white;

    .sch-input {
        padding-top: 5px;
        padding-left: 5px;
        padding-right: 5px;
        display: flex;
        width: fit-content;
        margin: auto;
        margin-bottom: 7px;

        .sch-label {
            padding: 3px 6px;
            border: 1px solid lightgrey;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
        }

        .sch-input-group {
            position: relative;

            input {
                width: 325px;
                padding: 5px 6px;
                border: 1px solid lightgrey;
            }
            .sch-btn-acct {
                position: absolute;
                top: 0;
                right: 0;
                width: 28px;
                height: 20px;
                padding-top: 6px;
            }
        }

        
    }

    .sch-body {
        display: flex;
        width: fit-content;
        margin: auto;
        .acct-box {
            border: 1px solid lightgrey;
            border-radius: 3px;
            width: 180px;
            height: 250px;
            overflow: scroll;

            ul {
                list-style: none;
                margin-block: 0;
                padding-inline: 0;
                padding-block: 0;
                text-align: left;
                .item {
                    padding: 5px 2px;
                }
            }
        }
        .acct-box::-webkit-scrollbar {
            display: none;
        }

        .acct-left {

        }
        .acct-button {
            display: flex;
            flex-direction: column;
            width: 30px;

            .button-shape {
                width: 20px;
                height: 20px;
                margin: auto;
                padding-top: 4px;
                border: 2px solid black;
                border-radius: 7px;
            }
        }
        .acct-right {
        }
    }

    .sch-footer {
        margin-top: 5px;
        button {
            background-color: white;
            border-radius: 3px;
            border: 1px solid grey;
        }
        button:hover {
            cursor: pointer;
            background-color: beige;
        }
    }
}
</style>