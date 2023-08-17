import React, { useState, useEffect, useRef, useContext } from 'react';
import { postRequest } from '../../apiRequest/apiRequest';
import SetCookie, {ClearCookies, GetCookie} from '../../cookieReader/cookieReader';
import ErrorSetterContext from '../../absolutePrompt/absolutePromptContext';
import "./moderate.css"

function ModeratePrompt(props){
    const [modForceReset,setModForceReset] = useState(0); 
    function updateModReset(){setModForceReset(modForceReset^1)}

    const [moderateFocusOn,setModerateFocusOn] = useState(0);
    function setFocusOnStyle(val){
        return ""+
            (val == 0?"25% 50% 25%":"")+
            (val == 1?"80% 10% 10%":"")+
            (val == 2?"10% 80% 10%":"")+
            (val == 3?"10% 10% 80%":"");
    }

    return (
        <div id="moderatePromptCont" onClick={()=>{props.toggleModerate()}}>
            <div id="moderatePrompt" onClick={(e)=>{e.stopPropagation()}}>
                <div id="moderatePromptConstraint" style={{
                    gridAutoRows:setFocusOnStyle(moderateFocusOn)
                }}>
                    <div id="siteStats" onClick={()=>{setModerateFocusOn(1)}}>
                        <BoardMod />
                        <BoardStats />
                    </div>
                    <div className='moderateBox' onClick={()=>{setModerateFocusOn(2)}}>
                        <ModeratePosts updateModReset={updateModReset} modForceReset={modForceReset}/>
                    </div>
                    <div id="moderateUsers" className='moderateBox' onClick={()=>{setModerateFocusOn(3)}}>
                        <ModerateUsers updateModReset={updateModReset} modForceReset={modForceReset}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BoardMod(props){
    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")
    const [boardInfo,setBoardInfo] = useState([]);
    function boardReload(){
        postRequest(
        {
            option: 9299,
            userId: userId,
            authKey: authKey
        }).then((data)=>{
            if(data["code"]!=0){
                setBoardInfo(data["boardList"])
            }
        })
    }

    useEffect(()=>{
        boardReload();
    },[])

    return (
        <div id="boardMod" className='statBox'>
            <div className='statsPaddingBox'>
                <div className='moderateHeader'>Boards</div>
                <div>
                    {
                        boardInfo.map((item,key)=>(
                            <BoardModItem key={key} item={item} boardReload={boardReload}/>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
function BoardModItem(props){
    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")

    const [boardDesc,setBoardDesc] = useState("");
    const [boardImg,setBoardImg] = useState("");
    const [boardCap,setBoardCap] = useState(-1);
    const [boardPrivacy,setBoardPrivacy] = useState(false);

    const [boardImgChange,setBoardImgChange] = useState("");
    const [updateBoardOpt,setUpdateBoardOpt] = useState(-1)

    useEffect(()=>{
        setBoardDesc(props.item.boardDesc)
        setBoardImg(props.item.boardImg ? props.item.boardImg : "ERROR")
        setBoardImgChange(props.item.boardImg)
        setBoardCap(props.item.threadCap)
        setBoardPrivacy(props.item.isPrivate)
    },[props.item])
    useEffect(()=>{
        if(updateBoardOpt != -1){
            setUpdateBoardOpt(-1)
            postRequest(
            {
                option: updateBoardOpt,
                userId: userId,
                authKey: authKey,
                board: props.item.shortHand,
                boardImg: boardImg,
                boardDesc: boardDesc,
                newCap: boardCap
            }).then((data)=>{
                if(data["code"]!=0){
                    props.boardReload()
                }
            })
        }
    },[updateBoardOpt])

    return (
        <div className='boardModItem'>
            <div className='boardModTitle'>{props.item.shortHand} - / {props.item.longHand} /</div>
            <div>
                <div className='boardModTitle'>Description: </div>
                <div className='changeBoardInfoTextCont'>
                    <input value={boardDesc} onChange={(e)=>{setBoardDesc(e.target.value)}}/>
                    <div className='optionButton' onClick={()=>{setUpdateBoardOpt(9202)}}>Change</div>
                </div>
            </div>
            <div>
                <div className='boardModTitle'>BoardImg: </div>
                <div className='changeBoardInfoTextCont'>
                    <input value={boardImg} onChange={(e)=>{setBoardImg(e.target.value)}}/>
                    <div className='optionButton' onClick={()=>{
                        setUpdateBoardOpt(9201)
                        setBoardImgChange(boardImg)
                    }}>
                        Change
                    </div>
                </div>
            </div>
            <div className='boardModTitle'>Img Preview</div>
            <div className='boardModImgCont'>
                <img src={boardImgChange} className='boardModImg'/>
            </div>
            <div className='boardModThreadCapCont'>
                <div className='boardModTitle'>Thread Cap:</div>
                <div>
                    {boardCap}
                </div>
            </div>
            <div className='boardModPrivacyCont'>
                <div className='boardModTitle'>Board Privacy: </div>
                <div className='boardPrivacyButtonCont'>
                    <div onClick={()=>{setBoardPrivacy(1);setUpdateBoardOpt(9204)}} 
                        style={{backgroundColor:(boardPrivacy == 1) ? "#8eff00":"white"}}>
                        Private
                    </div>
                    <div onClick={()=>{setBoardPrivacy(0);setUpdateBoardOpt(9204)}} 
                        style={{backgroundColor:(boardPrivacy == 0) ? "#8eff00":"white"}}>
                        Public
                    </div>
                </div>
            </div>
        </div>
    )
}
function BoardStats(props){
    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")
    const [boardList,setBoardList] = useState([])

    const [threadDelete, setThreadDelete] = useState(-1)

    useEffect(()=>{
        postRequest(
        {
            option: 9001,
            userId: userId,
            authKey: authKey
        }).then((data)=>{
            if(data["code"]!=0){
                setBoardList(data["boardList"])
            }
        })
    },[])
    useEffect(()=>{
        if(threadDelete != -1){
            postRequest(
            {
                option: 9101,
                userId: userId,
                authKey: authKey,
                threadId: threadDelete
            }).then((data)=>{
                //if delete good-> new request. really bad way to write the code
                if(data["code"]!=0){
                    postRequest(
                    {
                        option: 9001,
                        userId: userId,
                        authKey: authKey
                    }).then((data)=>{
                        if(data["code"]!=0){
                            setBoardList(data["boardList"])
                        }
                    })
                }
            })
        }
    },[threadDelete])
    /*
    useEffect(()=>{
        console.log("set",boardList)
    },[boardList])
    */
    return (
        <div id="boardStats" className='statBox'>
            <div className='statsPaddingBox'>
                <div className='moderateHeader'>Board Summary</div>
                <div>
                    {
                        //boardList.map((item,key)=>(<div>key</div>))
                        boardList.map((item,key)=>(
                            <BoardStatItem key={key} item={item} setThreadDelete={setThreadDelete}/>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

function BoardStatItem(props){
    return (
        <div className="boardStatItemCont">
            <div className='boardStatInfoCont'>
                <div>/{props.item["shortHand"]}/-{props.item["longHand"]}</div>
                <div>{props.item["boardSize"]} / {props.item["threadCap"]}</div>
            </div>
            {props.item["boardThreads"].map((threadItem,key)=>(
                <ModerateThreadPostItem key={key} threadItem={threadItem} 
                    setThreadDelete={props.setThreadDelete}/>
            ))}
        </div>
    )
}
function ModerateThreadPostItem(props){
    return (
        <div className="boardStatThreadInfo">
            <div className='boardStatThreadLeftInfo'>
                <div>{props.threadItem["threadId"]}</div>
            </div>

            <div className='boardStatThreadRightInfo'>
                <div>{props.threadItem["threadTitle"]}</div>
            </div>
            <div className='boardStatThreadModInfo'>
                <div>
                    <DisplayThreadMod type={0} 
                        value={props.threadItem["threadPriority"]}
                        threadId={props.threadItem["threadId"]}/>
                </div>
                <div>
                    <DisplayThreadMod type={1}    
                        value={props.threadItem["permLevel"]}
                        threadId={props.threadItem["threadId"]}/>
                </div>
                <div className='optionButton' onClick={()=>{
                    props.setThreadDelete(props.threadItem["threadId"])
                }}>
                    Delete
                </div>
            </div>

        </div>
    )
}
//will take in two props: 
//type - 0 = threadPrority, 1 = permLevel
//value -> actual value
function DisplayThreadMod(props){
    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")

    const [val,setVal] = useState(-1);
    const [responseVar,setResponseVal] = useState(-1);
    const [typeName,setTypeName] = useState("null")
    const [updateCounter,setUpdateCounter] = useState(0)
    useEffect(()=>{
        setVal(props.value);
        setResponseVal(props.value);
        setTypeName(props.type == "0" ? "Priority":"Perm");
    },[props.value])
    useEffect(()=>{
        setUpdateCounter(updateCounter+1);
    },[val])
    useEffect(()=>{
        //one for intial, second for the props.value update
        //third is the first legitamite one
        if(updateCounter > 2){
            postRequest(
            {
                option: 9100,
                threadId: props.threadId,
                threadMod: props.type,
                value: val,
                userId: userId,
                authKey: authKey
            }).then((data)=>{
                //explantion: do no want the button and the number to show 
                //different things. this way prevents that
                if(data["code"]!=0){
                    setResponseVal(val)
                } else{
                    setVal(responseVar)
                }
            })
        }
    },[updateCounter])

    function buttonActive(setVal){
        return "displayThreadPermsButton" + (val==setVal ? "Active":"");
    }
    
    return (
        <div className='displayThreadPerms'>
            <div className='threadPermTypeName'>{typeName}</div>
            <div onClick={()=>{setVal(0)}}
                className={buttonActive(0)}>
                0
            </div>
            <div onClick={()=>{setVal(50)}}
                className={buttonActive(50)}>
                50
            </div>
            <div onClick={()=>{setVal(99)}}
                className={buttonActive(99)}>
                99
            </div>
            <div className='displayThreadPermValue'>{responseVar}</div>
        </div>
    )
}

function ModeratePosts(props){
    const [reportList,setReportList] = useState([]);
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")
    useEffect(()=>{
        postRequest(
        {
            option: 9002,
            userId: userId,
            authKey: authKey
        }).then((data)=>{
            if(data["code"]!=0){
                setReportList(data["reportList"])
            }
        })
    },[props.modForceReset])

    return (
        <div id="moderatePosts" className='moderatePaddingBox'>
            <div className='moderateHeader'>Moderate Posts</div>
            <div className="statsTableCont">
                <div className='statsTable'>
                    {reportList.map((item)=>(
                        <div key={item["messageId"]} className="statsTableItem">
                            <div className='statsTableContent'>
                                <div className='statsItemTime'>{item["postTime"]}</div>
                                <div className='statsItemContent' style={{display:item["imageLinks"] == null ? "block":"grid"}}>
                                    <div className='statsItemLeft'>
                                        <div className="reportedMessageContent">{item["messageContent"]}</div>

                                        <div className="reportedMessageInfo">
                                            <div><b>ID:</b> 
                                                {item["hashed_ip"] ? 
                                                    item["hashed_ip"].substr(0,16)+"...": "Error"}
                                            </div>
                                            <div><b>Thread:</b> {item["threadReference"]} / <b>Msg:</b> {item["messageId"]}</div>
                                        </div>
                                    </div>
                                    { 
                                        item["imageLinks"] == null ? <div style={{display:"none"}}/> :
                                        <div className='statsItemRight'>
                                            <div className='statsTableImgConstraint'>
                                                <img src={item["imageLinks"]} className="statsTableImg"
                                                    style={{height:"100px"}}
                                                    onClick={(e)=>{
                                                        console.log(e.target.style.height)
                                                        e.target.style.height = (e.target.style.height == "100px")?
                                                            "":"100px";
                                                    }}/>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className='optionButtonConstraint'>
                                <div className='optionButtonCont'>
                                    <div className='optionButton' onClick={()=>{
                                        //var userId = GetCookie("userId")
                                        //var authKey = GetCookie("authKey")
                                        postRequest(
                                        {
                                            option: 9997,
                                            userId: userId,
                                            authKey: authKey,
                                            messageId: item["messageId"]
                                        }).then((data)=>{
                                            if(data["code"]!=0){
                                                props.updateModReset();
                                            } 
                                        })
                                    }}>
                                        UnReport
                                    </div>
                                    <div className='optionButton' onClick={()=>{
                                        //var userId = GetCookie("userId")
                                        //var authKey = GetCookie("authKey")
                                        postRequest(
                                        {
                                            option: 9999,
                                            userId: userId,
                                            authKey: authKey,
                                            messageId: item["messageId"]
                                        }).then((data)=>{
                                            if(data["code"]!=0){
                                                props.updateModReset();
                                            } 
                                        })
                                    }}>
                                        Delete
                                    </div>
                                    <div className='optionButton' onClick={()=>{
                                        setErrorJSON({type:99,
                                            ele:<BanUserPrompt hashed_ip={item["hashed_ip"]} 
                                                messageId={item["messageId"]} updateModReset={props.updateModReset}/>})
                                    }}>
                                        Ban 
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function BanUserPrompt(props){
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    const [timeBan,setTimeBan] = useState(-1)
    const banTimeDurationList = 
        [["12 hr",12],["1 Day",24],["3 Day",72],["1 Week",24*7],["1 Month",24*7*4],["3 Month",24*7*4*3],]
    const [banReason,setBanReason] = useState("")


    return (
        <div className="banUserPromptCont" onClick={(e)=>{e.stopPropagation()}}>
            <div><b>Ban User:</b> {props.hashed_ip.substr(0,16)+"..."}</div>
            <div>Reason:</div>
            <div className="banReasonCont">
                <input placeholder="Reason" className="banReasonInput"
                    value={banReason} onInput={(e)=>{setBanReason(e.target.value)}}/>
            </div>
            <div className='optionButtonConstraint'>
                <div className='optionButtonCont'>
                    <div className="banDurationCont" onClick={()=>{}}>
                        {
                            banTimeDurationList.map((item,key)=>(
                                <div key={key} className="banDurationItem" onClick={()=>{setTimeBan(key)}}
                                    style={{backgroundColor:(timeBan==key?"black":"white"),color:(timeBan==key?"white":"black")}}
                                >
                                    {item[0]}
                                </div>
                            ))
                        }                    
                    </div>
                    <div className='optionButton' onClick={()=>{
                        if(timeBan != -1 && banReason != ""){
                            var userId = GetCookie("userId")
                            var authKey = GetCookie("authKey")
                            postRequest(
                            {
                                option: 9998,
                                userId: userId,
                                authKey: authKey,
                                messageId: props.messageId,
                                banDuration: banTimeDurationList[timeBan][1],
                                reason: banReason
                            }).then((data)=>{
                                if(data["code"]!=0){
                                    props.updateModReset();
                                } 
                            })
                            setErrorJSON({show: 0})
                        }
                    }}>
                        Ban
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModerateUsers(props){
    const [banList,setBanList] = useState([]);

    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")
    useEffect(()=>{
        postRequest(
        {
            option: 9003,
            userId: userId,
            authKey: authKey
        }).then((data)=>{
            if(data["code"]!=0){
                setBanList(data["bannedUsers"])
            }
        })
    },[props.modForceReset])

    return (
        <div id="moderateUsersCont" className='moderatePaddingBox'>
            <div className='moderateHeader'>Moderate Users</div>
            <div className="statsTableCont">
                <div className='statsTable'>
                    {
                        banList.map((item,key)=>(
                            <div key={key} className="banUserCont"> 
                                <div className="banInfoCont"><b>Start Time:</b> 
                                    <div className="banInfo">{item["startTime"]}</div></div>
                                <div className="banInfoCont"><b>End Time:</b>
                                    <div className="banInfo">{item["expireTime"]}</div></div>
                                <div className="banInfoCont"><b>Hashed Ip:</b> 
                                    <div className="banInfo">{
                                        item["hashed_ip"].substr(0,16)+"..."
                                    }</div></div>
                                <div className="banInfoReasonCont"><b>Reason:</b>
                                    <div className="banInfoReason">{item["reason"]}</div></div>

                                <div className='optionButtonConstraint'>
                                    <div className='optionButtonCont'>
                                        <div className='optionButton' onClick={()=>{
                                            //var userId = GetCookie("userId")
                                            //var authKey = GetCookie("authKey")
                                            postRequest(
                                            {
                                                option: 9899,
                                                userId: userId,
                                                authKey: authKey,
                                                hashed_ip: item["hashed_ip"]
                                            }).then((data)=>{
                                                if(data["code"]!=0){
                                                    props.updateModReset();
                                                } else{
                                                }
                                            })
                                        }}>
                                            Unban
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}

export default ModeratePrompt