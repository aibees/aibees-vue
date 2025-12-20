import { createWebHistory, createRouter } from 'vue-router';
import Login from '@/components/login/Login.vue';
import Home from '@/components/Home.vue';
import Account from '@/components/account';
import System from '@/components/system';
import NotFound from '@/components/except/NotFound.vue';
import NAVERLogin from '@/components/login/NaverLogin.vue';

import { userSession } from './util/user-session';

const routes=[
    {
        path: "/:catchAll(.*)",
        name: "NotFound",
        component: NotFound
    },
    {
        path: '/',
        name: 'root',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Dashboard',
        component: Home
    },
    {
        path: "/account",
        name: "Account",
        component: Account.AccountView,
        meta: {
            title: '가계부'
        },
        children: [
            {
                path: '',
                name: 'Account-entry',
                component: Account.AccountEntry,
                meta: {
                    title: '가계부 입력'
                }
            },
            {
                path: 'bulk',
                name: 'Account-upload',
                component: Account.AccountUpload,
                meta: {
                    title: '가계부 일괄 업로드'
                }
            }
            ,
            {
                path: 'search',
                name: 'Account-search',
                component: Account.AccountSearch,
                meta: {
                    title: '가계부 조회'
                }
            },
            {
                path: 'cashflow',
                name: 'Account-cashflow',
                component: Account.AccountCashflow,
                meta: {
                    title: '월별 현금흐름표'
                }
            },
            {
                path: 'fixed',
                name: 'Account-fixed',
                component: Account.AccountFixed,
                meta: {
                    title: '고정비 관리'
                }
            },
            {
                path: 'info',
                name: 'Account-info',
                component: Account.AccountInfo,
                meta: {
                    title: '계좌/카드 정보'
                }
            },
            {
                path: 'prepaid',
                name: 'Account-prepaid',
                component: Account.AccountPrepaid,
                meta: {
                    title: '선급비용 관리'
                }
            }
        ]
    },
    {
        path: '/system',
        name: 'System-Home',
        component: System.SystemView,
        meta: {
            title: '시스템 설정'
        },
        children: [
            {
                path: '',
                name: 'System-main',
                component: System.SystemMain,
                meta: {
                    title: '시스템 설정'
                }
            },
            {
                path: 'acctcd',
                name: 'System-acctCd',
                component: System.SystemAcctCd,
                meta: {
                    title: '계정과목 설정'
                }
            },
            {
                path: 'source',
                name: 'System-source',
                component: System.SystemSource,
                meta: {
                    title: '출처범주 설정'
                }
            },
            {
                path: 'preset',
                name: 'System-preset',
                component: System.SystemPreset,
                meta: {
                    title: '프리셋 설정'
                }
            },
            {
                path: 'preset-mapping',
                name: 'System-preset-mapping',
                component: System.SystemPresetMap,
                meta: {
                    title: '프리셋 매핑 설정'
                }
            }
        ]
    }
    , {
        path: "/oauth",
        name: "naverLogin",
        component: NAVERLogin
    }
    , {
        path: "/login",
        name: "Login",
        component: Login
    }
]


export const setRouterToApp = () => {
    const session = userSession();

    const router = createRouter({
        history: createWebHistory(),
        routes
    })

    router.beforeEach((to, from, next) => {
        next();
        // if (to.fullPath == '/login') {
        //     next();
        // } else if (to.fullPath !== '/login' && !session.isUserSession()) {
        //     return next({ path: '/login' });
        // } else {
        //     next();
        // }
    })

    router.afterEach((to, from) => {
        document.title = to.meta.title === undefined ? 'Aibees-Page' : to.meta.title;
    })
    return router
}