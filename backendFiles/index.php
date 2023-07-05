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
    echo "ERROR: WHAT R U DOING HERE? GET OUT >:3 -> ";
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
else if($option == 1){
    if(!empty($hData["username"]) && !empty($hData["password"])){
        if(createUserAccount($hData["username"], $hData["password"]) == 1 ){
            $retStr = $goodEnding;
        }
    } 
}
else if($option == 2){
    if(!empty($hData["username"]) && !empty($hData["password"])){
        $ret = hasUserAccount($hData["username"], $hData["password"]);
        if( $ret != null ){
            $ret["code"] = 1;
            $retStr = json_encode($ret);
        } else{
            $retStr = '{"code":0,"msg":"Account not found. Please dm me if you need help."}';
        }
    } 
}
else if($option == 3){
    if(!empty($hData["userId"]) && !empty($hData["authKey"])){
        $getUser = userIsAuthed($hData["userId"], $hData["authKey"]);
        if( $getUser != null ){
            $getUser["code"] = 1;
            $retStr = json_encode($getUser);
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
else if($option >= 2000 && $option <= 2999){
    $loggedIn = false;
    $userId = rand();
    if(!empty($hData["userId"]) && !empty($hData["sessionId"]) 
        && userIsAuthed($hData["userId"],$hData["sessionId"]) != null){
        $loggedIn = true;
        $userId = $hData["userId"];
    }
    if($option == 2000){
        if(!empty($hData["currentBoard"]) && !empty($hData["threadTitle"]) && 
            !empty($hData["messageContent"]) 
            && !empty($_FILES["messageImage"]["name"]) && verifyImg($_FILES["messageImage"]["name"]) != -1
            && strlen($hData["threadTitle"]) < 100
            && strlen($hData["messageContent"]) < 2000){
            $ret = addThread($hData["currentBoard"],$hData["threadTitle"],
                $hData["messageContent"],$userId,$loggedIn);
            $ret["code"] = 1;
            $retStr = json_encode($ret);
        } else{
            $retStr = generateError("Missing items");
        }
    }
    else if($option == 2001){
        if (!empty($hData["threadId"]) && !empty($hData["messageContent"])) {
            $retStr = '{"code":1}';
            addMessage($hData["threadId"], $hData["messageContent"], $userId, ($loggedIn ? $hData["userId"] : -1));
        } else{
            $retStr= generateError("Missing items");
        }
    }
    else if($option == 2999){
        if($loggedIn && !empty($hData["messageId"])){
            reportMessage($hData["messageId"]);
            $retStr=json_encode(Array("code"=>1));
        } else{
            $retStr=generateError("Please Login To Report This Post");
        }
    }
}
else if($option == 3000){
    
}
else if($option >= 9000 && $option <= 9999){
    if(!empty($hData["userId"]) && !empty($hData["authKey"]) && userIsAuthed($hData["userId"],$hData["authKey"],80) != null){
        if($option == 9000){
            //this is for generate messageStats
        }
        else if($option == 9001){
            //this is for generating boardStats
        }
        else if($option == 9002){
            //this is for generating flagged posts
            $report = getReportedMessage();
            $retStr = json_encode(Array(
                "code"=>1,
                "reportList"=>$report
            ));
        }
        else if($option == 9003){
            //this is for generating user list
        }
        else if($option == 9997){
        }
        else if($option == 9799){
            //lock board
        }
        else if($option == 9898){
            //unban user
        }
        else if($option == 9899){
            //ban user
        }
        else if($option == 9998){
            //delete thread
        }
        else if($option == 9999){
            //delete message
            if(!empty($hData["messageId"])){
                deletePost($hData["messageId"]);
            }
            $retStr=json_encode(Array("code"=>1,"msg"=>"Deleted Message"));
        }
    } else{
        $retStr=generateError("Error. You are not supposed to see this code. Get out.");
    }
}

echo $retStr;

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
    return array("newThreadId"=>$threadId);
}

//returns either the link or null
function uploadImg($fileName){ 
    global $post_image_dir,$host_computer_loc;
    $imageFileType = strtolower(pathinfo(basename($_FILES[$fileName]["name"]),PATHINFO_EXTENSION));
    if(verifyImg($_FILES[$fileName]["name"]) == -1){
        return "wrong type";
    }

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

function reportMessage($messageId,$value=1){
    global $conn;
    $que = "UPDATE messageList
            SET isReported = $value
            WHERE messageId=".$messageId;
    $conn->query($que);
}
function getReportedMessage(){
    global $conn;
    $que = "SELECT * FROM messageList WHERE isReported=1";
    $res = $conn->query($que);
    return $res->fetch_all(MYSQLI_ASSOC);
}

function deletePost($messageId){
    global $conn;
    $que = "DELETE FROM messageList WHERE messageId=$messageId";
    $conn->query($que);
    $que = "SELECT threadId,threadSize FROM threadList WHERE firstPostLink=$messageId";
    $res = $conn->query($que);

    if($res->num_rows > 0){
        if($res->fetch_assoc()["threadSize"] == 1) {
            $que = "DELETE FROM threadList WHERE firstPostLink=$messageId";
            $conn->query($que);
        } else{
            //find oldest and make that the first
            $que = "SELECT messageId FROM messageList 
                    WHERE threadReference=$messageId ORDER BY messageId LIMIT 1";
            $res = $conn->query($que);
            if($res->num_rows == 0) return false;
            $newMessageId = $res->fetch_assoc()["messageId"];

            $que = "UPDATE threadList 
                    SET firstPostLink=$newMessageId
                    WHERE firstPostLink=$messageId";
            $conn->query($que);

        }
    }
    return true;
}

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