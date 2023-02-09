import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./mainContent.css"

function MainContent(props){
    return (
        <div id="mainContent" >
            <MainContentTabs currentBoard={props.currentBoard}/>
            <div id="mainContentDisplayer">
                <MenuBar />
                <ThreadCont currentBoard={props.currentBoard}/>
            </div>
        </div>
    )
}
function MenuBar(props){
    const [threadSizeValue,setThreadSizeValue] = useState(15)
    useEffect(()=>{
        document.getElementById("root").style.setProperty("--sizeOfThumbNail",threadSizeValue*10+"px")
    },[threadSizeValue])

    return (
    <div id='menuCont'>
        <div>

        </div>
        <div>
            Thread Size:
            <input type="range" min="10" max="30" step="1" 
                value={threadSizeValue}
                onChange={(e)=>{console.log(e.target.value); setThreadSizeValue(e.target.value)}}
                className="sliderStyle"/>
        </div>
    </div>
    )
}

function ThreadCont(props){
    const [activeThread,setActiveThread] = useState(-1);
    const [threadList, setThreadList] = useState([])

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
            }
        })
    },[props.currentBoard,forceUpdateCnt])
    useEffect(()=>{
        console.log("UPDATE ACTIVE",activeThread);
    },[activeThread]);

    return (
        <div id='threadViewEncap'>
            <GUIcont activeThread={activeThread} setActiveThread={setActiveThread}
                currentBoard={props.currentBoard} forceUpdate={forceUpdate} refreshActive={refreshActive}/>
            {
                activeThread == -1 ? <div /> :
                <div id="activeThreadDisplay" onClick={()=>{setActiveThread(-1)}}>
                    <ActiveThreadDisplayer activeThread={activeThread} setActiveThread={setActiveThread}
                        forceRefreshActive={forceRefreshActive}
                        currentBoard={props.currentBoard}/>
                </div>
            }
            <div className='threadViewCont'>
                <div className='threadCont'>
                    <ThreadViewDisplay setActiveThread={setActiveThread} />
                    {
                        threadList.map((item)=>(<ThreadViewDisplay setActiveThread={setActiveThread}
                            threadName={item["threadTitle"]} threadThumb={item["imageLinks"]}
                            threadId={item["threadId"]} threadSize={item["threadSize"]}
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

    useEffect(()=>{setMessageContent("")},[props.activeThread])

    const submitCont = (
        <div id="promptSubmitCont">
            <div id="promptSubmitLeftCont">
                <div>Options:</div>
                <div className="promptOption">
                    <input type="file" onChange={(e)=>{setImageUpload(Array.from(e.target.files))}} />
                </div>
                <div className="promptOption">...</div>
            </div>
            <div id="promptSubmit" onClick={()=>{
                var hasImg = false;
                var postObject = {
                    option: (props.activeThread != -1)+2000,

                    userId: -1,
                    sessionId: -1,
                };
                if(props.activeThread == -1){
                    postObject.currentBoard = props.currentBoard["shortHand"]
                    postObject.threadTitle = threadTitle;
                    postObject.messageContent = newMessageContent
                } else{
                    postObject.threadId = props.activeThread;
                    postObject.messageContent = messageContent;
                }

                console.log(postObject)
                if(imageUpload.length > 0){
                    console.log("HAS IMG")
                    hasImg = true;
                    var tmpData = new FormData();
                    for ( var key in postObject ) {
                        tmpData.append(key, postObject[key]);
                    }
                    postObject = tmpData;
                    postObject.append("messageImage",imageUpload[0])
                    console.log(postObject);
                    console.log(imageUpload[0]);
                }
                apiRequest("http://localhost:8070/","",postObject,"POST",hasImg).then((data)=>{
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
                    }
                })
            }}>Enter</div>
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
            }
        })
    },[props.activeThread,props.forceRefreshActive])
    
    const displayActiveContent = function(message) {
        return (
            <div className="activeThreadContentDisplayer" key={message["messageId"]}>
                <div className='messageInfo'>
                    <div>{message["messageOwner"]}</div>
                    <div className='messageInfoRight'>
                        <div className='messageId'>Id:{message["messageId"]}</div>
                        <div className='messageTime'>{message["postTime"]}</div>
                    </div>
                </div>
                <div className='activeThreadBody'>
                    { message["imageLinks"].length == 0 ? <div /> :
                    
                    <div className='imageContentDisplayer'>{
                        <img src={message["imageLinks"]} key={message["imageLinks"]}/>
                        /*
                        message["imageLinks"].map((imageLnk)=>(
                            <img src={imageLnk} key={imageLnk}/>
                        ))*/
                        }</div>
                    }
                    <div className='textContentDisplayer'>{
                        message["messageContent"]
                }</div>
                </div>
            </div>
        )
    };

    return (
        <div id="activeThreadCont" onClick={(e)=>{e.stopPropagation()}}>
            <div id="activeThreadTitle">{"test"}</div>
            { activeThreadMessages.map((message)=>(displayActiveContent(message)))}
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
        </div>
    )
}

function MainContentTabs(props){
    const [leftItems,setLeftItems] = useState([{name:"left_tab"}])
    const [rightItems,setRightItems] = useState([{name:"right_tab"}])

    return (
        <div id="mainContentTabs">
            <div id="mainContentTabs_left">
                <div>/{props.currentBoard["shortHand"]}/-{props.currentBoard["longHand"]}</div>
            </div>
            <div id="mainContentTabs_right">
                <div>test</div>
            </div>
        </div>
    )
}
export default MainContent