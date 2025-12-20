<template>
    <div class="with-lnb system">
        <ALnb
            :title="route.meta.title"
            :menu="menuList"
        />
        <div class="contents system-view">
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
                'name': '홈',
                'linkTo': 'System-main'
            }
            ,
            {
                'name': '계정과목 설정',
                'linkTo': 'System-acctCd'
            }
            ,
            {
                'name': '출처범주 설정',
                'linkTo': 'System-source'
            }
            ,
            {
                'name': '프리셋 설정',
                'linkTo': 'System-preset'
            }
            ,
            {
                'name': '프리셋 매핑 설정',
                'linkTo': 'System-preset-mapping'
            }
        ]
    };
    
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