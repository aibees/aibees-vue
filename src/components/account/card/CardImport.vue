<template>
    <AccountHeader :prop_title=title />
  card excel upload
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

<style>

</style>