import React, { useState, useEffect } from 'react';
import './Options.css';
import List from './List';

export default function Options() {
  return (
    <div className="App">
      <div className="card">
        <div className="container">
          <p>Podcasts for Chrome</p>
          <h1>Options</h1>
          <p className="instructions">
            Add and remove links to rss-feeds of your favorite podcasts in the
            list here or in the pop-up. <br /> You can display up to five
            podcasts in your new tab.
          </p>
          <List />
          <p>Enjoy your podcasts! ✨</p>
        </div>
      </div>
    </div>
  );
}
