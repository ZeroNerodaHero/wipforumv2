<?php
function hasUserAccount($username, $password){
    global $conn;
    $que = "SELECT userId FROM userList WHERE userName='$username' and password='$password'";
    $res = $conn->query($que);
    if($res->num_rows == 0) return null;
    $userId = ($res->fetch_assoc())["userId"];
    $authKey = rand();
    $que = "UPDATE userList
            SET authKey = $authKey
            WHERE userId=$userId";
    $conn->query($que);  
    updateUserIp("userId",$userId);

    return userIsAuthed($userId,$authKey);
}
function createUserAccount($username,$password){
    global $conn;
    $que = "SELECT userName FROM userList WHERE userName='$username'";
    $res = $conn->query($que);
    if($res->num_rows != 0) return 0;
    $userId = (rand() << 32 | rand());
    $que = "INSERT INTO userList(userId,userName,password)
                VALUES($userId,'$username','$password')";
    $conn->query($que);
    return 1;
}

?>