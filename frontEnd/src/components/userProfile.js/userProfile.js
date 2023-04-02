import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./rightTab.css"
import UserSquare from '../createBox/generateBoxImage';

function UserProfile(props){
    const [profileState, setProfileState] = useState(0)
    const [tabState, setTabState] = useState(0)
    const [isLogin, setLogin] = useState(0)
    const [expandedProfile, setExpandedProfile] = useState(<LoginTab setTabState={setTabState}/>)
    const changeState = ()=>{setProfileState(profileState^1)}

    useEffect(()=>{
        if(tabState == 1){
            setExpandedProfile(<LoginTab setTabState={setTabState}/>)
        } 
        else if(tabState == 2){
            setExpandedProfile(<CreateAccount setTabState={setTabState}/>)
        } 
        else if(tabState == 3){
            setExpandedProfile(<UserInfo />)
        }
    },[tabState])

    return (
        <div id="userProfileCont" onClick={changeState}>
            <div>(You)</div>
            {
                profileState == 0 ?
                <div></div>:
                <div>
                    <div onClick={(e)=>{e.stopPropagation()}}>
                        {expandedProfile}
                    </div>
                    <div id="resetRightTabUnderlay" onClick={changeState}></div>
                </div>
            }
        </div>
    );
}

function LoginTab(props){
    const [userName,setUserName] = useState("")
    const [password,setPassword] = useState("")
    return (
        <div id='userProfileExpanded'>
            <div id="userLoginCont">
                <div id="userLoginHeader">Welcome Back</div>
                <input value={userName} onChange={(e)=>{setUserName(e.target.value)}} placeholder="Username"/>
                <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password"/>
                <div id="userLoginButtonCont">
                    <div onClick={()=>{props.setTabState(2)}}>Create Account</div>
                    <div>Login</div>
                </div>
            </div>
        </div>
    )
}
function CreateAccount(props){
    const [userName,setUserName] = useState("")
    const [password,setPassword] = useState("")
    const [repassword,setRePassword] = useState("")
    return (
        <div id='userProfileExpanded'>
            <div id="userLoginCont">
                <div id="userLoginHeader">Create Account</div>
                <input value={userName} onChange={(e)=>{setUserName(e.target.value)}} placeholder="Username"/>
                <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password"/>
                <input type="password" value={repassword} onChange={(e)=>{setRePassword(e.target.value)}} placeholder="Retype Password"/>
                <div id="userLoginButtonCont">
                    <div onClick={()=>{props.setTabState(1)}}>Back</div>
                    <div onClick={()=>{
                        console.log(userName, password)
                        apiRequest("http://localhost:8070/","",
                        {
                            option: 1,
                            username: userName,
                            password: password
                        },
                        "POST").then((data)=>{
                            if(data["code"]!=0){
                                console.log("ok")
                            }
                        })
                    }}>Create Account</div>
                </div>
            </div>
        </div>
    )
}
function UserInfo(props){
    return (
        <div id="userProfileExpanded">
            <div id="userProfileInfoCont">
                <UserSquare />
                <div id='userProfileTextInfo'>
                    <div id="userProfileName">
                        <div>USERNAME</div>
                        <div>CALL_SIGN</div>
                    </div>
                    <div id="userProfileButtonCont">
                        <div>RESET USER_ID</div>
                        <div>SETTINGS</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile