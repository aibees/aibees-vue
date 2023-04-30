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
    </div>
    <div class="aibees-body">
        <div class="aibees-body-condition">

        </div>
        <div class="aibees-body-list">
            <ul>
                <li v-for="item in searchResultList" v-bind:key="item.path+item.id">
                    <div class="listItem">
                        <div class="item-left-image" @click="viewImageDetail(item)">
                            <img v-bind:src="'https://static.aibeesworld.com'+item.path+item.id" oncontextmenu="return false;" />
                        </div>
                        <div class="item-center-display" @click="viewImageDetail(item)">
                            <div class="display-name">
                                {{ item.name }}
                            </div>
                            <div class="display-meta-path">
                                {{ item.pathName }}<br/>{{ item.time }}
                            </div>
                        </div>
                        <div class="item-right-buttons">
                            <button @click="itemEvent(item, 'download')"><font-awesome-icons :icon="['fa-solid', 'fa-download']" /></button>
                            <button @click="itemEvent(item, 'update')"><font-awesome-icons :icon="['fa-solid', 'fa-pen']" /></button>
                            <button @click="itemEvent(item, 'delete')"><font-awesome-icons :icon="['fa-solid', 'fa-trash']" /></button>
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
    import AibeesMetaEditVue from './comp/AibeesMetaEdit.vue';

    // variable
    let title = ref("MARIA");
    let searchInput = ref("");
    let searchResultList = ref([]);
    let curItem = ref(null);


    // function
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

    const viewImageDetail = (item) => {
        const imgSrc = 'https://static.aibeesworld.com'+item.path+item.id;

        const displayStatus = document.getElementById('popupImage');
        displayStatus.style.display = 'block';

        const displayImageSrc = document.getElementById('popupImageSrc');
        displayImageSrc.src = imgSrc;
    }

    const closePopupImage = () => {
        if('block' == document.getElementById('popupImage').style.display) {
            document.getElementById('popupImageSrc').src = '';
            document.getElementById('popupImage').style.display = 'none';
        }
    }

    const clickSearchBtn = e => {
        //alert("input : " + searchInput.value);

        searchResultList.value = [
            {
                pathName: '/이미지/여자친구/2023년01월',
                path: '/image/girlfriend/202301',
                name: '여자친구와의 추억4',
                time: '2022.12.22 13:40:29',
                id: '/000004.jpg'
            }
            ,{
                pathName: '/이미지/여자친구/2023년01월',
                path: '/image/girlfriend/202301',
                name: '여자친구와의 추억34',
                time: '2022.12.22 13:40:29',
                id: '/000034.jpg'
            }
            ,{
                pathName: '/이미지/여자친구/2023년01월',
                path: '/image/girlfriend/202301',
                name: '여자친구와의 추억54',
                time: '2022.12.22 13:40:29',
                id: '/000054.jpg'
            }
            ,{
                pathName: '/이미지/여자친구/2023년01월',
                path: '/image/girlfriend/202301',
                name: '여자친구와의 추억74',
                time: '2022.12.22 13:40:29',
                id: '/000074.jpg'
            }
        ]

        searchInput.value = '';
    }

    const itemEvent = (cur, eventType) => {
        curItem.value = cur;
        console.log(curItem.value);

        if('download' == eventType) {
            alert('download')
        } else if('update' == eventType) {
            document.getElementById('metaEditPopup').style.display = 'block';
        } else if('delete' == eventType) {
            alert('delete')
        }
    }
</script>

<style lang="scss" scoped>
    @import '@@/aibees/aibees_home.scss'
    
</style>