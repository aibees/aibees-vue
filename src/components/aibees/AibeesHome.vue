<template>
  <div class="aibees">
    <div id="popupImage" class="aibees-popup-image">
        <div class="popupImageBack"></div>
        <img id="popupImageSrc" src="" oncontextmenu="return false;" />
        <button @click="closePopupImage()">
            <font-awesome-icons v-bind:icon="['fa-solid', 'fa-xmark']" />
        </button>
    </div>
    <AibeesMetaEditVue :curItem="curItem" />
    <div class="aibees-header">
        <div class="aibees-header-title">
            {{  title }}
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
                <button class="headerButton" id="uploadButton"><font-awesome-icons v-bind:icon="['fa-solid', 'fa-upload']" /> 올리기</button>
                <button class="headerButton" id="mkdir">폴더 만들기</button>
            </div>
            <div class="buttons-right">

            </div>
        </div>
    </div>
    <div class="aibees-body">
        <div class="aibees-body-condition">

        </div>
        <div class="aibees-body-list">
            <ul>
                <li v-for="(item, idx) in searchResultList" v-bind:key="item.path+item.id">
                    <div class="listItem" :index="idx" :id="`itemBox-${idx}`">
                        <div class="item-left-image" @click="viewImageDetail(item, idx)">
                            <img v-bind:src="(item.ext!='dir')?('https://static.aibeesworld.com'+item.path+item.id):('https://static.aibeesworld.com/image/asset/directory.png')" oncontextmenu="return false;" />
                        </div>
                        <div class="item-center-display" @click="viewImageDetail(item, idx)">
                            <div class="display-name">
                                {{ item.fileName }}
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
    <div class="aibees-add">
      <input type="file" accept="image/*" />
    </div>
  </div>
</template>

<script setup>
    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import AibeesMetaEditVue from './comp/AibeesMetaEdit.vue';

    // variable
    let fileId = ref("0"); // start : root
    let title = ref("MARIA");
    let searchInput = ref("");
    let searchResultList = ref([]);
    let curItem = ref(null);


    // function
    // lifeCycle
    onBeforeMount(() => {
        document.body.style.backgroundColor="rgb(231, 231, 231)";
    })

    onMounted(() => {
        const escapeHandler = (e) => {
            if(e.key == 'Escape' && 'block' == document.getElementById('popupImage').style.display) {
                closePopupImage();
            }
        }

        document.addEventListener('keydown', escapeHandler);
    })

    // custom
    // 이미지 상세보기 오픈 function
    const viewImageDetail = (item, idx) => {
        // directory는 파랗게만 된다.
        if(item.ext=='dir') {
            console.log(idx);
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

    // 이미지 상세보기 닫기 function
    const closePopupImage = () => {
        if('block' == document.getElementById('popupImage').style.display) {
            document.getElementById('popupImageSrc').src = '';
            document.getElementById('popupImage').style.display = 'none';
        }
    }

    const getFileList = (item) => {
         
    }

    const clickSearchBtn = e => {
        //alert("input : " + searchInput.value);

        searchResultList.value = [
        {
                pathName: '',
                path: '',
                filename: '..',
                ext: 'dir',
                time: '',
                id: '',
                option: 'back'
            }
            ,{
                pathName: '/이미지/여자친구/2023년01월',
                path: '/image/girlfriend/202301',
                fileName: '문서',
                ext: 'dir',
                time: null,
                id: 'documents'
            },{
                pathName: '/이미지/여자친구/2023년01월',
                path: '/image/girlfriend/202301',
                fileName: '여자친구와의 추억34',
                ext: 'jpg',
                time: '2022.12.22 13:40:29',
                id: '/000034.jpg'
            }
        ]

        searchInput.value = '';
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