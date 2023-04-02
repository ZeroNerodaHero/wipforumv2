import React, { useState, useEffect, useRef, useContext } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./rightTab.css"
import UserSquare from '../createBox/generateBoxImage';
import SetCookie, {ClearCookies, GetCookie} from "../cookieReader/cookieReader"
import ErrorSetterContext from '../absolutePrompt/absolutePromptContext';

function UserProfile(props){
    const [profileState, setProfileState] = useState(0)
    const [tabState, setTabState] = useState(0)
    const [profileName,setProfileName] = useState("ERROR")
    const [expandedProfile, setExpandedProfile] = useState(<LoginTab setTabState={setTabState} setProfileName={setProfileName}/>)
    const changeState = ()=>{setProfileState(profileState^1)}

    useEffect(()=>{
        var userId = GetCookie("userId")
        var authKey = GetCookie("authKey")

        if(userId != null && authKey != null){
            apiRequest("http://localhost:8070/","",
            {
                option: 3,
                userId: userId,
                authKey: authKey
            },
            "POST").then((data)=>{
                if(data["code"]!=0){
                    setProfileName(data["username"])
                    setTabState(3)
                }
            })
        }
    },[])

    useEffect(()=>{
        if(tabState == 1){
            setExpandedProfile(<LoginTab setTabState={setTabState} setProfileName={setProfileName}/>)
        } 
        else if(tabState == 2){
            setExpandedProfile(<CreateAccount setTabState={setTabState}/>)
        } 
        else if(tabState == 3){
            setExpandedProfile(<UserInfo setTabState={setTabState} profileName={profileName}/>)
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
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

    return (
        <div id='userProfileExpanded'>
            <div id="userLoginCont">
                <div id="userLoginHeader">Welcome Back</div>
                <input value={userName} onChange={(e)=>{setUserName(e.target.value)}} placeholder="Username"/>
                <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} placeholder="Password"/>
                <div id="userLoginButtonCont">
                    <div onClick={()=>{props.setTabState(2)}}>Create Account</div>
                    <div onClick={()=>{
                        apiRequest("http://localhost:8070/","",
                        {
                            option: 2,
                            username: userName,
                            password: password
                        },
                        "POST").then((data)=>{
                            if(data["code"]!=0){
                                console.log(data)
                                SetCookie("userId",data["userId"],7);
                                SetCookie("authKey",data["authKey"],7);
                                props.setProfileName(data["username"])
                                props.setTabState(3)
                            } else{
                                setErrorJSON({error:1,title:"Failed to Login",content:data["msg"]})
                            }
                        })
                    }}>Login</div>
                </div>
            </div>
        </div>
    )
}
function CreateAccount(props){
    const [userName,setUserName] = useState("")
    const [password,setPassword] = useState("")
    const [repassword,setRePassword] = useState("")
    const {errorJSON,setErrorJSON} = useContext(ErrorSetterContext)

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
                        if(password === repassword){
                            apiRequest("http://localhost:8070/","",
                            {
                                option: 1,
                                username: userName,
                                password: password
                            },
                            "POST").then((data)=>{
                                if(data["code"]!=0){
                                    props.setTabState(1)
                                } else{
                                    setErrorJSON({error:1,title:"Failed to Create Account",content:"Server is broken or something"})
                                }
                            })
                        } else {
                            setErrorJSON({error:1,title:"Incorrect Retype",
                                content:"You did not type ur password the same. Dummy."})
                        }
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
                <UserSquare userId={GetCookie("userId")}/>
                <div id='userProfileTextInfo'>
                    <div id="userProfileName">
                        <div><b>Hello, </b> {props.profileName}</div>
                    </div>
                    <div id="userProfileButtonCont">
                        <div className="profileButton">SETTINGS</div>
                        <div className="profileButton" onClick={()=>{
                            ClearCookies();
                            props.setTabState(1)
                        }}>LOG OUT</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile