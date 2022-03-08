<template>
  <div id="list-tab">
    <ul>
      <li v-for="data in listData" v-bind:key="data">
        <div id="tags">
            <span class="tag-platform">{{ data.platform }}</span>
            <span class="tag-span" v-for="tag in data.tags" v-bind:key="tag">{{tag}}</span>
        </div>
        <div class="product">
            <div class="product_left">
                <h3 class="name">{{ data.name }}</h3>
                <div class="amounts">
                    공급가 : {{data.buyPrice}}원 / 택배비 : {{data.buyCourier}}원 - 판매가 : {{data.selPrice}}원 / 판매택배비 : {{data.selCourier}}원
                </div>
            </div>
            <div class="product_right">
                <p> 마진율 : {{ data.marginRate }}% </p>
                <p> 마진액 : {{ data.marginAmount }} </p>
                <p>
                  <a :href="data.hlink" target="_blank"><h3 style="margin-bottom: 5px;">주문하러 가기</h3></a>
                  <a :href="data.hlink"><h3 style="margin-bottom: 5px;">수정하기</h3></a>
                </p>
            </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
    import { ref } from 'vue'

    const listData = ref([
        { name: '케어올 FK94 마스크 100매',
           tags: ['생활/건강', '수납'],
           platform: '쿠팡',
            buyPrice: 12000,
            buyCourier: 3500,
            selPrice: 19000,
            selCourier: 0,
            marginRate: 10.4,
            marginAmount: 3500,
            hlink: 'http://domeggook.com/19211492?from=lstGen/' },
            { name: '수납 언더베드',
           tags: ['생활/건강', '수납'],
           platform: '네이버',
            buyPrice: 12000,
            buyCourier: 3500,
            selPrice: 19000,
            selCourier: 0,
            marginRate: 10.4,
            marginAmount: 3500,
            hlink: 'http://domeggook.com/19211492?from=lstGen/'  },
            { name: '케어올 FK94 마스크 100매',
           tags: ['생활/건강', '수납'],
           platform: '쿠팡',
            buyPrice: 12000,
            buyCourier: 3500,
            selPrice: 19000,
            selCourier: 0,
            marginRate: 10.4,
            marginAmount: 3500,
            hlink: 'http://domeggook.com/19211492?from=lstGen/'  }
    ])
</script>

<style lang="scss" scoped>
    @import '@@/store/sub/store_list.scss'
</style>