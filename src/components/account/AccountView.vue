<template>
    <div class="with-lnb account">
        <ALnb :title="route.meta.title" :menu="menuList" />
        <div class="contents account-view">
            <router-view />
        </div>
    </div>
</template>

<script setup>
    import menu from '@json/menuList.json';
const route = useRoute();

let menuList = ref([]);

onMounted(() => {
    menuList.value = menu.menuList.filter(m => m.id == 'account')[0].subMenu;
});
</script>

<style lang="scss" scoped></style>