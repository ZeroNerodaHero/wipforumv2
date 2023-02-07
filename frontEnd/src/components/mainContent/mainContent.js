import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./mainContent.css"

function MainContent(props){
    apiRequest("http://localhost:8070/").then((data)=>{
        console.log(data)
    })

    return (
        <div id="mainContent" >
            <MainContentTabs />
            <div id="mainContentDisplayer">
                <MenuBar />
                <ThreadCont/>
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
    useEffect(()=>{
        console.log(activeThread);
    },[activeThread]);

    return (
        <div id='threadViewEncap'>
            <GUIcont activeThread={activeThread}/>
            {
                activeThread == -1 ? <div /> :
                <div id="activeThreadDisplay" onClick={()=>{setActiveThread(-1)}}>
                    <ActiveThreadDisplayer setActiveThread={props.setActiveThread}/>
                </div>
            }
            <div className='threadViewCont'>
                <div className='threadCont'>
                    <ThreadViewDisplay setActiveThread={setActiveThread} />
                    <ThreadViewDisplay threadName="Hahah" setActiveThread={setActiveThread}/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                    <ThreadViewDisplay setActiveThread={setActiveThread} threadName="Hahah"/>
                </div>
            </div>
        </div>

    )

}
function GUIcont(props){
    const [addMessageState,setAddMessageState] = useState(-1);
    const [threadTitle,setThreadTitle] = useState("");
    const [messageContent,setMessageContent] = useState("");

    const submitCont = (
        <div id="promptSubmitCont">
            <div id="promptSubmitLeftCont">
                <div>Options:</div>
                <div className="promptOption">+</div>
                <div className="promptOption">...</div>
            </div>
            <div id="promptSubmit">Enter</div>
        </div>
    );
    const promptTextArea = (<textarea value={messageContent }
                            placeholder="Your Message" 
                            onChange={(e)=>{setMessageContent(e.target.value)}}/>)
    return (
        <div id="GUIcont">
            <div id="bottomRightGuiCont">
                {
                /*
                <div id='PageControlGuiCont'>
                    <div className="PageGuiButton" id='pageUpButton'>&#9650;</div>
                    <div className="PageGuiButton" id='pageDownButton'>&#9660;</div>
                </div>
                */
                }
                <div id="addMessageButton" onClick={()=>{setAddMessageState(1)}}>+</div>
            </div>
            {
                addMessageState == -1 ? <div></div> :
                <div id="newPromptCont" onClick={()=>{setAddMessageState(-1)}}>
                    
                {props.activeThread == -1? 
                    <div id="newThreadPrompt" className='newPrompt' onClick={(e)=>{e.stopPropagation()}}>
                        <div className='promptTitle'>New Thread</div>
                        <div className="promptBody">
                            <input value={threadTitle} onChange={(e)=>{setThreadTitle(e.target.value)}}
                                    placeholder="Title"/>
                            {promptTextArea}
                            {submitCont}
                        </div>
                    </div> 
                    :
                    <div id="newMessagePrompt" className='newPrompt' onClick={(e)=>{e.stopPropagation()}}>
                        <div className='promptTitle'>Add Message</div>
                        <div className="promptBody">
                            {promptTextArea}    
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
    const [activeThreadItems,setActiveThreadItems] = useState({title:"LOADING", 
        messages:[
        { id:'1',username:"test",time:"Thurs 01-01-2009 6:00",
            images:["https://media.discordapp.net/attachments/1059546802975682652/1069102672059318272/1674758387885233.jpg",
                "https://media.discordapp.net/attachments/1059546802975682652/1068679406568087672/baby-star-nosed-moles.webp"],
        content:"LOADING CONTENT" },
        { id:'2',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT".repeat(100) },
        { id:'3',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT".repeat(100) },
        { id:'4',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT".repeat(100) },
        { id:'5',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT".repeat(100) },
        { id:'6',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT" },
        { id:'7',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT" },
        { id:'8',username:"test",time:"Thurs 01-01-2009 6:00",images:[],content:"LOADING CONTENT" }
        ]
    })
    const displayActiveContent = function(message) {
        return (
            <div className="activeThreadContentDisplayer" key={message["id"]}>
                <div className='messageInfo'>
                    <div>{message["username"]}</div>
                    <div className='messageInfoRight'>
                        <div className='messageId'>Id:{message["id"]}</div>
                        <div className='messageTime'>{message["time"]}</div>
                    </div>
                </div>
                <div className='activeThreadBody'>
                    { message["images"].length == 0 ? <div /> :
                    <div className='imageContentDisplayer'>{
                        message["images"].map((imageLnk)=>(
                            <img src={imageLnk} key={imageLnk}/>
                        ))
                    }</div>
                    }
                    <div className='textContentDisplayer'>{
                        message["content"]
                }</div>
                </div>
            </div>
        )
    };

    return (
        <div id="activeThreadCont" onClick={(e)=>{e.stopPropagation()}}>
            <div id="activeThreadTitle">{activeThreadItems["title"]}</div>
            {activeThreadItems["messages"].map((message)=>(displayActiveContent(message))) }
        </div>
    )
}
function ThreadViewDisplay(props){
    const [threadThumb,setThreadThumb] = useState("https://media.discordapp.net/attachments/700130094844477561/961128316306350120/1610023331992.png")
    const [threadName,setThreadName] = useState("ERROR")
    
    useEffect(()=>{
        if(props.threadName !== undefined){
            console.log(props.threadName)
            setThreadName(props.threadName)
        }
        if(props.threadThumb !== undefined){
            setThreadThumb(props.threadThumb)    
        }
    },[props.threadName,props.threadThumb])

    return (
        <div className="threadThumbNail" onClick={()=>props.setActiveThread(1)}>
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
                <div>test</div>
            </div>
            <div id="mainContentTabs_right">
                <div>test</div>
            </div>
        </div>
    )
}
export default MainContent