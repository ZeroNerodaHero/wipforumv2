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
        console.log("update",threadSizeValue)
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
    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1001,
            currentBoard: props.currentBoard["shortHand"]
        },
        "POST").then((data)=>{
            console.log("threads",data)
            if(data["code"]!=0){
                setThreadList(data["threadList"]);
            }
        })
    },[props.currentBoard])
    useEffect(()=>{
        console.log(activeThread);
    },[activeThread]);

    return (
        <div id='threadViewEncap'>
            <GUIcont activeThread={activeThread} currentBoard={props.currentBoard}/>
            {
                activeThread == -1 ? <div /> :
                <div id="activeThreadDisplay" onClick={()=>{setActiveThread(-1)}}>
                    <ActiveThreadDisplayer activeThread={activeThread} setActiveThread={setActiveThread}
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
    useEffect(()=>{setMessageContent("")},[props.activeThread])
    const submitCont = (
        <div id="promptSubmitCont">
            <div id="promptSubmitLeftCont">
                <div>Options:</div>
                <div className="promptOption">+</div>
                <div className="promptOption">...</div>
            </div>
            <div id="promptSubmit" onClick={()=>{
                apiRequest("http://localhost:8070/","",
                {
                    userId: -1,
                    sessionId: -1,
                    option: (props.activeThread != -1)+2000,
                    threadId: (props.activeThread),
                    threadTitle: threadTitle,
                    newMessageContent: newMessageContent,
                    messageContent: messageContent,
                    currentBoard: props.currentBoard["shortHand"]
                },
                "POST").then((data)=>{
                    console.log(data)
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
            imageLinks:["https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
                "https://media.discordapp.net/attachments/1059546802975682652/1068679406568087672/baby-star-nosed-moles.webp"],
            messageContent:"LOADING CONTENT" },
            { messageId:'1',messageOwner:"test",postTime:"Thurs 01-01-2009 6:00",
            imageLinks:["https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
                "https://media.discordapp.net/attachments/1059546802975682652/1068679406568087672/baby-star-nosed-moles.webp"],
            messageContent:"LOADING CONTENT".repeat(1000) },{ messageId:'1',messageOwner:"test",postTime:"Thurs 01-01-2009 6:00",
            imageLinks:["https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
                "https://media.discordapp.net/attachments/1059546802975682652/1068679406568087672/baby-star-nosed-moles.webp"],
            messageContent:"LOADING CONTENT" }
        ]
    )
    const [activeThreadCont,setActiveThreadCont] = useState(<div></div>)

    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1002,
            activeThread: props.activeThread,
            currentBoard: props.currentBoard
        },
        "POST").then((data)=>{
            console.log("msg",data)
            if(data["code"]==1){
                console.log(data["messageList"])
                console.log("SIZE",data["messageList"].length )
                if(data["messageList"].length > 0){
                    setActiveThreadMessages(data["messageList"])
                }
            }
            console.log("FIN",activeThreadMessages)
        })
    },[props.activeThread])
    
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
            { console.log("test",activeThreadMessages)}
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
                    {"test ".repeat(100)}
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