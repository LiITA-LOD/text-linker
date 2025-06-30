import type React from 'react';
import './App.css';
import Wizard from './components/Wizard';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>LiITA TextLinker</h1>
        <p>Linguistic Data Annotation Wizard</p>
      </header>
      <main className="app-main">
        <Wizard />
      </main>
    </div>
  );
};

export default App;
