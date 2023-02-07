import React, { useState, useEffect, useRef } from 'react';
import "./userProfile.css"

function UserProfile(){
    const [profileState, setProfileState] = useState(0)
    const [imageLnk,setImageLnk] = useState("https://media.discordapp.net/attachments/709131875117170689/1038994862214754376/1667779284776750.jpg")
    
    const changeState = ()=>{setProfileState(profileState^1); console.log("ok")}
    
    return (
        <div id="userProfileCont" onMouseEnter={changeState} onMouseLeave={changeState}>
            <img src={imageLnk} id="userProfilePic"/>
            {
                profileState == 0 ?
                <div></div>
                :
                <div id="userProfileExpanded">
                    <div id="userProfileInfoCont">
                        <div>USERNAME</div>
                        <div>USER_ID</div>
                        <div>CALL_SIGN</div>
                        <div>RESET USER_ID</div>
                    </div>
                </div>
            }
        </div>
    )
}

export default UserProfile