import React from 'react';
import List from '../../pages/Options/List.jsx';
import Recommendations from '../Newtab/Recommendations.jsx';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastStorage } from '../../hooks/usePodcastStorage.js';
import './Onboarding.css';
import '../../root/Root.css';

export default function Onboarding() {
  const { items, handleAddPodcast } = usePodcastStorage();

  return (
    <div className="App">
      <ThemeProvider>
        <div className="card">
          <div className="container">
            <h2 className="sub-header">Onboarding</h2>
            <h1 className="header">Welcome! 👋</h1>
            <p className="instructions">
              Search a podcast or pick a recommendation...
            </p>
            <List />
            <Recommendations onAddPodcast={handleAddPodcast} />
            <Recommendations onAddPodcast={handleAddPodcast} />
            <Recommendations onAddPodcast={handleAddPodcast} />
            <Recommendations onAddPodcast={handleAddPodcast} />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
