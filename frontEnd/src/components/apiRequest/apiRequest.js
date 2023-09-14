import axios from "axios"
import {GetCookie} from "../cookieReader/cookieReader"

function getRequest(params={}){
    var paramsStr = "";
    for (let val in params) {
        if(paramsStr != "") paramsStr += "&"
        paramsStr += val+"="+params[val]
    }
    return apiRequest(paramsStr,"","GET");
}
function postRequest(body="",authUser=false,hasImg=false){
    return apiRequest("",body,"POST",hasImg,authUser);
}

function apiRequest(params="", body="", method="GET",hasImg=false,authUser=false) {
    var url = "https://schizoi.cyou/request"
    url = "http://localhost:8070/";

    if(authUser === true){
        var userId = GetCookie("userId"), authKey = GetCookie("authKey")
        body["userId"] = userId != null ? userId : Math.floor(Math.random()*1000000000)
        body["authKey"] = authKey != null ? authKey : -1
    }
    
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