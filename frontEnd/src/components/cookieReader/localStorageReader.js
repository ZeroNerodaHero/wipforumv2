function getLocalStorageItem(item,key=null){
    var storageItem = JSON.parse(localStorage.getItem("userSettings"))
    if(storageItem == null) storageItem = {}
    if(key == null) return storageItem;
    return storageItem[key];
}

export default getLocalStorageItem