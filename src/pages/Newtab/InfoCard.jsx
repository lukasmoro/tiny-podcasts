import React, { useRef, useState, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';
import './InfoCard.css';

const InfoCard = ({ podcast }) => {
  const { episode, author, releaseDate, publisher, category, description } =
    podcast || {};
  const cardRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [{ scale, opacity, zIndex, height }, api] = useSpring(() => ({
    scale: 1,
    opacity: 1,
    zIndex: 0,
    height: '150px',
    config: { tension: 350, friction: 40 },
  }));

  useEffect(() => {
    if (isExpanded) {
      api.start({
        scale: 1,
        opacity: 1,
        zIndex: 150,
        height: '300px',
      });
    } else {
      api.start({
        scale: 1,
        opacity: 1,
        zIndex: 0,
        height: '150px',
      });
    }
  }, [isExpanded, api]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <animated.div
      ref={cardRef}
      className="info-card"
      style={{
        scale,
        opacity,
        zIndex,
        height,
      }}
    >
      <div className="info-card-content">
        <h4 className="episode-title">{episode || 'Unknown Episode'}</h4>
        <div className="info-row">
          {publisher && publisher !== author && (
            <div className="info-item">
              <span className="info-label">Publisher:</span>
              <span className="info-value">{publisher}</span>
            </div>
          )}
          {releaseDate && (
            <div className="info-item">
              <span className="info-label">Release:</span>
              <span className="info-value">{releaseDate}</span>
            </div>
          )}
          {category && (
            <div className="info-item">
              <span className="info-label">Category:</span>
              <span className="info-value">{category}</span>
            </div>
          )}
        </div>
        {isExpanded && description && (
          <div className="episode-description">
            <p>{description}</p>
          </div>
        )}
        <button className="toggle-button" onClick={toggleExpand}>
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      </div>
    </animated.div>
  );
};

export default InfoCard;
