<?php 
function getReportedMessage(){
    global $conn;
    $que = "SELECT * FROM messageList WHERE isReported=1";
    $res = $conn->query($que);
    return $res->fetch_all(MYSQLI_ASSOC);
}

function getBannedUsers(){
    global $conn;
    $que = "SELECT * FROM bannedIps";
    $res = $conn->query($que);
    return $res->fetch_all(MYSQLI_ASSOC);
}

function banPost($messageId,$banDuration,$reason){
    global $conn;

    $que = "SELECT hashed_ip FROM messageList WHERE messageId=$messageId";
    $res = $conn->query($que);
    if(!empty($res) && $res->num_rows > 0){
        $hashed_ip = $res->fetch_assoc()["hashed_ip"];
        if(!userIsBanned($hashed_ip))
            banIp($hashed_ip,$banDuration*60*60,$reason); 
        deletePost($messageId);
    }
}

function banIp($hash_ip,$endSeconds,$reason="Unknown."){
    global $conn;
    $reason = addslashes($reason);
    $endTime = new DateTime();
    $endTime->add(new DateInterval("PT".$endSeconds."S"));
    $que = "INSERT INTO bannedIps(hashed_ip,reason,expireTime)
            VALUES('$hash_ip','$reason','".$endTime->format('Y-m-d H:i:s')."')";
    $conn->query(($que));
    return true;
}

function unBanIp($hash_ip){
    global $conn;
    $que = "DELETE FROM bannedIps WHERE hashed_ip='$hash_ip'";
    $conn->query($que);
    return true;
}

function loadBoardThreads(){
    global $conn;
    $que = "SELECT shortHand,longHand,boardDesc,boardImg,threadCap 
            FROM boardList";
    $res = $conn->query($que);
    if(empty($res)) return null;

    $ret = Array();
    while($row = $res->fetch_assoc()){
        $que = "SELECT threadId,threadTitle,permLevel,threadPriority 
                FROM threadList 
                WHERE boardReference='".$row["shortHand"]."'
                ORDER BY updateTime";
        $boardRes = $conn->query($que);
        $row["boardSize"] = $boardRes->num_rows;
        $row["boardThreads"] = Array();
        while($boardRow = $boardRes->fetch_assoc()){
            array_push($row["boardThreads"],$boardRow);
        }
        
        array_push($ret,$row);
    }
    return $ret;
}

function updateMessageMod($threadId,$threadMod,$value){
    $updateColumn = ($threadMod == 0 ? "threadPriority":"permLevel");
    $que = "UPDATE threadList 
            SET $updateColumn = $value
            WHERE threadId=$threadId";
    return myQuery($que);
}
function addBoard($shortHand,$longHand,$boardDesc,$boardImg){
    myQuery("INSERT INTO boardList(shortHand,longHand,boardDesc,boardImg)
            VALUES('$shortHand','$longHand','$boardDesc','$boardImg') ");
}

function changeBoardImg($board,$boardImg){
    boardChangeData($board,Array("boardImg",$boardImg));
}

function changeBoardDesc($board,$desc){
    boardChangeData($board,Array("boardDesc",$desc));
}

function changeBoardCap($board,$newCap){
    boardChangeData($board,Array("threadCap",$newCap));
}

function changeBoardPrivacy($board){
    boardChangeData($board,Array("isPrivate","!isPrivate"),false);
}

/**
 * boardChangeData 
 * Uses this to alter the board data. Takes in a board and an associative array params. 
 * Params should be an array array with [0] = "data schema", [1]="new data"
 *
 * @param  mixed $board
 * @param  mixed $params
 * @return void
 */
function boardChangeData($board,$param,$quotes=true){
    $processedStr = addSlashes($param[1]);
    myQuery("UPDATE boardList
            SET ".$param[0]."=".$processedStr.($quotes == true ? "'":"")."
            WHERE shortHand='".$board."'");
}

?>