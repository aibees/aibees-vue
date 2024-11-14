<template>
    <AccountHeader :prop_title=title />
    <div class="system-preset">
        <div class="page-box pages-buttons">
            <button class="buttons" @click="insertRow">추가</button>
            <button class="buttons" @click="selectData">조회</button>
            <button class="buttons" @click="saveData">저장</button>
        </div>

        <div class="page-box pages-search">

        </div>

        <div class="page-box pages-grid-main">
            <table class="main-table">
                <thead>
                    <tr>
                        <th>프리셋 코드</th>
                        <th>프리셋 명</th>
                        <th>사용여부</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(data, idx) in headerDataList" :key="idx" :id="`headerTr-${idx}`">
                    
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="page-box pages-grid-subs">
            <table class="subs-table">
                <thead>

                </thead>
                <tbody>
                    
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
    import { getResourceItem, getResourceList } from '@/scripts/util/common/SettingResource.js';
    import AccountHeader from '../common/AccountHeader.vue';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const title = ref('시스템설정-사전유형관리');
    const headerDataList = ref([]);
    const bankOptionList = ref([]);
    const cardCompOptionList = ref([]);
    const ynOptionList = ref([{'value': 'Y', 'name': 'Y'}, {'value': 'N', 'name': 'N'}]);


    const getPresetHeaderList = () => {
        const param = {
            
        }
        const url = aibeesGlobal.API_SERVER_URL + "/account/sysem/preset/headers";
        const callback = (res) => {
            if(res.data.message == 'SUCCESS') {
                headerDataList.value = res.data.data;
            } else {
                alert(res.data.message);
            }
        }
        axiosGet(url, callback);
    }
</script>

<style lang="scss" scoped>
.system-preset {
    .page-box {
        width: 90%;
        margin: 5px auto 0px;
        border: 1px solid grey;
        border-radius: 5px;

    }

    .pages-buttons {

        display: flex;
        justify-content: right;
        height: 40px;
        background-color: beige;

        button {
            margin: 5px 20px;
            width: 80px;
            height: 30px;
            padding: 2px 10px;
            border: none;
            border-radius: 5px;
            background-color: #000032;
            color: white;
            font-weight: 750;
            cursor: pointer;
        }

        button:hover {
            background-color: #2c2ccc;
        }
    }

    .pages-search {
        height: 60px;
    }

    .pages-grid-main {
        height: 550px;
    }

    .pages-grid-subs {
        height: 250px;
    }
}
</style>