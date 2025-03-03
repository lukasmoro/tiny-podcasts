import React from 'react';
import List from './List';
import Overlay from '../Newtab/Overlay';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Options.css';
import './Form.css';
import '../../root/Root.css';

export default function Options() {
  return (
    <div className="App">
      <ThemeProvider>
        <Overlay />
        <div className="spacer"></div>
        <div className="cards-container">
          <div className="card left-card">
            <div className="container">
              <h2 className="sub-header">Managing Podcasts</h2>
              <h1 className="header">Options</h1>
              <p className="instructions">
                Manage podcasts here or in the pop-up window.
              </p>
              <div className="overflow">
                <List />
              </div>
              <p className="greets">Enjoy your Podcasts! 🎧</p>
            </div>
          </div>

          <div className="right-cards">
            <div className="card right-card">
              <div className="container">
                <h2 className="sub-header">Finding Podcasts</h2>
                <h1 className="header">Recommendations</h1>
                <p className="instructions">
                  Unsure where to start? Here are some favorites.
                </p>
                <div className="items"></div>
              </div>
            </div>

            <div className="card right-card">
              <div className="container">
                <h2 className="sub-header">Enjoy Podcasts?</h2>
                <h1 className="header">Support</h1>
                <p className="instructions">
                  Please consider supporting. This will help creating more tiny
                  products in the future. Thank you!
                </p>
                <div className="items">
                  <p></p>
                </div>
              </div>
            </div>
          </div>

          <p className="signature">
            Podcasts by <a href="https://lukasmoro.com">Lukas Moro</a>.
            <br />
            <a href="https://github.com/lukasmoro/podcasts-chrome-extension">
              Github
            </a>{' '}
            • <a href="">Privacy Policy</a>
          </p>
        </div>
      </ThemeProvider>
    </div>
  );
}
