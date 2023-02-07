import logo from './logo.svg';
import './App.css';

import MainContent from './components/mainContent/mainContent';
import WebTab from './components/webTabs/webTabs';

function App() {
  return (
    <div className="App">
      <WebTab />
      <div id='AppMainContent'>
        <MainContent />
      </div>
    </div>
  );
}

export default App;
