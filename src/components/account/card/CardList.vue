<template>
    <AccountHeader :prop_title=title />
    <div class="card-list">
        <div class="card-list-search">
            <div class="filter-content">
                필터 적용됨
            </div>
            <div class="filter-icon">
                <img id="icon-img" src="@/assets/account/icon_filter.png" />
            </div>
        </div>
        <div class="card-list-grid">
            <ul>
                <li>
                    <div class="statement-item">
                        <div class="item-info">
                            <strong>우아한형제들_현대카드 애플페이 - (주)우아한형제들_설빙</strong>
                            <div class="item-subinfo">23.11.04 · 18:20 <span class="usage">교통비</span></div>
                        </div>
                        <div class="item-amount">
                            999,000 원
                        </div>
                    </div>
                </li>
                
                <li>
                    <div class="statement-item">
                        <div class="item-info">
                            <strong>우아한형제들_현대카드 애플페이 - (주)우아한형제들_설빙</strong>
                            <div class="item-subinfo">23.11.04 · 18:20</div>
                        </div>
                        <div class="item-amount">
                            999,000 원
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
    import {ref, onMounted} from 'vue';
    import { axiosGet, axiosPost } from '@/scripts/util/axios.js'
    import AccountHeader from '../common/AccountHeader.vue';

    const title = ref('카드내역 조회');

    onMounted(() => {
        
    })
</script>

<style lang="scss" scoped>
.card-list {
    font-family: "Nanum Gothic";
    display: block;
    width: 100%;
    height: 100%;
    margin: auto;

    .card-list-search {
        display: flex;
        justify-content: space-between;
        width: 100%;
        height: 30px;
        text-align: left;
        font-size: 11px;
        font-weight: 850;
        background-color: beige;

        .filter-content {
            margin-top: 6px;
            margin-left: 20px;
        }

        .filter-icon {
            margin-right: 20px;
            img{
                margin-top: 2px;
                width: auto;
                height: 25px;
            }
        }
    }

    .card-list-grid {
        width: 100%;
        height: 100%;

        ul {
            margin-inline: 0px;
            margin-block: 0px;
            padding-inline: 0px;
            list-style: none;
            li {
                display: block;
                height: 90px;
                border-bottom: 1px solid #efefef;
                .statement-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px 10px;

                    .item-info {
                        width: 60%;
                        text-align: left;
                        font-size: 14px;

                        .item-subinfo {
                            margin-top: 5px;
                            color: rgb(90, 90, 90);
                            font-size: 12px;

                            .usage {
                                background-color: rgb(240, 165, 116);
                                border-radius: 15px;
                                padding: 2px 5px;
                            }
                        }
                    }

                    .item-amount {
                        float: right;
                        font-size: 14px;
                        font-weight: 750;
                    }
                }
            }
        }
    }
}
</style>