import { useContext, useEffect,useState } from 'react';
import { Helmet,HelmetProvider } from 'react-helmet-async';
import HelmetUpdateContext from './helmetUpdateContext';
import {preLoadGetRequest} from './preLoad'

function HelmetUpdater(props){
    const {helmetUpdate,setElementUpdate} = useContext(HelmetUpdateContext)
    const [titleStr,setTitleStr] = useState("nodentity.xyz")
    
    useEffect(()=>{
        var currentURL = window.location.href;
        const params = preLoadGetRequest(currentURL)
        var temp_titleStr ="";
        if(params["board"] !== undefined) temp_titleStr = "["+params["board"]+"]"
        if(params["title"] !== undefined){
            temp_titleStr += " "+params["title"]
        } 
        temp_titleStr += " <nodentity.xyz>";
        setTitleStr(temp_titleStr)
    },[helmetUpdate])

    return (
        <HelmetProvider>
            <Helmet>
                <title>{titleStr}</title>
                <meta property="description" content="test"/>
                <meta property="og:description" content="test"/>
            </Helmet>
        </HelmetProvider>
    )
}
export default HelmetUpdater