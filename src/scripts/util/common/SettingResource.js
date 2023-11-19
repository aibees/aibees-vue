import { axiosPost } from '@/scripts/util/axios.js'

const url = aibeesGlobal.API_SERVER_URL + "/master/detail"

const getResourceList = (depart, category, title) => {
    const data = {
        'depart': depart,
        'category' : category,
        'title' : title
    }

    let result = {};

    $.ajax({
        'method': 'POST',
        'url' : url,
        'data': data,
        'async': false,
        'content-type': 'application/json',
        'dataType': 'json',
        'success': function(res) {
            result = res;
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