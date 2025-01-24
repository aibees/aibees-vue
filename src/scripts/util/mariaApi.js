/**
 * 공통 - 서버와의 통신 utility
 */
import axios from 'axios';

const mariaApi = axios.create({
    timeout: 50000,
    baseURL: aibeesGlobal.API_SERVER_URL
});

// interceptors
mariaApi.interceptors.request.use(
    (config) => {
        config.headers['servicekey'] = aibeesGlobal.SERVICE_KEY;
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
            alert('처리 완료');
        }
        return resp.data;
    },
    (error) => {
        console.log(error)
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