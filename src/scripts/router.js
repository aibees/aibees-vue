import { createWebHistory, createRouter } from 'vue-router'
import Home from '@/components/Home.vue'
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
        ]
    },
    {
        path: '/cafe',
        name: 'CafeHome',
        component: Cafes.CafeHome
    },
    {
        path: "/aibees",
        name: "Aibees",
        component: Aibees.AibeesHome
    }
]

export const setRouterToApp = () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    })

    router.beforeEach((to, from, next) => {
        console.log("router:before each : " + to.fullPath)
        next()
    })

    router.afterEach((to, from) => {
        console.log("router::after each : " + to)
    })
    return router
}