import getLocalStorageItem from "../cookieReader/localStorageReader"

function preLoadSettings(){
    var preLoad = getLocalStorageItem("userSettings")
    var rootEleStyle = document.getElementById("root").style
    if(preLoad["threadSize"] != undefined){
        rootEleStyle.setProperty("--thumbPerRow",preLoad["threadSize"])
    }
    if(preLoad["colors"] != undefined){
        for (const key of Object.keys(preLoad["colors"])) {
            const color = preLoad["colors"][key];
            rootEleStyle.setProperty("--"+key,color)
        }
    }
}

function preLoadGetRequest(setGETBoard,setGETThread,setGETThreadTitle){
    const currentURL = window.location.href;
    var params = getPageParams(currentURL)

    if(params["board"] !== undefined){
        setGETBoard(params["board"])
    } else{
        setGETBoard("")
    }
    if(params["thread"] !== undefined){
        setGETThread(params["thread"])
    } else{
        setGETThread("")
    }
    if(params["title"] !== undefined){
        setGETThreadTitle(params["title"])
    }else{
        setGETThreadTitle("")
    }
    console.log(params)
}
function updatePageParams(keyValueObject){
    var currentURL = window.location.href;
    var params = getPageParams(currentURL)
    
    for (const key of Object.keys(keyValueObject)) {
        if(params[key] !== undefined){
            const replaceStr = key + "=" + encodeURIComponent(params[key])
            currentURL = currentURL.replace(replaceStr,key+"="+encodeURIComponent(keyValueObject[key]))
        } else{
            if(Object.keys(params).length > 0) currentURL += "&"
            currentURL += key+"="+keyValueObject[key]
        }
    }
    //console.log(currentURL)
    window.history.pushState({}, '', currentURL);
}
function clearPageParams(keyArray){
    var currentURL = window.location.href;
    var params = getPageParams(currentURL)
    for(const key of keyArray){
        if(params[key] !== undefined){
            //in efficient. there is a better way but im kinda lazy. refactor for later
            const replaceStrAnd = "&"+key + "=" + encodeURIComponent(params[key])
            currentURL = currentURL.replace(replaceStrAnd,"")
            const replaceStr = key + "=" + encodeURIComponent(params[key])
            currentURL = currentURL.replace(replaceStr,"")
        }
    }
    //console.log(currentURL)
    window.history.pushState({}, '', currentURL);
}
function getPageParams(url){
    const regex = /[?&]([^=#]+)=([^&#]*)/g;
    let match;
    
    var params = {};
    while ((match = regex.exec(url))) {
        const paramName = decodeURIComponent(match[1]);
        const paramValue = decodeURIComponent(match[2]);
        params[paramName] = paramValue;
    }
    return params
}
export {preLoadGetRequest,updatePageParams,clearPageParams}
export default preLoadSettings