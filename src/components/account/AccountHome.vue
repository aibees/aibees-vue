<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, onBeforeRouteUpdate } from "vue-router";
import { userSession } from '../../scripts/util/user-session';

const session = userSession();
const router = useRouter();

onMounted(() => {
  
})
</script>

<style lang="scss" scoped>
@import url(//fonts.googleapis.com/earlyaccess/nanumgothic.css);

.account {
  .back-image {
    width: 100%;
    max-width: 1500px;
    height: fit-content;
    margin: auto;
    img {
      width: 100%;
      height: auto;
      opacity: 30%;
    }
  }

  .main-page {
    position: absolute;
    left: 50%;
    top: 20%;
    transform:translateX(-50%);
    width: 50%; 
    max-width: 800px;
    height: 500px;
    border: 2px solid lightgrey;
    border-radius: 3px;
    background-color: white;

    .main-title {
      margin: 90px auto 10px;
      font-size: 22px;
      font-weight: 800;
    }
    .main-subtitle {
      margin: 10px auto 70px;
      font-size: 16px;
      font-weight: 650;
    }

    .router-button {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      border-top: 1px solid lightgrey;
      padding-top: 30px;
      margin: auto;
      width: 60%;
      
      .buttons {
        background-color: rgb(134, 219, 160);
        padding: 8px 16px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }
}
</style>