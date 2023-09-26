import React, { createContext } from "react";

const HelmetUpdateContext = createContext();
function updateHelmetANDurl(func,paramObj,setHelmetUpdate,newState){
    func(paramObj)
    setHelmetUpdate(newState+1)
}

export default HelmetUpdateContext;
export {updateHelmetANDurl}
