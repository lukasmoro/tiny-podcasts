import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import DraggableInfoCard from './DraggableInfoCard.jsx';
import Overlay from './Overlay.jsx';
import { parseRss } from '../../utils/rssParser';
import useScrollPosition from '../../hooks/useScrollPosition';
import './Carousel.css';

const Carousel = () => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoadingActive] = useState(true);
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const [activeInfoCard, setActiveInfoCard] = useState(null);

  const { scrollPosition, indicatorIndex } = useScrollPosition(
    'parent-container',
    items.length
  );

  const handleClick = () => {
    setIsBlurVisible((prevIsBlurVisible) => !prevIsBlurVisible);
  };

  const handlePodcastEnd = () => {
    setIsBlurVisible(false);
  };

  const handleLoading = () => {
    setIsLoadingActive(false);
  };

  useEffect(() => {
    if (isBlurVisible) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isBlurVisible]);

  useEffect(() => {
    chrome.storage.local.get(['latestPodcasts', 'newUrls'], (items) => {
      if (items.latestPodcasts && items.latestPodcasts.length > 0) {
        setItems(items.latestPodcasts);
      } else if (items.newUrls) {
        const newUrls = items.newUrls.map((newUrl) => newUrl.text);
        Promise.all(newUrls.map((url) => fetch(url)))
          .then((responses) => Promise.all(responses.map((r) => r.text())))
          .then((xmlStrings) => {
            const firstPodcasts = xmlStrings.map(parseRss);
            setItems(firstPodcasts);
          })
          .catch((error) => console.error(error));
      }
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
        <Overlay />
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
                            {podcast.title.length > 30
                              ? `${podcast.title.substring(0, 30)}...`
                              : podcast.title}
                          </h2>
                          <StatusIndicator
                            status={podcast.PLAYBACK_STATUS}
                            podcastId={`${podcast.title}-${podcast.episode}`}
                          />
                        </div>
                        <h3 className="podcast-episode">
                          {podcast.episode.length > 45
                            ? `${podcast.episode.substring(0, 45)}...`
                            : podcast.episode}
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
                      setExpanded={setActiveInfoCard}
                    />
                    <div className="player-container">
                      <AudioPlayer
                        src={podcast.mp3}
                        podcastId={`${podcast.title}-${podcast.episode}`}
                        handleClick={handleClick}
                        onEnded={handlePodcastEnd}
                      />
                    </div>
                  </div>
                </li>
              )
          )}
          <div className={`blur ${isBlurVisible ? 'visible' : ''}`}></div>
          <li className="spacer"></li>
        </div>
      </ul>
      {items.length > 1 && (
        <span className="indicators">
          {items.map((__, index) => (
            <button
              key={index}
              className={`indicator ${
                index === indicatorIndex ? 'active' : ''
              }`}
            ></button>
          ))}
        </span>
      )}
    </div>
  );
};

export default Carousel;
