import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./webTabs.css"

import UserProfile from '../userProfile/userProfile';


function WebTab(props){
    const [userName,setUserName] = useState("Test")
    const [boardList,setBoardList] = useState([]);
    useEffect(()=>{
        apiRequest("http://localhost:8070/","",
        {
            option: 1000
        },
        "POST").then((data)=>{
            console.log("tabs",data)
            if(data["code"] == 1){
                setBoardList(data["boardList"]);
            }
        })
    },[])
    return (
        <div id="webTabCont">
            <div id="boardTabCont">
                {boardList.map((item)=>(<BoardTab key={item["shortHand"]} 
                    shortHand={item["shortHand"]} longHand={item["longHand"]} 
                    setCurrentBoard={props.setCurrentBoard}
                />))}
            </div>
            <div>
                <UserProfile></UserProfile>
            </div>
        </div>
    )
}

function BoardTab(props){
    const [boardDisplay, setBoardDisplay] = useState(0)
    const updateBoardDisplay = ()=>{setBoardDisplay(boardDisplay ^ 1)}
    return (
        <div className='boardTab' onMouseEnter={updateBoardDisplay} onMouseLeave={updateBoardDisplay} 
            onClick={()=>{props.setCurrentBoard({shortHand:props.shortHand,longHand:props.longHand})}}>
            {boardDisplay==0 ? 
                <div className='boardTabCollapse'>
                    {props.shortHand}
                </div>
                : 
                <div className='boardTabUnCollapse'>
                    {props.longHand}
                </div>
            }
        </div>
    )
}

export default WebTab