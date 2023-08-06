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

export default AbsolutePrompt