import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import MainContent from './components/mainContent/mainContent';
import preLoadSettings,{preLoadGetRequest} from './components/preLoad/preLoad';

function App() {
  const [currentURL,setCurrentUrl] = useState(window.location.href)
  const [GETboard,setGETboard] = useState("")
  const [GETthread,setGETthread] = useState("")
  const [GETtitle,setGETtitle] = useState("")

  const handleURLChange = () => {
    setCurrentUrl(window.location.href);
  };

  useEffect(()=>{
    preLoadSettings();

    // Add a popstate event listener to watch for URL changes
    window.addEventListener('popstate', handleURLChange);

    // Clean up the event listener when the component unmounts
    //not really needed bc unmount will not happen
    return () => {
      console.log("remove ")
      window.removeEventListener('popstate', handleURLChange);
    };
  },[])
  useEffect(()=>{
    console.log(currentURL)
    preLoadGetRequest(setGETboard,setGETthread,setGETtitle)
  },[currentURL])
  
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
