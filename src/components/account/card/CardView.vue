<template>
  <div class="card">
    <div class="card-nav" id="cardNavBar">
      <div class="burger">
        <font-awesome-icons :icon="['fa-solid', 'fa-bars']" />
      </div>
      <div class="menuList">
        <ul v-for="item in menuList" :key="item.value">
          <li class="menu-item prevent-select" @click="clickMenu(item)">
            {{ item.name }}
          </li>
          <ul style="margin-block-left: 1em; display: none;" name="sub-menu" :id="`sub-menu-${item.value}`">
            <li v-for="subItem in item.child" v-bind:key="subItem.value" class="menu-item prevent-select" style="margin-left: 10px; background-color: #6f8097;" @click="clickMenu(subItem)">
              {{ subItem.name }}
            </li>
          </ul>
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
    menuList.value = [
      {
        'name': '홈',
        'value': 'card_main'
      },
      {
        'name': '전체조회',
        'value': 'card_list'
      },
      {
        'name': '결제확정처리',
        'value': 'card_excel'
      },
      {
        'name': '통계청',
        'value': 'card_statistics',
        'child': [
          {
            'name': '도넛통계',
            'value': 'card_statistics'
          },
          {
            'name': '막대그래프통계',
            'value': 'card_statistics'
          }
        ]
      },
      {
        'name': '카드관리',
        'value': 'card_info'
      },
      {
        'name': '돌아가기',
        'value': 'back'
      }
    ]
  };

  const clickMenu = (item) => {
    if(item.child != null) {
      openSubMenu(item);
      return false;
    }

    const to = item.value.split('_')[1];

    if(item.value == 'back') {
      router.push( '/account' );
    } else {
      router.push({ name: 'Card-' + to })
    }
  }

  const openSubMenu = (item) => {
    const submenuObj = document.getElementById('sub-menu-' + item.value);

    if(submenuObj.style.display == 'block') {
      submenuObj.style.display = 'none';
      return false;
    }

    // 전체 none
    document.getElementsByName('sub-menu').forEach(sub => {
      sub.style.display = 'none';
    });

    // 여기서 item은 sub의 item이 아니라 parent의 item임
    if(submenuObj.style.display == 'none') {
      submenuObj.style.display = 'block';
    }
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
    background-color: #3c495a;

    .burger {
      position: absolute;
      margin: 10px 5px;
      width: 40px;
      height: 40px;
    }

    .menuList {
      display: none;
      margin-top: 50px;


      ul {
        list-style: none;
        padding-inline: 0px;
        margin-block: 0px;
        li {
          font-size: 13px;
          text-align: left;
          padding: 10px 0px 10px 7px;
          border-bottom: 0.5px solid lightgrey;
        }

        li:hover {
          background-color: white;
          color: #3c495a;
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