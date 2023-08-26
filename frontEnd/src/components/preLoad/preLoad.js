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
export default preLoadSettings