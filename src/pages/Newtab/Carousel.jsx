import React, { useEffect, useState, useRef } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import DraggableInfoCard from './DraggableInfoCard.jsx';
import { usePodcastData } from '../../hooks/usePodcastData';
import { textTruncate } from '../../utils/textTruncate.js';
import './Carousel.css';

// subscribe to event
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';

const Carousel = ({ isBlurVisible, handleBlurToggle, onPodcastEnd }) => {
  const { items, handleUpdatePodcastTime, handleUpdatePodcastStatus } =
    usePodcastData();
  const cardsRef = useRef(null);

  // states
  const [isLoading, setIsLoadingActive] = useState(true);
  const [activeInfoCard, setActiveInfoCard] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // start loading
  const startLoading = () => {
    setIsLoadingActive(true);
  };

  // stop loading
  const stopLoading = () => {
    setIsLoadingActive(false);
  };

  // handle time updates
  const handleTimeUpdate = (podcastID, time) => {
    handleUpdatePodcastTime(podcastID, time);
  };

  // handle status updates
  const handleStatusUpdate = (podcastID, status) => {
    handleUpdatePodcastStatus(podcastID, status);
  };

  // handle podcast ending
  const handlePodcastEnd = (podcastID) => {
    handleUpdatePodcastTime(podcastID, 0);
    handleUpdatePodcastStatus(podcastID, 'played');
    if (onPodcastEnd) {
      onPodcastEnd();
    }
  };

  // navigate to a specific podcast card
  const navigateToCard = (index) => {
    if (cardsRef.current && items[index]) {
      const cards = cardsRef.current;
      const cardElements = cards.querySelectorAll('li:not(.spacer)');
      if (cardElements[index]) {
        cardElements[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        setActiveIndex(index);
      }
    }
  };

  // monitor scroll position to update active index
  useEffect(() => {
    const handleScroll = () => {
      if (cardsRef.current) {
        const cards = cardsRef.current;
        const cardElements = cards.querySelectorAll('li:not(.spacer)');

        const containerCenter = cards.scrollLeft + cards.clientWidth / 2;

        let closestIndex = 0;
        let minDistance = Infinity;

        cardElements.forEach((card, index) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const distance = Math.abs(containerCenter - cardCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);
      }
    };

    const cardsElement = cardsRef.current;
    if (cardsElement) {
      cardsElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (cardsElement) {
        cardsElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

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
        ref={cardsRef}
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

                        <div className="podcast-title-text">
                          <h2 className="podcast-title">
                            {textTruncate(podcast.title || 'Unknown Title', 30)}
                          </h2>
                          <h3 className="podcast-episode">
                            {textTruncate(podcast.episode, 45)}
                          </h3>
                        </div>
                        <StatusIndicator
                          status={podcast.status || 'unplayed'}
                        />
                      </div>
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
                      initialStatus={podcast.status || 'unplayed'}
                      handleClick={() => {
                        handleBlurToggle();
                      }}
                      onTimeUpdate={(podcastID, time) =>
                        handleTimeUpdate(podcastID, time)
                      }
                      onStatusUpdate={(podcastID, status) =>
                        handleStatusUpdate(podcastID, status)
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
      <div className="indicators">
        {items.map((podcast, index) => (
          <button
            key={index}
            className={`indicator ${activeIndex === index ? 'active' : ''}`}
            onClick={() => navigateToCard(index)}
            aria-label={`Go to podcast ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
};

export default Carousel;
