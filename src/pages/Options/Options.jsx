import React, { useState, useEffect } from 'react';
import List from './List';
import Overlay from '../Newtab/Overlay';
import Recommendations from '../Newtab/Recommendations';
import BuyMeACoffeeButton from '../Newtab/BuyMeACoffeeButton';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastStorage } from '../../hooks/usePodcastStorage';
import './Options.css';
import './Form.css';
import '../../root/Root.css';

export default function Options() {
  const { items, handleAddPodcast } = usePodcastStorage();

  return (
    <div className="App">
      <ThemeProvider>
        <Overlay />
        <div className="cards-container">
          <div className="card left-card">
            <div className="container">
              <h2 className="sub-header">Manage Podcasts</h2>
              <h1 className="header">Subscriptions</h1>
              <p className="instructions">
                Manage podcasts here or in the pop-up window.
              </p>
              <div className="overflow">
                <List />
              </div>
            </div>
          </div>
          <div className="right-cards">
            <div className="card right-card">
              <div className="container">
                <h2 className="sub-header">Find Podcasts</h2>
                <h1 className="header">Recommendations</h1>
                <p className="instructions">
                  Unsure where to start? Here are some favorites.
                </p>
                <Recommendations onAddPodcast={handleAddPodcast} />
              </div>
            </div>
            <div className="card right-card">
              <div className="container">
                <h2 className="sub-header">Enjoy Podcasts?</h2>
                <h1 className="header">Tip Char</h1>
                <p className="instructions">
                  <em>Tiny Podcasts</em> is the first product of{' '}
                  <em>Tiny Software</em>. Every tip supports me to create future{' '}
                  <em>Tiny Products</em>. <br /> Thank you!
                </p>
                <BuyMeACoffeeButton />
                <div className="items">
                  <p></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
