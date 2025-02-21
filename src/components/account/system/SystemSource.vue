<template>
    <AccountHeader :prop_title=title />
    <div class="sysSource">
        <div class="sysSource-search">

        </div>

        <div class="sysSource-container">
            <div class="list-container first">
                <div class="sysSource-head">
                    출처(Source)
                </div>
                <div class="sysSource-buttons">
                    <button class="buttons" @click="insertSource()">추가</button>
                    <button class="buttons" @click="saveSource()">저장</button>
                    <button class="buttons" @click="deleteSource()">삭제</button>
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(source, idx) in dataList.source" :key="idx" :id="source.sourceCd" @click="selectSource(source.sourceCd)">
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`second_nm_${source.sourceNm}`" 
                                    v-model=source.sourceNm
                                    @change="sourceChanged(idx)" />
                            </span>
                            /
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`second_cd_${source.sourceCd}`" 
                                    :readonly="source.trxType != 'INSERT'"
                                    v-model=source.sourceCd />
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="list-container second">
                <div class="sysSource-head">
                    범주(Category)
                </div>
                <div class="sysSource-buttons">
                    <button class="buttons" @click="insertCategory()">추가</button>
                    <button class="buttons" @click="saveCategory()">저장</button>
                    <button class="buttons" @click="deleteCategory()">삭제</button>
                </div>
                <div class="container-body">
                    <ul>
                        <li class="list-item" v-for="(cate, idx) in dataList.category" :key="idx" :id="cate.categoryCd" @click="selectCategory(cate.categoryCd)">
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`second_nm_${cate.categoryNm}`" 
                                    v-model=cate.categoryNm
                                    @change="categoryChanged(idx)" />
                            </span>
                            /
                            <span>
                                <input 
                                    class="inputs" 
                                    :id="`second_cd_${cate.categoryCd}`" 
                                    :readonly="cate.trxType != 'INSERT'"
                                    v-model=cate.categoryCd />
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// import declaration
import { ref, onMounted, reactive } from 'vue'
import AccountHeader from '../common/AccountHeader.vue';
import mariaApi from '../../../scripts/util/mariaApi';

/******************************
 ******* Const  Variable ******
 ******************************/
const title = ref('시스템설정-출처/범주관리');

const cur = {
    sourceSelect: '',
    categorySelect: '',
    trxStatus: '',
    trxPos: ''
}

const dataList = reactive({
    source: [],
    category: []
});

/******************************
 *******   life  cycle   ******
 ******************************/
onMounted(async () => {
    await getSourceData();
});

/******************************
 ******* custom function ******
 ******************************/
/**
 * source 출처 조회
 */
const getSourceData = async () => {
    const { data } = await mariaApi.get('/system/sources');
    dataList.source = data;
    dataList.source.forEach(d => {
        d['trxType'] = '';
    });
}

/**
 * 출처 list 선택
 * @param {*} sourceCd 
 */
const selectSource = async (sourceCd) => {

    if (cur.categorySelect != '') {
        document.getElementById(cur.categorySelect).classList.remove('acct-active');
        cur.categorySelect = '';
    }

    if (cur.sourceSelect != '') {
        document.getElementById(cur.sourceSelect).classList.remove('acct-active');
        cur.sourceSelect = '';
    }

    cur.sourceSelect = sourceCd;
    const tr = document.getElementById(sourceCd);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }

    getCategoryData(sourceCd);
}

/**
 * 출처 신규생성
 */
const insertSource = () => {
    if (cur.trxPos == 'SOURCE') { return false; }

    if (cur.trxStatus != '') {
        const isContinue = confirm('변경사항 취소하는건가?');
        if(!isContinue) {
            getSourceData();
            initTrx();
            return false;
        }
    }

    const newData = {
        'sourceCd': '',
        'sourceNm': '',
        'enabledFlag': 'Y',
        'attribute1': '',
        'attribute2': '',
        'attribute3': '',
        'trxType': 'INSERT'
    }
    dataList.source.push(newData);
    cur.trxPos = 'SOURCE';
    cur.trxStatus = 'INSERT';
}

// update
const sourceChanged = (idx) => {
    if (dataList.source[idx].trxType == '') {
        dataList.source[idx].trxType = 'UPDATE';
    }
    cur.trxStatus = 'UPDATE';
    cur.trxPos = 'SOURCE';
}

/**
 * 출처 삭제
 */
const deleteSource = async () => {
    if (cur.sourceSelect == '') {
        alert("비정상");
        return false;
    }
    const { data } = await mariaApi.delete(`/system/sources/${cur.sourceSelect}`);
    getSourceData();
    initTrx();
}

/**
 * 출처 저장
 */
const saveSource = async () => {
    if (cur.trxPos != 'SOURCE') {
        alert("비정상");
        return false;
    }

    const bodyParam = {
        'data': dataList.source
    }
    const { data } = await mariaApi.post('/system/sources', bodyParam);
    getSourceData();
    initTrx();
}

/**
 * source 선택하면 category 범주 조회
 * @param {*} source 
 */
const getCategoryData = async (sourceCd) => {
    const { data } = await mariaApi.get(`/system/categories/${sourceCd}`);
    dataList.category = data;
    dataList.category.forEach(d => {
        d['trxType'] = '';
    });
}

/**
 * 범주 list 선택
 * @param {*} category 
 */
const selectCategory = (category) => {

    if (cur.categorySelect != '') {
        document.getElementById(cur.categorySelect).classList.remove('acct-active');
        cur.categorySelect = '';
    }

    cur.categorySelect = category;
    const tr = document.getElementById(category);

    if (tr.classList.contains('acct-active')) {
        tr.classList.remove('acct-active');
    } else {
        tr.classList.add('acct-active');
    }
}

const insertCategory = () => {
    if (cur.trxPos == 'CATEGORY') { return false; }

    if (cur.trxStatus != '') {
        const isContinue = confirm('변경사항 취소하는건가?');
        if(!isContinue) {
            getCategoryData(cur.sourceSelect);
            initTrx();
            return false;
        }
    }

    if (cur.sourceSelect == '') {
        alert("출처선택 필수");
        return false;
    }

    const newData = {
        'sourceCd': cur.sourceSelect,
        'categoryCd': '',
        'categoryNm': '',
        'enabledFlag': 'Y',
        'trxType': 'INSERT'
    }
    dataList.category.push(newData);
    cur.trxPos = 'CATEGORY';
    cur.trxStatus = 'INSERT';
}

// update
const categoryChanged = (idx) => {
    if (dataList.category[idx].trxType == '') {
        dataList.category[idx].trxType = 'UPDATE';
    }
    cur.trxStatus = 'UPDATE';
    cur.trxPos = 'CATEGORY';
}

/**
 * 범주 삭제
 */
const deleteCategory = async () => {
    if (cur.sourceSelect == '' || cur.categorySelect == '') {
        alert("비정상");
        return false;
    }
    const { data } = await mariaApi.delete(`/system/categories/${cur.sourceSelect}/${cur.categorySelect}`);
    getCategoryData(cur.sourceSelect);
    initTrx();
}

/**
 * 범주 저장
 */
 const saveCategory = async () => {
    if (cur.trxPos != 'CATEGORY') {
        alert("비정상");
        return false;
    }

    const bodyParam = {
        'data': dataList.category
    }
    const { data } = await mariaApi.post('/system/categories', bodyParam);
    getCategoryData(cur.sourceSelect);
    initTrx();
}

const initTrx = () => {
    cur.trxPos = '';
    cur.trxStatus = '';
}
</script>

<style lang="scss" scoped>

.acct-active {
    font-weight: bolder;
    background-color: rgb(232, 245, 220);
    border: 1px solid black;
}

.sysSource {
    .sysSource-head {
        background-color: beige;
    }
    .sysSource-buttons {
        display: flex;
        justify-content: right;
        width: 100%;
        height: 40px;
        background-color: beige;

        button {
            margin: 5px 10px;
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

    .sysSource-search {
        width: auto;
        height: 60px;
        background-color: beige;
    }

    .sysSource-container {
        display: flex;
        justify-content: left;
        .list-container {
            border-radius: 7px;
            width: 300px;
            height: 700px;
            margin: 10px 10px 5px;
            border: 1px solid lightgrey;

            .container-body {
                ul {
                    list-style: none;
                    margin-block: 0;
                    margin-inline: 0;
                    padding-inline: 0;
                    
                    .list-item {
                        padding: 10px 5px;

                        .inputs {
                            width: 100px;
                            border: none;
                            background-color: transparent;
                        }
                    }
                }
            }
        }
    }
}

</style>