import { createWebHistory, createRouter } from 'vue-router'
import Home from '@/components/Home.vue'
import Login from '@/components/Login.vue'
import Stores from '@/components/stores'
import Cafes from '@/components/cafes'
import Aibees from '@/components/aibees'
import NotFound from '@/components/except/NotFound.vue'

const routes=[
    {
        path: "/:catchAll(.*)",
        name: "NotFound",
        component: NotFound
    },
    {
        path: "/",
        name: "Home",
        component: Home
    },
    {
        path: '/store',
        name: 'StoreHome',
        component: Stores.StoreView,
        children: [
            {
                path: '',
                component: Stores.StoreHome
            },
            {
                path: 'login',
                component: Stores.StoreLogin
            }
        ],
        meta: { auth: true }
    },
    {
        path: '/cafe',
        name: 'CafeHome',
        component: Cafes.CafeHome,
        meta: { auth: true }
    },
    {
        path: "/aibees",
        name: "Aibees",
        component: Aibees.AibeesHome,
        meta: { 
            auth: true,
            title: 'MARIA'
        }
    },
    {
        path: "/login",
        name: "Login",
        component: Login
    }
]

export const setRouterToApp = () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    })

    router.beforeEach((to, from, next) => {
        // if(to.matched.some(r => r.)) {
        //     alert("로그인이 필요한 페이지입니다.");
        //     next('/login');
        // } else {
            next();
        // }
    })

    router.afterEach((to, from) => {
        document.title = to.meta.title === undefined ? 'Aibees-Page' : to.meta.title;
    })
    return router
}