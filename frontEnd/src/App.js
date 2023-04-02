import logo from './logo.svg';
import { useState } from 'react';
import './App.css';
import MainContent from './components/mainContent/mainContent';
import WebTab from './components/webTabs/webTabs';

function App() {
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
