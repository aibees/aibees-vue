<template>
    <div class="common-menu">
        <div class="menu-header">
            <div class="menu-header-btns">
                <div class="buttons-left">
                    전체메뉴
                </div>
                <div class="buttons-right">
                    로그아웃
                </div>
            </div>

            <div class="menu-user">
                박준서
            </div>
            <div class="menu-search-input">
                <MLabelInput noLabel
                    size="full"/>
            </div>
        </div>

        <div class="menu-list">
            <!-- <p class="caption-text">전체메뉴</p> -->

            <div class="d-menu-no-scroll menu-li">
                <ul class="main-ul">
                    <li v-for="(m, idx) in menuList" :key="m.id" class="main-li">
                        <div class="main-name">{{ m.name }}</div>

                        <ul class="sub-ul">
                            <li v-for="(sm, idx) in m.subMenu" :key="idx" class="sub-li">
                                <div class="menu-link" @click="goTo(sm.linkTo)">{{ sm.name }}</div>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
    import menu from '@json/menuList.json';
    
    const router = useRouter();

    const menuList = ref([]);
    onMounted(() => {
        menuList.value = menu.menuList;
    });

    const goTo = (linkTo) => {
        router.push({ name: linkTo });
    }

</script>

<style lang="scss" scoped>
@use '@@/__variables.scss' as *;
@use '@@/common.scss' as *;
.common-menu{
    margin: 1rem;
    .menu-header{
        .menu-header-btns {
            display: flex;
            justify-content: space-between;
            margin: 0.75rem 0.5rem;
            .buttons-left {

            }
            .buttons-right {

            }
        }

        .menu-user {

        }

        .menu-search-input {

        }
    }

    .menu-list {

        .menu-li {
            .main-ul {
                list-style: none;
                padding-inline: 0;
                margin-block: 0;
                margin-inline: 0;
                height: 70vh;
                
                .main-li {
                    padding: 0.1rem 0.8rem 1.7rem;
                    border-top: 1px solid #b6b6b6;

                    .main-name {
                        font-size: 0.8rem;
                        color: $color-black;
                        margin: 0.8rem 0.5rem;
                    }

                    .sub-ul {
                        list-style: none;
                        padding-inline: 0;
                        margin-block: 0;
                        margin-inline: 0;
                        .sub-li {
                            text-align: start;
                            font-size: 0.85rem;
                            font-weight: 550;
                            padding: 0.7rem;

                            .menu-link {
                                text-decoration: none;
                                color: #4d4d4d;
                            }
                        }
                    }
                }
            }
        }
    }
}

</style>