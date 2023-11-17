<template>
    <AccountHeader :prop_title=title />
    <div id="loading_bar">
        Progressing....
    </div>
    <div class="cardImport">
      <div class="import-buttons">
        <div class="buttons-left">
            <select class="select-transparent" style="height: 100%; font-weight: 750; background-color: rgb(211, 211, 168);">
                <option value="HANA">하나카드</option>
                <option value="SAMSUNG">삼성카드</option>
                <option value="SHINHAN">신한카드</option>
                <option value="HYUNDAE">현대카드</option>
            </select>
            <a class="buttons" @click="uploadFile()"><font-awesome-icons :icon="['fa-solid', 'fa-upload']" /></a>
            <a class="buttons" @click="submitFile()"><font-awesome-icons :icon="['fa-solid', 'fa-save']" /></a>
            <div><input type="text" id="importfileText" style="width: 300px; border: 0px; background-color:transparent; margin-left: 20px; margin-top: 12px;" readonly /></div>
            <div style="display: none"><input type="file" id="fileUploadInput" @change="putFileName();" /></div>
        </div>
        <div class="buttons-right">
            <button>제출</button>
        </div>
      </div>
      <div class="import-rows">
        <table class="import-table">
          <thead>
            <tr>
              <th class="table-th" style="width: 180px;">카드명</th>
              <th class="table-th" style="width: 150px;">일자</th>
              <th class="table-th" style="width: 90px;">승인번호</th>
              <th class="table-th" style="width: 100px;">분류</th>
              <th class="table-th" style="width: 80px;">금액</th>
              <th class="table-th" style="width: 400px;">적요</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(state, idx) in dataList" v-bind:key="state.approvNum" v-bind:id="idx">
                <td>{{ state.cardNm }}</td>
                <td><div class="date">{{ state.ymd }}</div><div class="time">{{ state.times }}</div></td>
                <td>{{ state.approvNum }}</td>
                <td>
                    <select :id="`itemBox-${idx}`" class="use-type select-transparent" @change="changeColor($event)" >
                        <option v-for="usage in useTypeMap" :key="usage.value" :value="usage.value" :color="usage.color">{{ usage.name }}</option>
                    </select>
                </td>
                <td style="text-align: right;">{{ state.amount }}</td>
                <td class="text-left"><input :id="`state-remark_${idx}`" :value="state.remark" style="width: 80%; height: 30px; background-color: white; border: none;"/></td>
            </tr>
            <!-- <tr>
              <td>하나카드_T다운(SK)</td>
              <td><div class="date">2023-12-31</div><div class="time">23:23:23</div></td>
              <td>28394873</td>
              <td><select id="selectrow_1" class="use-type select-transparent" @change="changeColor($event)" >
                    <option value="99" :color="'#efefef'">미분류</option>
                    <option value="05" :color="'#f0a574'">식비</option>
                  </select></td>
              <td>580,000</td>
              <td class="text-left">배달의 민족-검암-페리카나치킨_후라이드 한마리</td>
            </tr> -->
          </tbody>
        </table>
      </div>
    </div>
</template>

<script setup>

    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'
    import AccountHeader from '../common/AccountHeader.vue';
    
    const title = ref('카드내역 엑셀업로드');
    const dataList = ref([]);

    const useTypeMap = {
        '05' : {
            'name' : '식비',
            'value' : '05',
            'color' : '#f0a574'
        },
        '99' : {
            'name' : '전체',
            'value' : '99',
            'color' : '#afafaf'
        }
    }

    const uploadFile = () => {
      $("#fileUploadInput").click();
    }

    const changeColor = () => {
        const color_data = useTypeMap[event.target.value].color;
        document.getElementById('selectrow_1').style.backgroundColor = color_data;
    }

    const putFileName = () => {
        const fileName = document.getElementById('fileUploadInput').files[0].name;
        console.log(fileName);
        document.getElementById('importfileText').value = fileName;
    }

    const submitFile = () => {
        const data = new FormData();
        var fileInput = document.getElementById('fileUploadInput');
        
        if(fileInput.files[0] == undefined) {
          alert("파일 선택부터 하셈");
          return false;
        }

        const url = aibeesGlobal.API_SERVER_URL + "/account/file";
        data.append('type', 'HANA');
        data.append('file', fileInput.files[0]);

        const callback = (res) => {
          if(res.data.result == 'SUCCESS') {
            console.log(res.data);
            selectImportedFileData(res.data.fileId);
          } else {
            document.getElementById('loading_bar').style.display='none';
            alert(res.data.message);
          }
        }

        document.getElementById('loading_bar').style.display='block';
        axiosPostForFile(url, data, callback);
    }

    const selectImportedFileData = (fileId) => {

        const url = aibeesGlobal.API_SERVER_URL + "/account/file/list?fileId=" + fileId;

        const callback = (res) => {
            console.log(res.data);
            document.getElementById('loading_bar').style.display='none';
            dataList.value = res.data;
        }

        axiosGet(url, callback);
    }
</script>

<style lang="scss" scoped>
#loading_bar {
    position: absolute;
    display: none;
    top: 50%;
    left: 50%;
    font-weight: 850;
    font-size: 20px;
}

.cardImport {
  font-family: 'Nanum Barun Gothic';
  width: 1000px;
  border-left: 1px solid grey;
  border-right: 1px solid grey;
  margin: auto;

  .select-transparent {
    text-align: center;
    background-color: transparent;
    padding: 5px 15px;
    -webkit-appearance: none;
    -moz-appearance: none;
    text-indent: 1px;
    text-overflow: '';
    border: none;

    option {
    text-align: center;
    }
  }

  .select-transpaent:focus {
    outline: none;
  }

  .import-buttons {
    display: flex;
    width: 100%;
    height: 40px;
    background-color: beige;
    justify-content: space-between;

    .buttons-left {
        text-align: left;
        display: flex;
        a {
            margin-top: 10px;
            margin-left: 20px;
            cursor: pointer;
        }
    }
    .buttons-right {
        button {
            margin: 5px 20px;
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
            border: 2px solid black;
        }
    }
  }
  .import-rows {
    .import-table {
      border-spacing: 0px;
      border-collapse: collapse;
      thead {
        tr {
          .table-th {
            height: 40px;
            border-top: 2px solid black;
            border-bottom: 2px solid black;
          }
        }
      }

      tbody {
        tr {
          height: 60px;

          .text-left {
            text-align: left;
        }

        .text-right {
            text-align: right;
        }

          td {
            border-bottom: 1px solid rgb(174, 174, 174);
            font-size: 13px;

            .use-type {
              border-radius: 15px;
              height: 35px;
            }

            .date {
              font-size: 14px;
              font-weight: 750;
            }

            .time {
              font-size: 12px;
              color: rgb(120, 120, 120);
            }
          }
        }
      }
    }
  }
}
</style>