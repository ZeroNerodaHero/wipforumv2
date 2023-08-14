import { useState } from 'react';

function BookMarkIcon(props){
    return (
        <div style={{transform:"scale(0.15)"}}>
            <div id="bookmarkRibbon" style={{
                position: "absolute",
                left: "0px",
                top: "0px",
                width: 0,

                height: "100px",
                borderRight: "50px solid black",
                borderLeft: "50px solid black",
                borderBottom: "20px solid transparent"
            }} />
            <div id="bookmarkRibbon2" style={{
                position: "absolute",
                left: "2px",
                top: "2px",
                zIndex: 2,
                width: 0,

                height: "98px",
                borderRight: "50px solid white",
                borderLeft: "50px solid white",
                borderBottom: "20px solid transparent"
            }} />
        </div>
    );
}

export default BookMarkIcon