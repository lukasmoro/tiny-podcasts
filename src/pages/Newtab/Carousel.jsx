import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import DraggableInfoCard from './DraggableInfoCard.jsx';
import { usePodcastData } from '../../hooks/usePodcastData';
import { textTruncate } from '../../utils/textTruncate.js';
import './Carousel.css';

const Carousel = ({ isBlurVisible, handleBlurToggle, onPodcastEnd }) => {
  const { items } = usePodcastData();

  const [isLoading, setIsLoadingActive] = useState(true);
  const [activeInfoCard, setActiveInfoCard] = useState(null);

  const handleLoading = () => {
    setIsLoadingActive(false);
  };

  const loadPodcasts = () => {
    setIsLoadingActive(true);
  };

  useEffect(() => {
    loadPodcasts();

    const handleStorageChanged = (changes, area) => {
      if (area === 'local' && changes.newUrls) {
        loadPodcasts();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChanged);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChanged);
    };
  }, []);

  useEffect(() => {
    const initialLoadingTimer = setTimeout(() => {
      handleLoading();
    }, 2000);
    return () => {
      clearTimeout(initialLoadingTimer);
    };
  }, []);

  return (
    <>
      <ul
        id="parent-container"
        className={`cards ${isBlurVisible ? 'visible' : ''}`}
      >
        <div className={`loader ${isLoading ? 'active' : ''}`}>
          <li className="spacer"></li>
          {items.map(
            (podcast, index) =>
              podcast && (
                <li key={index}>
                  <div className="cover-container">
                    <div className="header-container">
                      <div className="header-content">
                        <div className="podcast-title-container">
                          <h2 className="podcast-title">
                            {textTruncate(podcast.title || 'Unknown Title', 30)}
                          </h2>
                          <StatusIndicator
                            status={podcast.status}
                            podcastID={podcast.key}
                          />
                        </div>
                        <h3 className="podcast-episode">
                          {textTruncate(podcast.episode, 45)}
                        </h3>
                      </div>
                    </div>
                    <div className="cover-mask"></div>
                    <img
                      className="cover"
                      src={podcast.image}
                      alt={podcast.title}
                    />
                    <DraggableInfoCard
                      podcast={podcast}
                      expanded={activeInfoCard === index}
                      setExpanded={(isExpanded) => {
                        setActiveInfoCard(isExpanded ? index : null);
                      }}
                    />
                    <div className="player-container">
                      <AudioPlayer
                        src={podcast.mp3}
                        podcastID={podcast.key}
                        handleClick={handleBlurToggle}
                        onEnded={onPodcastEnd}
                      />
                    </div>
                  </div>
                </li>
              )
          )}
          <li className="spacer"></li>
        </div>
      </ul>
    </>
  );
};

export default Carousel;
