import { createWebHistory, createRouter } from 'vue-router';
import Login from '@/components/login/Login.vue';
import Home from '@/components/Home.vue';
import Account from '@/components/account';
import Menu from '@/components/common/Menu.vue';
import Chart from '@/components/chart';
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
        path: '/menu',
        name: 'Menu',
        component: Menu
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
                    title: '엑셀 일괄 입력'
                }
            }
            ,
            {
                path: 'search',
                name: 'Account-search',
                component: Account.AccountSearch,
                meta: {
                    title: '상세내역 보고서'
                }
            },
            {
                path: 'closing',
                name: 'Account-confirm',
                component: Account.AccountConfirm,
                meta: {
                    title: '월별 마감'
                }
            },
            {
                path: 'closing',
                name: 'Account-closing',
                component: Account.AccountClosing,
                meta: {
                    title: '월별 마감 입력'
                }
            },
            {
                path: 'cashflow',
                name: 'Account-cashflow',
                component: Account.AccountCashflow,
                meta: {
                    title: '통장내역 보고서'
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
                path: 'fixed-monthly',
                name: 'Account-fixed-monthly',
                component: Account.AccountFixedMonthly,
                meta: {
                    title: '고정비 관리'
                }
            },
            {
                path: 'info',
                name: 'Account-info',
                component: Account.AccountInfo,
                meta: {
                    title: '계좌/카드 관리'
                }
            },
            {
                path: 'apply',
                name: 'Account-apply',
                component: Account.AccountApply,
                meta: {
                    title: '신용카드 사용내역 확인'
                }
            },
            {
                path: 'invoice',
                name: 'Account-invoice',
                component: Account.AccountInvoice,
                meta: {
                    title: '영수증 첨부 입력'
                }
            }
        ]
    },
    {
        path: '/chart',
        name: 'Chart-Home',
        component: Chart.ChartView,
        meta: {
            title: '가계부 통계차트'
        },
        children: [
            {
                path: 'expense',
                name: 'Chart-expense',
                component: Chart.ChartExpense
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
                props: (route) => ({ presetCd: route.query.presetCd }),
                meta: {
                    title: '프리셋 매핑 설정'
                }
            },
            {
                path: 'setting',
                name: 'System-setting',
                component: System.SystemSetting,
                meta: {
                    title: '공통코드 관리'
                }
            },
            {
                path: 'user',
                name: 'System-user',
                component: System.SystemUser,
                meta: {
                    title: '공통코드 관리'
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
        if (to.fullPath == '/login') {
            next();
        } else if (to.fullPath !== '/login' && !session.isUserSession()) {
            return next({ path: '/login' });
        }
        next();
    })

    router.afterEach((to, from) => {
        document.title = to.meta.title === undefined ? 'Aibees-Page' : to.meta.title;
    })
    return router
}