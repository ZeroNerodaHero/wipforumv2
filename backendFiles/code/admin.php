<?php 

function getReportedMessage(){
    global $conn;
    $que = "SELECT * FROM messageList WHERE isReported=1";
    $res = $conn->query($que);
    return $res->fetch_all(MYSQLI_ASSOC);
}

function deletePost($messageId){
    global $conn;
    //get the thread reference
    //delete
    //update size
    $que = "SELECT threadReference FROM messageList WHERE messageId=$messageId";
    $res = $conn->query($que);
    $threadReference = $res->fetch_assoc()["threadReference"];

    $que = "DELETE FROM messageList WHERE messageId=$messageId";
    $conn->query($que);

    $que = "UPDATE threadList
            SET threadSize=threadSize-1
            WHERE threadId=$threadReference";
    $conn->query($que);

    $que = "SELECT threadSize FROM threadList WHERE firstPostLink=$messageId";
    $res = $conn->query($que);
    if($res->num_rows > 0){
        if($res->fetch_assoc()["threadSize"] == 0) {
            $que = "DELETE FROM threadList WHERE firstPostLink=$messageId";
            $conn->query($que);
        } else{
            //find oldest and make that the first
            $que = "SELECT messageId FROM messageList 
                    WHERE threadReference=$threadReference ORDER BY messageId LIMIT 1";
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

?>