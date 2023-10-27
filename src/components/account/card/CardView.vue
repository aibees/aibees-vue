<template>
    <h1>CARD VIEW hello!</h1>
    <input type="file" id="fileUploadInput" style="display:none" />
    <button id="selectFile" @click="selectFile">업로드</button>
    <button id="submitFile" @click="submitFile">제출</button>

    <table>
        <tr>
            <th>helo</th>
            <th>helo</th>
            <th>helo</th>
            <th>helo</th>
        </tr>
    </table>
</template>

<script setup>

    // import declaration
    import { ref, onBeforeMount, onMounted } from 'vue'
    import { axiosGet, axiosPost, axiosPostForFile } from '@/scripts/util/axios.js'

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

</style>