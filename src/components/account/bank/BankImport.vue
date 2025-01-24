<template>
  <AccountHeader :prop_title=title />
  <div id="loading_bar">
      Progressing....
  </div>
  <div class="bankImport">
    <div class="import-buttons">
      <div class="buttons-left">
          <select id="uploadTypeSelect" class="select-transparent" style="height: 100%; font-weight: 750; background-color: rgb(211, 211, 168);">
              <option v-for="(bank, idx) in bankSelectList" :key="idx" :value="bank.value">
                {{ bank.name }}
              </option>
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
          <button @click="tmpSave()">임시저장</button>
          <button @click="transferData()">제출</button>
      </div>
    </div>
    <div class="import-rows">
      <table class="import-table">
        <thead>
          <tr>
            <th class="table-th" style="width: 200px;">계좌명</th>
            <th class="table-th" style="width: 150px;">일자</th>
            <th class="table-th" style="width: 280px;">계정과목매핑</th>
            <th class="table-th" style="width: 100px;">입출여부</th>
            <th class="table-th" style="width: 100px;">금액</th>
            <th class="table-th" style="width: 400px;">적요</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(state, idx) in dataList" v-bind:key="idx" v-bind:id="idx">
              <td>{{ state.bankNm }}</td>
              <td><div class="date">{{ state.ymd }}</div><div class="time">{{ state.times }}</div></td>
              <td>
                  <select :id="`itemBox_${idx}`" class="use-type select-transparent" :style="{ 'background-color': '#' + state.usageColor}">
                      <option v-for="data in useAcctMaster" :key="data.acctCd" :value="data.acctCd" :selected="data.acctCd == `${state.acctCd}`">{{ data.acctNm }} / {{ data.acctCd }}</option>
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
    import { ref, onMounted } from 'vue'
    import { axiosPost } from '@/scripts/util/axios.js'
    import { getResourceList } from '@/scripts/util/common/SettingResource.js';
    import AccountHeader from '../common/AccountHeader.vue';
    import mariaApi from '../../../scripts/util/mariaApi';
import axios from 'axios';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const title = ref('은행거래 결제확정처리');
    const dataList = ref([]);
    const useAcctMaster = ref({});
    const fileHashComboList = ref([]);
    const bankSelectList = ref([]);

    let curFileHash = '';


    /******************************
     ******* Vue  Lift Cycle ******
     ******************************/
    // 개발 완료
    onMounted(async () => {
      await getBankSelectList();
      await getFileNameList();
      await getAcctCdOptList();
    })

    /******************************
     ***** Element Init Func. *****
     ******************************/
    // 임시저장되어있는 업로드 파일명 조회
    // 개발 완료
    const getFileNameList = async () => {
      const { data } = await mariaApi.get('/account/bank/files');
      fileHashComboList.value = data;
    }

    // 은행목록 조회
    // 개발 완료
    const getBankSelectList = async () => {
      const param = { useYn: 'Y' }

      const { data } = await mariaApi.get('/account/bank/infos', { params: param });
      data.forEach(data => {
        bankSelectList.value.push(
          {
            'value': data.bankId,
            'name': data.bankNm
          }
        )
      })
    }

    // 계정과목코드 조회
    // 개발 완료
    const getAcctCdOptList = async () => {
      const acctParam = {
        enabledFlag : 'Y',
        finalFlag: 'Y'
      }
      const { data } = await mariaApi.get('/account/acct', { params: acctParam });
      useAcctMaster.value = data;
    }

    /******************************
     ******* Event  Function ******
     ******************************/
    // 개발 완료
    const uploadFile = () => {
      $("#fileUploadInput").click();
    }

    // 개발 완료
    const putFileName = () => {
        const fileName = document.getElementById('fileUploadInput').files[0].name;
        document.getElementById('importfileText').value = fileName;
    }

    /******************************
     ******* Main  Function *******
     ******************************/
    // 파일 제출
    // 개발 완료
    const submitFile = async () => {
        const formData = new FormData();
        var fileInput = document.getElementById('fileUploadInput');
        
        if(fileInput.files[0] == undefined) {
          alert("파일 선택부터 하셈");
          return false;
        }

        // const uploadParam = {
        //   'bankId': document.getElementById('uploadTypeSelect').value,
        //   'file': fileInput.files[0]
        // }

        const uploadParam = new FormData();
        uploadParam.append('bankId', document.getElementById('uploadTypeSelect').value);
        uploadParam.append('file', fileInput.files[0]);

        // const { data } = await mariaApi.post('/account/bank/files', uploadParam, {'Content-Type': 'multipart/form-data'});

        const { data } = await axios.post(
          aibeesGlobal.API_SERVER_URL + '/account/bank/files',
          uploadParam,
          { headers: { 
            'Content-Type': 'multipart/form-data',
            'serviceKey': aibeesGlobal.SERVICE_KEY
          
          } }
        )

        await getFileNameList();
        // 다시 한 번 리스트 조회
        await selectImportedFileData(data.fileId);
    }

    // import 된 tmp 데이터 조회, 출력
    // 개발 완료
    const selectImportedFileData = async (fileId) => {
      dataList.value = [];

      const { data } = await mariaApi.get('/account/bank/files/' + fileId);
      document.getElementById('loading_bar').style.display='none';
      dataList.value = data;

      dataList.value.forEach(d=> {
        d['entryNm'] = d.entryCd == 0 ? '수입' : '지출';
      })
    }

    // 기존에 조회했던 파일데이터 불러오기
    // 개발 완료
    const selectData = () => {
      const fileHashId = document.getElementById('uploadedFileSelect').value;
      curFileHash = fileHashId;
      selectImportedFileData(fileHashId);
    }

    const tmpSave = async  () => {
      const dataSize = dataList.value.length;
      if(dataSize == 0) {
        alert("데이터 로딩부터 합시다.");
        return false;
      }

      const newBankId = document.getElementById('uploadTypeSelect').value;

      for(let i = 0; i < dataSize; i++) {
        let data = dataList.value[i];
        data['acctCd'] = document.getElementById('itemBox_'+i).value;
        console.log(i + " / acctCd " + data['acctCd']);
        data['remark'] = document.getElementById('state-remark_'+i).value;
      }

      const tmpSaveParam = {
        'bankId': newBankId,
        'data': dataList.value,
        'fileHash': document.getElementById('uploadedFileSelect').value
      }

      // const tmpSaveParam = new FormData();
      // tmpSaveParam.append('bankId', newBankId);
      // tmpSaveParam.append('fileHash', curFileHash);
      // tmpSaveParam.append('data', dataList.value);
      console.log(tmpSaveParam);

      const { data } = await mariaApi.put('/account/bank/files', tmpSaveParam);
      await selectImportedFileData(data.fileHash);
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
          getFileNameList();
        }
        console.log(reqData);
        document.getElementById('loading_bar').style.display='block';
        axiosPost(url, reqData, callback);
      }
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
  width: 1400px;
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
              border-radius: 8px;
              width: 240px;
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