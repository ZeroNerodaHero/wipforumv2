import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import MainContent from './components/mainContent/mainContent';
import preLoadSettings,{preLoadGetRequest} from './components/preLoad/preLoad';

function App() {
  const [GETboard,setGETboard] = useState("")
  const [GETthread,setGETthread] = useState("")
  const [GETtitle,setGETtitle] = useState("")

  useEffect(()=>{
    preLoadSettings();
    preLoadGetRequest(setGETboard,setGETthread,setGETtitle)
  },[])
  return (
    <div className="App">
      <div id='AppMainContent'>
        <MainContent GETboard={GETboard} GETthread={GETthread} GETtitle={GETtitle}/>
      </div>
    </div>
  );
}

export default App;

/*

      //<WebTab setCurrentBoard={setCurrentBoard}/> 
*/
