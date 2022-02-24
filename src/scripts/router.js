import { createWebHistory, createRouter } from 'vue-router'
import Home from '@/components/Home.vue'
import Stores from '@/components/stores'
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
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes
})
