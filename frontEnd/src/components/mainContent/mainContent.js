import React, { useState, useEffect, useRef, useContext } from 'react';
import {getRequest,postRequest} from '../apiRequest/apiRequest';
import "./mainContent.css";
import getLocalStorageItem, { updateLocalStorage } from "../cookieReader/localStorageReader"
//import { func } from 'prop-types';

import {PushPin, Lock} from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import {preLoadGetRequest, updatePageParams, clearPageParams} from "../preLoad/preLoad"


import UserProfile from '../userProfile.js/userProfile';
import WebTab from '../webTabs/webTabs';
import { ThreadViewDisplay, ActiveThreadDisplayer } from '../messageDisplayer/messageDisplayer';
import AbsolutePrompt from '../absolutePrompt/absolutePrompt';
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';
import HelmetUpdateContext, {updateHelmetANDurl}  from '../preLoad/helmetUpdateContext';
import PiChart from '../HTMLentities/piChart';

function MainContent(props){
    const [currentBoard,setCurrentBoard] = useState(-1)
    const [threadSearch,setThreadSearch] = useState("")
    const [errorJSON,setErrorJSON] = useState({show:0})
    const [checkStorage,setCheckStorage] = useState(false);
    const [activeThreadPassthrough,setActiveThreadPassthrough] = useState(-1);
    const {helmetUpdate,setHelmetUpdate} = useContext(HelmetUpdateContext)


    //const [currentURL,setCurrentUrl] = useState(window.location.href)
    //returns false if url causes a change...this will prevent a double api call
    const handleURLChange = () => {
        //setCurrentUrl(window.location.href);
        const currentURL = window.location.href
        const requestObj = preLoadGetRequest(currentURL)

        if(requestObj["title"] !== undefined && requestObj["thread"] !== undefined){
            setActiveThreadPassthrough({threadId:requestObj["thread"],threadTitle:requestObj["title"]})
        } else{
            setActiveThreadPassthrough({threadId:-1,threadTitle:requestObj["title"]})
        }
        if(requestObj["board"] !== undefined) setCurrentBoard(requestObj["board"])
        else return false
        return true
    };

    useEffect(()=>{
        if(handleURLChange() == false){
            var tmpBoard = getLocalStorageItem("userSettings","currentBoard") 
            if(tmpBoard != undefined && typeof(tmpBoard) === "string"){
                setCurrentBoard(tmpBoard )
            } else{
                setCurrentBoard("h");
            }
        }

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

        window.addEventListener('popstate', handleURLChange);
        return () => {
            window.removeEventListener('popstate', handleURLChange);
        };
    },[])
    
    useEffect(()=>{
        if(currentBoard != -1 && checkStorage !== false){
            var userSettings = getLocalStorageItem("userSettings");
            userSettings["currentBoard"] = currentBoard;
            localStorage.setItem("userSettings",JSON.stringify(userSettings))
            updateHelmetANDurl(updatePageParams,{"board":currentBoard},
                setHelmetUpdate,helmetUpdate)
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
            <div id="menuRightCont">
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

    const {helmetUpdate,setHelmetUpdate} = useContext(HelmetUpdateContext)
    
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

            if(props.activeThreadPassthrough["threadId"] != -1){
                updateHelmetANDurl(updatePageParams,
                    {"thread":props.activeThreadPassthrough["threadId"],"title":props.activeThreadPassthrough["threadTitle"]},
                    setHelmetUpdate,helmetUpdate)
            }
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
                    updateHelmetANDurl(clearPageParams,["thread","title"],
                        setHelmetUpdate,helmetUpdate)
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
                            update_time={item["updateTime"]}
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
    const maxThreadTitle = 100
    const maxThreadText = 1500
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
        } else{
            setImageTemp(0)
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

    function managePostSubmit(){
        var hasImg = false;
        var postObject = {
            option: (props.activeThread != -1)+2000,
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
        postRequest(postObject,true,hasImg).
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
    }
    function capInputSize(value,maxSize){
        return value.length < maxSize;
    }

    const submitCont = (
        <div id="promptSubmitCont">
            <div id="promptOptCont">
                <div id="promptOptionList">
                    <div id="promptAddImageHeading"><b>Image:</b></div>
                    <div className="promptOption">
                        <div id="image_buttonPlaceHolder">
                            <div id="imageAddChangeButton" onClick={()=>{fileInput.current.click()}}>
                                <div className="imageSuggestText">{imageTemp == 0 ? "Add":"Change"}</div>
                                {imageTemp == 0 ? 
                                    <div id='uploadDummyImage'>+</div>
                                    :
                                    <img id="uploadedImageIcon" src={imageTemp} />
                                }
                            </div>
                            {imageTemp == 0 ? <div style={{display:"none"}} /> :
                                <div id="image_buttonRemoveFileButton" onClick={()=>{
                                    fileInput.current.value = null
                                    setImageUpload("")
                                }}>
                                    &#10005;
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
                <div id="promptSubmit" className="noselect" onClick={()=>{managePostSubmit()}}>Post</div>
            </div>
        </div>
    );
    const promptTextArea = function(content,setContent)
    {
        return (
            <div className='textAreaCont'>
                <textarea value={content} placeholder="Your Message" onChange={(e)=>{
                    var newThreadVal = e.target.value
                    if(capInputSize(newThreadVal,maxThreadText)){
                        setContent(e.target.value)
                    }
                }}/>
                <div style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px"
                }}>
                    <PiChart color="red" colorBack="grey" value={content.length} maxValue={maxThreadText}/>
                </div>
            </div>
        )
    }
    return (
        <div id="GUIcont">
            <div id="bottomRightGuiCont">
                <div id="addMessageButton" onClick={()=>{setAddMessageState(1)}}>+</div>
            </div>
            {
                addMessageState == -1 ? <div></div> :
                <div id="newPromptCont" onClick={()=>{setAddMessageState(-1);}}>
                    
                {props.activeThread == -1? 
                    <div id="newThreadPrompt" className='newPrompt' onClick={(e)=>{e.stopPropagation()}}>
                        <div className="promptPaddingCont"><div className='promptTitle'>New Thread</div></div>
                        <div className="promptBodyPaddingCont">
                            <div className="promptBody">
                                <div className='promptTitleCont'>
                                    <input value={threadTitle} onChange={(e)=>{setThreadTitle(e.target.value)}}
                                            placeholder="Title"/>
                                    <PiChart color="red" colorBack="grey" value={threadTitle.length} maxValue={maxThreadTitle}/>
                                </div>
                                
                                {promptTextArea(newMessageContent,setNewMessageContent)}
                                {submitCont}
                            </div>
                        </div>
                    </div> 
                    :
                    <div id="newMessagePrompt" className='newPrompt' onClick={(e)=>{e.stopPropagation()}}>
                        <div className="promptPaddingCont"><div className='promptTitle'>Add Message</div></div>
                        <div className="promptBodyPaddingCont">
                            <div className="promptBody">
                                {promptTextArea(messageContent,setMessageContent)}
                                {submitCont}
                            </div>
                        </div>
                    </div>
                }
                </div>
            }
        </div>
    );
}


/*
webtabs
*/
function MainContentTabs(props){
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
                    <div id="mainContentTabPointerText">
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

export default MainContent