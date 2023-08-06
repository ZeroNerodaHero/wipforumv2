<?php
function getBoardList(){
    global $conn;
    $ret = array("code"=>1,"boardList"=>[]);
    $que = "SELECT shortHand,longHand,boardDesc FROM boardList
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
    $que = "SELECT threadTitle,threadId,permLevel,creationTime,updateTime,threadSize,firstPostLink,threadPriority FROM threadList
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

function getLatestMessages($count){
    $ret = Array();
    $res = myQuery("SELECT messageContent,threadReference,boardReference,threadTitle 
                    FROM 
                        (messageList AS messageList JOIN threadList AS threadList 
                        ON messageList.threadReference=threadList.threadId)
                    ORDER BY messageId DESC LIMIT $count");

    if(empty($res) || $res->num_rows == 0) return null;
    $ret["messagePost"]=$res->fetch_all(MYSQLI_ASSOC);

    $res = myQuery("SELECT imageLinks,threadReference,boardReference
                    FROM 
                        (messageList AS messageList JOIN threadList AS threadList 
                        ON messageList.threadReference=threadList.threadId)
                    WHERE imageLinks is not null ORDER BY messageId DESC LIMIT $count");
    if(empty($res) || $res->num_rows == 0) return null;
    $ret["imagePost"]=$res->fetch_all(MYSQLI_ASSOC);

    return $ret;
}
?>