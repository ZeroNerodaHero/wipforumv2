import axios from "axios"

function apiRequest(url,params="", body="", method="GET",hasImg=false) {
    url = "http://172.17.0.1:8080/"
    url = "https://schizoi.cyou/request"
    url = "http://localhost:8070/";

    return new Promise((resolve, reject) => {
        axios({
            method: method,
            //url: url + (params == ""?params:"?"+params),
            url: url + params,
            //data: JSON.stringify(body),
            headers: !hasImg? {'X-Requested-With': 'XMLHttpRequest'}:{'Content-Type': 'multipart/form-data'},
            data: body,
            responseType: "json",
            proxy: false
        }).then((res) => {
            return resolve(res.data);
        }).catch(((err) => {
            return reject(err);
        }));
    });
}

export default apiRequest