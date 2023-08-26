import React, { useState, useEffect, useContext } from 'react';
import { getRequest,postRequest } from '../apiRequest/apiRequest';
import "./webTabs.css"
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
import getLocalStorageItem,{updateLocalStorage} from '../cookieReader/localStorageReader';



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
                        {
                            /*
                        <div id="boardTabBoardCont">
                            
                            boardList.map((item,key)=>(<BoardTab key={key} it={key}
                                shortHand={item["shortHand"]} longHand={item["longHand"]} 
                                setActiveBoard={setActiveBoard}
                            />))
                            
                        </div>
                            */
                        }
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
                    activeBoard == 0 ? 
                    <BoardPageView setCurrentBoard={props.setCurrentBoard} /> 
                    :
                    activeBoard == -1 ? 
                    <LatestPosts setCurrentBoard={props.setCurrentBoard} 
                        setActiveThreadPassthrough={props.setActiveThreadPassthrough}/> 
                    :
                    activeBoard == -2 ?
                    <SiteGuide /> 
                    :
                    activeBoard == -3 ?
                    <SiteSettings /> 
                    :
                    <div />
                }
            </div>
        </div>
    )
}
function BoardPageView(props){
    const [boardList,setBoardList] = useState([]);

    useEffect(()=>{
        getRequest(
        {
            option: 1000
        }).then((data)=>{
            if(data["code"] == 1){
                setBoardList(data["boardList"]);
            }
        })
    },[])

    return (
        <div>
            <div className='absoluteTitle'>
                Boards
            </div>
            <div className='boardTabBoardListCont'>
                {
                    boardList.map((item,key)=>(
                        <BoardPreview key={key} activeBoardInfo={boardList[key]}
                            setCurrentBoard={props.setCurrentBoard}/>
                    ))
                }
            </div>
        </div>
    )
}

function BoardPreview(props){
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    return (
        <div id="boardPreviewCont">
            <div id="boardImageHeader" style={{backgroundImage: 'url('+props.activeBoardInfo["boardImg"]+')'}}>
                /{props.activeBoardInfo["shortHand"]}/-{props.activeBoardInfo["longHand"]}
            </div>
            <div id="boardPreviewDescCont">
                <div id="boardPreviewDesc">
                    {props.activeBoardInfo["boardDesc"]}
                </div>
            </div>
            <div id='webTabButton'
                onClick={()=>{
                    props.setCurrentBoard(props.activeBoardInfo["shortHand"])
                    setErrorJSON({show:0})
                }}>
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


function SiteSettings(props){
    return (
        <div className='promptCont'>
            <div className="absoluteTitle">Settings</div>
            <div className="absoluteGuideContent">
                <div id="settingCont">
                    <SiteSettingThumbNail />
                    <SiteSettingsColor />
                </div>
            </div>
        </div>
    )
}
function SiteSettingThumbNail(){
    const [threadSizeValue,setThreadSizeValue] = useState(-1);
    const threadSizeAr = Array.from({length: 8}, (_, i) => i + 1)


    useEffect(()=>{
        if(getLocalStorageItem("userSettings","threadSize") != undefined){
            setThreadSizeValue(getLocalStorageItem("userSettings","threadSize") )
        } else{
            setThreadSizeValue(2);
        }
    },[])

    useEffect(()=>{
        if(threadSizeValue != -1){
            updateLocalStorage("threadSize",threadSizeValue)
            document.getElementById("root").style.setProperty("--thumbPerRow",threadSizeValue)
        }
    },[threadSizeValue])

    return (
        <div className='settingItemCont'>
            <div className='settingItemHeader'>Threads Per Row: </div>
            <div className='settingOptionCont'>
                <div className='settingOptionText'>n x</div>
                {threadSizeAr.map((item,key)=>(
                    <div className='settingOptionButtonSmol' onClick={()=>{setThreadSizeValue(item)}} key={key}
                        style={{backgroundColor:(threadSizeValue == item?"white":"#00000099")}}>
                        {item}
                    </div>
                ))}
            </div>
        </div>
    )
}
function SiteSettingsColor(){
    const colorSettings = [["Main Page","threadMainPageColor"],["Active Thread","activeThreadColor"],["Web Tab","webTabBackgroundColor"]]
    const [colorSettingValue, setColorSettingValue] = useState(
        {threadMainPageColor:getColor("threadMainPageColor"),activeThreadColor:getColor("activeThreadColor"),webTabBackgroundColor:getColor("webTabBackgroundColor")}
    )

    useEffect(()=>{
        updateLocalStorage("colors",colorSettingValue)
    },[colorSettingValue])
    //debouncer 
    var timeoutId = null;

    function updateColor(key,color){
        document.getElementById("root").style.setProperty("--"+key,color)
        setColorSettingValue((prevState)=>({
            ...prevState,
            [key]: color
        }))
    }
    function getColor(key){
        return getComputedStyle(document.getElementById("root")).getPropertyValue("--"+key).trim()
    }

    return (
        <div className='settingItemBoxCont'>
            <div className="settingItemBoxContHeader">
                Color Picker
            </div>
            {
                colorSettings.map((item,key)=>(
                    <div className='settingItemCont' key={key}>
                        <div className='settingItemHeader'>{item[0]}</div>
                        <div className='colorInputCont'>
                            <div onClick={()=>{updateColor(item[1],"")}}>&#8635;</div>
                            <input type="color" 
                                onInput={(e)=>{
                                    clearTimeout(timeoutId);
                                    timeoutId = setTimeout(() => {
                                        updateColor(item[1],e.target.value)
                                    }, 300);
                                }}
                                defaultValue={colorSettingValue[item[1]]}
                            />
                        </div>
                    </div>
                ))
            }
            <div id="colorDisclaimer">
                This is a dev mainly used option. Not optimized for user usage. Will lag. Also reload after color choice.
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