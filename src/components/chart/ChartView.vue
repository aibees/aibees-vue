<template>
    <div class="with-lnb account">
        <ALnb :title="route.meta.title" :menu="menuList" />
        <div class="contents chart-view">
            <router-view />
        </div>
    </div>
</template>

<script setup>
const route = useRoute();

let menuList = ref([]);

onMounted(() => {
    getsystemMenu();
});

const getsystemMenu = () => {
    menuList.value = [
        {
            'name': '비용 통계',
            'linkTo': 'Chart-expense'
        }
    ]
};
</script>

<style lang="scss" scoped></style>