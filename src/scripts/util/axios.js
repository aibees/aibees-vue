import axios from 'axios';


const testFunc = (msg, callback) => {
    console.log("test : " + msg);
    callback(msg);
}

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

export { testFunc, axiosGet }