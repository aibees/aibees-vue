<template>
  <AccountHeader :prop_title=title />
  <div id="loading_bar">
      Progressing....
  </div>
  <div id="toTopButton" @click="toTop()">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="#4a5568"
          stroke-width="1" stroke-linecap="square" stroke-linejoin="arcs">
      <path d="M18 15l-6-6-6 6"/>
    </svg>
  </div>
  <div class="bankImport">
    <div class="import-buttons">
      <div class="buttons-left">
          <select id="uploadType3Select" class="select-transparent" style="height: 100%; font-weight: 750; background-color: rgb(211, 211, 168);">
              <option value="81">하나은행</option>
              <option value="88">신한은행</option>
          </select>
          <a class="buttons" @click="uploadFile()"><font-awesome-icons :icon="['fa-solid', 'fa-upload']" /></a>
          <a class="buttons" @click="submitFile()"><font-awesome-icons :icon="['fa-solid', 'fa-save']" /></a>
          <div><input type="text" id="importfileText" onfocus="this.blur();" style="width: 300px; height: 30px; border: 0px; background-color:transparent; margin-left: 20px; margin-top: 4px;" readonly /></div>
          <div style="display: none"><input type="file" id="fileUploadInput" @change="putFileName();" /></div>
      </div>
      <div class="buttons-right">
          <select id="uploadedFileSelect" style="width: 250px;">
            <option value=""></option>
            <option v-for="opt in fileHashComboList" :key="opt.fileId" :value="opt.fileId">{{ opt.fileName }}</option>
          </select>
          <button @click="selectData()">조회</button>
          <button @click="selectData()">임시저장</button>
          <button @click="transferData()">제출</button>
      </div>
    </div>
    <div class="import-rows">
      <table class="import-table">
        <thead>
          <tr>
            <th class="table-th" style="width: 180px;">은행명</th>
            <th class="table-th" style="width: 150px;">일자</th>
            <th class="table-th" style="width: 100px;">구분</th>
            <th class="table-th" style="width: 100px;">입출여부</th>
            <th class="table-th" style="width: 100px;">금액</th>
            <th class="table-th" style="width: 380px;">적요</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(state, idx) in dataList" v-bind:key="idx" v-bind:id="idx">
              <td>{{ state.bankNm }}</td>
              <td><div class="date">{{ state.ymd }}</div><div class="time">{{ state.times }}</div></td>
              <td>
                  <select :id="`itemBox_${idx}`" class="use-type select-transparent" @change="changeColor($event, idx)" :style="{ 'background-color': '#' + state.usageColor}">
                      <option v-for="usage in useTypeMap" :key="usage.value" :value="usage.value" :color="usage.color" :selected="usage.value == `${state.usageCd}`" :style="{ 'background-color': usage.color}">{{ usage.name }}</option>
                  </select>
              </td>
              <td>{{ state.entryNm }}</td>
              <td style="text-align: right;">￦ <strong>{{ state.amount }}</strong>원</td>
              <td class="text-remark"><input :id="`state-remark_${idx}`" :value="state.remark" style="width: 80%; height: 30px; background-color: white; border: none;"/></td>
          </tr>
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
    const title = ref('은행거래 결제확정처리');
    const dataList = ref([]);
    const useTypeMap = ref({});
    const fileHashComboList = ref([]);
    const bankSelectList = ref([]);

    let curFileHash = '';
    let dateSortFlag = 'desc';
    let remarkSortFlag = 'desc';


    /******************************
     ******* Vue  Lift Cycle ******
     ******************************/
    onMounted(() => {
      getFilenameList();
      getBankSelectList();
      getUsageOption();
    })

    /******************************
     ***** Element Init Func. *****
     ******************************/
    const getFilenameList = () => {
      const url = aibeesGlobal.API_SERVER_URL + '/account/common/import/list?type=BANK';
      const callback = (res) => {
        fileHashComboList.value = res.data.data;
      }
      axiosGet(url, callback);
    }

    const getBankSelectList = () => {
      const callback = (res) => {
        bankSelectList.value = res.data;
      }
      return getBankOption('BANK_SELECT', callback);
    }

    const getBankOption = (tag, callback) => {
      const url = aibeesGlobal.API_SERVER_URL + '/account/bank/option?tag=' + tag;
      axiosGet(url, callback);
    }

    const getUsageOption = () => {
      const usageData = {};

      getResourceList('ACCOUNT', 'COMBO', 'USAGE')
      .forEach(data => {
        let usageColor = '#FFFFFF';
        if(data.attribute03 != null && data.attribute03 != '' && typeof data.attribute03 != "undefined") {
          usageColor = '#' + data.attribute03;
        }

        usageData[data.detailCode] = {
          'name'  : data.name,
          'value' : data.detailCode,
          'color' : usageColor
        }
      });
      useTypeMap.value = usageData;
    }

    /******************************
     ******* Event  Function ******
     ******************************/
    const uploadFile = () => {
      $("#fileUploadInput").click();
    }

    const changeColor = (event, idx) => {
        const color_data = useTypeMap.value[event.target.value].color;
        document.getElementById('itemBox_' + idx).style.backgroundColor = color_data;
    }

    const putFileName = () => {
        const fileName = document.getElementById('fileUploadInput').files[0].name;
        document.getElementById('importfileText').value = fileName;
    }

    /******************************
     ******* Main  Function *******
     ******************************/
    // 파일 제출
    const submitFile = () => {
        const data = new FormData();
        var fileInput = document.getElementById('fileUploadInput');
        
        if(fileInput.files[0] == undefined) {
          alert("파일 선택부터 하셈");
          return false;
        }

        const url = aibeesGlobal.API_SERVER_URL + "/account/bank/file";
        data.append('type', document.getElementById('uploadTypeSelect').value);
        data.append('file', fileInput.files[0]);

        const callback = (res) => {
          if(res.data.RESULT == 'SUCCESS') {
            selectImportedFileData(res.data.fileId);
          } else {
            document.getElementById('loading_bar').style.display='none';
            alert(res.data.message);
          }
          getFilenameList();
        }

        document.getElementById('loading_bar').style.display='block';
        axiosPostForFile(url, data, callback);
    }

    // import 된 tmp 데이터 조회, 출력
    const selectImportedFileData = (fileId) => {
      curFileHash = fileId;
      const url = aibeesGlobal.API_SERVER_URL + "/account/bank/temp/list?hashId=" + fileId;

      const callback = (res) => {
        document.getElementById('loading_bar').style.display='none';
        dataList.value = res.data.data;
        console.log(dataList.value);
        getFilenameList();
      }

      axiosGet(url, callback);
    }

    // 기존에 조회했던 파일데이터 불러오기
    const selectData = () => {
      const fileHashId = document.getElementById('uploadedFileSelect').value;
      selectImportedFileData(fileHashId);
    }

    // tmp 데이터 마스터 테이블로 이관
    const transferData = () => {
      const dataSize = dataList.value.length;
      if(dataSize == 0) {
        alert("데이터 로딩부터 합시다.");
        return false;
      }

      const isReal = confirm("최종이고, 데이터 변경은 DB에서만 가능하다는 것 인지 바람");
      
      if(isReal == true) {
        for(let i = 0; i < dataSize; i++) {
          let data = dataList.value[i];
          data['usageCd'] = document.getElementById('itemBox_'+i).value;
          data['remark'] = document.getElementById('state-remark_'+i).value;
          data['status'] = 'INSERT';
        }

        // send to Server
        const url = aibeesGlobal.API_SERVER_URL + '/account/bank';
        const reqData = {
          'type' : document.getElementById('uploadTypeSelect').value,
          'data' : dataList.value,
          'fileHash' : curFileHash
        }
        const callback = (res) => {
          document.getElementById('loading_bar').style.display='none';
          if(res.data.RESULT == 'SUCCESS') {
            alert("저장 완료");
            dataList.value = [];
            // link to bank statement list
          } else {
            console.log(res);
            alert("문제 발생");
          }
          getFilenameList();
        }
        console.log(reqData);
        document.getElementById('loading_bar').style.display='block';
        axiosPost(url, reqData, callback);
      }
    }

    const toTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
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

#toTopButton {
    position: fixed;
    right: 240px;
    bottom: 50px;
}

.bankImport {
  font-family: 'Nanum Barun Gothic';
  width: 1000px;
  height: 90vh;
  border-left: 1px solid grey;
  border-right: 1px solid grey;
  margin: 0 auto 60px;
  overflow: auto;

  .select-transparent {
    text-align: center;
    background-color: transparent;
    padding: 5px 15px;
    appearance: none;
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
            margin: 5px 10px;
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
              width: 120px;
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

            .text-remark {
              display: flex;
              justify-content: right;
            }
          }
        }
      }
    }
  }
}
</style>