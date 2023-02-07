import React, { useState, useEffect, useRef } from 'react';
import "./webTabs.css"

import UserProfile from '../userProfile/userProfile';


function WebTab(){
    const [userName,setUserName] = useState("Test")


    return (
        <div id="webTabCont">
            <div id="boardTabCont">
                <BoardTab shortHand="a" longHand="anime" />
                <BoardTab shortHand="v" longHand="video games" />
                <BoardTab shortHand="m" longHand="meta" />
                <BoardTab shortHand="m" longHand="meta" />
                <BoardTab shortHand="m" longHand="meta" />
                <BoardTab shortHand="m" longHand="meta" />    
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
        <div className='boardTab' onMouseEnter={updateBoardDisplay} onMouseLeave={updateBoardDisplay}>
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