import React from 'react';
import Recommendations from '../Newtab/Recommendations.jsx';
import Overlay from '../Newtab/Overlay.jsx';
import Searchbar from '../Options/Searchbar.jsx';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastData } from '../../hooks/usePodcastData.js';
import './Onboarding.css';
import '../Options/List.css';
import '../../root/Root.css';

const Onboarding = () => {
  const { handleAddPodcast } = usePodcastData();

  // define podcast IDs for each row of recommendations
  const recommendationItems = [
    ['1200361736', '1671669052', '1528594034', '1504506097'],
    ['1028908750', '1147205326', '1516093381', '1278815517'],
    ['1686414242', '1451724425', '354668519', '81934659'],
    ['1119389968', '394775318', '1460711432', '173001861'],
  ];

  return (
    <div className="App">
      <ThemeProvider>
        <Overlay />
        <div className="card">
          <div className="container">
            <h2 className="sub-header">Onboarding</h2>
            <h1 className="header">Welcome! 👋</h1>
            <p className="instructions">
              Search a podcast or pick a recommendation...
            </p>
            <Searchbar onSubmit={handleAddPodcast} />
            <div className="recommendations-container">
              {recommendationItems.map((row, index) => (
                <Recommendations
                  key={`row-${index}`}
                  podcastID={row}
                  onAddPodcast={handleAddPodcast}
                />
              ))}
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Onboarding;
