<template>
    <div class="journal">
        <div class="journal-nav" id="journalNavBar">
            <div class="burger">
                <font-awesome-icons :icon="['fa-solid', 'fa-bars']" />
            </div>
            <div class="menuList">
                <ul>
                    <li v-for="(item) in menuList" v-bind:key="item.value" class="menu-item prevent-select"
                        @click="callMenu(item)">
                        {{ item.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="journal-view">
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
    document.body.style.margin = "0px";
    getjournalMenu();
});

const getjournalMenu = () => {
    menuList.value = [
        {
            'name': '홈',
            'value': 'journal_main'
        },
        {
            'name': '전표조회',
            'value': 'journal_search'
        },
        {
            'name': '현금흐름표',
            'value': 'journal_cashflow'
        },
        {
            'name': '돌아가기',
            'value': 'back'
        }
    ]
};

const callMenu = (item) => {
    const to = item.value.split('_')[1];

    if (item.value == 'back') {
        router.push('/account');
    } else {
        router.push({ name: 'Journal-' + to })
    }
}

</script>
  
<style lang="scss" scoped>
.prevent-select {
    -webkit-user-select: none;
    /* Safari */
    -ms-user-select: none;
    /* IE 10 and IE 11 */
    user-select: none;
    /* Standard syntax */
}

.journal {
    .journal-nav {
        color: white;
        position: absolute;
        top: 0;
        left: 0;
        width: 50px;
        height: 100%;
        background-color: #5a7c4d;

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

    .journal-nav:hover {
        width: 160px;

        .burger {
            display: none;
        }

        .menuList {
            display: block;
        }
    }

    .journal-view {
        margin-left: 50px;
    }
}</style>