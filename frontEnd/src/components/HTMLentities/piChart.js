import { useEffect, useState } from "react";

function PiChart(props){
    const [gradientStr,setGradientStr] = useState("conic-gradient(red 180deg,black 180deg)")
    const piChartInteriorSize = "65%"
    useEffect(()=>{
        //this controls how much black is shown in px
        const degShadeBlackArea = 20
        const degShade = (props.value/props.maxValue)*360
        const degShadeBlock = degShade+degShadeBlackArea
        setGradientStr(
            "conic-gradient("+props.color+" 0deg "+degShade+"deg, black "+degShade+"deg "+degShadeBlock+"deg,"+props.colorBack+" "+degShadeBlock+"deg 360deg)"
        )
    },[props.color,props.colorBack,props.value,props.maxValue])

    return (
        <div className="piChartCont" style={{
            width: "1.5rem",
            background: gradientStr,
            height: "1.5rem",
            borderRadius: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "5px"
        }}>
            <div className="piChartInterior"
                style={{
                    width: piChartInteriorSize,
                    height: piChartInteriorSize,
                    borderRadius: "100%",
                    backgroundColor: "white"
                }}
                >
            </div>
        </div>
    )
}

export default PiChart