import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const userSession = defineStore('user', () => {
    const user = reactive({
        loginInfo: {
            uuid: "",
            accessToken: "",
            name: "",
            admin: false
        },
        roleList: [],
        accessTime: null
    });

    if (sessionStorage.getItem('user')) {
        const storageUser = JSON.parse(sessionStorage.getItem('user'));

        user.loginInfo.accessToken = storageUser.accessToken;
        user.loginInfo.uuid = storageUser.uuid;
        user.loginInfo.name = storageUser.name;
        user.accessTime = storageUser.accessTime;
    } 

    const getUserInfo = computed(() => user.loginInfo);

    const isUserSession = () => {
        return (typeof user.loginInfo.accessToken == 'undefined' || user.loginInfo.accessToken !== "")
            && user.accessTime !== null
            && (Number((new Date(user.accessTime)).getTime())) > (Number((new Date()).getTime()) - 21600000)
    };

    const loginUpdate = (info) => {
        user.loginInfo.uuid = info.uuid;
        user.loginInfo.accessToken = info.accessToken;
        user.loginInfo.name = info.name;
        user.loginInfo.admin = info.admin;
        user.roleList = info.roleList;
        user.accessTime = info.accessTime;

        const sessItem = {
            accessToken : info.accessToken,
            name : info.name,
            accessTime : info.accessTime,
            uuid: info.uuid
        }

        sessionStorage.setItem('user', JSON.stringify(sessItem));
    }

    const tokenUpdate = (token) => {
        sessionStorage.setItem('token', token);
    }

    const logoutUpdate = () => {
        user.loginInfo = {
            uuid: "",
            accessToken: "",
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