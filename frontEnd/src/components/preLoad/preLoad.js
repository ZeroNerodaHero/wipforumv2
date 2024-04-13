import getLocalStorageItem from "../cookieReader/localStorageReader"

function preLoadSettings(){
    var preLoad = getLocalStorageItem("userSettings")
    var rootEleStyle = document.documentElement.style
    if(preLoad["threadSize"] != undefined){
        rootEleStyle.setProperty("--thumbPerRow",preLoad["threadSize"])
    }
    if(preLoad["fontSize"] != undefined){
        rootEleStyle.setProperty("font-size",preLoad["fontSize"]+"px")
    } 
    if(preLoad["colors"] != undefined){
        for (const key of Object.keys(preLoad["colors"])) {
            const color = preLoad["colors"][key];
            rootEleStyle.setProperty("--"+key,color)
        }
    }
}

function preLoadGetRequest(){
    const currentURL = window.location.href;
    var params = getPageParams(currentURL)

    /*
    setGETBoard(params["board"] !== undefined ? params["board"] : "")
    setGETThread(params["thread"] !== undefined? params["thread"] : "")
    setGETThreadTitle(params["title"] !== undefined ? params["title"] : "")
    */
    return (params)
}
function updatePageParams(keyValueObject){
    const currentURL = window.location.href;
    var newURL = window.location.href;
    var params = getPageParams(currentURL)
    if(Object.keys(params).length == 0) newURL += "?"
    
    for (const key of Object.keys(keyValueObject)) {
        if(params[key] !== undefined){
            const replaceStr = key + "=" + params[key]
            newURL = newURL.replace(replaceStr,key+"="+stringValNormalizer(keyValueObject[key]))
        } else{
            if(Object.keys(params).length > 0) newURL += "&"
            newURL += key+"="+stringValNormalizer(keyValueObject[key])
        }
    }

    if(currentURL !== newURL) window.history.pushState({}, '', newURL);
}
function clearPageParams(keyArray){
    var currentURL = window.location.href;
    var params = getPageParams(currentURL)
    for(const key of keyArray){
        if(params[key] !== undefined){
            //in efficient. there is a better way but im kinda lazy. refactor for later
            const replaceStrAnd = "&"+key + "=" + stringValNormalizer(params[key])
            currentURL = currentURL.replace(replaceStrAnd,"")
            const replaceStr = key + "=" + stringValNormalizer(params[key])
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
        const paramValue = decodeURIComponent(match[2].trim()).replaceAll("_"," ");
        params[paramName] = paramValue;
    }
    //console.log("params are ", params)
    return params;
}
function stringValNormalizer(str){
    //return encodeURIComponent(str);
    return encodeURIComponent(str.replaceAll(" ","_"));
}
export {preLoadGetRequest,updatePageParams,clearPageParams}
export default preLoadSettings