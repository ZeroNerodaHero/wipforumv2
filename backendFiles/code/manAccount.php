<?php
//assumes password and username are valid
//also assumes password is hashed
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
    if($res->num_rows != 0) return Array("code"=>0,"msg"=>"Username already exists. Please choose a different one. Maybe add 420 XD");

    $userId = (rand() << 32 | rand());
    myQuery("INSERT INTO userList(userId,userName,password)
                VALUES($userId,'$username','$password')");
    return Array("code"=>"1","msg"=>"Created user account","userId"=>$userId);
}
?>