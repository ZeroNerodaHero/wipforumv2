import axios from "axios"

function apiRequest(url,params="", body="", method="GET",hasImg=false) {
    url = "http://localhost:8080/";
    url = "http://172.16.182.98:8080/"
    url = "https://funcel.xyz/request"

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