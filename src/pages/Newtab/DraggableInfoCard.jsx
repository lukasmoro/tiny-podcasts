import React, { useRef, useState, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';
import './InfoCard.css';

const DraggableInfoCard = ({ podcast }) => {
  const { episode, author, releaseDate, publisher, category, description } =
    podcast || {};
  const cardRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const [{ x, y, scale, opacity, zIndex, height }, api] = useSpring(() => ({
    x: -10,
    y: 0,
    scale: 1,
    opacity: 1,
    zIndex: 0,
    height: '150px',
    config: { tension: 350, friction: 40 },
  }));

  useEffect(() => {
    if (isExpanded) {
      api.start({
        x: -10,
        scale: 1,
        opacity: 1,
        zIndex: 150,
        height: '300px',
      });
    } else {
      api.start({
        x: -10,
        scale: 1,
        opacity: 1,
        zIndex: 0,
        height: '150px',
      });
    }
  }, [isExpanded, api]);

  const bind = useGesture({
    onDrag: ({ event, movement: [mx], velocity: [vx], last, cancel }) => {
      event?.preventDefault();

      if (mx > 0) {
        cancel();
        api.start({ x: 0 });
        return;
      }

      if (!last) {
        api.start({ x: mx });
        return;
      }

      if (Math.abs(vx) < 0.2) {
        api.start({ x: 0 });
        return;
      }

      setIsExpanded(!isExpanded);
    },
  });

  return (
    <animated.div
      ref={cardRef}
      className="info-card"
      {...bind()}
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex,
        height,
        touchAction: 'none',
        cursor: 'grab',
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
      </div>
    </animated.div>
  );
};

export default DraggableInfoCard;
