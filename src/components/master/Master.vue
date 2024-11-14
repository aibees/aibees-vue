<template>
    <div class="master">
        <div class="setting-master-search">
            <div class="search-div">
                <label class="search-label">부문 : </label>
                <!-- <input type="text" id="search-depart-input" class="searh-input" /> -->
                <select class="search-input" id="search-depart-input">
                    <option :key="idx" :value="item.value" v-for="(item, idx) in departOptions">{{ item.name }}</option>
                </select>
            </div>
            <div class="search-div">
                <label class="search-label">카테고리 : </label>
                <select class="search-input" id="search-category-input">
                    <option :key="idx" :value="item.value" v-for="(item, idx) in categoryOptions">{{ item.name }}</option>
                </select>
            </div>
            <div class="search-div">
                <label class="search-label">코드 : </label>
                <input type="text" id="search-code-input" class="searh-input" />
            </div>
            <div class="search-div">
                <label class="search-label">이름 : </label>
                <input type="text" id="search-desc-input" class="searh-input" />
            </div>
        </div>
        
        <div class="setting-master-button">
            <div class="left-side">
                <button>+</button>
                <button>-</button>
            </div>
            <div class="right-side">
                <button @click="getSettingMasterList()">조회</button>
                <button>저장</button>
            </div>
        </div>

        <div class="setting-master-grid">
            <table class="master-table table-common">
                <thead>
                    <tr>
                        <th>상태</th>
                        <th>부문</th>
                        <th>분류</th>
                        <th>코드</th>
                        <th>설명</th>
                        <th>속성01 명칭</th>
                        <th>속성02 명칭</th>
                        <th>속성03 명칭</th>
                        <th>속성04 명칭</th>
                        <th>속성05 명칭</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td></td>
                        <td>ACCOUNT</td>
                        <td>COMBO</td>
                        <td>PAYWAY</td>
                        <td>결제구분코드</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="setting-detail-grid">
            <table class="table-common detail-table">
                <thead>
                    <tr>
                        <th class="data-status">상태</th>
                        <th class="data-text">코드</th>
                        <th class="data-desc">이름</th>
                        <th class="data-number">SORT</th>
                        <th class="data-text">속성01 값</th>
                        <th class="data-text">속성02 값</th>
                        <th class="data-text">속성03 값</th>
                        <th class="data-text">속성04 값</th>
                        <th class="data-text">속성05 값</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="data-status"><div></div></td>
                        <td class="data-text"><div>00</div></td>
                        <td class="data-text"><div>전체</div></td>
                        <td class="data-number"><div>0</div></td>
                        <td class="data-text"><div></div></td>
                        <td class="data-text"><div></div></td>
                        <td class="data-text"><div></div></td>
                        <td class="data-text"><div></div></td>
                        <td class="data-text"><div></div></td>
                    </tr>
                    <tr>
                        <td class="data-status"><div></div></td>
                        <td class="data-text"><div>01</div></td>
                        <td class="data-text"><div class="edit">aesfasefasefasfefasdfdsasdfasdf-카드정산</div></td>
                        <td class="data-number"><div class="edit">2</div></td>
                        <td class="data-text"><div class="edit">삼성</div></td>
                        <td class="data-text"><div class="edit">CREDIT</div></td>
                        <td class="data-text"><div class="edit"></div></td>
                        <td class="data-text"><div class="edit"></div></td>
                        <td class="data-text"><div class="edit"></div></td>
                    </tr>
                </tbody>
            </table>
            <button @click="testEdit()">테스트버튼</button>
        </div>
    </div>
</template>

<script setup>
    import {ref, onMounted} from 'vue';
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'

    var editStatus = false;
    var departOptions = ref([]);
    var categoryOptions = ref([]);

    onMounted(() => {
        getOptionList('depart');
        getOptionList('category');
    })

    // custom function
    const getSettingMasterList = () => {
        const depart = 'depart=' + document.getElementById('search-depart-input').value
        const category = 'category=' + document.getElementById('search-category-input').value
        const code = 'code=' + document.getElementById('search-code-input').value
        const desc = 'desc=' + document.getElementById('search-desc-input').value

        const url = aibeesGlobal.API_SERVER_URL + '/master/header?'

        const callback = (res) => {
            console.log(res.data);
        }

        const urlArray = [url, depart, category, code, desc];

        axiosGet(urlArray.join('&'), callback);
    }

    const getOptionList = (type) => {
        const url = aibeesGlobal.API_SERVER_URL + '/master/options?option=' + type;
        const callback = (res) => {
            const resultType = res.data.type;
            const resultList = res.data.options;

            if(resultType == 'depart') {
                departOptions.value.push({
                    'name': '전체',
                    'value': ''
                });
                resultList.forEach((str) => {
                    departOptions.value.push({
                        'name': str,
                        'value': str
                    })
                });
            } else if(resultType == 'category') {
                categoryOptions.value.push({
                    'name': '전체',
                    'value': ''
                });
                resultList.forEach((str) => {
                    categoryOptions.value.push({
                        'name': str,
                        'value': str
                    })
                });
            }
        }

        axiosGet(url, callback);
    }

    const testEdit = () => {
        var editCellItems = document.getElementsByClassName('edit');
        var itemLen = editCellItems.length;
        if(editStatus == false) {
            // 읽기상태이므로 변경상태로 전환
            editStatus = true;
            for(var i = 0; i < itemLen; i++) {
                var item = editCellItems.item(i);
                item.contentEditable = true;
            }
        } else {
            // 읽기상태이므로 변경상태로 전환
            editStatus = false;
            for(var i = 0; i < itemLen; i++) {
                var item = editCellItems.item(i);
                item.contentEditable = false;
            }
        }
    }
</script>

<style lang="scss" scoped>
.master {
    width: 1000px;
    height: auto;
    margin: auto;

    .setting-master-search {
        display: flex;
        justify-content: space-around;
        width: 100%;
        height: 40px;
        background-color: beige;

        .search-div {
            margin: 8px 10px 5px;
            .search-label {
                font-size: 13px;
                font-weight: 700;
            }

            input {
                width: 120px;
                height: 16px;
                font-size: 11px;
                font-weight: 700;
                border-radius: 5px;
            }
            select {
                width: 140px;
                height: 20px;
                font-size: 11px;
                font-weight: 700;
                border-radius: 5px;
            }
        }
    }

    .setting-master-button {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
        padding-bottom: 10px;
        border-bottom: 3px solid grey;

        .left-side {
            button {
                width: 30px;
                height: 30px;
                padding: 2px 8px;
                margin-right: 5px;
                font-size: 13px;
                font-weight: 800;
            }
        }
        .right-side {
            button {
                width: 50px;
                height: 30px;
                padding: 2px 8px;
                margin-left: 5px;
                font-size: 13px;
                font-weight: 800;
            }
        }
    }

    table {
        width: 1000px;
        table-layout: fixed;
        border-collapse: collapse;
        box-sizing: border-box;
        // width: max-content;
        
        tr {
            th {
                border: 1px solid black;
                width: 120px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            
            td {
                border: 1px solid black;
                height: 25px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }
    }

    .setting-master-grid {
        width: 100%;
        height: 300px;
        margin: 20px 0px;
        overflow: auto;

        .master-table {

            font-size: 14px;
        }
    }

    .setting-detail-grid {
        width: 100%;
        height: 350px;
        margin: 20px 0px;
        overflow: auto;

        .detail-table {
            font-size: 13px;
            tr {
                .data-status {
                    width: 30px;
                }
                .data-text {
                }
                .data-number {
                    width: 45px;
                }
                .data-desc {
                    width: 150px;
                }
                .edit {
                    height: 25px;
                }
            }
        }
    }
}
</style>