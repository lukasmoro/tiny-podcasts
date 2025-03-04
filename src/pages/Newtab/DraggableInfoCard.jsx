import React, { useRef, useState, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';
import './DraggableInfoCard.css';

const DraggableInfoCard = ({ podcast }) => {
  const { episode, author, releaseDate, publisher, category, description } =
    podcast || {};
  const cardRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const COLLAPSED_POSITION = -170;
  const EXPANDED_POSITION = -410;

  const [{ x, y, scale, opacity, height }, api] = useSpring(() => ({
    x: COLLAPSED_POSITION,
    y: 30,
    scale: 1,
    opacity: 1,
    height: '150px',
    immediate: true,
    config: { tension: 350, friction: 40 },
  }));

  useEffect(() => {
    api.start({
      x: isExpanded ? EXPANDED_POSITION : COLLAPSED_POSITION,
      y: 30,
      scale: 1,
      opacity: 1,
      height: isExpanded ? '300px' : '150px',
      immediate: false,
    });
  }, [isExpanded, api]);

  const bind = useGesture({
    onDrag: ({
      event,
      movement: [mx],
      velocity: [vx],
      direction: [dx],
      last,
      cancel,
    }) => {
      event?.preventDefault();

      if (!isExpanded && mx > 0) {
        cancel();
        return;
      }

      if (isExpanded && mx < 0) {
        cancel();
        return;
      }

      if (!last) {
        const basePosition = isExpanded
          ? EXPANDED_POSITION
          : COLLAPSED_POSITION;
        api.start({
          x: basePosition + mx,
        });
        return;
      }
      const threshold = 100;

      if (isExpanded) {
        if (mx > threshold || (dx > 0 && vx > 0.5)) {
          setIsExpanded(false);
        } else {
          api.start({ x: EXPANDED_POSITION });
        }
      } else {
        if (mx < -threshold || (dx < 0 && vx > 0.5)) {
          setIsExpanded(true);
        } else {
          api.start({ x: COLLAPSED_POSITION });
        }
      }
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
        height,
        touchAction: 'none',
        cursor: 'grab',
        willChange: 'transform, opacity, height',
      }}
    >
      <div className="card-handle"></div>

      <div className="info-card-content">
        <h2 className="episode-title">{episode || 'Unknown Episode'}</h2>
        <div className="info-row">
          {publisher && publisher !== author && (
            <div className="info-item">
              <span className="info-label">Publisher: </span>
              <span className="info-value">{publisher}</span>
            </div>
          )}
          {releaseDate && (
            <div className="info-item">
              <span className="info-label">Release: </span>
              <span className="info-value">{releaseDate}</span>
            </div>
          )}
          {category && (
            <div className="info-item">
              <span className="info-label">Category: </span>
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
