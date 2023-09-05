import logo from './logo.svg';
import { useEffect, useState,useContext } from 'react';
import './App.css';
import MainContent from './components/mainContent/mainContent';
import preLoadSettings, {preLoadGetRequest} from './components/preLoad/preLoad';

import HelmetUpdateContext from './components/preLoad/helmetUpdateContext';
import HelmetUpdater from './components/preLoad/helmetUpdater';
function App() {
  const [helmetUpdate,setHelmetUpdate] = useState(0)

  useEffect(()=>{
    preLoadSettings();
  },[])

  return (
    <div className="App">
      <div id='AppMainContent'>
        <HelmetUpdateContext.Provider value={ {helmetUpdate,setHelmetUpdate} }>
          <HelmetUpdater helmetValues={helmetUpdate} />
          <MainContent/>
        </HelmetUpdateContext.Provider>
      </div>
    </div>
  );
}

export default App;

/*

      //<WebTab setCurrentBoard={setCurrentBoard}/> 
*/
