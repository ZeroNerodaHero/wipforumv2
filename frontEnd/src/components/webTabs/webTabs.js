import React, { useState, useEffect, useContext } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./webTabs.css"
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';



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
    },[])

    return (
        <div id="boardTab" onClick={(e)=>{e.stopPropagation()}}>
            <div id="boardTabLeft">
                <div className="boardTabHeader">Boards:</div>
                <div id="boardPage"></div>
                <div id="boardTabCont">
                    {boardList.map((item,key)=>(<BoardTab key={key} it={key}
                        shortHand={item["shortHand"]} longHand={item["longHand"]} 
                        setActiveBoard={setActiveBoard}
                    />))}
                </div>
            </div>
            <div id="boardTabRight">
                {
                    activeBoard == -1 ? <LatestPosts /> :
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
                //need 
                props.setActiveBoard(props.it)
            }}>
            /{props.shortHand}/-{props.longHand}
        </div>
    )
}

function LatestPosts(){
    return (
        <div>
            <div className='boardTabHeader'>
                Latest Posts
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
                <div>
                    <img id="boardPreviewImg" 
                        src=''/>
                </div>
                <div>
                    {props.activeBoardInfo["boardDesc"]}
                </div>
                <div id='webTabButton'
                    onClick={()=>{
                        props.setCurrentBoard({
                            shortHand: props.activeBoardInfo["shortHand"],
                            longHand: props.activeBoardInfo["longHand"]
                        })
                        setErrorJSON({show:0})
                    }}>
                    Visit
                </div>
            </div>
        </div>
    )
}

export default WebTab