<template>
    <div id="JournalSearchHeaderNo" v-show="defaultProp.open">
        <div class="modal-container">
            <div class="modal-title">
                전표번호로 검색
            </div>
            <div class="modal-header">
                <div class="left">
                    <span>전표번호</span>
                </div>
                <div class="right">
                    <input id="header-no" />
                </div>
            </div>
            <div class="modal-footer">
                <div class="buttons">
                    <button @click="modalConfirm">조회</button>
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
import { ref } from 'vue'

/*********************
 ** GLOBAL VARIABLE **
 *********************/
const defaultProp = defineModel('modalProp');
const emit = defineEmits(["searchConfirm"]);


/*********************
 ** BUTTON FUNCTION **
 *********************/

const search = () => {
}

const modalConfirm = () => {
    const headerNo = document.getElementById('header-no').value;
    if (headerNo === '') {
        alert('입력 안됨');
        return false;
    }
    emit('searchConfirm', headerNo);
    modalClose();
}

const modalClose = () => {
    defaultProp.value.open = false;
}
</script>

<style lang="scss" scoped>
#JournalSearchHeaderNo {
    position: absolute;
    width: 100%;
    height: 100%;
    
    background-color: transparent;
    
    .modal-container {
        position: relative;
        width: 350px;
        height: 100px;
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
                width: 30%;
            }
            .right {
                width: 70%;
                input {
                    width: 90%;
                }
            }
        }

        .modal-footer {
            border-top: 1px solid lightgrey;
            width: 100%;
            height: 20px;
            padding-top: 5px;
            display: flex;
            justify-content: center;

            button {
                margin-right: 5px;
            }
        }
    }
}
</style>