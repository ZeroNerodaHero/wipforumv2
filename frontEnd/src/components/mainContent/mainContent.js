import React, { useState, useEffect, useRef, createContext,useContext } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./mainContent.css"
import UserProfile from '../userProfile.js/userProfile';
import WebTab from '../webTabs/webTabs';
import SetCookie, {ClearCookies, GetCookie} from "../cookieReader/cookieReader"
import getLocalStorageItem from "../cookieReader/localStorageReader"
import AbsolutePrompt from '../absolutePrompt/absolutePrompt';
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
//import { func } from 'prop-types';
import {PushPin, Lock} from "@mui/icons-material"

function MainContent(props){
    const [currentBoard,setCurrentBoard] = useState({shortHand:"h",longHand:"home"})
    const [threadSearch,setThreadSearch] = useState("")
    const [errorJSON,setErrorJSON] = useState({show:0})
    const [checkStorage,setCheckStorage] = useState(false);

    useEffect(()=>{
        if(getLocalStorageItem("userSettings","currentBoard") != undefined){
            setCurrentBoard(getLocalStorageItem("userSettings","currentBoard") )
        } else{
            setCurrentBoard({shortHand:"h",longHand:"home"});
        }
        const showHelpOnLoad = getLocalStorageItem("userSettings","showHelp");
        if(showHelpOnLoad === undefined || showHelpOnLoad === true ){
            setErrorJSON({show:1,type:2});
        }
        setCheckStorage(true);
    },[])
    useEffect(()=>{
        if(checkStorage !== false){
            var userSettings = getLocalStorageItem("userSettings");
            userSettings["currentBoard"] = currentBoard;
            localStorage.setItem("userSettings",JSON.stringify(userSettings))
        }
    },[currentBoard])

    return (
        <div id="mainContent" >
            <ErrorSetterContext.Provider value={{errorJSON,setErrorJSON}}>
                <MainContentTabs currentBoard={currentBoard} setCurrentBoard={setCurrentBoard}/>
                <div id="mainContentDisplayer">
                    <MenuBar threadSearch={threadSearch} setThreadSearch={setThreadSearch}/>
                    <ThreadCont currentBoard={currentBoard} threadSearch={threadSearch} />
                </div>
                <AbsolutePrompt prompt={errorJSON} />
            </ErrorSetterContext.Provider>
        </div>
    )
}
function MenuBar(props){
    const [threadSizeValue,setThreadSizeValue] = useState(-1);

    useEffect(()=>{
        if(getLocalStorageItem("userSettings","threadSize") != undefined){
            setThreadSizeValue(getLocalStorageItem("userSettings","threadSize") )
        } else{
            setThreadSizeValue(2);
        }
    },[])

    useEffect(()=>{
        if(threadSizeValue != -1){
            var userSettings = getLocalStorageItem("userSettings");
            userSettings["threadSize"] = threadSizeValue;
            localStorage.setItem("userSettings",JSON.stringify(userSettings))
            document.getElementById("root").style.setProperty("--sizeOfThumbNail",(93/threadSizeValue)+"vw")
        }
    },[threadSizeValue])


    return (
    <div id='menuCont'>
        <div>
            Thread&nbsp;Size:
            <input type="range" min="1" max="7" step="1" 
                value={threadSizeValue}
                onChange={(e)=>{setThreadSizeValue(e.target.value)}}
                className="sliderStyle"/>
        </div>
        <div id="menuLeftCont">
            Search:
            <input id="threadSearchInput" value={props.threadSearch} 
                onChange={(e)=>{props.setThreadSearch(e.target.value)}}/>
        </div>

    </div>
    )
}

function ThreadCont(props){
    const [activeThread,setActiveThread] = useState(-1);
    const [activeThreadTitle,setActiveThreadTitle] = useState("test");

    const [threadList, setThreadList] = useState([])
    const [allThreads,setAllThreads] = useState([])

    const [forceUpdateCnt,setForceUpdateCnt] = useState(0);
    const forceUpdate = function(){setForceUpdateCnt(forceUpdateCnt ^ 1)}
    const [forceRefreshActive,setForceRefreshActive] = useState(0)
    const refreshActive = function(){setForceRefreshActive(forceRefreshActive ^ 1)}
    
    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1001,
            currentBoard: props.currentBoard["shortHand"]
        },
        "POST").then((data)=>{
            if(data["code"]!=0){
                setThreadList(data["threadList"]);
                setAllThreads(data["threadList"]);
                /* Note: not sure what this line was for */
                //setActiveThread(-1);
            }
        })
    },[props.currentBoard,forceUpdateCnt])

    useEffect(()=>{
        setThreadList(
            allThreads.filter((element)=>{
                return element.threadTitle.substr(0,props.threadSearch.length).toLowerCase() === props.threadSearch.toLowerCase()
        }))
    },[props.threadSearch])

    return (
        <div id='threadViewEncap'>
            <GUIcont activeThread={activeThread} setActiveThread={setActiveThread} setActiveThreadTitle={setActiveThreadTitle}
                currentBoard={props.currentBoard} forceUpdate={forceUpdate} refreshActive={refreshActive}/>
            {
                activeThread == -1 ? <div /> :
                <div id="activeThreadDisplay" onClick={()=>{setActiveThread(-1)}}>
                    <ActiveThreadDisplayer activeThread={activeThread}
                        threadTitle={activeThreadTitle}
                        forceRefreshActive={forceRefreshActive}
                        currentBoard={props.currentBoard}/>
                </div>
            }
            <div className='threadViewCont'>
                <div className='threadCont'>
                    {
                        threadList === undefined ? <div/> :
                        threadList.map((item)=>(
                        <ThreadViewDisplay setActiveThread={setActiveThread} setActiveThreadTitle={setActiveThreadTitle}
                            threadName={item["threadTitle"]} threadThumb={item["imageLinks"]}
                            threadId={item["threadId"]} threadSize={item["threadSize"]}
                            threadPriority={item["threadPriority"]} threadPerm={item["permLevel"]}
                            update_time={(new Date(convertTimeToJS(item["updateTime"]))).toLocaleTimeString("en-US").replace(/:\d+ /," ").replace(/,/,"")}
                            messageContent={item["messageContent"]}
                            key={item["threadId"]}
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
    const [hoverHelp,setHoverHelp] = useState(0);

    const fileInput = useRef(null)
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    useEffect(()=>{setMessageContent("")},[props.activeThread])
    useEffect(()=>{
        if(imageUpload != "" && imageUpload[0] != null){
            setImageTemp(URL.createObjectURL(imageUpload[0]))
        }
    },[imageUpload])

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
                <div 
                    onClick={()=>{setHoverHelp(hoverHelp ^ 1)}}>
                    <div>Help</div>
                </div>
                <div id="promptSubmit" onClick={()=>{
                    var hasImg = false;

                    var userId = GetCookie("userId")
                    var authKey = GetCookie("authKey")

                    var postObject = {
                        option: (props.activeThread != -1)+2000,

                        userId: userId != null ? userId : Math.floor(Math.random()*1000000000),
                        sessionId: authKey != null ? authKey : -1,
                    };
                    if(props.activeThread == -1){
                        postObject.currentBoard = props.currentBoard["shortHand"]
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
                    apiRequest("http://localhost:8070/","",postObject,"POST",hasImg).
                    then((data)=>{
                        //console.log(data)
                        if(data["code"] == 1){
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
                            setErrorJSON({show:1,type:1,title:"Failed to Post",content:data["msg"]})
                        }
                    })
                }}>Post</div>
            </div>
            {hoverHelp == 0 ? <div></div> :
                <div>
                    <div id="submitHelpBkg" onClick={()=>{setHoverHelp(0)}} />
                    <div id='submitHelp'>
                        <div id="submitHelpTopCont">
                            <div id="submitHelpTitle">Help</div>
                            <div id="submitHelpClose"
                                onClick={()=>{setHoverHelp(0)}}>Close</div>
                        </div>
                        <div>
                            <div>For a new post, you have to post an image.</div>
                            <div>For a message, you don't have to post an image.</div>
                            <div className="help_disclaimer">
                                If you do not have an account, you cannot post images, 
                                so you cannot make new threads. But you can post 
                                text-only messages.
                            </div>
                        </div>
                    </div>
                </div>
            }
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

    const [activeThreadMessages,setActiveThreadMessages] = useState([
        { messageId:'1',messageOwner:"test",postTime:"Thurs 01-01-2009 6:00",
            imageLinks:"https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
            messageContent:"LOADING CONTENT" }
        ]
    )
    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1002,
            activeThread: props.activeThread,
            currentBoard: props.currentBoard
        },
        "POST").then((data)=>{
            if(data["code"]==1){
                if(data["messageList"].length > 0){
                    setActiveThreadMessages(data["messageList"])
                }
            } else{
                setErrorJSON({show:1,type:1,title:"Failed to Load",content:"Not sure what happened"})
            }
        })
    },[props.activeThread,props.forceRefreshActive])


    
    const displayActiveContent = function(message,setMsgExpandOpt) {
        return (
            <div className="activeThreadContentDisplayer" key={message["messageId"]} >
                <div className='messageInfo'>
                    <div className="messageOwnerBoxCont">
                        <div className="messageOwnerBox" style={{
                            backgroundColor: numToColor(message["messageOwner"],.5)
                        }}>
                            {
                                //i have no clue why i have to write it like this, cause a NaN error if i dont do this
                                String((message["messageOwner"])%(1<<31)) 
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


                                                apiRequest("http://localhost:8070/","",
                                                {
                                                    option: 2999,
                                                    messageId: message["messageId"],
                                                    userId: userId != null ? userId : Math.floor(Math.random()*1000000000),
                                                    sessionId: authKey != null ? authKey : -1,
                                                },
                                                "POST").then((data)=>{
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
                    <div className='textContentDisplayer'>{
                        convertMessageIntoFormat(message["messageContent"])
                    }</div> 
                </div>
            </div>
        )
    };

    return (
        <div id="activeThreadCont" >
            <div id="activeThreadConstraint" onClick={(e)=>{e.stopPropagation()}}>
                <div id="activeThreadTitle">{props.threadTitle}</div>
                { activeThreadMessages.map((message)=>(displayActiveContent(message,setMsgExpandOpt)))}
            </div>
        </div>
    )
}
function ThreadViewDisplay(props){
    const [threadThumb,setThreadThumb] = useState("https://media.discordapp.net/attachments/700130094844477561/961128316306350120/1610023331992.png")
    const [threadName,setThreadName] = useState("ERROR")

    useEffect(()=>{
        if(props.threadName !== undefined){
            setThreadName(props.threadName)
        }
        if(props.threadThumb !== undefined){
            setThreadThumb(props.threadThumb)    
        }
    },[props.threadName,props.threadThumb])

    return (
        <div className="threadThumbNail" onClick={()=>{
                props.setActiveThread(props.threadId)
                props.setActiveThreadTitle(props.threadName)
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
                <div id="showBoards" onMouseEnter={()=>{setExpandLeft(1)}} onMouseLeave={()=>{setExpandLeft(0)}}
                    onClick={()=>{}}>
                    <div>
                        /{props.currentBoard["shortHand"]}/-{props.currentBoard["longHand"]}
                    </div>
                    {
                    expandLeft  == 0 ? <div></div> :
                    <div id="boardExpandedCont"><WebTab setCurrentBoard={props.setCurrentBoard }/></div>
                }  
                </div>
                <div onClick={()=>{setErrorJSON({show:1,type:2,deliberate:true})}}>
                    <div>
                        Help
                    </div>
                </div>
            </div>
            <div id="mainContentTabs_right">
                <UserProfile />
                
            </div>
        </div>
    )
}

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



function convertMessageIntoFormat(message){
    var newLineList = [];
    if(message !== undefined){
        for(var str of message.split(/\n+/)){
            newLineList.push([str,{newLine:1,changeColor:(str[0] === "~"? true : false)}])
        }
    }
    //console.log(newLineList)
    var newEle = (
        <div>
            {newLineList.map((item,index)=>(
                <div className='textContentParagraphSplit' key={index}>
                    <div className={(item[1]["changeColor"] == true? "textContentColorChange":"")}>
                        {item[0]}
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

export default MainContent