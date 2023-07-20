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
    $client  = @$_SERVER['HTTP_CLIENT_IP'];
    $forward = @$_SERVER['HTTP_X_FORWARDED_FOR'];
    $remote  = $_SERVER['REMOTE_ADDR'];

    if(filter_var($client, FILTER_VALIDATE_IP))
    {
        $ip = $client;
    }
    elseif(filter_var($forward, FILTER_VALIDATE_IP))
    {
        $ip = $forward;
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
?>