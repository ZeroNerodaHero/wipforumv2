import React, { useState, useEffect, useRef, useContext } from 'react';
import apiRequest from '../../apiRequest/apiRequest';
import SetCookie, {ClearCookies, GetCookie} from '../../cookieReader/cookieReader';
import ErrorSetterContext from '../../absolutePrompt/absolutePromptContext';
import "./moderate.css"

function ModeratePrompt(props){
    const [modForceReset,setModForceReset] = useState(0); 
    function updateModReset(){setModForceReset(modForceReset^1)}

    return (
        <div id="moderatePromptCont" onClick={()=>{props.toggleModerate()}}>
            <div id="moderatePrompt" onClick={(e)=>{e.stopPropagation()}}>
                <div id="moderatePromptConstraint">
                    <div id="siteStats">
                        <PostStats />
                        <BoardStats />
                    </div>
                    <ModeratePosts updateModReset={updateModReset} modForceReset={modForceReset}/>
                    <ModerateUsers updateModReset={updateModReset} modForceReset={modForceReset}/>
                </div>
            </div>
        </div>
    );
}

function PostStats(props){
    return (
        <div id="postStats" className='statBox'>
            <div className='statsPaddingBox'>
                <div className='moderateHeader'>Post Summary</div>
            </div>
        </div>
    );
}
function BoardStats(props){
    return (
        <div id="boardStats" className='statBox'>
            <div className='statsPaddingBox'>
                <div className='moderateHeader'>Board Summary</div>
            </div>
        </div>
    );
}
function ModeratePosts(props){
    const [reportList,setReportList] = useState([]);
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    const userId = GetCookie("userId")
    const authKey = GetCookie("authKey")
    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 9002,
            userId: userId,
            authKey: authKey
        },
        "POST").then((data)=>{
            if(data["code"]!=0){
                setReportList(data["reportList"])
            }
        })
    },[props.modForceReset])

    return (
        <div id="moderatePosts" className='moderateBox'>
            <div className='moderatePaddingBox'>
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
                                                <div><b>ID:</b> {item["hashed_ip"].substr(0,16)+"..."}</div>
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
                                            apiRequest("http://localhost:8070/","",
                                            {
                                                option: 9997,
                                                userId: userId,
                                                authKey: authKey,
                                                messageId: item["messageId"]
                                            },
                                            "POST").then((data)=>{
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
                                            apiRequest("http://localhost:8070/","",
                                            {
                                                option: 9999,
                                                userId: userId,
                                                authKey: authKey,
                                                messageId: item["messageId"]
                                            },
                                            "POST").then((data)=>{
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
                            apiRequest("http://localhost:8070/","",
                            {
                                option: 9998,
                                userId: userId,
                                authKey: authKey,
                                messageId: props.messageId,
                                banDuration: banTimeDurationList[timeBan][1],
                                reason: banReason
                            },
                            "POST").then((data)=>{
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
        apiRequest("http://localhost:8070/","",
        {
            option: 9003,
            userId: userId,
            authKey: authKey
        },
        "POST").then((data)=>{
            if(data["code"]!=0){
                setBanList(data["bannedUsers"])
            }
        })
    },[props.modForceReset])

    return (
        <div id="moderateUsers" className='moderateBox'>
            <div className='moderatePaddingBox'>
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
                                                apiRequest("http://localhost:8070/","",
                                                {
                                                    option: 9899,
                                                    userId: userId,
                                                    authKey: authKey,
                                                    messageId: item["hashed_ip"]
                                                },
                                                "POST").then((data)=>{
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
        </div>
    );
}

export default ModeratePrompt