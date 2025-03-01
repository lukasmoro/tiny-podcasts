import React from 'react';
import List from './List';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Options.css';
import '../../root/Root.css';

export default function Options() {
  return (
    <div className="App">
      <ThemeProvider>
        <div className="spacer"></div>
        <div className="card">
          <div className="container">
            <h2 className="sub-header">Managing Podcasts</h2>
            <h1 className="header">Options</h1>
            <p className="instructions">
              Manage podcasts here or in the pop-up window.
            </p>
            <List />
            <p className="greets">Enjoy your Podcasts! 🎧</p>
          </div>
          <p className="signature">
            Podcasts by <a href="https://lukasmoro.com">Lukas Moro</a>.
            <br />
            <a href="">Github</a> • <a href="">Privacy Policy</a>
          </p>
        </div>
      </ThemeProvider>
    </div>
  );
}
