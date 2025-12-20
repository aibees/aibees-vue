<template>
    <div>
        <div v-if="!isMobile">
            <AGnb />
        </div>
        <router-view />
        <div v-if="isMobile">
            <AGnb />
        </div>
    </div>
</template>

<script setup>
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

<style lang="scss" src="@@/app.scss" />