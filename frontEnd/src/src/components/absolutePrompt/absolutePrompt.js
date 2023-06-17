import React, { useState, useEffect, useRef, useContext } from 'react';
import "./absolutePrompt.css"

function AbsolutePrompt(props){
    const [showPrompt,setShowPrompt] = useState(0)
    useEffect(()=>{
        console.log(props.prompt)
        if(props.prompt.error !== 0){
            setShowPrompt(1)
        }
    },[props.prompt])
    return (
        <div id="absolutePromptCont">
            {
                showPrompt === 0 ? <div></div> :
                <div className="absolutePrompt" onClick={()=>{setShowPrompt(0)}}>
                    <div className="absolutePromptBoxCont">
                        <div className="absoluteTitle">{props.prompt.title}</div>
                        <div className="absoluteContent">{props.prompt.content}</div>
                    </div>
                </div>
            }
        </div>
    )
}

export default AbsolutePrompt