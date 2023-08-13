<?php

function threadIsLocked($threadId,$permLevel){
    $res = myQuery("SELECT threadId FROM threadList 
            WHERE threadId=$threadId AND permLevel <= $permLevel");
    return $res->num_rows == 0;
}
//what is the difference between messageOwner and userreference?
function addMessage($threadReference,$messageContent,$messageOwner,$userReference=-1){
    global $conn;

    $imageLink = "";
    if(!empty($_FILES["messageImage"])){
        $imageErrorType = verifyImg("messageImage");
        if($imageErrorType== 1){
            $imageLink = uploadImg("messageImage");
        } else{
            return generateImageError($imageErrorType);
        }
    } 

    //this is used to randomize the user id in everys tring. purpose of 191? prime does something? no? dunno
    //i have no idea what this randomization will cause but...
    srand($messageOwner % ($threadReference*$threadReference* 7919));
    $messageOwner = rand();

    $messageContent = yeetBadWords($messageContent);
    $que = "UPDATE threadList 
    SET threadSize=threadSize+1
    WHERE threadId=" . $threadReference;
    $conn->query($que);

    $messageContent = addslashes($messageContent);
    $hashed_ip = getIpAddrHash();
    $que = "INSERT INTO messageList(threadReference,messageContent,messageOwner,userReference,imageLinks, hashed_ip)
            VALUES($threadReference,'$messageContent',$messageOwner,$userReference,".
                (empty($imageLink) ? 'null':"'$imageLink'").",'".$hashed_ip."')";
    $conn->query($que);
    updatePostCooldown($hashed_ip,$userReference);
    updateUserExp($userReference);
    
    return Array("code"=>1,"newMessageId"=>$conn->insert_id);
}
function addThread($currentBoard,$threadTitle,$newMessageContent,$messageOwner,$loggedIn){
    global $conn;
    $imageErrorType = verifyImg("messageImage");
    if($imageErrorType < 0) return generateImageError($imageErrorType);

    $threadTitle = yeetBadWords($threadTitle);
    $threadTitle = addslashes($threadTitle);
    $que = "INSERT INTO threadList(boardReference,threadTitle,threadOP)
            VALUES('$currentBoard','$threadTitle',$messageOwner)";
    $conn->query($que);
    $threadId = $conn->insert_id;
    $msgLink = addMessage($threadId, $newMessageContent, $messageOwner, ($loggedIn ? $messageOwner : -1))["newMessageId"];
    $que = "UPDATE threadList
            SET firstPostLink=".$msgLink."
            WHERE threadId=".$threadId;
    $conn->query($que);
    
    maintainBoardSize($currentBoard);
    

    return array("newThreadId"=>$threadId);
}

function hasPostCooldown($hash_ip){
    $res = myQuery("SELECT expireTime FROM cooldownPostTimer
            WHERE hashed_ip='$hash_ip'");
    if(empty($res) || $res->num_rows == 0) return -1;
    return (new DateTime($res->fetch_assoc()["expireTime"]) > new DateTime()) ? 1 : 0;
}
function updatePostCooldown($hash_ip,$userId){
    //default cooldown = 120
    $expireSeconds = 120;
    $res = myQuery("SELECT userExp FROM userList WHERE userId=$userId");
    if(!empty($res) && $res->num_rows > 0){
        $expireSeconds = max(10,$expireSeconds - ($res->fetch_assoc()["userExp"]));
    }
    $expireTime = "DATE_ADD(NOW(),INTERVAL $expireSeconds SECOND)";
    if(hasPostCooldown($hash_ip) == -1){
        myQuery("INSERT INTO cooldownPostTimer(hashed_ip,expireTime)
                VALUES('$hash_ip',$expireTime)");
    } else{
        myQuery("UPDATE cooldownPostTimer
            SET expireTime=$expireTime
            WHERE hashed_ip='$hash_ip'");
    }

}
function updateUserExp($userId){
    $res = myQuery("SELECT userId FROM userList WHERE userId=$userId");
    if(!empty($res) && $res->num_rows > 0){
        myQuery("UPDATE userList SET userExp=userExp+1 WHERE userId=$userId");
    }
}

function generateImageError($imageErrorType){
    if ($imageErrorType == -1){
        return Array("code"=>0,"msg"=>"Uploaded media is the wrong type");
    }
    if ($imageErrorType == -2){
        return Array("code"=>0,"msg"=>"Uploaded media is the too big");
    }
    return "";
}

//returns either the link or null
function uploadImg($fileName){ 
    global $post_image_dir,$host_computer_loc;
    $imageFileType = strtolower(pathinfo(basename($_FILES[$fileName]["name"]),PATHINFO_EXTENSION));
    srand(time());
    $file_loc = $post_image_dir . rand((1<<29),(1<<31)) . "." .$imageFileType;
    if (!is_uploaded_file($_FILES[$fileName]["tmp_name"]))
        return "invalid file upload";
    if (!file_exists($file_loc)){
        if (move_uploaded_file($_FILES[$fileName]["tmp_name"], $file_loc)){
            return htmlspecialchars($host_computer_loc.basename($file_loc));
        } else{
            return "file cannot be uploaded bc of some reason";
        }
    } else{
        return htmlspecialchars($host_computer_loc.basename($file_loc));
    }
}

//we need to make sure it calls this to check size and also the file type is right
function verifyImg($fileName){
    if($_FILES[$fileName]["size"] > 2000000){
        return -2;
    }
    if(verifyImgType($_FILES[$fileName]["name"]) == -1) return -1;
    return 1;
}
function verifyImgType($fileName){
    $imageFileType = strtolower(pathinfo(basename($fileName),PATHINFO_EXTENSION));
    if($imageFileType == "jpg"|| $imageFileType == "png" || $imageFileType == "jpeg"
        || $imageFileType == "gif" ){
            return 1;
    }
    return -1;
}

function updateMessageReport($messageId,$value=1){
    $value = (1 << ($value-1));
    myQuery("UPDATE messageList
            SET isReported = (isReported | $value)
            WHERE messageId=".$messageId);
}

function yeetBadWords($str){
    global $badWordList;
    foreach($badWordList as $word){
        $str = str_replace($word,"(nice)",$str);
    }
    return $str;
}

function maintainBoardSize($board){
    $res=myQuery("SELECT threadCap FROM boardList WHERE shortHand='$board'");
    if(empty($res)) return;

    $boardCap = $res->fetch_assoc()["threadCap"];
    $boardCurSize = countThreads($board);

    if($boardCurSize > $boardCap){
        $res =myQuery("SELECT threadId FROM threadList 
                WHERE boardReference='$board' AND threadPriority = 0
                ORDER BY updateTime LIMIT ".($boardCurSize-$boardCap));

        if(!empty($res) && $res->num_rows > 0){
            while($row = $res->fetch_assoc()){
                deleteThread($row["threadId"]);
            }
        }
    }

}
function deleteFileLocOnLocal($fileName){
    global $host_computer_loc;
    echo "imgs/postImgs/".basename($fileName);
    return unlink("imgs/postImgs/".basename($fileName));
}
function deleteThread($threadId){
    myQuery("DELETE FROM threadList WHERE threadId=$threadId");
    
    $res = myQuery("SELECT imageLinks FROM messageList WHERE threadReference=$threadId");
    while($row = $res->fetch_assoc()){
        deleteFileLocOnLocal($row["imageLinks"]);
    }
    myQuery("DELETE FROM messageList WHERE threadReference=$threadId");
}

function deletePost($messageId){
    //get the thread reference
    //delete
    //update size
    $que = "SELECT threadReference,imageLinks FROM messageList WHERE messageId=$messageId";
    $res = myQuery($que)->fetch_assoc();
    $threadReference = $res["threadReference"];
    $imageLink = $res["imageLinks"];
    deleteFileLocOnLocal($imageLink);

    myQuery("DELETE FROM messageList WHERE messageId=$messageId");
    myQuery("UPDATE threadList
            SET threadSize=threadSize-1
            WHERE threadId=$threadReference");

    $res = myQuery("SELECT threadSize FROM threadList WHERE firstPostLink=$messageId");
    if($res->num_rows > 0){
        if($res->fetch_assoc()["threadSize"] == 0) {
            myQuery("DELETE FROM threadList WHERE firstPostLink=$messageId");
        } else{
            //find oldest and make that the first
            $res = myQuery("SELECT messageId FROM messageList 
                    WHERE threadReference=$threadReference ORDER BY messageId LIMIT 1");
            if($res->num_rows == 0) return false;
            $newMessageId = $res->fetch_assoc()["messageId"];

            myQuery("UPDATE threadList 
                    SET firstPostLink=$newMessageId
                    WHERE firstPostLink=$messageId");
        }
    }
    return true;
}

function countThreads($board){
    $res = myQuery("SELECT threadId FROM threadList WHERE boardReference='$board'");
    return $res->num_rows;
}

?>