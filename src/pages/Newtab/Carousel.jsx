import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import DraggableInfoCard from './DraggableInfoCard.jsx';
import { usePodcastData } from '../../hooks/usePodcastData';
import { textTruncate } from '../../utils/textTruncate.js';
import './Carousel.css';

// subscribe to event
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';

const Carousel = ({ isBlurVisible, handleBlurToggle, onPodcastEnd }) => {
  const { items, handleUpdatePodcastTime } = usePodcastData();

  // states
  const [isLoading, setIsLoadingActive] = useState(true);
  const [activeInfoCard, setActiveInfoCard] = useState(null);

  // start loading
  const startLoading = () => {
    setIsLoadingActive(true);
  };

  // stop loading
  const stopLoading = () => {
    setIsLoadingActive(false);
  };

  // Handler for time updates
  const handleTimeUpdate = (podcastID, time) => {
    console.log(`Carousel: Updating time for podcast ${podcastID} to ${time}`);
    handleUpdatePodcastTime(podcastID, time);
  };

  // Handle podcast ending
  const handlePodcastEnd = (podcastID) => {
    console.log(`Carousel: Podcast ${podcastID} ended, resetting time to 0`);
    handleUpdatePodcastTime(podcastID, 0);
    if (onPodcastEnd) {
      onPodcastEnd();
    }
  };

  // useEffect loading carousel on mount and when podcast data changes
  useEffect(() => {
    startLoading();

    // Log podcast items and their currentTime values when they change
    if (items.length > 0) {
      console.log('Carousel: Current podcast items with times:');
      items.forEach((item) => {
        console.log(
          `- ${item.title} (ID: ${item.key}): currentTime = ${item.currentTime}`
        );
      });
    }

    // use the podcast update event
    const updateEventHandler = () => {
      startLoading();
    };

    const loadingTimer = setTimeout(() => {
      stopLoading();
    }, 2000);

    // listen to the custom event
    window.addEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);

    return () => {
      clearTimeout(loadingTimer);
      window.removeEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);
    };
  }, []);

  return (
    <>
      <ul
        id="parent-container"
        className={`cards ${isBlurVisible ? 'visible' : ''}`}
      >
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
                      initialTime={podcast.currentTime}
                      handleClick={() => {
                        handleBlurToggle();
                      }}
                      onTimeUpdate={(podcastID, time) =>
                        handleTimeUpdate(podcastID, time)
                      }
                      onEnded={() => handlePodcastEnd(podcast.key)}
                    />
                  </div>
                </div>
              </li>
            )
        )}
        <li className="spacer"></li>
      </ul>
    </>
  );
};

export default Carousel;
