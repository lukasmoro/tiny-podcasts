import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import InfoCard from './InfoCard.jsx';
import { parseRss } from '../../utils/rssParser';
import useScrollPosition from '../../hooks/useScrollPosition';
import './Carousel.css';

const Carousel = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoadingActive] = useState(true);
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const { scrollPosition, indicatorIndex } = useScrollPosition(
    'parent-container',
    items.length
  );
  const [activeInfoCard, setActiveInfoCard] = useState(null);

  const handleClick = () => {
    setIsBlurVisible((prevIsBlurVisible) => !prevIsBlurVisible);
  };

  const handlePodcastEnd = () => {
    setIsBlurVisible(false);
  };

  const handleLoading = () => {
    setIsLoadingActive(false);
  };

  const handleCoverClick = (index) => {
    // Toggle info card visibility
    setActiveInfoCard(activeInfoCard === index ? null : index);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      if (!item.newUrls) {
        return;
      }

      const newUrls = item.newUrls.map((newUrl) => newUrl.text);

      Promise.all(newUrls.map((url) => fetch(url)))
        .then((responses) => Promise.all(responses.map((r) => r.text())))
        .then((xmlStrings) => {
          const firstPodcasts = xmlStrings.map(parseRss);
          setItems(firstPodcasts);
        })
        .catch((error) => console.error(error));
    });
  }, []);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      handleLoading();
    }, 2000);
    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  return (
    <div className="App">
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
                  <div className="podcast-episode">
                    <h2>{podcast.episode}</h2>
                  </div>
                  <img
                    className="cover"
                    src={podcast.image}
                    alt={podcast.title}
                    onClick={() => handleCoverClick(index)}
                  />
                  <InfoCard podcast={podcast} />
                  <div className="player-container">
                    <StatusIndicator
                      status={podcast.PLAYBACK_STATUS}
                      podcastId={`${podcast.title}-${podcast.episode}`}
                    />
                    <AudioPlayer
                      src={podcast.mp3}
                      podcastId={`${podcast.title}-${podcast.episode}`}
                      handleClick={handleClick}
                      onEnded={handlePodcastEnd}
                    />
                  </div>
                </li>
              )
          )}
          <div className={`blur ${isBlurVisible ? 'visible' : ''}`}></div>
          <li className="spacer"></li>
        </div>
      </ul>
      <span className="indicators">
        {items.map((__, index) => (
          <button
            key={index}
            className={`indicator ${index === indicatorIndex ? 'active' : ''}`}
          ></button>
        ))}
      </span>
    </div>
  );
};

export default Carousel;
