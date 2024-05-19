<template>
  <div id="mkdirPopup" class="aibees-popup-image">
        <div class="popupImageBack"></div>
        <div class="input-box">
            <p class="description">생성할 폴더명 입력</p>
            <br/><label class="mkdirPopupLabel">폴더 ID</label><br/>
            <input class="input_text" id="newFolderIdInput" placeholder="(영문과 숫자만)" />
            <br/><label class="mkdirPopupLabel">폴더 이름</label><br/>
            <input class="input_text" id="newFolderNameInput" />
            <br/><label class="mkdirPopupLabel">생성할 위치</label><br/>
            <input class="input_text" id="mkdirCurrpath" style="width:270px" />
            <input class="input_text" id="mkdirCurrFileId" style="width:30px;text-align: center;" />
            <div class="mkdirButtons">
                <button class="mkdirButton" id="confirmMkdir" @click="confirmMkdir()" style="background-color:#03C75A;">생성</button>
                <button class="mkdirButton" id="cancelMkder" @click="closePopupImage()">취소</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import constants from '../../../scripts/util/constant.js'

    /**
     * 폴더생성 확인버튼
     */
    const confirmMkdir = () => {
        const alias = document.getElementById('newFolderNameInput').value;
        const dirNm = document.getElementById('newFolderIdInput').value;
        const parentId = document.getElementById('mkdirCurrFileId').value;

        const url = constants.MARIA_DOMAIN + '/file/folder'

        const data = {
            'name' : alias,
            'fileName' : dirNm,
            'parentId' : parentId
        }

        const callback = (data) => {
            if(data.data.message == 'SUCCESS') {
                alert("정상적으로 생성되었습니다.");
                closePopupImage();
            }
        }

        axiosPost(url, data, callback);
    }

    const closePopupImage = () => {
        if('block' == document.getElementById('mkdirPopup').style.display) {
            document.getElementById('newFolderNameInput').value = '';
            document.getElementById('newFolderIdInput').value = '';
            document.getElementById('mkdirPopup').style.display = 'none';
        }
    }
</script>

<style lang="scss" scoped>
@import "@@/__variables";
.aibees-popup-image {
    display:none;
    position: absolute;
    width:100%;
    height: 100%;
    left: 0;
    top: 0;

    .popupImageBack {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 1;
        opacity: 60%;
        width:100%;
        height: 100%;
        background-color: black;
    }

    img {
        margin-top: 20vh;
        position: relative;
        width: 80%;
        height: auto;
        opacity: 100%;
        z-index: 2;
    }

    button {
        position: absolute;
        border: none;
        border-radius: 2px;
        top: 70px;
        right: 70px;
        z-index: 3;
    }
}
@include mobile {
    // min-width: 0;
    // max-width: 600px;

    .aibees-popup-image {
        display:none;
        position: absolute;
        width:100%;
        height: 100%;
        left: 0;
        top: 0;

        .popupImageBack {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
            opacity: 60%;
            width:100%;
            height: 100%;
            background-color: black;
        }

        img {
            margin-top: 20vh;
            position: relative;
            width: 80%;
            height: auto;
            opacity: 100%;
            z-index: 2;
        }

        .input-box {
            margin: 20vh auto 0;
            padding: 20px 0 40px;
            border-radius: 5px;
            background-color: white;
            position: relative;
            width: 80%;
            height: auto;
            opacity: 100%;
            z-index: 2;

            .description {
                color: #03C75A;
            }

            .input_text {
                width: 300px;
                height: 22px;
                margin: 10px 0;
                background-color: rgb(231, 231, 231);
                border: 0.5px solid lightgrey;
                border-radius: 5px;
            }
        }

        .mkdirPopupLabel {
            width: 300px;
            height: 22px;
            text-align: right;
        }

        .mkdirButtons {
            display: flex;
            justify-content: center;
            .mkdirButton {
                position: inherit;
                border: none;
                width: 100px;
                height: 30px;
                margin: 15px;
            }
        }

        .closePopup {
            position: absolute;
            border: none;
            border-radius: 2px;
            top: 70px;
            right: 70px;
            z-index: 3;
        }
    }
}
</style>