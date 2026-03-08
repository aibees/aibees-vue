/**
 * 공통 - 서버와의 통신 utility
 */
import axios from 'axios';
import { MariaConfirm } from './mariaConfirm.js';
import { userSession } from './user-session.js';
import MariaToast from './mariaToast.js';

const mariaApi = axios.create({
    timeout: 50000,
    baseURL: aibeesGlobal.API_SERVER_URL
});

const exceptUrl = ['/login']

// interceptors
mariaApi.interceptors.request.use(
    async (config) => {
        const url = config.url;
        const method = config.method?.toLowerCase();

        if (!exceptUrl.includes(url) && ['post', 'put', 'delete'].includes(method) && !config.skipConfirm) {
            let confirmMsg = '진행';

            if (method === 'delete') { confirmMsg = '삭제'; }
            else if (method === 'post') { confirmMsg = '등록'; }
            else if (method === 'put') { confirmMsg = '수정'; }

            // Confirm 창을 띄우고 사용자의 응답을 기다림
            const isConfirmed = await MariaConfirm(confirmMsg + "하시겠습니까?");

            // 취소 버튼을 눌렀다면, Axios 자체 기능을 이용해 요청을 강제 취소
            if (!isConfirmed) {
                throw new axios.Cancel('사용자가 작업을 취소했습니다.');
            }
        }

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
        // get 방식이 아니고 성공 메세지가 있다면 Toast 띄우기
        if (resp.config.method !== 'get' && resp.data.success) {
            // 서버에서 내려온 success 메시지 혹은 기본 메시지
            MariaToast.success(resp.data.success || '정상적으로 처리되었습니다.');
        }
        return resp.data;
    },
    (error) => {
        console.log("axios error...");
        console.log(error);

        // 사용자가 Confirm 창에서 취소하여 발생한 Cancel 에러는 무시
        if (axios.isCancel(error)) {
            console.log('Request canceled by user');
            return Promise.reject(error);
        }

        // 서버에서 넘어온 에러 메시지를 alert 대신 error toast로 띄움
        if (error.response?.data?.error) {
            MariaToast.error(error.response.data.error.message || '오류가 발생했습니다.');
        } else {
            MariaToast.error('서버와의 통신에 실패했습니다.');
        }

        return Promise.reject(error.response?.data || error);
    }
)

// showMessage
export const successMsg = (msg) => {
    MariaToast.success(typeof msg === 'string' ? msg : JSON.stringify(msg));
};

export const errorMsg = (msg) => {
    MariaToast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
};

export default mariaApi;
