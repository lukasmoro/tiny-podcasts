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

  // Define consistent position constants
  const COLLAPSED_POSITION = -170; // Position behind the cover with handle visible
  const EXPANDED_POSITION = -410; // Position fully visible to the left of cover

  const [{ x, y, scale, opacity, zIndex, height }, api] = useSpring(() => ({
    x: COLLAPSED_POSITION,
    y: 15,
    scale: 1,
    opacity: 1,
    zIndex: 10, // Behind the cover (cover has z-index 100)
    height: '150px',
    immediate: true,
    config: { tension: 350, friction: 40 },
  }));

  useEffect(() => {
    // Apply the appropriate position based on expansion state
    api.start({
      x: isExpanded ? EXPANDED_POSITION : COLLAPSED_POSITION,
      y: 15,
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

      // If trying to drag right when in collapsed state, cancel
      if (!isExpanded && mx > 0) {
        cancel();
        return;
      }

      // If trying to drag left when in expanded state, cancel
      if (isExpanded && mx < 0) {
        cancel();
        return;
      }

      if (!last) {
        // During drag, apply the movement
        const basePosition = isExpanded
          ? EXPANDED_POSITION
          : COLLAPSED_POSITION;
        api.start({
          x: basePosition + mx,
          // Gradually increase z-index as user drags left
          zIndex: isExpanded ? 150 : mx < -50 ? 150 : 10,
        });
        return;
      }

      // On release, determine if we should snap to expanded or collapsed state
      const threshold = 100; // Pixels to determine threshold for state change

      if (isExpanded) {
        // If already expanded, check if dragged right enough to collapse
        if (mx > threshold || (dx > 0 && vx > 0.5)) {
          setIsExpanded(false);
        } else {
          // Not enough movement, return to expanded state
          api.start({ x: EXPANDED_POSITION, zIndex: 150 });
        }
      } else {
        // If collapsed, check if dragged left enough to expand
        if (mx < -threshold || (dx < 0 && vx > 0.5)) {
          setIsExpanded(true);
        } else {
          // Not enough movement, return to collapsed state
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
      {/* Add a visible handle indicator */}
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
