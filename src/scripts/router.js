import { createWebHistory, createRouter } from 'vue-router'
import Login from '@/components/login/Login.vue'
import Account from '@/components/Account'
import Aibees from '@/components/aibees'
import Master from '@/components/master/Master.vue'
import NotFound from '@/components/except/NotFound.vue'
import NAVERLogin from '@/components/login/NaverLogin.vue'

const routes=[
    {
        path: "/:catchAll(.*)",
        name: "NotFound",
        component: NotFound
    },
    {
        path: "/",
        name: "AibeesHome",
        component: Aibees.AibeesHome,
        meta: { 
            auth: true,
            title: 'MARIA'
        }
    },
    {
        path: "/home",
        name: "AibeesHome",
        component: Aibees.AibeesHome,
        meta: { 
            auth: true,
            title: 'MARIA'
        }
    },
    {
        path: "/account",
        name: "Account",
        component: Account.AccountHome,
        children: [
            {
                path: "",
                name: "AccountHome",
                component: Account.AccountMain
            },
            {
                path: 'journal',
                name: "Journal-Home",
                component: Account.JournalView,
                children: [
                    {
                        path: '',
                        name: 'Journal-main',
                        component: Account.JournalMain
                    }
                ]
            },
            {
                path: 'card',
                name: "Card-Home",
                component: Account.CardView,
                children: [
                    {
                        path: '',
                        name: 'Card-main',
                        component: Account.CardMain
                    },
                    {
                        path: 'list',
                        name: "Card-list",
                        component: Account.CardList
                    },
                    {
                        path: 'excel',
                        name: "Card-excel",
                        component: Account.CardUpload
                    },
                    {
                        path: 'statics1',
                        name: "Card-statistics-doughnut",
                        component: Account.CardStaticsDoughnutByUsage
                    },
                    {
                        path: 'statics2',
                        name: "Card-statistics-line-amount",
                        component: Account.CardStaticsLineWithAmount
                    },
                    {
                        path: 'info',
                        name: "Card-info",
                        component: Account.CardInfo
                    }
                ]
            },
            {
                path: 'bank',
                name: 'Bank-Home',
                component: Account.BankView,
                children: [
                    {
                        path: '',
                        name: 'Bank-main',
                        component: Account.BankMain
                    },
                    {
                        path: 'excel',
                        name: 'Bank-excel',
                        component: Account.BankUpload
                    },
                    {
                        path: 'closing',
                        name: 'Bank-closing',
                        component: Account.BankClose
                    },
                    {
                        path: 'info',
                        name: 'Bank-info',
                        component: Account.BankInfo
                    },
                    {
                        path: 'statistics',
                        name: 'Bank-statistics',
                        component: Account.BankClose
                    },
                    {
                        path: 'info',
                        name: "Bank-info",
                        component: Account.BankInfo
                    }
                ]
            }
        ]
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
        path: "/master",
        name: "Master",
        component: Master
    },
    {
        path: "/oauth",
        name: "naverLogin",
        component: NAVERLogin
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