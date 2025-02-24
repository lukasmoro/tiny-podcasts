import React from 'react';
import './Options.css';
import List from './List';

export default function Options() {
  return (
    <div className="App">
      <div className="head"></div>
      <div className="card">
        <div className="container">
          <h2>Managing Podcasts</h2>
          <h1>Options</h1>
          <p className="instructions">
            Add up to 5 Podcasts in the list below or in the pop-up window.
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
    </div>
  );
}
