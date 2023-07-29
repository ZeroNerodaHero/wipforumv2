<?php

function addMessage($threadReference,$messageContent,$messageOwner,$userReference=-1){
    global $conn;

    //this is used to randomize the user id in everys tring. purpose of 191? prime does something? no? dunno
    //i have no idea what this randomization will cause but...
    srand($messageOwner % ($threadReference*$threadReference* 7919));
    $messageOwner = rand();

    $imageLink = (!empty($_FILES["messageImage"])) ? uploadImg("messageImage") : "";
    if ($imageLink == "wrong type"){
        echo '{"code":0,"msg":"Uploaded media is the wrong type"}';
        die();
    }

    $messageContent = yeetBadWords($messageContent);
    $que = "UPDATE threadList 
    SET threadSize=threadSize+1
    WHERE threadId=" . $threadReference;
    $conn->query($que);

    $messageContent = addslashes($messageContent);
    $que = "INSERT INTO messageList(threadReference,messageContent,messageOwner,userReference,imageLinks, hashed_ip)
            VALUES($threadReference,'$messageContent',$messageOwner,$userReference,".
                (empty($imageLink) ? 'null':"'$imageLink'").",'".getIpAddrHash()."')";
    $conn->query($que);
    
    return $conn->insert_id;
}
function addThread($currentBoard,$threadTitle,$newMessageContent,$messageOwner,$loggedIn){
    global $conn;
    $threadTitle = yeetBadWords($threadTitle);
    $threadTitle = addslashes($threadTitle);
    $que = "INSERT INTO threadList(boardReference,threadTitle,threadOP)
            VALUES('$currentBoard','$threadTitle',$messageOwner)";
    $conn->query($que);
    $threadId = $conn->insert_id;
    $msgLink = addMessage($threadId, $newMessageContent, $messageOwner, ($loggedIn ? $messageOwner : -1));
    $que = "UPDATE threadList
            SET firstPostLink=".$msgLink."
            WHERE threadId=".$threadId;
    $conn->query($que);

    
    maintainBoardSize($currentBoard);
    

    return array("newThreadId"=>$threadId);
}

//returns either the link or null
function uploadImg($fileName){ 
    global $post_image_dir,$host_computer_loc;
    $imageFileType = strtolower(pathinfo(basename($_FILES[$fileName]["name"]),PATHINFO_EXTENSION));
    if(verifyImg($_FILES[$fileName]["name"]) == -1){
        return "wrong type";
    }
    srand(time());
    $file_loc = $post_image_dir . rand((1<<29),(1<<31)) . "." .$imageFileType;
    if (!is_uploaded_file($_FILES[$fileName]["tmp_name"]))
        return "invalid file upload";
    if (!file_exists($file_loc) && $_FILES[$fileName]["size"] < 2000000){
        if (move_uploaded_file($_FILES[$fileName]["tmp_name"], $file_loc)){
            return htmlspecialchars($host_computer_loc.basename($file_loc));
        } else{
            return "file cannot be uploaded bc of some reason";
        }
    } else{
        if (file_exists($file_loc)) return htmlspecialchars($host_computer_loc.basename($file_loc));
        else return "file too big ".$_FILES[$fileName]["size"];
    }
}
function verifyImg($fileName){
    $imageFileType = strtolower(pathinfo(basename($fileName),PATHINFO_EXTENSION));
    if($imageFileType == "jpg" || $imageFileType == "png" || $imageFileType == "jpeg"
        || $imageFileType == "gif" ){
            return 1;
    }
    return -1;
}

function updateMessageReport($messageId,$value=1){
    global $conn;
    $value = (1 << ($value-1));
    $que = "UPDATE messageList
            SET isReported = (isReported | $value)
            WHERE messageId=".$messageId;
    $conn->query($que);
}

function yeetBadWords($str){
    global $badWordList;
    foreach($badWordList as $word){
        $str = str_replace($word,"(nice)",$str);
    }
    return $str;
}

function maintainBoardSize($board){
    global $conn;
    $que = "SELECT threadCap FROM boardList WHERE shortHand='$board'";
    $res = $conn->query($que);
    if(empty($res)) return;

    $boardCap = $res->fetch_assoc()["threadCap"];
    $boardCurSize = countThreads($board);

    if($boardCurSize > $boardCap){
        $que = "SELECT threadId FROM threadList 
                WHERE boardReference='$board' AND threadPriority = 0
                ORDER BY updateTime LIMIT ".($boardCurSize-$boardCap);
        $res = $conn->query($que);

        if(!empty($res) && $res->num_rows > 0){
            while($row = $res->fetch_assoc()){
                deleteThread($row["threadId"]);
            }
        }
    }

}
function deleteThread($threadId){
    global $conn;
    $que = "DELETE FROM threadList WHERE threadId=$threadId";
    $conn->query($que);
    $que = "DELETE FROM messageList WHERE threadReference=$threadId";
    $conn->query($que);
}
function countThreads($board){
    global $conn;
    $que = "SELECT threadId FROM threadList WHERE boardReference='$board'";
    $res = $conn->query($que);
    return $res->num_rows;
}

?>