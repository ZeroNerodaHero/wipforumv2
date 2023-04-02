import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./webTabs.css"


function WebTab(props){
    const [boardList,setBoardList] = useState([]);
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
        <div id="boardTab">
            <div id="boardTabHeader">Boards:</div>
            <div id="boardPage"></div>
            <div id="boardTabCont">
                {boardList.map((item)=>(<BoardTab key={item["shortHand"]} 
                    shortHand={item["shortHand"]} longHand={item["longHand"]} 
                    setCurrentBoard={props.setCurrentBoard}
                />))}
            </div>
            <div id="addNewBoard">Search</div>
        </div>
    )
}

function BoardTab(props){
    return (
        <div className='boardTabItem'
            onClick={()=>{props.setCurrentBoard({shortHand:props.shortHand,longHand:props.longHand})}}>
            /{props.shortHand}/-{props.longHand}
        </div>
    )
}

export default WebTab