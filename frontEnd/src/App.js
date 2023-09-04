import logo from './logo.svg';
import { useEffect, useState } from 'react';
import './App.css';
import MainContent from './components/mainContent/mainContent';
import preLoadSettings from './components/preLoad/preLoad';

function App() {
  useEffect(()=>{
    preLoadSettings();
  },[])

  return (
    <div className="App">
      <div id='AppMainContent'>
        <MainContent/>
      </div>
    </div>
  );
}

export default App;

/*

      //<WebTab setCurrentBoard={setCurrentBoard}/> 
*/
