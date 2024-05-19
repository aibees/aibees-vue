import { axiosPost } from '@/scripts/util/axios.js'

const url = aibeesGlobal.API_SERVER_URL + "/master/detail"

const getResourceList = (depart, category, title) => {
    const data = {
        'mainCategory': depart,
        'subCategory' : category,
        'hCode' : title
    }

    let result = [];

    $.ajax({
        'method': 'POST',
        'url' : url,
        'data': JSON.stringify(data),
        'async': false,
        'headers' : {
            'content-type': 'application/json'
        },
        'dataType': 'json',
        'success': function(res) {
            result = res.data;
        },
        'failed': function(err) {
            alert(err);
            return null;
        }
    })

    return result;
}

const getResourceItem = (depart, category, code, id) => {
    return null;
}

export { getResourceItem, getResourceList }