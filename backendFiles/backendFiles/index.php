<?php 
header('Access-Control-Allow-Origin: *');    
header('Access-Control-Allow-Headers:  *');
header('Access-Control-Allow-Methods:  *'); 

include_once("login.php");

$hData = $_POST;
if(empty($_POST)){
    $hData = json_decode(file_get_contents("php://input"),true);
} 
if(empty($hData)){
    echo "ERROR: WHAT R U DOING HERE? GET OUT >:3";
    die();
}

//parameters
//api-key requires
$apiKey = "null";
$option = empty($hData["option"]) ? 0:$hData["option"];
$retStr = '{"code":0}';
$goodEnding = '{"code":1}';

if($option == 0){
    die();
}
if($option == 1){
    if(!empty($hData["username"]) && !empty($hData["password"])){
        if(createUserAccount($hData["username"], $hData["password"]) == 1 ){
            $retStr = $goodEnding;
        }
    } 
}
/* option 1000**** */ 
else if($option == 1000){
    $ret = array("code"=>1,"boardList"=>[]);
    $que = "SELECT shortHand,longHand FROM boardList
            WHERE isPrivate=false
            ORDER BY boardPriority DESC";
    $res = $conn->query($que);
    while($data = $res->fetch_assoc()){
        $ret["boardList"][] = $data;
    }
    $retStr = json_encode($ret);
}
else if($option == 1001){
    $ret = array("code"=>1,"threadList"=>[]);
    $que = "SELECT threadTitle,threadId,permLevel,creationTime,updateTime,threadSize,firstPostLink FROM threadList
            WHERE boardReference = '".$hData["currentBoard"]."'
            ORDER BY threadPriority DESC, updateTime DESC";
    $res = $conn->query($que);
    while($data = $res->fetch_assoc()){
        if (!empty($data["firstPostLink"])) {
            $que = "SELECT imageLinks,messageContent FROM messageList WHERE messageId=" . $data["firstPostLink"];
            $resRow = $conn->query($que);
            $data = array_merge($data, $resRow->fetch_assoc());
        } else{
            $data["imageLinks"] = "";
            $data["messageContent"] = "ERROR LOADING";
        }
        $ret["threadList"][] = $data;
    }
    $retStr = json_encode($ret);
}
else if($option == 1002){
    $ret = array("code"=>1,"messageList"=>[]);
    $que = "SELECT messageId,messageOwner,messageContent,imageLinks,postTime FROM messageList
            WHERE threadReference = '".$hData["activeThread"]."'";
            //ORDER BY threadPriority DESC, updateTime DESC";
    $res = $conn->query($que);
    while($data = $res->fetch_assoc()){
        $ret["messageList"][] = $data;
    }
    $retStr = json_encode($ret);
}
/* option 2000**** */ 
else if($option == 2000){
    if(!empty($hData["currentBoard"]) && !empty($hData["threadTitle"]) && 
        !empty($hData["messageContent"]) && !empty($hData["userId"]) && !empty($_FILES["messageImage"]["name"])
        && strlen($hData["messageContent"]) < 2000){
        $ret = addThread($hData["currentBoard"],$hData["threadTitle"],
            $hData["messageContent"],$hData["userId"]);
        $ret["code"] = 1;
        $retStr = json_encode($ret);
    } else{
        $retStr = generateError("Missing items");
    }
}
else if($option == 2001){
    if (!empty($hData["threadId"]) && !empty($hData["messageContent"])) {
        $retStr = '{"code":1}';
        addMessage($hData["threadId"], $hData["messageContent"], $hData["userId"]);
    } else{
        $retStr= generateError("Missing items");
    }
}
else if($option == 3000){
    
}

echo $retStr;
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
function addMessage($threadReference,$messageContent,$messageOwner){
    global $conn;
    $imageLink = !empty($_FILES["messageImage"]) ? uploadImg("messageImage") : "";
    $messageContent = addslashes($messageContent);
    $que = "INSERT INTO messageList(threadReference,messageContent,messageOwner,imageLinks)
            VALUES($threadReference,'$messageContent',$messageOwner,".
                (empty($imageLink) ? 'null':"'$imageLink'").")";
    $conn->query($que);
    return $conn->insert_id;
}
function addThread($currentBoard,$threadTitle,$newMessageContent,$messageOwner){
    global $conn;
    $threadTitle = addslashes($threadTitle);
    $que = "INSERT INTO threadList(boardReference,threadTitle,threadOP)
            VALUES('$currentBoard','$threadTitle',$messageOwner)";
    $conn->query($que);
    $threadId = $conn->insert_id;
    $msgLink = addMessage($threadId, $newMessageContent, $messageOwner);
    $que = "UPDATE threadList
            SET firstPostLink=".$msgLink."
            WHERE threadId=".$threadId;
    $conn->query($que);
    return array("newThreadId"=>$threadId);
}

//returns either the link or null
function uploadImg($fileName){ 
    global $post_image_dir;
    $file_loc = $post_image_dir . basename($_FILES[$fileName]["name"]);
    $imageFileType = strtolower(pathinfo($file_loc,PATHINFO_EXTENSION));
    if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
        && $imageFileType != "gif" ){
            return "wrong type";
    }
    if (!is_uploaded_file($_FILES[$fileName]["tmp_name"]))
        return "invalid file upload";
    if (!file_exists($file_loc) && $_FILES[$fileName]["size"] < 2000000){
        if (move_uploaded_file($_FILES[$fileName]["tmp_name"], $file_loc)){
            return htmlspecialchars("http://172.16.182.98:8070/imgs/postImgs/".basename($file_loc));
        } else{
            return "file cannot be uploaded bc of some reason";
        }
    } else{
        if (file_exists($file_loc)) return "file exists";
        else return "file too big ".$_FILES[$fileName]["size"];
    }
    return "error";
}
/*
code 0-999: user info
code 1000-1999: threadInfo
code 2000-2999: adding threads/messages
2000->add new thread
2001->add new message
code 
*/
?>
