function getLocalStorageItem(item,key=null){
    var storageItem = JSON.parse(localStorage.getItem("userSettings"))
    if(storageItem == null) storageItem = {}
    if(key == null) return storageItem;
    return storageItem[key];
}
function updateLocalStorage(key,item){
    var userSettings = getLocalStorageItem("userSettings")
    userSettings[key] = item;
    localStorage.setItem("userSettings",JSON.stringify(userSettings))
}
export {updateLocalStorage}
export default getLocalStorageItem