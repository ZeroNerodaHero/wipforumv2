import { useEffect,useState } from "react";
import getLocalStorageItem,{updateLocalStorage} from '../../cookieReader/localStorageReader';
import "./webTabsSetting.css"


function SiteSettings(props){
    /*
        make site ont a left and right side
    */
    return (
        <div className='promptCont'>
            <div className="absoluteTitle">Settings</div>
            <div className="absoluteGuideContent">
                <div id="settingCont">
                    <div>
                        <SiteSettingThumbNail />
                        <SiteFontSize />
                    </div>
                    <div>
                        <SiteSettingsColor />
                    </div>
                </div>
            </div>
        </div>
    )
}
function SiteSettingThumbNail(){
    const [threadSizeValue,setThreadSizeValue] = useState(-1);
    const threadSizeAr = Array.from({length: 8}, (_, i) => i + 1)

    useEffect(()=>{
        if(getLocalStorageItem("userSettings","threadSize") != undefined){
            setThreadSizeValue(getLocalStorageItem("userSettings","threadSize") )
        } else{
            setThreadSizeValue(2);
        }
    },[])

    useEffect(()=>{
        if(threadSizeValue != -1){
            updateLocalStorage("threadSize",threadSizeValue)
            document.documentElement.style.setProperty("--thumbPerRow",threadSizeValue)
        }
    },[threadSizeValue])

    return (
        <SettingItemTemplate settingName="Threads Per Row" 
            settingEle={
                <div className='settingOptionCont'>
                    <div className='settingOptionText'>n x</div>
                    {threadSizeAr.map((item,key)=>(
                        <div className='settingOptionButtonSmol' onClick={()=>{setThreadSizeValue(item)}} key={key}
                            style={{backgroundColor:(threadSizeValue == item?"white":"#00000099")}}>
                            {item}
                        </div>
                    ))}
                </div>
            }
        />
    )
}
function SiteFontSize(props){
    const [fontSize,setFontSize] = useState("-1");
    useEffect(()=>{
        if(getLocalStorageItem("userSettings","fontSize") != undefined){
            setFontSize(getLocalStorageItem("userSettings","fontSize") )
        } else{
            setFontSize(16);
        }
    },[])

    useEffect(()=>{
        if(fontSize != -1){
            updateLocalStorage("fontSize",fontSize)
            document.documentElement.style.setProperty("font-size",fontSize+"px")
        }
    },[fontSize])

    return (
        <SettingItemTemplate settingName="Font Size:"
            settingEle= {
                <div className='settingOptionCont'>
                    <div className='settingOptionText'>{fontSize}px</div>
                    <input type="range" step={1} value={fontSize} onChange={(e)=>{setFontSize(e.target.value)}}
                        min="8" max="32"/>
                </div>
            }
        />
    )
}
function SettingItemTemplate(props){
    return (
        <div className='settingItemCont'>
            <div className='settingItemHeader'>{props.settingName}</div>
            <div className='settingOptionCont'>
                {props.settingEle}
            </div>
        </div>
    )
}

function SiteSettingsColor(){
    const colorSettings = [["Main Page","threadMainPageColor"],["Active Thread","activeThreadColor"],["Web Tab","webTabBackgroundColor"]]
    const [colorSettingValue, setColorSettingValue] = useState(
        {threadMainPageColor:getColor("threadMainPageColor"),activeThreadColor:getColor("activeThreadColor"),webTabBackgroundColor:getColor("webTabBackgroundColor")}
    )

    useEffect(()=>{
        updateLocalStorage("colors",colorSettingValue)
    },[colorSettingValue])
    //debouncer 
    var timeoutId = null;

    function updateColor(key,color){
        document.documentElement.style.setProperty("--"+key,color)
        setColorSettingValue((prevState)=>({
            ...prevState,
            [key]: color
        }))
    }
    function getColor(key){
        return getComputedStyle(document.documentElement).getPropertyValue("--"+key).trim()
    }

    return (
        <div className='settingItemBoxCont'>
            <div className="settingItemBoxContHeader">
                Color Picker
            </div>
            {
                colorSettings.map((item,key)=>(
                    <div className='settingItemCont' key={key}>
                        <div className='settingItemHeader'>{item[0]}</div>
                        <div className='colorInputCont'>
                            <div onClick={()=>{
                                updateColor(item[1],"")
                                //updateColor(item[1],getColor(item[1]))
                            }}>&#8635;</div>
                            <input type="color" 
                                onInput={(e)=>{
                                    clearTimeout(timeoutId);
                                    timeoutId = setTimeout(() => {
                                        updateColor(item[1],e.target.value)
                                    }, 300);
                                }}
                                defaultValue={colorSettingValue[item[1]]}
                            />
                        </div>
                    </div>
                ))
            }
            <div id="colorDisclaimer">
                This is a dev mainly used option. Not optimized for user usage. Will lag. Also reload after color choice.
            </div>
        </div>
    )
}

export default SiteSettings