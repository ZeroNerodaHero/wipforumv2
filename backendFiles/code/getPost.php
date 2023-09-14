<?php
function getBoardList(){
    $ret = array("code"=>1);
    $res=myQuery("SELECT shortHand,longHand,boardDesc,boardImg FROM boardList
            WHERE isPrivate=false
            ORDER BY boardPriority DESC");
    $ret["boardList"] = $res->fetch_all(MYSQLI_ASSOC);
    return json_encode($ret);
}

function getThreadList($currentBoard,$loadStart=0,$loadSize=0){
    $limitStr = "";
    if($loadSize != 0){
        $limitStr = "LIMIT $loadStart OFFSET $loadSize";
    }
    $ret = array("code"=>1,"threadList"=>[]);
    $res = myQuery("SELECT threadTitle,threadId,permLevel,creationTime,updateTime,threadSize,firstPostLink,threadPriority FROM threadList
            WHERE boardReference = '".$currentBoard."'
            ORDER BY threadPriority DESC, updateTime DESC ".$limitStr);
    while($data = $res->fetch_assoc()){
        $data["errorThread"] = false;
        if (!empty($data["firstPostLink"]) && $data["firstPostLink"] != NULL) {
            $resRow = myQuery("SELECT imageLinks,messageContent FROM messageList WHERE messageId=" . $data["firstPostLink"]);
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
    $ret = array("code"=>1,"messageList"=>[]);
    $res = myQuery("SELECT messageId,messageOwner,messageContent,imageLinks,postTime FROM messageList
            WHERE threadReference = '".$activeThread."'");
    $ret["messageList"]=$res->fetch_all(MYSQLI_ASSOC);
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