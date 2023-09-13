import React, { useState, useEffect, useContext } from 'react';
import { getRequest} from '../apiRequest/apiRequest';
import "./webTabs.css"
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
import getLocalStorageItem,{updateLocalStorage} from '../cookieReader/localStorageReader';
import SearchIcon from '@mui/icons-material/Search';

import SiteSettings from './webTabsSetting/webTabsSetting';


function WebTab(props){
    const [activeBoard,setActiveBoard] = useState(0);

    useEffect(()=>{
        if(props.type != undefined) setActiveBoard(props.type)
    },[])

    return (
        <div id="boardTab" onClick={(e)=>{e.stopPropagation()}}>
            <div id="boardTabLeft">
                <div id="boardTabContConstraint">
                    <div id="boardTabCont">
                        <div id="boardTabMiscCont">
                            <div className='boardTabItem' onClick={()=>{setActiveBoard(0)}}>Boards</div>
                            <div className='boardTabItem' onClick={()=>{setActiveBoard(-1)}}>Latest</div>
                            <div className='boardTabItem' onClick={()=>{setActiveBoard(-2)}}>Help</div>
                            <div className='boardTabItem' onClick={()=>{setActiveBoard(-3)}}>Settings</div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="boardTabRight">
                {
                    activeBoard == 0 ?  <BoardPageView setCurrentBoard={props.setCurrentBoard} /> 
                    :
                    activeBoard == -1 ?  <LatestPosts setCurrentBoard={props.setCurrentBoard} 
                        setActiveThreadPassthrough={props.setActiveThreadPassthrough}/> 
                    :
                    activeBoard == -2 ? <SiteGuide /> 
                    :
                    activeBoard == -3 ? <SiteSettings /> 
                    :
                    <div />
                }
            </div>
        </div>
    )
}
function BoardPageView(props){
    const [boardList,setBoardList] = useState([]);
    const [boardListSearch,setBoardListSearch] = useState([]);
    const [boardSearchStr,setBoardSearchStr] = useState("")

    useEffect(()=>{
        getRequest(
        {
            option: 1000
        }).then((data)=>{
            if(data["code"] == 1){
                setBoardList(data["boardList"]);
                setBoardListSearch(data["boardList"]);
            }
        })
    },[])
    useEffect(()=>{
        setBoardListSearch(
            boardList.filter((element)=>{
                if(element["shortHand"].substr(0,boardSearchStr.length).toLowerCase() === boardSearchStr.toLowerCase()) return true;
                if(element["longHand"].substr(0,boardSearchStr.length).toLowerCase() === boardSearchStr.toLowerCase()) return true;
                return false;
        }))
    }, [boardSearchStr])

    return (
        <div>
            <div className='absoluteTitle'>
                Boards
            </div>
            <div id="boardSearchBarCont">
                <div className="boardSearchBarIconCont">
                    <SearchIcon fontSize="small"/>
                </div>
                <input value={boardSearchStr} onInput={(e)=>{setBoardSearchStr(e.target.value)}}/>
            </div>
            <div className='boardTabBoardListCont'>
                {
                    boardListSearch.map((item,key)=>(
                        <BoardPreview key={key} activeBoardInfo={item}
                            setCurrentBoard={props.setCurrentBoard}/>
                    ))
                }
            </div>
        </div>
    )
}

function BoardPreview(props){
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    function changeBoard(board){
        props.setCurrentBoard(board)
        setErrorJSON({show:0})
    }

    return (
        <div className="boardPreviewCont"
        onClick={()=>{
            changeBoard(props.activeBoardInfo["shortHand"])
        }}>
            <div className="boardImageCont" style={{backgroundImage: 'url('+props.activeBoardInfo["boardImg"]+')'}}>
                <div className="boardImageTitle">
                    /{props.activeBoardInfo["shortHand"]}/-{props.activeBoardInfo["longHand"]}
                </div>
                <div className="boardPreviewDescCont">
                    <div className="boardPreviewDesc">
                        {props.activeBoardInfo["boardDesc"]}
                    </div>
                </div>
            </div>
            
            <div className='webTabButton'>
                Visit
            </div>
        </div>
    )
}

function LatestPosts(props){
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)
    const [latestPost,setLatestPost] = useState([]);

    useEffect(()=>{
        getRequest(
        {
            option: 1003
        }).then((data)=>{
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
            <div className='absoluteTitle'>
                Latest Posts
            </div>
            <div>
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
            var userSettings = getLocalStorageItem("userSettings")
            userSettings["showHelp"] = showHelp;
            localStorage.setItem("userSettings",JSON.stringify(userSettings))
        }
    },[showHelp])

    const helpText = [
        ["How do I navigate the site?",
            <div>You can navigate the site by clicking the boxes. You can change your current board by clicking the board on the upper left corner</div>
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
        ["What are the rules?",
            <div>
                <ol style={{margin:"0px",wordBreak:"break-all"}}>
                    <li><b>Not an NSFW site: </b>Plz don't post that stuff here</li>
                    <li><b>No harassment/doxxing/degenerate behavior</b></li>
                </ol>
            </div>
        ],
    ]

    return (
        <div className='promptCont' onClick={(e)=>{e.stopPropagation()}}>
            <div className="absoluteTitle">Help</div>
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