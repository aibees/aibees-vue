<template>
    <div class="with-lnb account">
        <ALnb :title="route.meta.title" :menu="menuList" />
        <div class="contents chart-view">
            <router-view />
        </div>
    </div>
</template>

<script setup>
    import menu from '@json/menuList.json';

    const route = useRoute();
    let menuList = ref([]);

    onMounted(() => {
        menuList.value = menu.menuList.filter(m => m.id == 'chart')[0].subMenu;
    });
        
    const isMobile = ref(window.innerWidth < 1200)

    const handleResize = () => {
        isMobile.value = window.innerWidth < 1200;
    }

    onMounted(() => {
        window.addEventListener('resize', handleResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', handleResize);
    });
</script>

<style lang="scss" scoped></style>