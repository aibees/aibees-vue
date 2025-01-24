import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const userSession = defineStore('user', () => {
    const user = reactive({
        loginInfo: {
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
        user.accessTime = storageUser.accessTime;
    } 

    const getUserInfo = computed(() => user.loginInfo);

    const isUserSession = () => {
        const storage = JSON.parse(sessionStorage.getItem("user"));

        console.log("isUserSesion")
        console.log(user);

        return (typeof user.loginInfo.accessToken == 'undefined' || user.loginInfo.accessToken !== "")
            && user.accessTime !== null
            && (Number((new Date(user.accessTime)).getTime())) > (Number((new Date()).getTime()) - 21600000)
    };

    const loginUpdate = (info) => {
        user.loginInfo.accessToken = info.accessToken;
        user.loginInfo.name = info.name;
        user.loginInfo.admin = info.admin;
        user.roleList = info.roleList;
        user.accessTime = info.accessTime;

        const sessItem = {
            accessToken : info.accessToken,
            name : info.name,
            accessTime : info.accessTime
        }

        sessionStorage.setItem('user', JSON.stringify(sessItem));
    }

    const logoutUpdate = () => {
        user.loginInfo = {
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