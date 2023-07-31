import React, { useState, useEffect, useRef, useContext } from 'react';
import "./absolutePrompt.css"
import getLocalStorageItem from '../cookieReader/localStorageReader';

function AbsolutePrompt(props){
    const [showPrompt,setShowPrompt] = useState(0)
    const [promptEle,setPromptEle] = useState(<div>ERROR</div>)
    useEffect(()=>{
        //console.log(props.prompt)
        if(props.prompt.show !== 0){
            setShowPrompt(1)
            if(props.prompt.type === 1){
                setPromptEle(
                    <div className="errorPromptBoxCont">
                        <div className="absoluteTitle">{props.prompt.title}</div>
                        <div className="absoluteContent">{props.prompt.content}</div>
                    </div>
                )
            } else if(props.prompt.type == 2){
                setPromptEle(
                    <SiteGuide setShowPrompt={setShowPrompt}  
                        deliberate={props.prompt.deliberate !== undefined ? props.prompt.deliberate : false}/>
                )
            } else if(props.prompt.type == 99){
                setPromptEle(props.prompt.ele)
            }
        } else{
            setShowPrompt(0)
        }
    },[props.prompt])
    return (
        <div id="absolutePromptCont">
            {
                showPrompt === 0 ? <div></div> :
                <div className="absolutePrompt" onClick={()=>{setShowPrompt(0)}}>
                    {promptEle}
                </div>
            }
        </div>
    )
}

function SiteGuide(props){
    const [showHelp,setShowHelp] = useState(true)
    const [clickChange,setClickChange] = useState(true)
    useEffect(()=>{
        var tmp = getLocalStorageItem("userSettings","showHelp")
        if(tmp !== undefined) setShowHelp(tmp)
    },[])
    useEffect(()=>{
        var userSettings = JSON.parse(localStorage.getItem("userSettings"))
        userSettings["showHelp"] = showHelp;
        localStorage.setItem("userSettings",JSON.stringify(userSettings))

        
    },[showHelp])
    useEffect(()=>{
        console.log("ok")
        if(showHelp === false){
            props.setShowPrompt(0)
        }
    },[clickChange])

    return (
        <div className='guidePromptCont' onClick={(e)=>{e.stopPropagation()}}>
            <div className="absoluteTitle">Guide</div>
            <div className="absoluteContent">
                Guide is WIP.
                <br/>
                Hello, this is probably your first time on this website so i made this for you.
                <br/>
                You can change the board you are on by the top left corner.
                <br/>
                You can login and create an account on the top right corner. Currently, creating an account only
                makes it so that your userId is saved so that users can see that you are the owner. More features will be
                implemented.
                <br />
                On the topic about IPs. This website does log ips but it hashes it with sha256 so instead of directly storing 
                ips, a hashed version of your ip is stored. It is very hard to break your ip so stop calling this a cia 
                honeypot.
            </div>
            <div className="guideDoNotShowCont">
                <div>
                    Do Not Show Again 
                </div>
                <div>
                    <input type="checkbox" onClick={()=>{setShowHelp(showHelp === false ? true: false); setClickChange(clickChange ? false:true)}} 
                        defaultChecked={showHelp===false}/>
                </div>
            </div>
        </div>
    )
}

export default AbsolutePrompt