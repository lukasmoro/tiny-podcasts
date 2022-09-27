import React, { useState, useEffect } from 'react';
import './Options.css';
import List from './List';

export default function Options() {
  return (
    <div className="App">
      <div className="head">
        <h2>Podcasts for Chrome</h2>
        <h1>Options</h1>
        <div className="spacer"></div>
      </div>
      <div className="card">
        <div className="container">
          <h2>Managing RSS-Feeds</h2>
          <p className="instructions">
            Add and remove up to five links to rss-feeds of your favorite
            podcasts in the list below or in the pop-up.
          </p>
          <List />
          <div className="line"></div>
          <p className="greets">
            Enjoy your podcasts and never stop learning! 🎧✨
          </p>
        </div>
      </div>
      <p className="signature">
        Podcasts by <a href="https://lukasmoro.com">Lukas Moro</a>.
        <br />
        <a href="">Github</a> • <a href="">Privacy Policy</a>
      </p>
    </div>
  );
}
