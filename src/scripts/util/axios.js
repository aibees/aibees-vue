import axios from 'axios';


const axiosGet = (url, callback) => {
    axios.get(url)
    .then((res) => {
        callback(res);
    })
    .catch(err => {
        console.log(err);
        alert(err);
    })
}

const axiosPost = (url, data, callback) => {
    axios.post(url, data, {

    })
    .then((res) => {
        callback(res);
    })
    .catch(err => {
        console.log(err);
        alert(err);
    })
}

const axiosPostForFile = (url, data, callback) => {
    axios.post(url, data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then((res) => {
        callback(res);
    })
    .catch(err => {
        console.log(err);
        alert(err);
    })
}

export { axiosPostForFile, axiosGet, axiosPost } 