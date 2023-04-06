import React, { useState, useEffect, useRef, createContext,useContext } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./mainContent.css"
import UserProfile from '../userProfile.js/userProfile';
import WebTab from '../webTabs/webTabs';
import SetCookie, {ClearCookies, GetCookie} from "../cookieReader/cookieReader"
import AbsolutePrompt from '../absolutePrompt/absolutePrompt';
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';

function MainContent(props){
    const [currentBoard,setCurrentBoard] = useState({shortHand:"h",longHand:"home"})
    const [threadSearch,setThreadSearch] = useState("")
    const [errorJSON,setErrorJSON] = useState({error:0})

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
    const [threadSizeValue,setThreadSizeValue] = useState(2)
    
    useEffect(()=>{
        document.getElementById("root").style.setProperty("--sizeOfThumbNail",(93/threadSizeValue)+"vw")
    },[threadSizeValue])


    return (
    <div id='menuCont'>
        <div>
            Thread Size:
            <input type="range" min="1" max="7" step="1" 
                value={threadSizeValue}
                onChange={(e)=>{setThreadSizeValue(e.target.value)}}
                className="sliderStyle"/>
        </div>
        <div>
            Search:
            <input id="threadSearchInput" value={props.threadSearch} 
                onChange={(e)=>{props.setThreadSearch(e.target.value)}}/>
        </div>

    </div>
    )
}

function ThreadCont(props){
    const [activeThread,setActiveThread] = useState(-1);
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
        console.log("UPDATE ACTIVE",activeThread);
    },[activeThread]);
    useEffect(()=>{
        setThreadList(
            allThreads.filter((element)=>{
                return element.threadTitle.substr(0,props.threadSearch.length).toLowerCase() === props.threadSearch.toLowerCase()
        }))
    },[props.threadSearch])

    return (
        <div id='threadViewEncap'>
            <GUIcont activeThread={activeThread} setActiveThread={setActiveThread}
                currentBoard={props.currentBoard} forceUpdate={forceUpdate} refreshActive={refreshActive}/>
            {
                activeThread == -1 ? <div /> :
                <div id="activeThreadDisplay" onClick={()=>{setActiveThread(-1)}}>
                    <ActiveThreadDisplayer activeThread={activeThread}
                        forceRefreshActive={forceRefreshActive}
                        currentBoard={props.currentBoard}/>
                </div>
            }
            <div className='threadViewCont'>
                <div className='threadCont'>
                    {
                        threadList === undefined ? <div/> :
                        threadList.map((item)=>(
                        <ThreadViewDisplay setActiveThread={setActiveThread}
                            threadName={item["threadTitle"]} threadThumb={item["imageLinks"]}
                            threadId={item["threadId"]} threadSize={item["threadSize"]}
                            update_time={(new Date(item["updateTime"])).toLocaleTimeString()}
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
                    apiRequest("http://localhost:8080/","",postObject,"POST",hasImg).
                    then((data)=>{
                        console.log(data)
                        if(data["code"] == 1){
                            setAddMessageState(-1)
                            props.forceUpdate();
                            if(props.activeThread == -1){
                                setThreadTitle(""); setNewMessageContent("");
                                props.setActiveThread(data["newThreadId"]);        
                            } else{
                                setMessageContent("")
                                props.refreshActive();        
                                console.log("ok",props.activeThread)
                            }
                            setImageUpload(-1)
                            setImageTemp(0)
                        } else{
                            setErrorJSON({error:1,title:"Failed to Post",content:data["msg"]})
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

    const [activeThreadMessages,setActiveThreadMessages] = useState([
        { messageId:'1',messageOwner:"test",postTime:"Thurs 01-01-2009 6:00",
            imageLinks:"https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
            messageContent:"LOADING CONTENT" }
        ]
    )
    useEffect(()=>{
        apiRequest("http://localhost:8080/","",
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
                setErrorJSON({error:1,title:"Failed to Load",content:"Not sure what happened"})
            }
        })
    },[props.activeThread,props.forceRefreshActive])
    
    const displayActiveContent = function(message) {
        return (
            <div className="activeThreadContentDisplayer" key={message["messageId"]}>
                <div className='messageInfo'>
                    <div>{message["messageOwner"]}</div>
                    <div className='messageInfoRightCont'>
                        <div className='messageInfoRight'>
                            <div className='messageId'>Id:{message["messageId"]}</div>
                            <div className='messageTime'>{message["postTime"]}</div>
                        </div>
                        <div className='messageOpt' onClick={()=>{

                        }}>&#8942;</div>
                    </div>
                </div>
                <div className='activeThreadBody'>
                    { 
                    message["imageLinks"] == undefined ? <div /> :
                        <div className='imageContentDisplayer'>
                            <img src={message["imageLinks"]} onClick={(e)=>{
                                var gridEncap = e.target.parentNode.parentNode
                                gridEncap.style.display = (gridEncap.style.display === "" ?
                                    "block":"") 
                                e.target.scrollIntoView()
                            }}/>
                        </div>
                    }
                    <div className='textContentDisplayer'>{
                        message["messageContent"]
                }</div>
                </div>
            </div>
        )
    };

    return (
        <div id="activeThreadCont" >
            <div id="activeThreadConstraint" onClick={(e)=>{e.stopPropagation()}}>
            <div id="activeThreadTitle">{"test"}</div>
            { activeThreadMessages.map((message)=>(displayActiveContent(message)))}
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
        <div className="threadThumbNail" onClick={()=>props.setActiveThread(props.threadId)}>
            <div className="threadTitle">
                <div className='threadTitleText'>{threadName}</div>
            </div>
            <div className='threadBodyCont'>
                <div className="threadImgCont">
                    <img src={threadThumb} className="threadImg"/>
                </div>
                <div className='threadPreviewCont'>
                    {props.messageContent}
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
                 
            </div>
            <div id="mainContentTabs_right">
                <UserProfile />
                
            </div>
        </div>
    )
}
export default MainContent