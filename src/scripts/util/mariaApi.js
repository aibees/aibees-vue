/**
 * 공통 - 서버와의 통신 utility
 */
import axios from 'axios';
import MariaToast from '../util/common/MariaToast'
import { userSession } from '../util/user-session'

const mariaApi = axios.create({
    timeout: 50000,
    baseURL: aibeesGlobal.API_SERVER_URL
});

// interceptors
mariaApi.interceptors.request.use(
    (config) => {
        config.headers['Authorization'] = userSession().getUserInfo.accessToken;
        config.headers['AuthorId'] = userSession().getUserInfo.uuid;
        config.headers['Content-Type'] = 'application/json';
        return config;
    },
    (error) => {
        console.log(error);
        return Promise.reject(error);
    }
)

mariaApi.interceptors.response.use(
    (resp) => {
        if (resp.config.method != 'get' && resp.data.success) {
            MariaToast.success(resp.data.success);
        }
        return resp.data;
    },
    (error) => {
        console.log(error)
        if (error.response.data.error != null)
            alert(error.response.data.error.message);
        return Promise.reject(error.response.data);
    }
)

// showMessage
const successMsg = (msg) => {
    showMsg("success", msg);
}

const errorMsg = (msg) => {
    showMsg("error", msg);
}

const showMsg = (type, msg) => {
    if (!msg) {
        return;
    }

    if (typeof msg != 'string') {
        msg = JSON.stringify(msg);
    }


}

export default mariaApi;
