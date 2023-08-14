import axios from "axios"

function getRequest(params={}){
    var paramsStr = "";
    for (let val in params) {
        if(paramsStr != "") paramsStr += "&"
        paramsStr += val+"="+params[val]
    }
    return apiRequest(paramsStr,"","GET");
}
function postRequest(body="",hasImg=false){
    return apiRequest("",body,"POST",hasImg);
}

function apiRequest(params="", body="", method="GET",hasImg=false) {
    var url = "https://schizoi.cyou/request"
    url = "http://localhost:8070/";
    return new Promise((resolve, reject) => {
        axios({
            method: method,
            url: url + (params == ""?params:"?"+params),
            //url: url + params,
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

export {postRequest,getRequest}
export default apiRequest