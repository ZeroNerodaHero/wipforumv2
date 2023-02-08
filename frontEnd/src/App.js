import logo from './logo.svg';
import { useState } from 'react';
import './App.css';
import MainContent from './components/mainContent/mainContent';
import WebTab from './components/webTabs/webTabs';

function App() {
  const [currentBoard,setCurrentBoard] = useState({shortHand:"h",longHand:"home"})
  return (
    <div className="App">
      <WebTab setCurrentBoard={setCurrentBoard}/>
      <div id='AppMainContent'>
        <MainContent currentBoard={currentBoard}/>
      </div>
    </div>
  );
}

export default App;
