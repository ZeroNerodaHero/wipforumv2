import React, { useState, useEffect, useRef, useContext } from 'react';
import {getRequest,postRequest} from '../apiRequest/apiRequest';
import "./mainContent.css"
import UserProfile from '../userProfile.js/userProfile';
import WebTab from '../webTabs/webTabs';
import SetCookie, {ClearCookies, GetCookie} from "../cookieReader/cookieReader"
import getLocalStorageItem, { updateLocalStorage } from "../cookieReader/localStorageReader"
import AbsolutePrompt from '../absolutePrompt/absolutePrompt';
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
//import { func } from 'prop-types';

import {PushPin, Lock} from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import {updatePageParams, clearPageParams} from "../preLoad/preLoad"

function MainContent(props){
    const [currentBoard,setCurrentBoard] = useState(-1)
    const [threadSearch,setThreadSearch] = useState("")
    const [errorJSON,setErrorJSON] = useState({show:0})
    const [checkStorage,setCheckStorage] = useState(false);

    const [activeThreadPassthrough,setActiveThreadPassthrough] = useState(-1);
    var getInitObject = {}
    function getInitComplete(){
        if(getInitObject["threadId"] !== undefined && getInitObject["threadTitle"] !== undefined){
            setActiveThreadPassthrough(getInitObject)
        }
    }

    useEffect(()=>{
        const showHelpOnLoad = getLocalStorageItem("userSettings","showHelp");
        if(showHelpOnLoad === undefined || showHelpOnLoad === true ){
            setErrorJSON(
                {show:1,type:99,
                ele:<WebTab setCurrentBoard={setCurrentBoard } 
                    setActiveThreadPassthrough={setActiveThreadPassthrough}
                    type={-2} />
            })
        }
        setCheckStorage(true);
    },[])

    //inefficent double call. will first do a call for /h/ then this. and then maybe another...fix?
    //may have fixed
    //idea-> priority for get board then settings then h
    useEffect(()=>{
        //console.log("GET BOARD IS " + props.GETboard)
        if(props.GETboard !== ""){
            //console.log(props.GETboard)
            setCurrentBoard(props.GETboard)
        } else{
            var tmpBoard = getLocalStorageItem("userSettings","currentBoard") 
            if(tmpBoard != undefined && typeof(tmpBoard) === "string"){
                setCurrentBoard(tmpBoard )
            } else{
                setCurrentBoard("h");
            }
        }
    },[props.GETboard])
    useEffect(()=>{
        //console.log(props.GETthread)

        if(props.GETthread !== ""){
            getInitObject["threadId"] = props.GETthread
            getInitComplete()
        } else{
            //pass through a -1
            setActiveThreadPassthrough({"threadId":-1})
        }
    },[props.GETthread])
    useEffect(()=>{
        if(props.GETtitle !== ""){
            getInitObject["threadTitle"] = props.GETtitle
            getInitComplete()
        }
    },[props.GETtitle])
    
    
    useEffect(()=>{
        if(currentBoard != -1 && checkStorage !== false){
            var userSettings = getLocalStorageItem("userSettings");
            userSettings["currentBoard"] = currentBoard;
            localStorage.setItem("userSettings",JSON.stringify(userSettings))
            updatePageParams({"board":currentBoard})
        }
    },[currentBoard])

    return (
        <div id="mainContent" >
            <ErrorSetterContext.Provider value={{errorJSON,setErrorJSON}}>
                <MainContentTabs currentBoard={currentBoard} setCurrentBoard={setCurrentBoard}
                    setActiveThreadPassthrough={setActiveThreadPassthrough}/>
                <div id="mainContentDisplayer">
                    <MenuBar threadSearch={threadSearch} setThreadSearch={setThreadSearch}/>
                    <ThreadCont currentBoard={currentBoard} setCurrentBoard={setCurrentBoard}
                        threadSearch={threadSearch} 
                        activeThreadPassthrough={activeThreadPassthrough} />
                </div>
                <AbsolutePrompt prompt={errorJSON} />
            </ErrorSetterContext.Provider>
        </div>
    )
}
function MenuBar(props){
    return (
    <div id='menuCont'>
        <div>
            
        </div>
        <div id="menuLeftCont">
            <SearchIcon />
            <input id="threadSearchInput" value={props.threadSearch} 
                onChange={(e)=>{props.setThreadSearch(e.target.value)}}/>
        </div>

    </div>
    )
}

function ThreadCont(props){
    const [activeThread,setActiveThread] = useState(-1);
    const [activeThreadTitle,setActiveThreadTitle] = useState("LOADING...");

    const [threadList, setThreadList] = useState([])
    const [allThreads,setAllThreads] = useState([])

    const [forceUpdateCnt,setForceUpdateCnt] = useState(0);
    const forceUpdate = function(){setForceUpdateCnt(forceUpdateCnt ^ 1)}
    const [forceRefreshActive,setForceRefreshActive] = useState(0)
    const refreshActive = function(){setForceRefreshActive(forceRefreshActive ^ 1)}

    const [updateMessageBox,setUpdateMessageBox] = useState("");

    const [flagUpdateThread,setFlagUpdateThread] = useState(-1)
    
    useEffect(()=>{
        if(props.currentBoard !=  -1){
            getRequest(
            {
                option: 1001,
                currentBoard: props.currentBoard
            }).then((data)=>{
                if(data["code"]!=0){
                    if(data["threadList"] != undefined){
                        setThreadList(data["threadList"]);
                        setAllThreads(data["threadList"]);
                    } 
                /* Note: not sure what this line was for */
                    //setActiveThread(-1);
                } else{
                    props.setCurrentBoard("h")
                }
            })
        }
    },[props.currentBoard,forceUpdateCnt])

    useEffect(()=>{
        setThreadList(
            allThreads.filter((element)=>{
                return element.threadTitle.substr(0,props.threadSearch.length).toLowerCase() === props.threadSearch.toLowerCase()
        }))
    },[props.threadSearch])

    useEffect(()=>{
        if(props.activeThreadPassthrough != -1){
            setActiveThread(props.activeThreadPassthrough["threadId"])
            setActiveThreadTitle(props.activeThreadPassthrough["threadTitle"])

            if(props.activeThreadPassthrough["threadId"] != -1)
                updatePageParams({"thread":props.activeThreadPassthrough["threadId"],"title":props.activeThreadPassthrough["threadTitle"]})
        }
    },[props.activeThreadPassthrough])

    return (
        <div id='threadViewEncap'>
            <GUIcont activeThread={activeThread} setActiveThread={setActiveThread} setActiveThreadTitle={setActiveThreadTitle}
                currentBoard={props.currentBoard} forceUpdate={forceUpdate} refreshActive={refreshActive}
                updateMessageBox={updateMessageBox} />
            {
                activeThread == -1 ? <div /> :
                <div id="activeThreadDisplay" onClick={()=>{
                    setActiveThread(-1)
                    clearPageParams(["thread","title"])
                }}>
                    <ActiveThreadDisplayer activeThread={activeThread}
                        threadTitle={activeThreadTitle}
                        forceRefreshActive={forceRefreshActive}
                        currentBoard={props.currentBoard}
                        setUpdateMessageBox={setUpdateMessageBox}
                        setFlagUpdateThread={setFlagUpdateThread}
                        />
                </div>
            }
            <div className='threadViewCont'>
                <div className='threadCont'>
                    {
                        threadList === undefined || threadList.length == 0 ? 
                        <div id="emptyBoardList">
                            Empty Board. Be the first to post...
                        </div> 
                        :
                        threadList.map((item)=>(
                        <ThreadViewDisplay setActiveThread={setActiveThread} setActiveThreadTitle={setActiveThreadTitle}
                            threadName={item["threadTitle"]} threadThumb={item["imageLinks"]}
                            threadId={item["threadId"]} threadSize={item["threadSize"]}
                            threadPriority={item["threadPriority"]} threadPerm={item["permLevel"]}
                            update_time={(new Date(convertTimeToJS(item["updateTime"]))).toLocaleTimeString("en-US").replace(/:\d+ /," ").replace(/,/,"")}
                            messageContent={item["messageContent"]}
                            key={item["threadId"]}
                            flagUpdateThread={flagUpdateThread} setFlagUpdateThread={setFlagUpdateThread}
                        />))
                    }
                </div>
            </div>
        </div>

    )

}
function GUIcont(props){
    const [addMessageState,setAddMessageState] = useState(-1);
    const [threadTitle,setThreadTitle] = useState("");
    const [messageContent,setMessageContent] = useState("");
    const [newMessageContent,setNewMessageContent] = useState("");
    const [imageUpload,setImageUpload] = useState("");
    const [imageTemp,setImageTemp] = useState(0);

    const fileInput = useRef(null)
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    useEffect(()=>{setMessageContent("")},[props.activeThread])
    useEffect(()=>{
        if(imageUpload != "" && imageUpload[0] != null){
            setImageTemp(URL.createObjectURL(imageUpload[0]))
        }
    },[imageUpload])
    useEffect(()=>{
        if(props.updateMessageBox !== ""){
            setMessageContent(messageContent+
                (messageContent !== "" && messageContent[messageContent.length-1] !== "\n" ? "\n":"")+
                props.updateMessageBox+"\n");
            setAddMessageState(1)
        }
    },[props.updateMessageBox])

    const submitCont = (
        <div id="promptSubmitCont">
            <div id="promptOptCont">
                <div id="promptOptionList">
                    <div><b>Image:</b></div>
                    <div className="promptOption">
                        <div id="image_buttonPlaceHolder" onClick={()=>{fileInput.current.click()}}>
                            {imageTemp == 0 ? "Add" : 
                                <div>
                                    <img id="uploadedImageIcon" src={imageTemp}></img>
                                    <span>Change</span>
                                </div>
                            }
                        </div>
                        <input type="file" ref={fileInput} style={{ display: "none"}}
                            onChange={(e)=>{
                                setImageUpload(Array.from(e.target.files));
                                
                            }} />
                    </div>
                </div>     
            </div>
            <div id="promptSubmitButtonCont">
                <div id="promptSubmit" className="noselect" onClick={()=>{
                    var hasImg = false;

                    var userId = GetCookie("userId")
                    var authKey = GetCookie("authKey")

                    var postObject = {
                        option: (props.activeThread != -1)+2000,

                        userId: userId != null ? userId : Math.floor(Math.random()*1000000000),
                        sessionId: authKey != null ? authKey : -1,
                    };
                    if(props.activeThread == -1){
                        postObject.currentBoard = props.currentBoard
                        postObject.threadTitle = threadTitle;
                        postObject.messageContent = newMessageContent
                    } else{
                        postObject.threadId = props.activeThread;
                        postObject.messageContent = messageContent;
                    }

                    if(imageUpload != -1 && imageUpload.length > 0){
                        hasImg = true;
                        var tmpData = new FormData();
                        for ( var key in postObject ) {
                            tmpData.append(key, postObject[key]);
                        }
                        postObject = tmpData;
                        postObject.append("messageImage",imageUpload[0])
                    }
                    postRequest(postObject,hasImg).
                    then((data)=>{
                        //console.log(data)
                        if(data["code"] >= 1){
                            setAddMessageState(-1)
                            props.forceUpdate();
                            if(props.activeThread == -1){
                                setThreadTitle(""); setNewMessageContent("");
                                props.setActiveThread(data["newThreadId"]);
                                //can set title like this but maybe not so good       
                                props.setActiveThreadTitle(threadTitle) 
                            } else{
                                setMessageContent("")
                                props.refreshActive();      
                            }
                            setImageUpload(-1)
                            setImageTemp(0)
                        } else{
                            if(data["code"] === -1){
                                //user is banned
                                setErrorJSON({show:1,type:1,title:"Failed to Post: User is Banned",
                                    content:(<div>
                                        <div>You are <b>banned</b>.</div>
                                        <div>Your ban started on: <b>{data["startTime"]}</b></div>
                                        <div>Your ban will end on: <b>{data["expireTime"]}</b></div><br/>
                                        <div>Admin's Reason: <div><b>{data["reason"]}</b></div></div>
                                    </div>)
                                })
                            } else{
                                setErrorJSON({show:1,type:1,title:"Failed to Post",content:data["msg"]})
                            }
                        }
                    })
                }}>Post</div>
            </div>
        </div>
    );
    const promptTextArea = function(content,setContent)
    {
        return <textarea value={content} placeholder="Your Message" onChange={(e)=>{setContent(e.target.value)}}/>
    }
    return (
        <div id="GUIcont">
            <div id="bottomRightGuiCont">
                {
                /*<div id='PageControlGuiCont'><div className="PageGuiButton" id='pageUpButton'>&#9650;</div><div className="PageGuiButton" id='pageDownButton'>&#9660;</div></div>*/
                }
                <div id="addMessageButton" onClick={()=>{setAddMessageState(1)}}>+</div>
            </div>
            {
                addMessageState == -1 ? <div></div> :
                <div id="newPromptCont" onClick={()=>{setAddMessageState(-1);}}>
                    
                {props.activeThread == -1? 
                    <div id="newThreadPrompt" className='newPrompt' onClick={(e)=>{e.stopPropagation()}}>
                        <div className='promptTitle'>New Thread</div>
                        <div className="promptBody">
                            <input value={threadTitle} onChange={(e)=>{setThreadTitle(e.target.value)}}
                                    placeholder="Title"/>
                            {promptTextArea(newMessageContent,setNewMessageContent)}
                            {submitCont}
                        </div>
                    </div> 
                    :
                    <div id="newMessagePrompt" className='newPrompt' onClick={(e)=>{e.stopPropagation()}}>
                        <div className='promptTitle'>Add Message</div>
                        <div className="promptBody">
                            {promptTextArea(messageContent,setMessageContent)}    
                            {submitCont}
                        </div>
                    </div>
                }
                </div>
            }
        </div>
    );
}
function ActiveThreadDisplayer(props){
    /*activeThreadCont has a problem !!!!! */
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)
    const [expandMsgOpt,setMsgExpandOpt] = useState(-1)

    const [threadFlagged,setThreadFlagged] = useState(false)
    const [threadFlagUpdate,setThreadFlagUpdate] = useState(-1)
    const messageReferenceList = useRef(null)
    //const messageIdMap = new Map();

    const [activeThreadMessages,setActiveThreadMessages] = useState([
        { messageId:'1',messageOwner:"test",postTime:"Thurs 01-01-2009 6:00",
            imageLinks:"https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
            messageContent:"LOADING CONTENT" }
        ]
    )
    useEffect(()=>{
        getRequest(
        {
            option: 1002,
            activeThread: props.activeThread,
            currentBoard: props.currentBoard
        }).then((data)=>{
            if(data["code"]==1){
                if(data["messageList"].length > 0){
                    setActiveThreadMessages(data["messageList"])
                }
            } else{
                setErrorJSON({show:1,type:1,title:"Failed to Load",content:"Not sure what happened"})
            }
        })

        var tmpFlag = getLocalStorageItem("userSettings","flagged")
        if(tmpFlag != undefined) setThreadFlagged(tmpFlag.find((item)=> props.activeThread == item) !== undefined);
    },[props.activeThread,props.forceRefreshActive])
    useEffect(()=>{
        if(threadFlagUpdate != -1){
            var tmpFlag = getLocalStorageItem("userSettings","flagged")
            if(tmpFlag == undefined) tmpFlag = Array()

            var tmpNum = Number(props.activeThread)
            var tmpIndex = tmpFlag.indexOf(tmpNum)
            if(threadFlagged === false){
                tmpFlag.splice(tmpIndex,1)
                props.setFlagUpdateThread(tmpNum)
            } else{
                if(tmpIndex == -1){
                    tmpFlag.push(tmpNum)
                    props.setFlagUpdateThread(tmpNum)
                }
            }
            updateLocalStorage("flagged",tmpFlag)
        }
    },[threadFlagUpdate])


    function callBackFocusPost(messageId){
        const eleId = activeThreadMessages.findIndex((ele)=> ele["messageId"] === messageId)
        if(eleId >= 0){
            const tempEle = messageReferenceList.current.childNodes[eleId];
            fadeColor(tempEle)
            tempEle.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        }
    }

    const displayActiveContent = function(message,setMsgExpandOpt,setAddMessageState) {
        return (
            <div className="activeThreadContentDisplayer" key={message["messageId"]} >
                <div className='messageInfo'>
                    <div className="messageOwnerBoxCont">
                        <div className="messageOwnerBox" style={{
                            backgroundColor: message["messageOwner"] == -1 ? "white" : numToColor(message["messageOwner"],.5),
                            color: message["messageOwner"] == -1 ? "#ff00ea" : "black"
                        }}>
                            {
                                //i have no clue why i have to write it like this, cause a NaN error if i dont do this
                                message["messageOwner"] == -1 ? "buryBOT" : String((message["messageOwner"])%(1<<31)) 
                            } 
                        </div>
                    </div>
                    <div className='messageInfoRightCont'>
                        <div className='messageInfoRight'>
                            <div className='messageId'>Id:{message["messageId"]}</div>
                            <div className='messageTime'>{ 
                                //muthafucking longest jscript i ever wrote
                                ((new Date(convertTimeToJS(message["postTime"]))).toLocaleString("en-US")).replace(/:\d+ /," ").replace(/,/,"")
                            }</div>
                        </div>
                        <div className='messageOpt' onClick={()=>{
                            setMsgExpandOpt(message["messageId"])
                        }}>
                            &#8942;
                            {
                                expandMsgOpt != message["messageId"] ? <div/> :
                                <div>
                                    <div className='expandedOptCloseController' onClick={(e)=>{setMsgExpandOpt(-1);e.stopPropagation();}}/>
                                    <div className='expandedOpt'>
                                        <div className='expandedOptHeading'>
                                            Options
                                        </div>
                                        <div className="expandedOptClose">
                                            <div onClick={()=>{
                                                var userId = GetCookie("userId")
                                                var authKey = GetCookie("authKey")
                                                postRequest(
                                                {
                                                    option: 2999,
                                                    messageId: message["messageId"],
                                                    userId: userId != null ? userId : Math.floor(Math.random()*1000000000),
                                                    sessionId: authKey != null ? authKey : -1,
                                                }).then((data)=>{
                                                    if(data["code"]!=0){
                                                        /* Note: not sure what this line was for */
                                                        //setActiveThread(-1);
                                                        setErrorJSON({show:1,type:1,title:"Thanks",content:"Will Look Into the Report"})
                                                    } else {
                                                        setErrorJSON({show:1,type:1,title:"Error",content:data["msg"]})
                                                    }
                                                })
                                            }}>
                                                Report
                                            </div>
                                            <div onClick={(e)=>{
                                                //e.stopPropagation()
                                                props.setUpdateMessageBox("#"+message["messageId"])
                                            }}>Reply</div>
                                            <div onClick={(e)=>{
                                                setMsgExpandOpt(-1)
                                                e.stopPropagation()
                                            }}>Close</div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
                <div className='activeThreadBody' style={{display:(message["imageLinks"] === null ? "block" : "grid")}}>
                    { 
                    message["imageLinks"] === null ? <div className='noDisplayImageCont'/> :
                        <div className='imageContentDisplayer'>
                            <img src={message["imageLinks"]} onClick={(e)=>{
                                var gridEncap = e.target.parentNode.parentNode
                                gridEncap.style.display = (gridEncap.style.display === "grid" ?
                                    "block":"grid") 
                                //block nearest makes it so that it scrolls to the closest element that is scrollable
                                //initally was scrolling the APP causing wierd error
                                //awkward behavior when photo is really 
                                //e.target.scrollIntoView({behavior: "smooth",block:"nearest",container:document.getElementById("activeThreadConstraint")})
                                //scrollToChild(e.target,document.getElementById("activeThreadCont"))
                            }}/>
                        </div>
                    }
                    <div className='textContentDisplayer'>
                        {convertMessageIntoFormat(message["messageContent"],true,callBackFocusPost)}
                    </div> 
                </div>
            </div>
        )
    };

    

    return (
        <div id="activeThreadCont" >
            <div id="activeThreadConstraint" onClick={(e)=>{e.stopPropagation()}}>
                <div id="activeThreadTopBar">
                    <div id="activeThreadTitle">{props.threadTitle}</div>
                    <div className="activeThreadOptionCont">
                        <div className={threadFlagged == true? "activeThreadFlagOn" : "activeThreadFlagOff"} 
                            onClick={()=>{
                                setThreadFlagged(threadFlagged == true ? false: true)
                                setThreadFlagUpdate(threadFlagUpdate+1)
                            }}/>
                    </div>
                </div>
                <div ref={messageReferenceList}>
                    { activeThreadMessages.map((message)=>{
                        return displayActiveContent(message,setMsgExpandOpt)
                    })}
                </div>
                <div id="activeThreadDeadSpace" />
            </div>
        </div>
    )
}
function ThreadViewDisplay(props){
    const [threadThumb,setThreadThumb] = useState("https://media.discordapp.net/attachments/700130094844477561/961128316306350120/1610023331992.png")
    const [threadName,setThreadName] = useState("ERROR")
    const [isFlagged,setIsFlagged] = useState(false)

    useEffect(()=>{
        if(props.threadName !== undefined){
            setThreadName(props.threadName)
        }
        if(props.threadThumb !== undefined){
            setThreadThumb(props.threadThumb)    
        }
        var tmpFlag = getLocalStorageItem("userSettings","flagged")
        if(tmpFlag != undefined) setIsFlagged(tmpFlag.find((item)=> props.threadId == item) !== undefined);
    },[props.threadName,props.threadThumb])
    useEffect(()=>{
        if(props.flagUpdateThread != -1 && props.flagUpdateThread == props.threadId){
            //setFlagUpdateThread
            var tmpFlag = getLocalStorageItem("userSettings","flagged")
            if(tmpFlag != undefined) setIsFlagged(tmpFlag.find((item)=> props.threadId == item) !== undefined);
            props.setFlagUpdateThread(-1)
        }
    },[props.flagUpdateThread])

    return (
        <div className="threadThumbNail" onClick={()=>{
                props.setActiveThread(props.threadId)
                props.setActiveThreadTitle(props.threadName)
                updatePageParams({"thread":props.threadId,"title":props.threadName})
            }}>
                
            <div className="threadTitle">
                <div className='threadTitleText'>{threadName}</div>
                
            </div>
            <div className='threadBodyCont'>
                <div className='threadPermCont'><div className='threadPermInfo'>
                    { props.threadPriority <= 0 ? <div/> :
                        <PushPin fontSize="small"/>
                    }
                    { props.threadPerm <= 0 ? <div/>:
                        <Lock fontSize="small"/>
                    }
                </div></div> 
                <div className="threadImgCont">
                    <img src={threadThumb} className="threadImg"/>
                </div>
                <div className='threadPreviewCont'>
                    { convertMessageIntoFormat(props.messageContent) }
                </div>
            </div>
            <div className='threadMiscInfo'>
                {props.update_time} / {props.threadSize}
            </div>
            {isFlagged === false ? <div style={{display:"none"}}/> : 
                    <div className='activeThreadOptionCont' style={{height:"3%"}}>
                        <div className="activeThreadFlagOn" /> 
                    </div>    
                }
        </div>
    )
}

/*
webtabs
*/
function MainContentTabs(props){
    const [expandLeft,setExpandLeft] = useState(0);
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)
    
    return (
        <div id="mainContentTabs">
            <div id="mainContentTabs_left">
                <div id="showBoards" 
                    onClick={()=>{
                        setErrorJSON(
                            {show:1,type:99,
                            ele:<WebTab setCurrentBoard={props.setCurrentBoard } 
                                setActiveThreadPassthrough={props.setActiveThreadPassthrough}/>
                            })
                        }}>
                    <div>
                        ☰ Board: /{props.currentBoard}/
                    </div>
                </div>
            </div>
            <div id="mainContentTabs_right">
                <UserProfile />
                
            </div>
        </div>
    )
}
//try to use the hambruger as a css before

//fun stuff

//this function will choose one r,g,b to set to 255
//generate r based on a range of 1-255
//generate g based on a range of
function numToColor(num,lockOpacity=1){
    //if mod 3 is true then set it to a high number or something else
    var r=255,g=255,b=255;
    if(num % 3 == 0){
        g = num%255;
        b = num%100;
    }
    else if(num % 3 == 1){
        r = num%255;
        b = num%100;
    }
    else {
        r = num%255;
        g = num%100;
    }
    return "rgba("+r+","+g+","+b+","+lockOpacity+")"
}

function scrollToChild(ele, parentEle,offset=-0){
    const parentRect = parentEle.getBoundingClientRect();
    const eleRect = ele.getBoundingClientRect();
    console.log(parentRect)
    console.log(eleRect)
    const scrollTop = eleRect.top - parentRect.top + parentEle.scrollTop+offset;

    parentEle.scrollTo({
        top: 0,
        behavior: 'instant'
    })
    parentEle.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
    })
}



function convertMessageIntoFormat(message,splitMore=false,callBackFunc=null){
    var newLineList = [];
    if(message !== undefined){
        for(const str of message.split(/\n+/)){
            var merged = []
            if(splitMore === true){
                const normalText = str.split(/#[0-9]*/);
                const userReference = str.match(/#[0-9]*/g);
                if(userReference !== null){
                    for(let i = 0, j = 0; i < normalText.length; i++,j++){
                        merged.push(normalText[i])
                        if(j < userReference.length){
                            merged.push(userReference[j])
                        }
                    }
                    //console.log("normal: ", normalText,"user",userReference,"final",merged)
                } else{
                    merged = normalText
                }
            } else{
                merged.push(str)
            }
            
            newLineList.push([merged,{newLine:1,changeColor:(str[0] === "~"? true : false),}])
        }
    }
    //console.log(newLineList)
    var newEle = (
        <div>
            {newLineList.map((item,index)=>(
                <div className='textContentParagraphSplit' key={index}>
                    <div className={(item[1]["changeColor"] == true? "textContentColorChange":"")}>
                        {item[0].map((itemString,key)=>{
                            const isUserReference = (itemString[0] === "#"  && splitMore);
                            return <span key={key} onClick={()=>{
                                if(isUserReference){
                                    callBackFunc(itemString.substr(1))
                                }
                            }} className={isUserReference ? "userReferenceTextContent":""}>
                                {itemString}
                            </span>
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
    return newEle
}
function convertTimeToJS(time){
    time = time.replace(/ /,"T")
    return time+"Z";
}

function fadeColor(ele){
    ele.style.backgroundColor = "#fcffe4";
    setTimeout(()=>{
        ele.style.backgroundColor = ""
    },"1000")
}

export default MainContent