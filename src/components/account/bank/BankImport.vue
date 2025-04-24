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
                {{ bank.name }} ({{ bank.value }})
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
          <tr v-for="(state, idx) in dataList" v-bind:key="idx" :id="`tr_${idx}`" :class="{ red: state.usedFlag === 'Y' }">
              <td>{{ state.bankNm }}</td>
              <td><div class="date">{{ state.ymd }}</div><div class="time">{{ state.times }}</div></td>
              <td>
                  <select :id="`itemBox_${idx}`" name="selectBox" class="use-type select-transparent" :style="{ 'background-color': '#' + state.usageColor}" @change="selectedAcct(idx)">
                      <option v-for="data in useAcctMaster" :key="data.acctCd" :value="data.acctCd" :selected="data.acctCd == `${state.acctCd}`">{{ data.acctNm }} / {{ data.acctCd }}</option>
                  </select>
              </td>
              <td>{{ state.entryNm }}</td>
              <td style="text-align: right;">￦ <strong>{{ state.amount }}</strong>원</td>
              <td class="text-remark"><input :id="`state-remark_${idx}`" :value="state.remark" style="width: 80%; height: 52px; background-color: white; border: none;"/></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
    // import declaration
    import { ref, onMounted } from 'vue'
    import AccountHeader from '../common/AccountHeader.vue';
    import mariaApi from '../../../scripts/util/mariaApi';
    import axios from 'axios';
    import { userSession } from '../../../scripts/util/user-session';

    /******************************
     ******* Const  Variable ******
     ******************************/
    const title = ref('은행거래 결제확정처리');
    const dataList = ref([]);
    const useAcctMaster = ref([]);
    const fileHashComboList = ref([]);
    const bankSelectList = ref([]);

    let copiedOptions = "";
    /******************************
     ******* Vue  Lift Cycle ******
     ******************************/
    // 개발 완료
    onMounted(async () => {
      await getBankSelectList();
      await getFileNameList();
      await getAcctCdOptList();
    })

    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'c') {
        const activeSelect = document.activeElement; // 포커스된 select 요소
        if (activeSelect.id.startsWith('itemBox_')) {
            copiedOptions = Array.from(activeSelect.selectedOptions).map(option => option.value)[0];
            console.log('복사된 옵션:', copiedOptions);
        }
      }

      if (event.ctrlKey && event.key === 'v') {
          const activeSelect = document.activeElement; // 포커스된 select 요소
          if (activeSelect.id.startsWith('itemBox_')) {
              activeSelect.value = copiedOptions;
              selectedAcct(activeSelect.id.split('_')[1]);
          }
      }
    })

    document.getElementsByName('selectBox').forEach(e => {
      e.addEventListener('keydown', (event) => {
        if (event.ctrlKey) {
          console.log(event.ctrlKey);

          if (event.key == 'c') {
            const v = e.value;
            alert(v);
            navigator.clipboard.writeText(v);
          }

          if (event.key == 'v') {
            navigator.clipboard.readText().then(text => {
              e.value = text;
            });
          }
        }
      })
    })

    /******************************
     ***** Element Init Func. *****
     ******************************/
    // 임시저장되어있는 업로드 파일명 조회
    // 개발 완료
    const getFileNameList = async () => {
      const { data } = await mariaApi.get('/api/account/bank/files');
      fileHashComboList.value = data;
    }

    // 은행목록 조회
    // 개발 완료
    const getBankSelectList = async () => {
      const param = { useYn: 'Y' }

      const { data } = await mariaApi.get('/api/account/bank/infos', { params: param });
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
      const { data } = await mariaApi.get('/api/account/acct', { params: acctParam });
      useAcctMaster.value = data;
      useAcctMaster.value.push({'acctCd': '-1', 'acctNm': '별도정산'});
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

        const uploadParam = new FormData();
        uploadParam.append('bankId', document.getElementById('uploadTypeSelect').value);
        uploadParam.append('file', fileInput.files[0]);

        // const { data } = await mariaApi.post('/account/bank/files', uploadParam, {'Content-Type': 'multipart/form-data'});

        const { data } = await axios.post(
          aibeesGlobal.API_SERVER_URL + '/api/account/bank/files',
          uploadParam,
          { headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': userSession().getUserInfo.accessToken,
            'AuthorId': userSession().getUserInfo.uuid
          } }
        )

        console.log(data);
        await getFileNameList();
        // 다시 한 번 리스트 조회
        await selectImportedFileData(data.data.fileHash);
    }

    // import 된 tmp 데이터 조회, 출력
    // 개발 완료
    const selectImportedFileData = async (fileId) => {
      dataList.value = [];
      document.getElementById('loading_bar').style.display='block';

      const { data } = await mariaApi.get('/api/account/bank/files/' + fileId);
      document.getElementById('loading_bar').style.display='none';
      dataList.value = data;

      dataList.value.forEach(d=> {
        console.log(d);
        d['entryNm'] = d.entryCd == 0 ? '수입' : '지출';
      })
    }

    // 기존에 조회했던 파일데이터 불러오기
    // 개발 완료
    const selectData = () => {
      const fileHashId = document.getElementById('uploadedFileSelect').value;
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
        data['remark'] = document.getElementById('state-remark_'+i).value;
      }

      const tmpSaveParam = {
        'bankId': newBankId,
        'data': dataList.value,
        'fileHash': document.getElementById('uploadedFileSelect').value
      }

      const { data } = await mariaApi.put('/api/account/bank/files', tmpSaveParam);
      await selectImportedFileData(data.fileHash);
    }

    // tmp 데이터 마스터 테이블로 이관
    const transferData = async () => {
      const dataSize = dataList.value.length;
      if(dataSize == 0) {
        alert("데이터 로딩부터 합시다.");
        return false;
      }

      const isReal = confirm("최종이고, 데이터 변경은 DB에서만 가능하다는 것 인지 바람");
      
      if (!isReal) {
        return false;
      }

      for(let i = 0; i < dataSize; i++) {
        let data = dataList.value[i];
        data['usageCd'] = document.getElementById('itemBox_'+i).value;
        data['remark'] = document.getElementById('state-remark_'+i).value;
      }

      const reqData = {
        'fileHash': document.getElementById('uploadedFileSelect').value,
        'data' : dataList.value
      }

      const { data } = await mariaApi.post('/api/account/bank/files/je', reqData);

      console.log(data);
      dataList.value = [];
      await getFileNameList();
    }

    const selectedAcct = (idx) => {
      const acctCd = document.getElementById('itemBox_' + idx).value;
      const tr = document.getElementById('tr_' + idx);
      if (acctCd != null && acctCd != '' && acctCd != '101001') {
        tr.style.backgroundColor = '#dfefff';
      } else {
        tr.style.backgroundColor = '#fff';
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

.red {
    font-weight: 650;
    background-color: rgb(255, 235, 235);
}

.bankImport {
  font-family: 'Nanum Barun Gothic';
  width: 1400px;
  height: 90vh;
  margin: auto;
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
    width: 90%;
    height: 40px;
    background-color: beige;
    justify-content: space-between;
    margin: auto;

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
      margin: auto;
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
              width: 52px;
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