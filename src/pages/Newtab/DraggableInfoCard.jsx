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

  const [{ x, y, scale, opacity, zIndex, height }, api] = useSpring(() => ({
    x: COLLAPSED_POSITION,
    y: 30,
    scale: 1,
    opacity: 1,
    zIndex: 10,
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
      zIndex: isExpanded ? 150 : 10,
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
          zIndex: isExpanded ? 150 : mx < -50 ? 150 : 10,
        });
        return;
      }
      const threshold = 100;

      if (isExpanded) {
        if (mx > threshold || (dx > 0 && vx > 0.5)) {
          setIsExpanded(false);
        } else {
          api.start({ x: EXPANDED_POSITION, zIndex: 150 });
        }
      } else {
        if (mx < -threshold || (dx < 0 && vx > 0.5)) {
          setIsExpanded(true);
        } else {
          api.start({ x: COLLAPSED_POSITION, zIndex: 10 });
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
        zIndex,
        height,
        touchAction: 'none',
        cursor: 'grab',
        willChange: 'transform, opacity, height, z-index',
      }}
    >
      <div className="card-handle"></div>

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
