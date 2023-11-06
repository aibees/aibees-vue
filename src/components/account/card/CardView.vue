<template>
  <div class="card">
    <div class="card-nav" id="cardNavBar">
      <div class="burger">
        <font-awesome-icons :icon="['fa-solid', 'fa-bars']" />
      </div>
      <div class="menuList">
        <ul>
          <li v-for="(item) in menuList" v-bind:key="item.value" class="menu-item prevent-select" @click="callMenu(item)">
            {{ item.name }}
          </li>
        </ul>
      </div>
    </div>
    <div class="card-view">
      <router-view />
    </div>
  </div>
</template>

<script setup>
  import { useRouter } from "vue-router";
  import { ref, onMounted } from 'vue'
  import { axiosGet, axiosPost } from '@/scripts/util/axios.js'

  const router = useRouter();

  let menuList = ref([]);

  onMounted(() => {
    document.body.style.margin="0px";
    getCardMenu();
  });

  const getCardMenu = () => {
    console.log("mockup : getCardMenu List");
    //axiosGet(url, callback);
    menuList.value = [
      {
        'name': '전체조회',
        'value': 'card_list'
      },
      {
        'name': '엑셀업로드',
        'value': 'card_excel'
      },
      {
        'name': '통계1',
        'value': 'card_statistics'
      },
      {
        'name': '통계2',
        'value': 'card_statistics'
      }
    ]
  };

  const callMenu = (item) => {

    const to = item.value.split('_')[1];
    router.push({
      name: 'Card-' + to
    })
  }

</script>

<style lang="scss" scoped>

.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
.card {
  .card-nav {
    color: white;
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 100%;
    background-color: rgb(0, 0, 50);

    .burger {
      position: absolute;
      margin: 10px 5px;
      width: 40px;
      height: 40px;
    }

    .menuList {
      display: none;

      ul {
        list-style: none;
        padding-inline: 0px;
        li {
          font-size: 13px;
          text-align: left;
          padding: 10px 0px 10px 7px;
          border-bottom: 0.5px solid lightblue;
        }

        li:hover {
          background-color: white;
          color: rgb(0, 0, 50);
          font-weight: 800;
          cursor: pointer;
        }
      }
    }
  }

  .card-nav:hover {
    width: 160px;

    .burger {
      display: none;
    }

    .menuList {
      display: block;
    }
  }

  .card-view {
    margin-left: 50px;
    
  }
}
</style>