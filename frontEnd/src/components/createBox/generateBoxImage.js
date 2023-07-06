import React, { useState, useEffect, useRef } from 'react';
import "./generateBoxImage.css"


function UserSquare(props){
    const userSquareEle = useRef(null);
    const [userSquareChildren,setUserSquareChildren] = useState([])
    const [eleColor,setEleColor] = useState([0,0,0])
    useEffect(()=>{
        var decrypt = props.userId;
        var r = (decrypt % 1000) % 256;
        var g = ((decrypt/1000) % 1000) % 256;
        var b = ((decrypt/1000000) % 1000) % 256;
        setEleColor([r,g,b])

        var is1 = 0;
        var opacityList = [];
        for(var i = 0; i < 64; i++){
            opacityList.push( (decrypt &1) )
            if((decrypt &1) ) is1++;
            decrypt = Math.floor(decrypt/2);
        }
        setUserSquareChildren(opacityList)
    },[props.userId])

    return (
        <div id="loadingGridElement" ref={userSquareEle}
            style={{backgroundColor:"rgb("+eleColor[0]+','+eleColor[1]+','+eleColor[2]+')'}}>
        
            {userSquareChildren.map((e,i)=>(
                <div key={i} style={{backgroundColor:(e ? "transparent" : "rgba(0,0,0,.5)")}}></div>
            ))}
        </div>
    )
}

export default UserSquare