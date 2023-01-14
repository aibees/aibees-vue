<template>
  <div class="cafe">
    <div class="cafe-navi">
      <ul>
        <!-- <li v-for="tab in tabs"
                :key="tab"
                :class="['tab-button', { active: currentTab === tab }]"
                @click="currentTab = tab">{{ tab }} </li> -->
        <li v-for="tab in tabs"
                :key="tab[0]"
                @click="changeTab(tab[1])">{{ tab[0] }} </li>
      </ul>
    </div>
    <div class="cafe-tab">
      <keep-alive>
        <component :is="currentTab">
        </component>
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
  import { ref, markRaw } from 'vue'
  import CafeRecipe from './tabs/CafeRecipe.vue'
  import CafeRevenue from './tabs/CafeRevenue.vue'

  const tabs = ref([["레시피", "CafeRecipe"], ["매출내역", "CafeRevenue"]])
  var currentTab = null

  function changeTab(name) {
    const lookup = {
      CafeRecipe,
      CafeRevenue
    }
    currentTab.value = markRaw(lookup[name])
  }

  defineProps({
    tabs: Array,
    currentTab: String
  })
</script>

<style lang="scss" scoped>
  .cafe {
    .cafe-navi {
      display: inline-block;
      width: auto;
      height: fit-content;
      padding: 3px 70px;
      border: 1px solid #000000;
      font-size: 20px;
      background-color: #f2ffa6;
      ul {
        list-style-type: none;
        display: flex;
        justify-content: space-around;
        padding: 0px;
        margin: 8px 0px;
        li {
          text-decoration: none;
          float: left;
          margin: 0px 30px;
        }
      }
    }

    .class-tab {
      display: block;
    }
  }
</style>