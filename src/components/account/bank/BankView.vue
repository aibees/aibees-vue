<template>
  <div class="bank">
    <div class="bank-nav" id="bankNavBar">
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
    <div class="bank-view">
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
    getBankMenu();
  });

  const getBankMenu = () => {
    menuList.value = [
      {
        'name': '홈',
        'value': 'bank_main'
      },
      {
        'name': '조회',
        'value': 'bank_list'
      },
      {
        'name': '엑셀업로드',
        'value': 'bank_excel'
      },
      {
        'name': '월별 회계결산',
        'value': 'bank_closing'
      },
      {
        'name': '통장통계',
        'value': 'bank_statistics'
      },
      {
        'name': '통장정보',
        'value': 'bank_info'
      },
      {
        'name': '돌아가기',
        'value': 'back'
      }
    ]
  };

  const callMenu = (item) => {
    const to = item.value.split('_')[1];

    if(item.value == 'back') {
      router.push( '/account' );
    } else {
      router.push({
        name: 'Bank-' + to
      })
    }
  }

</script>

<style lang="scss" scoped>


.prevent-select {
  -webkit-user-select: none; /* Safari */
  -ms-user-select: none; /* IE 10 and IE 11 */
  user-select: none; /* Standard syntax */
}
.bank {
  .bank-nav {
    color: white;
    position: absolute;
    top: 0;
    left: 0;
    width: 50px;
    height: 100%;
    background-color: rgb(104, 0, 201);

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
          border-bottom: 0.5px solid rgb(181, 69, 255);
        }

        li:hover {
          background-color: white;
          color: rgb(104, 0, 201);
          font-weight: 800;
          cursor: pointer;
        }
      }
    }
  }

  .bank-nav:hover {
    width: 160px;

    .burger {
      display: none;
    }

    .menuList {
      display: block;
    }
  }

  .bank-view {
    margin-left: 50px;
  }
}
</style>