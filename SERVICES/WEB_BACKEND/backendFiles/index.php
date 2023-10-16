<?php 
header('Access-Control-Allow-Origin: *');    
header('Access-Control-Allow-Headers:  *');
header('Access-Control-Allow-Methods:  *'); 

include_once("SERVERCONFIG.php");
include_once("login.php");
include_once("code/authUser.php");

echo apiRequest();

function apiRequest(){
    global $isTest;
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $hData = $_GET;
    } else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $hData = $_POST;
        if(empty($_POST)) $hData = json_decode(file_get_contents("php://input"),true);
    }
    if(empty($hData)) return "ERROR: WHAT R U DOING HERE? GET OUT >:3 -> ";

    //parameters
    $option = empty($hData["option"]) ? 0:$hData["option"];
    $retStr = '{"code":0}';
    $goodEnding = '{"code":1}';

    if($option >= 1 && $option <= 999){
        include_once("code/manAccount.php");
        if($option == 1 || $option == 2){
            if(empty($hData["username"]) || empty($hData["password"])){
                $retStr=json_encode(Array("code"=>0,"msg"=>"Please Enter both a username and password"));
            }
            else{
                if(preg_match("/['\"]/", $hData["username"].$hData["password"])){
                    $retStr=json_encode(Array("code"=>"0","msg"=>"Failed...Please do not put quotes into your username or password"));
                } else{
                    //username is unique acting as a salt
                    $password=hash("sha256",$hData["password"].$hData["username"]);
                    if($option == 1) $retStr = json_encode(createUserAccount($hData["username"],$password));
                    else if($option == 2){
                        $ret = hasUserAccount($hData["username"], $password);
                        if( $ret != null ){
                            $ret["code"] = 1;
                            $retStr = json_encode($ret);
                        } else{
                            $retStr = '{"code":0,"msg":"Account not found. Please dm me if you need help."}';
                        }
                    }
                }
            }
        }
        else if($option == 3){
            if(!empty($hData["userId"]) && !empty($hData["authKey"])){
                $getUser = userIsAuthed($hData["userId"], $hData["authKey"]);
                if( $getUser != null ){
                    $getUser["code"] = 1;
                    $retStr = json_encode($getUser);
                } else{
                    $retStr = json_encode(Array(
                        "code"=>"0",
                        "msg"=>"Failed to autologin via the proper id and key. 
                                User key may have expired or user may have logged 
                                in somewhere else. Please relogin."
                    ));
                }
            } 
        } else if($option == 999){
            $retStr = json_encode(Array("code"=>1,"hashed_ip"=>getIpAddrHash()));
        }
    }
/* option 1000**** */ 
    else if($option >= 1000 && $option <= 1999){
        include_once("code/getPost.php");
        if($option == 1000) $retStr = getBoardList();
        else if($option == 1001){
            if(!empty($hData["currentBoard"])){
                $loadStart= (!empty($hData["loadStart"])) ?  $hData["loadStart"] : 0;
                $loadSize=(!empty($hData["loadSize"])) ?  $hData["loadSize"] : 0;
                $retStr = getThreadList($hData["currentBoard"],$loadStart,$loadSize);
            }
        }
        else if($option == 1002 && !empty($hData["activeThread"])){
            $retStr = getMessageList($hData["activeThread"]);
        }
        else if($option == 1003) $retStr = json_encode(Array("code"=>1,"latestPost"=>getLatestMessages(10)));
    }
    /* option 2000**** */ 
    else if($option >= 2000 && $option <= 2999){
        include_once("code/manPost.php");

        $loggedIn = false;
        $userId = rand();
        $permLevel = 0;
        if(!empty($hData["userId"]) && !empty($hData["authKey"])) {
            $userInfo = userIsAuthed($hData["userId"],$hData["authKey"]);
            if( $userInfo != null){
                $loggedIn = true;
                $userId = $hData["userId"];
                $permLevel = $userInfo["accountPerm"];
            }
        }
        
        if($option == 2000 || $option == 2001){
            //fall through error
            $retStr = generateError("Missing items or general error");

            //both add message and thread need these checks. do not move
            $tmpUserHash = getIpAddrHash();
            if(userIsBanned($tmpUserHash)){
                $retObj = bannedUserInfoREST($tmpUserHash);
                $retStr = json_encode($retObj);
            } 
            else if(hasPostCooldown($tmpUserHash) == 1){
                $retStr = json_encode(Array(
                    "code"=>-2,
                    "msg"=>"You have posted way too quick. Please wait a while to post. It will end on ".getPostCooldown($tmpUserHash)->format('Y-m-d H:i:s'),
                ));
            }
            else if(empty($hData["messageContent"]) || strlen($hData["messageContent"]) > 1500){
                $retStr = generateError("Missing message or message too long(1500 char max).");
            }
            else if($option == 2000){
                if(!empty($hData["currentBoard"]) && !empty($hData["threadTitle"]) && !empty($_FILES["messageImage"]["name"])){
                    $ret = addThread($hData["currentBoard"],$hData["threadTitle"],$hData["messageContent"],$userId,$loggedIn,$permLevel);
                    $retStr = json_encode($ret);
                }
            }  else if($option == 2001) {
                if(!empty($hData["threadId"])){
                    $retStr = json_encode(
                        addMessage($hData["threadId"], $hData["messageContent"], $userId, ($loggedIn ? $hData["userId"] : -1),$permLevel));
                } else{
                    $retStr = generateError("Thread Not included error");
                }
            }
        }
        else if($option == 2999){
            if($loggedIn && !empty($hData["messageId"])){
                updateMessageReport($hData["messageId"]);
                $retStr=json_encode(Array("code"=>1));
            } else{
                $retStr=generateError("Please Login To Report This Post");
            }
        }
    }
    else if($option >= 9000 && $option <= 9999){
        //man post is included for update report status
        include_once("code/manPost.php");
        include_once("code/admin.php");
        $retStr = generateError("Admin failed To Load");
        if( (!empty($hData["userId"]) && !empty($hData["authKey"]) && userIsAuthed($hData["userId"],$hData["authKey"],80) != null) || $isTest ){
            if($option == 9001){
                $ret = loadBoardThreads();
                if($ret != null) $retStr = json_encode(Array("code"=>1,"boardList"=>$ret));
            }
            else if($option == 9002){
                //this is for generating flagged posts
                $retStr = json_encode(Array("code"=>1,"reportList"=>getReportedMessage()));
            }
            else if($option == 9003){
                //this is for generating user list
                $retStr = json_encode(Array("code"=>1,"bannedUsers"=>getBannedUsers()));
            }
            else if($option == 9100){
                if(isset($hData["threadId"]) && isset($hData["threadMod"]) && isset($hData["value"])
                    && updateMessageMod($hData["threadId"],$hData["threadMod"],$hData["value"])){
                        $retStr = json_encode(Array("code"=>1));
                } else{
                    $retStr = generateError("Failed to update");
                }
            }
            else if($option == 9101){
                //delete thread
                if(isset($hData["threadId"])){
                    deleteThread($hData["threadId"]);
                    $retStr = json_encode(Array("code"=>1));
                } else{
                    $retStr = generateError("Failed to delete thread.");
                }
            }
            //9200 is where board options start
            else if($option >= 9200 && $option <= 9249){
                if(!empty($hData["board"])){
                    $hData["board"] = addslashes($hData["board"]);
                    $hData["boardLongHand"] = addslashes($hData["boardLongHand"]);
                    $hData["boardImg"] = addslashes($hData["boardImg"]);
                    $hData["boardDesc"] = addslashes($hData["boardDesc"]);
                    
                    if($option == 9200) addBoard($hData["board"],$hData["boardLongHand"],$hData["boardDesc"],$hData["boardImg"]);
                    else if($option == 9201) changeBoardImg($hData["board"],$hData["boardImg"]);
                    else if($option == 9202) changeBoardDesc($hData["board"],$hData["boardDesc"]);
                    else if($option == 9203) changeBoardCap($hData["board"],$hData["newCap"]);
                    else if($option == 9204) changeBoardPrivacy($hData["board"]);
                    else if($option == 9205) changeBoardLock($hData["board"],$hData["boardPerm"]);
                    $retStr = json_encode(Array("code"=>1));
                }
            }
            else if($option == 9299){
                $retStr = json_encode(Array("code"=>1, "boardList"=>getBoardListForMod()));
            }
            else if($option == 9899){
                if(!empty($hData["hashed_ip"])) $retStr = json_encode(unBanIp($hData["hashed_ip"]));
            }
            else if($option == 9997){
                if(!empty($hData["messageId"])){
                    //report immunity
                    updateMessageReport($hData["messageId"],2);
                    $retStr=json_encode(Array("code"=>1,"msg"=>"UnReported Message"));
                }
            }
            else if($option == 9998){
                if(!empty($hData["messageId"]) && !empty($hData["banDuration"]) && !empty($hData["reason"])){
                    //ban post
                    $retStr=json_encode(banPost($hData["messageId"],$hData["banDuration"],$hData["reason"]));
                }
            }
            else if($option == 9999){
                //delete message
                if(!empty($hData["messageId"])){
                    deletePost($hData["messageId"]);
                    $retStr=json_encode(Array("code"=>1,"msg"=>"Deleted Message"));
                }
            }
        } else{
            $retStr=generateError("Error. You are not supposed to see this code. Get out.");
        }
    }
    return $retStr;
}
?>