<template>
    <div id="footer" class="container">
        <nav class="footer-nav">
            <div class="logo" v-if="!isMobile">
                <img src="https://static.aibeesworld.com/static/img/logo_image.png" />
            </div>
            <ul class="footer-nav-list">
                <li class="footer-nav-item" v-for="(nv, idx) in navItem" :key="idx" >
                    <RouterLink :to="nv.linkTo" class="footer-nav-link" :aria-label="nv.label" v-slot="{ isActive }">
                        <div class="footer-nav-link" :class="{ 'is-active': isActive }">
                            <div v-if="isMobile">
                                <font-awesome-icons class="footer-nav-icon" :icon="['fa-solid', nv.icon]" :class="{ 'is-active': isActive }"  aria-hidden="true" />
                            </div>
                            <div v-else>
                                <div>{{ nv.label }}</div>
                            </div>
                        </div>
                    </RouterLink>
                </li>
            </ul>
            <div class="user" v-if="!isMobile">
                <div v-if="userSession().isUserSession()" class="user-logined">
                    {{ userInfo.name }} 님&nbsp;&nbsp;&nbsp;<span @click="logout"><font-awesome-icons id="glass" :icon="['fa-solid', 'fa-right-from-bracket']" /></span>
                </div>
                <div v-else @click="goToLogin">
                    LOGIN
                </div>
            </div>
        </nav>
    </div>
</template>

<script setup>
    import { userSession } from '@scripts/util/user-session.js';
    const router = useRouter();
    const session = userSession();
    const userInfo = session.getUserInfo;
    const navItem = reactive([
        {
            linkTo: '/home',
            icon: 'fa-home',
            label: '홈'
        },
        {
            linkTo: '/account',
            icon: 'fa-book',
            label: '가계부 입력관리'
        },
        {
            linkTo: '/chart',
            icon: 'fa-book',
            label: '가계부 통계'
        },
        {
            linkTo: '/system',
            icon: 'fa-gear',
            label: '설정'
        }
    ]);

    const goToLogin = () => {
        router.push({ path: '/login' })
    }

    const logout = () => {
        session.logoutUpdate();
        goToLogin();
    }

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

<style lang="scss" src="@@/common/footer.scss" scoped />