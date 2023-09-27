import React, { useState, useEffect, useRef, useContext } from 'react';
import {getRequest,postRequest} from '../apiRequest/apiRequest';
import getLocalStorageItem, { updateLocalStorage } from "../cookieReader/localStorageReader"
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
import HelmetUpdateContext, {updateHelmetANDurl}  from '../preLoad/helmetUpdateContext';

import {PushPin, Lock} from "@mui/icons-material"
import {updatePageParams} from "../preLoad/preLoad"
import './messageDisplayer.css'

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
                            <div className="messageOptPointerText">&#8942;</div>
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
                                                postRequest(
                                                {
                                                    option: 2999,
                                                    messageId: message["messageId"]
                                                },true).then((data)=>{
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
    const {helmetUpdate,setHelmetUpdate} = useContext(HelmetUpdateContext)


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
                updateHelmetANDurl(updatePageParams,{"thread":props.threadId,"title":props.threadName},
                    setHelmetUpdate,helmetUpdate)
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
                {(new Date(convertTimeToJS(props.update_time))).toLocaleTimeString("en-US").replace(/:\d+ /," ").replace(/,/,"")}
                / 
                {props.threadSize}
            </div>
            {isFlagged === false ? <div style={{display:"none"}}/> : 
                    <div className='activeThreadOptionCont' style={{height:"3%",zIndex:1}}>
                        <div className="activeThreadFlagOn" /> 
                    </div>    
                }
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
/*
splitMore is used to get the # data
notes:
newline seems to be useless 
*/
function convertMessageIntoFormat(message,splitMore=false,callBackFunc=null){
    if(message == undefined){
        return (<div>ERROR LOADING MESSAGE</div>);
    }
    
    var messageTextList = splitTextIntoFormat(message);
    for(const textNodes of messageTextList){
        var textBlockSplit = []
        for(var str of textNodes.text.split(/\n+/)){
            if(str.length == 0) continue;
            if(textNodes["type"] === "code"){
                //str = str.replaceAll("    ","&nbsp;".repeat(4))
            }
            var merged = []
            if(splitMore === true){
                const normalText = str.split(/#[0-9]*/);
                const userReference = str.match(/#[0-9]*/g);
                if(userReference !== null){
                    for(let i = 0, j = 0; i < normalText.length; i++,j++){
                        //added to reduce some redudency for empty strings
                        if(normalText[i].length > 0) merged.push(normalText[i])
                        if(j < userReference.length) merged.push(userReference[j])
                    }
                } else{
                    merged = normalText
                }
            } else{
                merged.push(str)
            }
            textBlockSplit.push({text: merged, newLine:1,changeColor:(str[0] === "~"? true : false),})
        }
        textNodes["blockTextSplit"] = textBlockSplit;
    }
    console.log(messageTextList)
    var newEle = (
        <div>
            {messageTextList.map((item,index)=>{
                const msgType = item["type"], msgBlocks = item["blockTextSplit"]
                const msgClassName = msgType != undefined && msgType === "null" ? "" : "message_"+ msgType;
                return (
                    <div className={msgClassName} key={index}>
                        {msgBlocks.map((textBlocks,key)=>(
                            <div className={textBlocks["changeColor"] == true ? "textContentColorChange":""} key={key}>
                                {textBlocks["text"].map((text,ind)=>{
                                    const isUserReference = (text[0] === "#"  && splitMore);
                            
                                    return (
                                        <span key={ind} onClick={()=>{
                                            if(isUserReference){
                                                callBackFunc(text.substr(1))
                                            }
                                        }} className={isUserReference ? "userReferenceTextContent":""}>
                                            {text}
                                        </span>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                )
            })}
        </div>
    )
    return newEle
}

//no longer stack code...we will find the first position with [] and everything up until the [end]
//basically fills the firstMatchEle up then checks if it null for the end
function splitTextIntoFormat(text){
    var ret = [];

    var lastMatch = 0;
    const regex = /\[[^\]]*\]/g;
    let match;
    let firstMatchEle = null;

    while ((match = regex.exec(text)) !== null) {
        if(match[0] == "[end]" && firstMatchEle !== null){
            const topStringStart = firstMatchEle.index+firstMatchEle.match.length
            // +5 for the size of [end]
            const endStringEnd = match.index+5
            ret.push({text: text.substr(topStringStart,match.index-topStringStart),type:text.substr(firstMatchEle.index+1,firstMatchEle.match.length-2)})

            firstMatchEle = null
            lastMatch = endStringEnd

        } else if(firstMatchEle === null){
            ret.push({text: text.substr(lastMatch,match.index - lastMatch),type:"null"})
            //matchesWithIndex.push({ match: match[0], index: match.index });
            firstMatchEle = { match: match[0], index: match.index }
        }
    }
    ret.push({text:text.substr(lastMatch,text.length-lastMatch),type:"null"})

    return ret;
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

export {ActiveThreadDisplayer,ThreadViewDisplay}