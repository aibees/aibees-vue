

import mariaApi from '@scripts/util/mariaApi.js';

const getResourceList = async (systemCd, codeType) => {
    const searchParam = {
        systemCd, codeType
    }
    const { data } = await mariaApi.get('/api/settings/headers/resources', { params: searchParam });
    return data.detailList; 
}

const getResourceItem = async (systemCd, codeType, code) => {
    const searchParam = {
        systemCd, codeType, code
    }
    const { data } = await mariaApi.get('/api/settings/details/resource-item', { params: searchParam });
    return data.detailList; 
}

export { getResourceItem, getResourceList }