<template>
    <div id="JournalPresetModal" v-show="defaultProp.open">
        <div class="modal-container">
            <div class="modal-title">
                사전정의유형 검색
            </div>
            <div class="modal-header">
                <div class="left">
                    <span>Pre-set</span>
                </div>
                <div class="center">
                    <div class="inputs"><input id="preset-input" /></div>
                </div>
                <div class="right">
                    <button @click="search">검색</button>
                </div>
            </div>
            <div class="modal-grid">
                <ul>
                    <li class="tr-preset" v-for="data in presetList" :key="data.presetCd" :id="`tr_${data.presetCd}`" @click="selectedPreset(data.presetCd)">
                        <div style="width: 30%;">{{ data.presetCd }}</div>|
                        <div style="margin-left: 20px;">{{ data.presetNm }}</div>
                    </li>
                </ul>
            </div>
            <div class="modal-footer">
                <div>
                    selected : {{ selectedPresetCd }}
                </div>
                <div class="buttons">
                    <button @click="modalConfirm">사용</button>
                    <button @click="modalClose">취소</button>
                </div>
            </div>
        </div>

        
    </div>
</template>

<script setup>
/*********************
 **     IMPORTS     **
 *********************/
import { ref, onMounted } from 'vue'
import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'

/*********************
 ** GLOBAL VARIABLE **
 *********************/
const defaultProp = defineModel('modalProp');
const emit = defineEmits(["presetConfirm"]);
const presetList = ref([]);
const selectedPresetCd = ref('');


/*********************
 ** BUTTON FUNCTION **
 *********************/

const search = () => {
    const searchValue = document.getElementById('preset-input').value;

    let url = aibeesGlobal.API_SERVER_URL + '/system/preset/headers/popup';
    const param = '?presetCd=' + searchValue + '&presetNm=' + searchValue;
    
    url = url + param;

    const callback = (res) => {
        if (res.data.message = 'SUCCESS') {
            presetList.value = res.data.data;
        } else {
            alert(res.data.message);
        }
    }

    axiosGet(url, callback);
}

const selectedPreset = (presetCd) => {
    Array.from(document.getElementsByClassName('tr-preset')).forEach(
        target => {
            target.style.backgroundColor = 'white';
            target.style.color = 'black';
        }
    );
    document.getElementById('tr_'+presetCd).style.backgroundColor = '#4078ff';
    document.getElementById('tr_'+presetCd).style.color = 'white';
    selectedPresetCd.value = presetCd;
}

const modalConfirm = () => {
    if (selectedPresetCd.value === '') {
        alert('선택되지 않음.');
        return false;
    }
    emit('presetConfirm', selectedPresetCd.value);
    modalClose();
}

const modalClose = () => {
    presetList.value = [];
    defaultProp.value.open = false;
}
</script>

<style lang="scss" scoped>
#JournalPresetModal {
    position: absolute;
    width: 100%;
    height: 100%;
    
    background-color: transparent;
    
    .modal-container {
        position: relative;
        width: 350px;
        height: 300px;
        margin: 120px auto 0px;
        border: 2px solid grey;
        background-color: white;

        .modal-title {
            padding-top: 5px;
            height: 25px;
            text-align: center;
            border-bottom: 1px solid lightgrey;
        }

        .modal-header {
            display: flex;
            width: 100%;
            height: 30px;
            padding-top: 5px;
            border-bottom: 1px solid lightgrey;

            .left {
                width: 15%;
            }
            .center {
                width: 70%;
                input {
                    width: 90%;
                }
            }
            .right {
                width: 15%;
            }
        }

        .modal-grid {
            width: 100%;
            height: 200px;
            overflow: scroll;

            ul {
                list-style: none;
                padding-inline: 0;
                padding-block: 0;
                margin-inline: 0;
                margin-block: 0;
                li {
                    display: flex;
                    // justify-content: space-between;
                    width: 90%;
                    margin: auto;
                    height: 25px;
                    border-bottom: 1px solid lightgrey;
                    margin-bottom: 5px;
                }
            }
        }

        .modal-footer {
            border-top: 1px solid lightgrey;
            width: 100%;
            height: 20px;
            padding-top: 5px;
            display: flex;
            justify-content: space-between;

            button {
                margin-right: 5px;
            }
        }
    }
}
</style>