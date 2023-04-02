//code is stolen from indian people

function SetCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function GetCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return null;
}
function ClearCookies(){
    var Cookies = document.cookie.split(';');
    for (var i = 0; i < Cookies.length; i++) {
    document.cookie = Cookies[i] + "=; expires="+ new Date(0).toUTCString();
    }
}

export default SetCookie
export {GetCookie,ClearCookies}