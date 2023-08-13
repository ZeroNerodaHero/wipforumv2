<?php
function hasUserAccount($username, $password){
    $res =myQuery("SELECT userId FROM userList WHERE userName='$username' and password='$password'");
    if($res->num_rows == 0) return null;
    $userId = ($res->fetch_assoc())["userId"];

    $authKey = rand();
    myQuery("UPDATE userList
            SET authKey = $authKey
            WHERE userId=$userId");
    updateUserIp("userId",$userId);

    return userIsAuthed($userId,$authKey);
}
function createUserAccount($username,$password){
    $res = myQuery("SELECT userName FROM userList WHERE userName='$username'");
    if($res->num_rows != 0) return 0;

    $userId = (rand() << 32 | rand());
    myQuery("INSERT INTO userList(userId,userName,password)
                VALUES($userId,'$username','$password')");
    return 1;
}
?>