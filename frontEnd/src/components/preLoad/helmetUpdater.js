import { useContext, useEffect,useState } from 'react';
import { Helmet,HelmetProvider } from 'react-helmet-async';
import HelmetUpdateContext from './helmetUpdateContext';
import {preLoadGetRequest} from './preLoad'

function HelmetUpdater(props){
    const {helmetUpdate,setElementUpdate} = useContext(HelmetUpdateContext)
    const [titleStr,setTitleStr] = useState("schizoi.cyou")
    
    useEffect(()=>{
        var currentURL = window.location.href;
        const params = preLoadGetRequest(currentURL)
        var temp_titleStr ="";
        if(params["board"] !== undefined) temp_titleStr = "["+params["board"]+"]"
        if(params["title"] !== undefined){
            temp_titleStr += " "+params["title"]
        } 
        //temp_titleStr += " (schizoi.cyou)";
        temp_titleStr += " <SchizoICU>";
        setTitleStr(temp_titleStr)
    },[helmetUpdate])
    /*
    useEffect(()=>{
        var temp_titleStr ="";
        if(props.helmetValues["board"] !== undefined) temp_titleStr = "["+props.helmetValues["board"]+"]"
        if(props.helmetValues["title"] !== undefined){
            temp_titleStr += " "+props.helmetValues["title"]
        } 
        temp_titleStr += " (schizoi.cyou)";
        setTitleStr(temp_titleStr)
    },[props.helmetValues])
    */
    return (
        <HelmetProvider>
            <Helmet>
                <title>{titleStr}</title>
                <meta name="description" content="Welcome to schizoi.cyou"/>
            </Helmet>
        </HelmetProvider>
    )
}
export default HelmetUpdater
/*
const [helmentEle,setHelmetEle] = useState(<Helmet />)
    function handleURLtoHeader(){
        const currentURL = window.location.href
        const requestObj = preLoadGetRequest(currentURL)

        var titleStr ="";
        var metaDesc ="schizoi.cyou"

        if(requestObj["board"] !== undefined) titleStr = "["+requestObj["board"]+"]"
        if(requestObj["title"] !== undefined){
            titleStr += " "+requestObj["title"]
        } 
        titleStr += " (schizoi.cyou)";

        setHelmetEle(
            <Helmet>
            <meta name="description" content={metaDesc} />
            </Helmet>
        )
    }

*/