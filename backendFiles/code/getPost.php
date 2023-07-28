<?php
function getBoardList(){
    global $conn;
    $ret = array("code"=>1,"boardList"=>[]);
    $que = "SELECT shortHand,longHand FROM boardList
            WHERE isPrivate=false
            ORDER BY boardPriority DESC";
    $res = $conn->query($que);
    while($data = $res->fetch_assoc()){
        $ret["boardList"][] = $data;
    }
    return json_encode($ret);
}

function getThreadList($currentBoard){
    global $conn;
    $ret = array("code"=>1,"threadList"=>[]);
    $que = "SELECT threadTitle,threadId,permLevel,creationTime,updateTime,threadSize,firstPostLink FROM threadList
            WHERE boardReference = '".$currentBoard."'
            ORDER BY threadPriority DESC, updateTime DESC";
    $res = $conn->query($que);
    while($data = $res->fetch_assoc()){
        $data["errorThread"] = false;
        if (!empty($data["firstPostLink"]) && $data["firstPostLink"] != NULL) {
            $que = "SELECT imageLinks,messageContent FROM messageList WHERE messageId=" . $data["firstPostLink"];
            $resRow = $conn->query($que);
            if($resRow->num_rows > 0){  
                $data = array_merge($data, $resRow->fetch_assoc());
            }
        } else{
            $data["errorThread"] = true;
            $data["imageLinks"] = "";
            $data["messageContent"] = "ERROR LOADING";
        }
        $ret["threadList"][] = $data;
    }
    return json_encode($ret);
}
function getMessageList($activeThread){
    global $conn;
    $ret = array("code"=>1,"messageList"=>[]);
    $que = "SELECT messageId,messageOwner,messageContent,imageLinks,postTime FROM messageList
            WHERE threadReference = '".$activeThread."'";
            //ORDER BY threadPriority DESC, updateTime DESC";
    $res = $conn->query($que);
    while($data = $res->fetch_assoc()){
        $ret["messageList"][] = $data;
    }
    return json_encode($ret);
}
?>