import React, { useState, useEffect, useRef, useContext } from 'react';
import { postRequest } from '../../apiRequest/apiRequest';
import ErrorSetterContext from '../../absolutePrompt/absolutePromptContext';
import "./moderate.css"

function ModeratePrompt(props){
    const [modForceReset,setModForceReset] = useState(0); 
    function updateModReset(){setModForceReset(modForceReset^1)}

    const [moderateFocusOn,setModerateFocusOn] = useState(0);
    function setFocusOnStyle(val){
        return ""+
            (val == 0?"25%".repeat(4):"6.6% ".repeat(val-1) +"80% "+"6.6% ".repeat(4-val))
    }

    return (
        <div id="moderatePromptCont" onClick={()=>{props.toggleModerate()}}>
            <div id="moderatePrompt" onClick={(e)=>{e.stopPropagation()}}>
                <div id="moderatePromptConstraint" style={{
                    gridAutoRows:setFocusOnStyle(moderateFocusOn)
                }}>
                    <div className='moderateBox' onClick={()=>{setModerateFocusOn(1)}}>
                        <BoardMod />
                    </div>
                    <div className='moderateBox' onClick={()=>{setModerateFocusOn(2)}}>
                        <BoardStats />
                    </div>
                    <div className='moderateBox' onClick={()=>{setModerateFocusOn(3)}}>
                        <ModeratePosts updateModReset={updateModReset} modForceReset={modForceReset}/>
                    </div>
                    <div id="moderateUsers" className='moderateBox' onClick={()=>{setModerateFocusOn(4)}}>
                        <ModerateUsers updateModReset={updateModReset} modForceReset={modForceReset}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BoardMod(props){
    const [boardInfo,setBoardInfo] = useState([]);
    function boardReload(){
        postRequest(
        {
            option: 9299
        },true).then((data)=>{
            if(data["code"]!=0){
                setBoardInfo(data["boardList"])
            }
        })
    }

    useEffect(()=>{
        boardReload();
    },[])

    const [addNewBoard,updateAddNewBoard] = useState(0)

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
                    {
                        addNewBoard === 0 ?
                        <div className='boardModItemAddBoardCont' onClick={()=>{updateAddNewBoard(1)}}>
                            <div className='boardModAddBoard'>
                                +
                            </div>
                        </div> 
                        :
                        <BoardModAddBoard boardReload={boardReload} updateAddNewBoard={updateAddNewBoard}/>
                    }
                </div>
            </div>
        </div>
    );
}

function BoardModAddBoard(props){
    const [shortHand,setShortHand] = useState("")
    const [longHand,setLongHand] = useState("")
    const [desc,setDesc] = useState("")
    const [img,setImg] = useState("")

    function addBoard(){
        postRequest(
        {
            option: 9200,
            board: shortHand,
            boardLongHand: longHand,
            boardDesc: desc,
            boardImg: img
        },true).then((data)=>{
            if(data["code"]!=0){
                props.boardReload()
            }
        })
    }
    return (
        <div className='boardModItem'>
            <div className="addBoardItemCont">
                <div>Short Hand</div>
                <input value={shortHand} onInput={(e)=>{setShortHand(e.target.value)}}/>
                <div>Long Hand</div>
                <input value={longHand} onInput={(e)=>{setLongHand(e.target.value)}} />
                <div>Board Desc</div>
                <input value={desc} onInput={(e)=>{setDesc(e.target.value)}} />
                <div>Board Img</div>
                <input value={img} onInput={(e)=>{setImg(e.target.value)}} />
            </div>
            <div className="optionButtonConstraint">
                <div className="optionButton" onClick={()=>{props.updateAddNewBoard(0)}}>Cancel</div>
                <div className="optionButton" onClick={()=>{addBoard()}}>Add</div>
            </div>
        </div>
    )
}

function BoardModItem(props){
    const [boardDesc,setBoardDesc] = useState("");
    const [boardImg,setBoardImg] = useState("");
    const [boardCap,setBoardCap] = useState(-1);
    const [boardPrivacy,setBoardPrivacy] = useState(false);
    const [boardPerm,setBoardPerm] = useState(0);

    const [boardImgChange,setBoardImgChange] = useState("");
    const [updateBoardOpt,setUpdateBoardOpt] = useState(-1)

    useEffect(()=>{
        setBoardDesc(props.item.boardDesc)
        setBoardImg(props.item.boardImg ? props.item.boardImg : "ERROR")
        setBoardImgChange(props.item.boardImg)
        setBoardCap(props.item.threadCap)
        setBoardPrivacy(props.item.isPrivate)
        setBoardPerm(props.item.boardPermPost)
    },[props.item])
    useEffect(()=>{
        if(updateBoardOpt != -1){
            setUpdateBoardOpt(-1)
            postRequest(
            {
                option: updateBoardOpt,
                board: props.item.shortHand,
                boardImg: boardImg,
                boardDesc: boardDesc,
                newCap: boardCap,
                boardPerm: boardPerm
            },true).then((data)=>{
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
            <div className='boardModPrivacyCont'>
                <div className='boardModTitle'>Lockdown: </div>
                <div className='boardPrivacyButtonCont'>
                    <div onClick={()=>{setBoardPerm(50);setUpdateBoardOpt(9205)}} 
                        style={{backgroundColor:(boardPerm == 50) ? "#8eff00":"white"}}>
                        On
                    </div>
                    <div onClick={()=>{setBoardPerm(0);setUpdateBoardOpt(9205)}} 
                        style={{backgroundColor:(boardPerm == 0) ? "#8eff00":"white"}}>
                        Off
                    </div>
                </div>
            </div>
        </div>
    )
}
function BoardStats(props){
    const [boardList,setBoardList] = useState([])

    const [threadDelete, setThreadDelete] = useState(-1)

    useEffect(()=>{
        postRequest(
        {
            option: 9001
        },true).then((data)=>{
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
                threadId: threadDelete
            },true).then((data)=>{
                //if delete good-> new request. really bad way to write the code
                if(data["code"]!=0){
                    postRequest(
                    {
                        option: 9001,
                    },true).then((data)=>{
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
            },true).then((data)=>{
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

    useEffect(()=>{
        postRequest(
        {
            option: 9002,
        },true).then((data)=>{
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
                                        postRequest(
                                        {
                                            option: 9997,
                                            messageId: item["messageId"]
                                        },true).then((data)=>{
                                            if(data["code"]!=0){
                                                props.updateModReset();
                                            } 
                                        })
                                    }}>
                                        UnReport
                                    </div>
                                    <div className='optionButton' onClick={()=>{
                                        postRequest(
                                        {
                                            option: 9999,
                                            messageId: item["messageId"]
                                        },true).then((data)=>{
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
                            postRequest(
                            {
                                option: 9998,
                                messageId: props.messageId,
                                banDuration: banTimeDurationList[timeBan][1],
                                reason: banReason
                            },true).then((data)=>{
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

    useEffect(()=>{
        postRequest(
        {
            option: 9003,
        },true).then((data)=>{
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
                                            postRequest(
                                            {
                                                option: 9899,
                                                hashed_ip: item["hashed_ip"]
                                            },true).then((data)=>{
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