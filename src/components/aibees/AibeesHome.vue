<template>
    <div class="aibees">
    <AibeesPopupImage style="display:none;" />
    <AibeesMkdir style="display:none;" />
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
                <li v-for="(item, idx) in searchResultList" v-bind:key="item.id">
                    <div class="listItem" :index="idx" :id="`itemBox-${idx}`" @dblclick="fileDbclick(item)">
                        <div class="item-left-image" @click="viewImageDetail(item, idx)">
                            <img v-bind:src="('dir' == item.ext)?('https://static.aibeesworld.com/image/asset/directory.png'):('https://static.aibeesworld.com'+item.path+'.'+item.ext)" oncontextmenu="return false;" />
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
    import AibeesMkdir from './comp/AibeesMkdir.vue';
    import AibeesPopupImage from './comp/AibeesPopupImage.vue';
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

        // 단축키 설정
        const escapeHandler = (e) => {
            if(e.key == 'Escape' && 'block' == document.getElementById('popupImage').style.display) {
                closePopupImage();
            }
        }

        document.addEventListener('keydown', escapeHandler);

        // default search
        getCurrentPath();
        getChildListWithFileId(fileId.value);
    })

    // custom
    /*
     * 현재 위치를 조회해온다.
     */
    const getCurrentPath = () => {
        const uri = "/file/detail?fileId=" + fileId.value;
        const callback = (result) => {
        currentPath.value = result.data.absoluePath;
        }
        axiosGet(constants.MARIA_DOMAIN+uri, callback);
    }

    /**
     * 파일 더블클릭
     * @param {*} item 
     */
    const fileDbclick = (item) => {
        console.log(item.id);
        getChildListWithFileId(item.id);
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
        const imgSrc = 'https://static.aibeesworld.com'+item.path+'.'+item.ext;

        // display 열어주고 block에 이미지 넣기
        const displayStatus = document.getElementById('popupImage');
        displayStatus.style.display = 'block';
        const displayImageSrc = document.getElementById('popupImageSrc');
        displayImageSrc.src = imgSrc;
    }

    /**
     * 폴더생성
     */
    const createDirectory = () => {
        const displayMkdirs = document.getElementById('mkdirPopup');
        displayMkdirs.style.display = 'block';
    }

    /**
     * 파일 Detail 조회
     * @param {} param 
     */
    const getFileList = (mockParam) => {
         //testFunc(param, displayItemAfterSearch);
        const url = constants.MARIA_DOMAIN + '/file/list';
        const param = {
            'fileId' : fileId
        }
        axiosPost(url, param, displayItemAfterSearch);
    }

    const getChildListWithFileId = (fileId) => {
         //testFunc(param, displayItemAfterSearch);
        const url = constants.MARIA_DOMAIN + '/file/list';
        const param = {
            'fileId' : fileId
        }
        axiosPost(url, param, displayItemAfterSearch);
    }

    const displayItemAfterSearch = (item) => {
        console.log("callBack :: displayItemAfterSearch");
        console.log(item.data)
        searchResultList.value = item.data;
        currentPath.value = item.data.absoluePath;

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