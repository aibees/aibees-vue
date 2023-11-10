<template>
    <AccountHeader :prop_title=title />
    <div class="cardImport">
      <div class="import-buttons">
        <a><font-awesome-icons :icon="['fa-solid', 'fa-upload']" /></a>
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
            <tr>
              <td>하나카드_T다운(SK)</td>
              <td><div class="date">2023-12-31</div><div class="time">23:23:23</div></td>
              <td>28394873</td>
              <td><select id="row_1" style="width: 100%; height: 100%; border: none;" >
                    <option value="all">미분류</option>
                  </select></td>
              <td>580,000</td>
              <td>배달의 민족-검암-페리카나치킨_후라이드 한마리</td>
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
    import AccountHeader from '../common/AccountHeader.vue';
    
    const title = ref('카드내역 엑셀업로드');

    const selectFile = () => {
      $("#fileUploadInput").click();
    }

    const submitFile = () => {
        const data = new FormData();

        console.log("api url : " + aibeesGlobal.API_SERVER_URL);

        var fileInput = document.getElementById('fileUploadInput');
        
        if(fileInput.files[0] == undefined) {
          alert("파일 선택부터 하셈");
          return false;
        }

        const url = aibeesGlobal.API_SERVER_URL + "/account/file";
        data.append('type', 'HANACARD');
        data.append('file', fileInput.files[0]);

        const callback = (res) => {
          console.log(res);
        }

        axiosPostForFile(url, data, callback);
    }
</script>

<style lang="scss" scoped>
.cardImport {
  width: 1000px;
  border-left: 1px solid grey;
  border-right: 1px solid grey;
  margin: auto;

  .import-buttons {
    display: flex;
    width: 100%;
    height: 40px;
    background-color: beige;
    justify-content: left;

    a {
      margin-top: 10px;
      margin-left: 20px;
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
          td {
            border-bottom: 1px solid rgb(174, 174, 174);

            select {
              -webkit-appearance: none;
              -moz-appearance: none;
              text-indent: 1px;
              text-overflow: '';
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