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
    $hData = $_POST;
    if(empty($_POST)){
        $hData = json_decode(file_get_contents("php://input"),true);
    } 
    if(empty($hData)){
        return "ERROR: WHAT R U DOING HERE? GET OUT >:3 -> ";
    }


    //parameters
    //api-key requires
    $apiKey = "null";
    $option = empty($hData["option"]) ? 0:$hData["option"];
    $retStr = '{"code":0}';
    $goodEnding = '{"code":1}';

    if($option >= 1 && $option <= 999){
        include_once("code/manAccount.php");
        if($option == 1){
            if(!empty($hData["username"]) && !empty($hData["password"])){
                if((preg_match("/['\"]/", $hData["username"].$hData["password"]))){
                    $retStr = json_encode(Array(
                        "code"=>"0",
                        "msg"=>"Failed to create user account. Please do not put quotes into your username or password"
                    ));
                }
                else if(createUserAccount($hData["username"], $hData["password"]) == 1 ){
                    $retStr = $goodEnding;
                } else{
                    $retStr = json_encode(Array(
                        "code"=>"0",
                        "msg"=>"Failed to create user account. Username already exists."
                    ));
                }
            } else{
                $retStr = json_encode(Array(
                    "code"=>"0",
                    "msg"=>"Failed to create user account. Please enter both a username and password."
                ));
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
                } else{
                    $retStr = json_encode(Array(
                        "code"=>"0",
                        "msg"=>"Failed to autologin via the proper id and key. 
                                User key may have expired or user may have logged 
                                in somewhere else. Please relogin."
                    ));
                }
            } 
        }
    }
/* option 1000**** */ 
    else if($option >= 1000 && $option <= 1999){
        include_once("code/getPost.php");
        if($option == 1000){
            $retStr = getBoardList();
        }
        else if($option == 1001){
            if(!empty($hData["currentBoard"])){
                $retStr = getThreadList($hData["currentBoard"]);
            }
        }
        else if($option == 1002){
            if(!empty($hData["activeThread"])){
                $retStr = getMessageList($hData["activeThread"]);
            }
        }
        else if($option == 1003){
            $retStr = json_encode(Array("code"=>1,"latestPost"=>getLatestMessages(10)));
        }
    }
    /* option 2000**** */ 
    else if($option >= 2000 && $option <= 2999){
        include_once("code/manPost.php");

        $loggedIn = false;
        $userId = rand();
        $permLevel = 0;
        if(!empty($hData["userId"]) && !empty($hData["sessionId"])) {
            $userInfo = userIsAuthed($hData["userId"],$hData["sessionId"]);
            if( $userInfo != null){
                $loggedIn = true;
                $userId = $hData["userId"];
                $permLevel = $userInfo["accountPerm"];
            }
        }
        
        if($option == 2000 || $option == 2001){
            $tmpUserHash = getIpAddrHash();
            if(userIsBanned($tmpUserHash)){
                $retObj = bannedUserInfo($tmpUserHash);
                $retStr = json_encode(Array(
                    "code" => -1,
                    "msg"=>"You are banned",
                    "startTime"=>$retObj["startTime"],
                    "expireTime"=>$retObj["expireTime"],
                    "reason"=>$retObj["reason"]
                ));
            } 
            else if(hasPostCooldown(getIpAddrHash()) == 1){
                $retStr = json_encode(Array(
                    "code"=>0,
                    "msg"=>"You have posted way too quick. Please wait a while to post."
                ));
            }
            else if(!empty($hData["messageContent"]) && strlen($hData["messageContent"]) < 1500){
                if($option == 2000 && !empty($hData["currentBoard"]) && !empty($hData["threadTitle"]) && 
                    !empty($_FILES["messageImage"]["name"]) && verifyImg("messageImage") == 1
                    && strlen($hData["threadTitle"]) < 100
                ){
                    $ret = addThread($hData["currentBoard"],$hData["threadTitle"],
                        $hData["messageContent"],$userId,$loggedIn);
                    $ret["code"] = 1;
                    $retStr = json_encode($ret);
                } else if($option == 2001 && !empty($hData["threadId"])){
                    if(threadIsLocked($hData["threadId"],$permLevel)){
                        $retStr = json_encode(Array(
                            "code"=>0,
                            "msg"=>"Thread is locked. Only admins can post in this thread. Sorry"
                        ));
                    } else{
                        $retStr = json_encode(
                            addMessage($hData["threadId"], $hData["messageContent"], $userId, ($loggedIn ? $hData["userId"] : -1)));
                    }
                } else {
                    $retStr = generateError("Missing items or title too long");
                }
            } else{
                $retStr = generateError("Missing message or message too long");
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
    else if($option == 3000){
        //what is the prupose of this?
    }
    else if($option >= 9000 && $option <= 9999){
        //man post is included for update report status
        include_once("code/manPost.php");
        include_once("code/admin.php");
        if( (!empty($hData["userId"]) && !empty($hData["authKey"]) && userIsAuthed($hData["userId"],$hData["authKey"],80) != null)
            || $isTest ){
            if($option == 9000){
                //this is for generate messageStats
            }
            else if($option == 9001){
                $ret = loadBoardThreads();
                if($ret != null){
                    $retStr = json_encode(Array(
                        "code"=>1,
                        "boardList"=>$ret
                    ));
                } else{
                    $retStr = generateError("Failed To Load");
                }
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
                $report = getBannedUsers();
                $retStr = json_encode(Array(
                    "code"=>1,
                    "bannedUsers"=>$report
                ));
            }
            else if($option == 9100){
                if(isset($hData["threadId"]) && isset($hData["threadMod"]) 
                    && isset($hData["value"])
                    && updateMessageMod($hData["threadId"],$hData["threadMod"],$hData["value"])){
                        $retStr = json_encode(Array(
                            "code"=>1
                        ));
                } else{
                    $retStr = generateError("Failed to update");
                }
            }
            else if($option == 9101){
                //delete thread
                if(isset($hData["threadId"])){
                    deleteThread($hData["threadId"]);
                    $retStr = json_encode(Array(
                        "code"=>1
                    ));
                } else{
                    $retStr = generateError("Failed to delete thread.");
                }
            }
            //9200 is where board options start
            else if($option >= 9200 && $option <= 9299){
                if(!empty($hData["board"])){
                    if($option == 9200){
                        addBoard($hData["board"],$hData["boardLongHand"],
                            $hData["boardDesc"],$hData["boardImg"]);
                    }
                    else if($option == 9201){
                        changeBoardImg($hData["board"],$hData["boardImg"]);
                    }
                    else if($option == 9202){
                        changeBoardDesc($hData["board"],$hData["boardDesc"]);
                    }
                    else if($option == 9203){
                        changeBoardCap($hData["board"],$hData["newCap"]);
                    }
                    else if($option == 9204){
                        changeBoardPrivacy($hData["board"]);
                    }
                    else if($option == 9205){
                        //lock board
                    }
                    $retStr = json_encode(Array("code"=>1));
                }
            }
            
            else if($option == 9899){
                if(!empty($hData["hashed_ip"]) && unBanIp($hData["hashed_ip"])){
                    $retStr = json_encode(
                        Array(
                            "code"=>1,
                            "hash_ip"=>$hData["hashed_ip"]
                    ));
                }
            }
            else if($option == 9900){
                $retStr = json_encode(
                    Array(
                        "code"=>1,
                        "hash_ip"=>getIpAddrHash(),
                        "banned"=>(userIsBanned(getIpAddrHash()) ? 1:0)
                ));
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
                    banPost($hData["messageId"],$hData["banDuration"],$hData["reason"]);
                }
                $retStr=json_encode(Array("code"=>1,"msg"=>"Banned User"));
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
    return $retStr;
}

/*
function updateUserIp($param,$param_value){
function userIsBanned($hash_ip){
function banIp($hash_ip)
function unBanIp($hash_ip)
*/
?>