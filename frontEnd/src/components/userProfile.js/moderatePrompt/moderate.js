import React, { useState, useEffect, useRef, useContext } from 'react';
import apiRequest from '../../apiRequest/apiRequest';
import SetCookie, {ClearCookies, GetCookie} from '../../cookieReader/cookieReader';
import ErrorSetterContext from '../../absolutePrompt/absolutePromptContext';
import "./moderate.css"

function ModeratePrompt(props){
    return (
        <div id="moderatePromptCont" onClick={()=>{props.toggleModerate()}}>
            <div id="moderatePrompt" onClick={(e)=>{e.stopPropagation()}}>
                <div id="moderatePromptConstraint">
                    <div id="siteStats">
                        <PostStats />
                        <BoardStats />
                    </div>
                    <ModeratePosts />
                    <ModerateUsers />
                </div>
            </div>
        </div>
    );
}

function PostStats(props){
    return (
        <div id="postStats" className='statBox'>
            <div className='statsPaddingBox'>
                <div className='moderateHeader'>Post Summary</div>
                
            </div>
        </div>
    );
}
function BoardStats(props){
    return (
        <div id="boardStats" className='statBox'>
            <div className='statsPaddingBox'>
                <div className='moderateHeader'>Board Summary</div>
            </div>
        </div>
    );
}
function ModeratePosts(props){
    const [reportList,setReportList] = useState([]);
    useEffect(()=>{
        var userId = GetCookie("userId")
        var authKey = GetCookie("authKey")
        apiRequest("http://localhost:8070/","",
        {
            option: 9002,
            userId: userId,
            authKey: authKey
        },
        "POST").then((data)=>{
            if(data["code"]!=0){
                /* Note: not sure what this line was for */
                //setActiveThread(-1);
                console.log(data)
            } else{
                console.log("failed ",data)
            }
        })
    },[])

    return (
        <div id="moderatePosts" className='moderateBox'>
            <div className='moderatePaddingBox'>
                <div className='moderateHeader'>Moderate Posts</div>
                <div className="statsTableCont">
                    <div className='statsTable'>
                    </div>
                </div>
            </div>
        </div>
    );
}
function ModerateUsers(props){
    return (
        <div id="moderateUsers" className='moderateBox'>
            <div className='moderatePaddingBox'>
                <div className='moderateHeader'>Moderate Users</div>
                <div className="statsTableCont">
                    <div className='statsTable'>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                        <div>a</div><div>a</div><div>a</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModeratePrompt