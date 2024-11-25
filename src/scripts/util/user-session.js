import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const userSession = defineStore('user', () => {
    const user = reactive({
        loginInfo: {
            email: "",
            name: "",
            admin: false
        },
        roleList: [],
        accessTime: null
    });

    if (localStorage.getItem('user')) {
        const storageUser = JSON.parse(localStorage.getItem('user'));
        user.loginInfo = storageUser.loginInfo;
        user.roleList = storageUser.roleList;
        user.accessTime = storageUser.accessTime;
    }

    const getUserInfo = computed(() => user.loginInfo);

    const isUserSession = () => {
        return user.loginInfo.email !== "" 
            && user.accessTime !== null
            && (Number((new Date(user.accessTime)).getTime())) > (Number((new Date()).getTime()) - 21600000)};

    const loginUpdate = (info) => {
        user.loginInfo = info.loginInfo;
        user.roleList = info.roleList;
        user.accessTime = new Date();

        localStorage.setItem('user', JSON.stringify(user));
    }

    const logoutUpdate = () => {
        user.loginInfo = {
            email: "",
            name: "",
            admin: false
        },
        user.roleList = [];
        user.accessTime = null;
    }

    return {
        getUserInfo,
        isUserSession, loginUpdate, logoutUpdate
    }
})