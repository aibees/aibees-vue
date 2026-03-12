

import mariaApi from '@scripts/util/mariaApi.js';

const getResourceList = async (systemCd, codeType) => {
    const searchParam = {
        systemCd, codeType
    }
    const { data } = await mariaApi.get('/api/settings/headers/resources', { params: searchParam });
    return data.detailList; 
}

const getResourceItem = (depart, category, code, id) => {
    return null;
}

export { getResourceItem, getResourceList }