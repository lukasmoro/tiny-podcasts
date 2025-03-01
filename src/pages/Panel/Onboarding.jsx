import React from 'react';
import List from '../../pages/Options/List.jsx';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Onboarding.css';
import '../../root/Root.css';

export default function Onboarding() {
  return (
    <div className="App">
      <ThemeProvider>
        <div className="spacer"></div>
        <div className="card">
          <div className="container">
            <h2 className="sub-header">Onboarding</h2>
            <h1 className="header">Hey there! 👋</h1>
            <p className="instructions">
              Happy you are here.
              <br />
              <br />
              Simply search for a podcast or pick a recommendation...
            </p>
            <List />
            <p className="greets">Enjoy your Podcasts! 🎧</p>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
