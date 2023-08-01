<?php 
//this function doubles as a long. and a perm checker
function userIsAuthed($userId,$authKey,$permLevel=0){
    global $conn;
    $que = "SELECT * FROM userList WHERE userId=$userId and authKey=$authKey and accountPerm >= $permLevel";
    $res = $conn->query($que); 
    if($res->num_rows == 0) return null;
    updateUserIp("userId",$userId); 
    $ret = $res->fetch_assoc();

    unset($ret["password"]);
    return $ret;
}

//ip stuff
function getIpAddrHash(){
    $ipAddrHash = hash('sha256',getUserIP());
    return $ipAddrHash;
}

function getUserIP(){
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote  = $_SERVER['REMOTE_ADDR'];

    //make sure to do proxy_set_header X-Forwarded-For $remote_addr in nginx
    if(!empty($forward))
    {
        $ip = explode(",",$forward)[0];
    }
    else
    {
        $ip = $remote;
    }

    return $ip;
}
function updateUserIp($param,$param_value){
    global $conn;
    $que = "UPDATE userList
            SET last_hashedLoginIp='".getIpAddrHash()."'
            WHERE $param='$param_value'";
    $conn->query($que);
}

function userIsBanned($hash_ip){
    global $conn;
    $que = "SELECT hashed_ip FROM bannedIps WHERE hashed_ip='$hash_ip'";
    $res = $conn->query($que);

    if($res->num_rows != 0) return true;
    return false;
}

function bannedUserInfo($hash_ip){
    global $conn;
    $que = "SELECT * FROM bannedIps WHERE hashed_ip='$hash_ip'";
    $res = $conn->query($que);

    if($res->num_rows != 0) return $res->fetch_assoc();
}

?>
