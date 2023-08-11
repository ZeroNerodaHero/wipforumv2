import getLocalStorageItem from "../cookieReader/localStorageReader"

function preLoadSettings(){
    if(getLocalStorageItem("userSettings","threadSize") != undefined){
        var preLoadThreadSize = getLocalStorageItem("userSettings","threadSize")
        document.getElementById("root").style.setProperty("--thumbPerRow",preLoadThreadSize)
    }
}
export default preLoadSettings