import React, { useState, useEffect, useRef } from 'react';
import apiRequest from '../apiRequest/apiRequest';
import "./generateBoxImage.css"


function UserSquare(props){
    const [squareElement,setSquareElement] = useState(<div id="loadingGridElement"></div>)
    useEffect(()=>{
        var doubleSize = props.userId;
    },[])

    return (squareElement)
}

export default UserSquare