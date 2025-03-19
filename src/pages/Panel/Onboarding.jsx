import React, { useEffect, useRef } from 'react';
import Recommendations from '../Newtab/Recommendations.jsx';
import Overlay from '../Newtab/Overlay.jsx';
import Searchbar from '../Options/Searchbar.jsx';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { ArrowIcon } from '../Icons/ArrowIcon.jsx';
import { PinIcon } from '../Icons/PinIcon.jsx';
import { usePodcastData } from '../../hooks/usePodcastData.js';
import './Onboarding.css';
import '../Options/List.css';
import '../../root/Root.css';

const Onboarding = () => {
  const { handleAddPodcast } = usePodcastData();
  const isMounted = useRef(true);

  // cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // safe wrapper for handleAddPodcast
  const safeHandleAddPodcast = async (podcast) => {
    if (!isMounted.current) return;

    try {
      await handleAddPodcast(podcast);
    } catch (error) {
      if (isMounted.current) {
        console.error('Error adding podcast:', error);
      }
    }
  };

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
        <ArrowIcon className="top-right-arrow" />
        <PinIcon className="pin-icon" />
        <div className="card">
          <div className="container">
            <h2 className="sub-header">Onboarding</h2>
            <h1 className="header">Welcome! Let's get started! ✨🌞✨</h1>
            <p className="instructions">
              Search podcasts or pick a recommendation below...
            </p>
            <Searchbar onSubmit={safeHandleAddPodcast} />
            <div className="recommendations-container">
              {recommendationItems.map((row, index) => (
                <Recommendations
                  key={`row-${index}`}
                  podcastID={row}
                  onAddPodcast={safeHandleAddPodcast}
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