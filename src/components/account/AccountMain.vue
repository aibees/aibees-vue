<template>
  <div id="account" class="account">
    <div class="back-image">
      <img src="@image/account_backimg.jpg" />
    </div>

    <div class="main-page">
      <div class="main-title">AibeesWorld</div>
      <div class="main-subtitle">가계장부 및 통계페이지</div>

      <div class="router-button">
        <div class="buttons" @click="toRouter('journal')">가계부 회계</div>
        <div class="buttons" @click="toRouter('bank')">은행내역관리</div>
        <div class="buttons" @click="toRouter('card')">카드내역관리</div>
        <div class="buttons" @click="toRouter('setting')">환경설정</div>
      </div>
    </div>
  </div>
</template>

<script setup>
    import { onMounted } from 'vue';
    import { useRouter } from "vue-router";
    import { useStore } from 'vuex';

    const sessionStore = useStore();
    const router = useRouter();

    onMounted(() => {
        console.log(sessionStore.getters.logined);
    })

    const toRouter = (r) => {
    if(r == 'card') {
        router.push({ name: 'Card-main' })
    } else if(r == 'journal') {
        router.push({ name: 'Journal-main' })
    } else if(r == 'bank') {
        router.push({ name: 'Bank-main' })
    } else {
        location.href('/account')
    }
    }
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
      flex-direction: row;
      justify-content: center;
      border-top: 1px solid lightgrey;
      padding-top: 30px;
      margin: auto;
      width: 60%;
      
      .buttons {
        width: 96px;
        background-color: rgb(134, 219, 160);
        padding: 8px 16px;
        margin: 10px 4px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
    }
  }
}
</style>