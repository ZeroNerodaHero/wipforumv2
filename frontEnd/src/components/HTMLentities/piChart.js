import { useEffect, useState } from "react";

function PiChart(props){
    const piChartInteriorSize = "65%"
    const warningRateShow = "0.3"
    const [gradientStr,setGradientStr] = useState("conic-gradient(red 180deg,black 180deg)")
    const [elementHover,setElementHover] = useState(false)
    const [elementRate,setElementRate] = useState(0)

    useEffect(()=>{
        //this controls how much black is shown in px
        const degShadeBlackArea = 20
        const degShade = (props.value/props.maxValue)*360
        const degShadeBlock = degShade+degShadeBlackArea
        setGradientStr(
            "conic-gradient("+props.color+" 0deg "+degShade+"deg, black "+degShade+"deg "+degShadeBlock+"deg,"+props.colorBack+" "+degShadeBlock+"deg 360deg)"
        )
        setElementRate(props.value/props.maxValue)
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
            marginLeft: "5px",
            aspectRatio: "1/1",

            position: "relative"
        }} onMouseEnter={()=>{setElementHover(true)}} onMouseLeave={()=>{setElementHover(false)}}>
            <div className="piChartInterior"
                style={{
                    width: piChartInteriorSize,
                    height: piChartInteriorSize,
                    borderRadius: "100%",
                    backgroundColor: "white",
                    border: "1px black solid"
                }}
                >
            </div>
            {
                (elementHover == false && (elementRate <= warningRateShow)) ? <div /> :
                <div style={{
                    position: "absolute",
                    fontSize: "0.5rem",
                    marginRight:"3px",
                    right:"100%",
                }}>
                    {props.value+"/"+props.maxValue}
                </div>
            }
            {
                (elementRate < warningRateShow) ? <div /> :
                <div style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "red",
                    marginBottom: "2px"
                }}>!</div>
            }
        </div>
    )
}

export default PiChart