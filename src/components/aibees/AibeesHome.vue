<template>
  <div class="aibees">
    <div id="popupImage" class="aibees-popup-image">
        <div class="popupImageBack"></div>
        <img id="popupImageSrc" src="" oncontextmenu="return false;" />
        <button class="closePopup" @click="closePopupImage('mkdirPopup')">
            <font-awesome-icons v-bind:icon="['fa-solid', 'fa-xmark']" />
        </button>
    </div>
    <div id="mkdirPopup" class="aibees-popup-image">
        <div class="popupImageBack"></div>
        <div class="input-box">
            <p>생성할 폴더명 입력</p>
            <br/><label class="mkdirPopupLabel">폴더 ID (영문과 숫자만)</label><br/>
            <input id="newFolderIdInput" placeholder="New Folder" />
            <br/><label class="mkdirPopupLabel">폴더 이름</label><br/>
            <input id="newFolderNameInput" placeholder="New Folder" />
            <div class="mkdirButtons">
                <button class="mkdirButton" id="confirmMkdir" @click="confirmMkdir()" style="background-color:#03C75A;">생성</button>
                <button class="mkdirButton" id="cancelMkder" @click="closePopupImage('mkdirPopup')">취소</button>
            </div>
        </div>
    </div>
    <AibeesMetaEditVue :curItem="curItem" />
    <div class="aibees-header">
        <div class="aibees-header-title">
            <router-link to="/aibees">{{  title }}</router-link>
        </div>
        <div class="aibees-header-search">
            <span>
                <input id="fileSearch" type="text" placeholder="파일이름 검색" v-model="searchInput" @keyup.enter="clickSearchBtn" />
                <button id="searchButton" class="btnSearch" @click="clickSearchBtn">
                    <font-awesome-icons :icon="['fa-solid', 'fa-magnifying-glass']" />
                </button>
            </span>
        </div>
        <div class="aibees-header-buttons">
            <div class="buttons-left">
                <button class="headerButton" id="uploadButton" @click="uploadClick();"><font-awesome-icons v-bind:icon="['fa-solid', 'fa-upload']" /> 올리기</button>
                <input id="uploadFileInput" type="file" accept="image/*" style="display:none;" @change="uploadFileChange" />
                <button class="headerButton" id="mkdir" @click="createDirectory">폴더 만들기</button>
            </div>
            <div class="buttons-right">

            </div>
        </div>
    </div>
    <div class="aibees-body">
        <div class="aibees-body-condition">
            <span>위치 : </span><span id="current_path">{{ currentPath }}</span>
        </div>
        <div class="aibees-body-list">
            <ul>
                <li v-for="(item, idx) in searchResultList" v-bind:key="item.path+item.id">
                    <div class="listItem" :index="idx" :id="`itemBox-${idx}`" @dblclick="fileDbclick(item)">
                        <div class="item-left-image" @click="viewImageDetail(item, idx)">
                            <img v-bind:src="('dir' == item.ext)?('https://static.aibeesworld.com/image/asset/directory.png'):('https://static.aibeesworld.com'+item.path)" oncontextmenu="return false;" />
                        </div>
                        <div class="item-center-display" @click="viewImageDetail(item, idx)">
                            <div class="display-name">
                                {{ item.name }}
                            </div>
                            <div class="display-meta-path">
                                {{ item.pathName }}<br/>{{ item.time }}
                            </div>
                        </div>
                        <div id="buttonGroup" class="item-right-buttons" @click="if(item.ext=='dir') { viewImageDetail(item, idx); }">
                            <button v-if="item.ext!='dir'" @click="itemEvent(item, 'download')"><font-awesome-icons :icon="['fa-solid', 'fa-download']" /></button>
                            <button v-if="item.ext!='dir'" @click="itemEvent(item, 'update')"><font-awesome-icons :icon="['fa-solid', 'fa-pen']" /></button>
                            <button v-if="item.ext!='dir'" @click="itemEvent(item, 'delete')"><font-awesome-icons :icon="['fa-solid', 'fa-trash']" /></button>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
  </div>
</template>

<script setup>
    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import AibeesMetaEditVue from './comp/AibeesMetaEdit.vue';
    import constants from '../../scripts/util/constant.js'

    // variable
    let fileId = ref("0"); // start : root
    let title = ref("MARIA");
    let searchInput = ref("");
    let searchResultList = ref([]);
    let curItem = ref(null);
    let currentPath = ref("/");

    // function
    // lifeCycle
    onBeforeMount(() => {
        document.body.style.backgroundColor="rgb(231, 231, 231)";
    })

    onMounted(() => {
        getCurrentPath();

        // 단축키 설정
        const escapeHandler = (e) => {
            if(e.key == 'Escape' && 'block' == document.getElementById('popupImage').style.display) {
                closePopupImage();
            }
        }

        document.addEventListener('keydown', escapeHandler);

        // default search
        getFileListWithFileId(fileId.value);
    })

    // custom

    /*
     * 현재 위치를 조회해온다.
     */
    const getCurrentPath = () => {
        const callback = (result) => {
            console.log(result.data.absoluePath);
            currentPath.value = result.data.absoluePath;
        }
        const requestUrl = "http://localhost:19010/file/";
        axiosGet(requestUrl+fileId.value, callback);
    }

    /**
     * 파일 더블클릭
     * @param {*} item 
     */
    const fileDbclick = (item) => {
        console.log(item.id);
        getFileListWithFileId(item.id);
        fileId.value = item.id;
        getCurrentPath();
    }

    /**
     * 이미지 상세보기 오픈
     * @param {*} item 
     * @param {*} idx 
     */
    const viewImageDetail = (item, idx) => {
        // directory는 파랗게만 된다.
        if(item.ext=='dir') {
            $("[id^='itemBox']").css('background-color', 'white');
            document.getElementById('itemBox-' + idx).style.backgroundColor = '#bde7ff66'
            return false;
        }
        
        // image static 주소
        const imgSrc = 'https://static.aibeesworld.com'+item.path+item.id;

        // display 열어주고 block에 이미지 넣기
        const displayStatus = document.getElementById('popupImage');
        displayStatus.style.display = 'block';
        const displayImageSrc = document.getElementById('popupImageSrc');
        displayImageSrc.src = imgSrc;
    }

    /**
     * 이미지 상세보기 popup 닫기 
     */
    const closePopupImage = (target) => {
        if('block' == document.getElementById(target).style.display) {
            document.getElementById('popupImageSrc').src = '';
            document.getElementById(target).style.display = 'none';
        }
    }

    /**
     * 폴더생성
     */
    const createDirectory = () => {
        const displayMkdirs = document.getElementById('mkdirPopup');
        displayMkdirs.style.display = 'block';
    }

    /**
     * 폴더생성 확인버튼
     */
    const confirmMkdir = () => {
        const dirName = document.getElementById('newFolderNameInput').value;
        alert(dirName);
    }

    // 파일 조회
    const getFileList = (param) => {
         //testFunc(param, displayItemAfterSearch);
         const url = constants.MARIA_DOMAIN + '/file/list';
         const variable = "?fileId=" + "0";
         axiosGet(url, displayItemAfterSearch);
    }

    const getFileListWithFileId = (fileId) => {
         //testFunc(param, displayItemAfterSearch);
         const url = constants.MARIA_DOMAIN + '/file/list';
         const variable = "?fileId=" + fileId;
         axiosGet(url + variable, displayItemAfterSearch);
    }

    const displayItemAfterSearch = (item) => {
        console.log("callBack :: displayItemAfterSearch");
        console.log(item.data)
        searchResultList.value = item.data;

    }

    const clickSearchBtn = e => {
        var param = {
            'search': 'search param',
            'path' : 'path param'
        }
        getFileList(param);
        searchInput.value = '';
    }


    // fileUpload
    const uploadClick = () => {
        $("#uploadFileInput").click();
    }

    const uploadFileChange = (e) => {
        let uploadForm = new FormData();
        let file = e.target.files[0];
        console.log(file)

        uploadForm.append('file', file);

        $.ajax({
            url : constants.MARIA_DOMAIN + '/image/upload',
            data: uploadForm,
            enctype: 'multipart/form-data',
            async: false,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function(data) {
                console.log("success");
                console.log(data);
            },
            error: function(err) {
                console.log(err);
            }
        });
    }

    // button event controller
    const itemEvent = (cur, eventType) => {
        curItem.value = cur;
        console.log(curItem.value);

        if('download' == eventType) {
            alert('download')
        } else if('update' == eventType) {
            document.getElementById('metaEditPopup').style.display = 'block';
        } else if('delete' == eventType) {
            imageDeleteEvent();
        }
    }

    const imageDeleteEvent = () => {
        var selection = confirm("이미지를 삭제하시겠습니까?");
        alert(selection);
    }
</script>

<style lang="scss" scoped>
    @import '@@/aibees/aibees_home.scss'
    
</style>