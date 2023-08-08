import React, { useState, useEffect, useContext } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./webTabs.css"
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
import getLocalStorageItem from '../cookieReader/localStorageReader';



function WebTab(props){
    const [boardList,setBoardList] = useState([]);
    const [activeBoard,setActiveBoard] = useState(-1);

    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1000
        },
        "POST").then((data)=>{
            if(data["code"] == 1){
                setBoardList(data["boardList"]);
            }
        })
        if(props.type != undefined) setActiveBoard(props.type)
    },[])

    return (
        <div id="boardTab" onClick={(e)=>{e.stopPropagation()}}>
            <div id="boardTabLeft">
                <div className="boardTabHeader">Boards:</div>
                <div id="boardTabCont">
                    <div>
                        {boardList.map((item,key)=>(<BoardTab key={key} it={key}
                            shortHand={item["shortHand"]} longHand={item["longHand"]} 
                            setActiveBoard={setActiveBoard}
                        />))}
                    </div>
                    <div>
                        <div className='boardTabItem' onClick={()=>{setActiveBoard(-1)}}>Latest</div>
                        <div className='boardTabItem' onClick={()=>{setActiveBoard(-2)}}>Help</div>
                    </div>
                </div>
            </div>
            <div id="boardTabRight">
                {
                    activeBoard == -1 ? 
                    <LatestPosts setCurrentBoard={props.setCurrentBoard} 
                        setActiveThreadPassthrough={props.setActiveThreadPassthrough}/> 
                    :
                    activeBoard == -2 ?
                    <SiteGuide /> 
                    :
                    <BoardPreview activeBoardInfo={boardList[activeBoard]} 
                        setCurrentBoard={props.setCurrentBoard}/>
                }
            </div>
        </div>
    )
}

function BoardTab(props){
    return (
        <div className='boardTabItem'
            onClick={()=>{
                props.setActiveBoard(props.it)
            }}>
            /{props.shortHand}/-{props.longHand}
        </div>
    )
}

function LatestPosts(props){
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)
    const [latestPost,setLatestPost] = useState([]);

    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1003
        },
        "POST").then((data)=>{
            if(data["code"] == 1){
                setLatestPost(data["latestPost"]);
            }
        })
    },[])

    function latestSetPage(board,threadId,threadTitle){
        //console.log(board,threadId)
        props.setCurrentBoard(board)
        props.setActiveThreadPassthrough({"threadId":threadId,"threadTitle":threadTitle})
        setErrorJSON({show:0})
    }

    return (
        <div>
            <div className='boardTabHeader'>
                Latest Posts
            </div>
            <div>
            {
                /*
                latestPost["imagePost"] === undefined ? <div>Failed to load image messages</div>:
                <div id="latestImagePostCont">
                    <div><b>Latest Images</b></div>
                    {
                        latestPost["imagePost"].map((item,key)=>(
                            <div key={key} className="latestImagePostCont">
                                <div className='latestImageCont'>
                                    <img className='latestImage' src={item["imageLinks"]}/>
                                </div>
                            </div>
                        ))
                    }
                </div>
                */
            }
            {
                latestPost["messagePost"] === undefined ? <div>Failed to load text messages</div>:
                <div id='latestMessagePostCont'>
                {
                    latestPost["messagePost"].map((item,key)=>(
                        <div key={key} className="latestMessagePost" 
                            onClick={()=>{
                                latestSetPage(item["boardReference"],item["threadReference"],item["threadTitle"])
                            }}>
                            <div className='latestMessageHeader'>
                                <b>/{item["boardReference"]}
                                /-{item["threadTitle"]}</b>
                            </div>
                            <div className='latestMessageCont'>
                                <div>&#8627;</div>
                                <div className='latestMessageContText'>{item["messageContent"]}</div>
                            </div>
                        </div>
                    ))
                }
                </div>
            }
            </div>
        </div>
    )
}

function BoardPreview(props){
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    return (
        <div id="boardPreviewCont">
            <div className='boardTabHeader'>
                /{props.activeBoardInfo["shortHand"]}/-{props.activeBoardInfo["longHand"]}
            </div>
            <div id="boardPreviewBodyCont">
                <div id="boardPreviewImgCont">
                    <img id="boardPreviewImg" 
                        src='https://wabtec.wd1.myworkdayjobs.com/wabtec_careers/assets/banner'/>
                </div>
                <div>
                    {props.activeBoardInfo["boardDesc"]}
                </div>
                <div id='webTabButton'
                    onClick={()=>{
                        props.setCurrentBoard(props.activeBoardInfo["shortHand"])
                        setErrorJSON({show:0})
                    }}>
                    Visit
                </div>
            </div>
        </div>
    )
}

function SiteGuide(props){
    const [showHelp,setShowHelp] = useState(true)
    const [clickChange,setClickChange] = useState(false)
    useEffect(()=>{
        var tmp = getLocalStorageItem("userSettings","showHelp")
        if(tmp !== undefined) setShowHelp(tmp)
    },[])
    useEffect(()=>{
        //console.log(showHelp,showHelp===false)
        if(clickChange == true){
            var userSettings = JSON.parse(localStorage.getItem("userSettings"))
            userSettings["showHelp"] = showHelp;
            localStorage.setItem("userSettings",JSON.stringify(userSettings))
        }
    },[showHelp])

    const helpText = [
        ["How do I navigate the site?",
            "You can navigate the site by clicking the boxes. You can change your current board by clicking the board on the upper left corner"
        ],
        ["How do I create an account?",
            "Click the (you) on the upper right corner."
        ],
        ["What is the point of an account?",
            "Not much. It only makes your userId show the same for a given thread. Like a trip code"+
            "I just have it as a possible feature."
        ],
        
        ["Is this site an ip grabber?",
            'No. This site does not store your ip. '+
            'It only stores a hashed version via SHA256. '+
            'No one can computably decrypt your hashed_ip. The hashed '+
            'ip is used to ban users rather than user accounts or ips.'
        ],
    ]

    return (
        <div className='guidePromptCont' onClick={(e)=>{e.stopPropagation()}}>
            <div className="absoluteTitle">Guide</div>
            <div className="absoluteGuideContent">
                Hello, this is probably your first time on this website so i made this for you.
                Guide is WIP.
                {helpText.map((item,key)=>(
                    <HelpTextItem title={item[0]} body={item[1]} key={key}/>
                ))}
            </div>
            <div className="guideDoNotShowCont">
                <div>
                    Do Not Show Again 
                </div>
                <div>
                    <input type="checkbox" onChange={()=>{setShowHelp(showHelp === false ? true: false); setClickChange(true)}} 
                        checked={!showHelp}/>
                </div>
            </div>
        </div>
    )
}

function HelpTextItem(props){
    const [expandHelp,setExpandHelp] = useState(0)
    return (
        <div className='helpTextItemCont'>
            <div className='helpTextItemTitle' onClick={()=>{setExpandHelp(expandHelp^1)}}>
                <div>{props.title}</div>
                <div>{expandHelp == 0 ? "+":"-"}</div>
            </div>
            {expandHelp == 0 ? <div/> : 
                <div className='helpTextItemBody'>{props.body}</div>
            }
        </div>
    )
}

export default WebTab