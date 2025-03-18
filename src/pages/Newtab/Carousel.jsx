import React, { useEffect, useState, useRef } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import StatusIndicator from './StatusIndicator.jsx';
import DraggableInfoCard from './DraggableInfoCard.jsx';
import { usePodcastData } from '../../hooks/usePodcastData';
import { textTruncate } from '../../utils/textTruncate.js';
import './Carousel.css';

// subscribe to event
const Carousel = ({ isBlurVisible, handleBlurToggle, onPodcastEnd }) => {

  //custom hook for updating podcast data
  const { items, handleUpdatePodcastTime, handleUpdatePodcastStatus } =
    usePodcastData();

  //ref holding which card is currently centered
  const cardsRef = useRef(null);
  const [spacerWidth, setSpacerWidth] = useState(0);

  // Calculate dynamic spacer width
  const calculateSpacerWidth = () => {
    if (cardsRef.current) {
      const containerWidth = cardsRef.current.clientWidth;
      const cardWidth = 400;
      const neededSpace = (containerWidth - cardWidth) / 2;
      setSpacerWidth(Math.max(0, neededSpace));
    }
  };

  // recalculate spacer width on window resize
  useEffect(() => {
    calculateSpacerWidth();
    
    const handleResize = () => {
      calculateSpacerWidth();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // center first card on initial load
  useEffect(() => {
    if (cardsRef.current && items.length > 0) {
      const cards = cardsRef.current;
      const cardElements = cards.querySelectorAll('li:not(.spacer)');
      if (cardElements[0]) {
        cardElements[0].scrollIntoView({
          behavior: 'instant',
          block: 'center',
          inline: 'center',
        });
        setActiveIndex(0);
      }
      calculateSpacerWidth();
    }
  }, [items.length]);

  // states
  const [activeInfoCard, setActiveInfoCard] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  return (
    <>
      <ul
        id="parent-container"
        className={`cards ${isBlurVisible ? 'visible' : ''}`}
        ref={cardsRef}
      >
        <li className="spacer" style={{ width: spacerWidth }}></li>
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
        <li className="spacer" style={{ width: spacerWidth }}></li>
      </ul>
      <div className={`indicators ${items.length <= 1 || isBlurVisible ? 'hidden' : ''}`}>
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
