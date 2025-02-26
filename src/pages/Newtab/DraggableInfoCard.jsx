import React, { useRef, useState, useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';
import './InfoCard.css';
const DraggableInfoCard = ({ podcast, expanded, setExpanded }) => {
  // Parsed podcast data
  const { episode, author, releaseDate, publisher, category, description } =
    podcast || {};
  // Reference to the card element
  const cardRef = useRef(null);
  // State to track if card is in front or behind
  const [isInFront, setIsInFront] = useState(false);
  // Spring animation for the card - removed rotateY from the animations
  const [{ x, y, scale, opacity, zIndex }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1.5,
    opacity: 0,
    zIndex: 1,
    config: { tension: 350, friction: 40 },
  }));
  // Update animation when isInFront changes
  useEffect(() => {
    if (isInFront) {
      api.start({
        x: 0,
        scale: 1.5,
        opacity: 1,
        zIndex: 150,
      });
    } else {
      api.start({
        x: -10,
        scale: 1,
        opacity: 0.7,
        zIndex: 0,
      });
    }
  }, [isInFront, api]);
  // Set up the drag gesture
  const bind = useGesture({
    onDrag: ({ event, movement: [mx], velocity: [vx], last, cancel }) => {
      // Prevent default to ensure touch events don't cause unwanted behavior
      event?.preventDefault();
      // Immediately ignore any rightward dragging attempt
      if (mx > 0) {
        // Cancel the gesture and reset
        cancel();
        api.start({ x: 0 });
        return;
      }
      // Now we know mx is negative or zero
      // Process drag movement for leftward motion only
      if (!last) {
        api.start({ x: mx });
        return;
      }
      // When drag ends:
      // If velocity is too low, reset to original position
      if (Math.abs(vx) < 0.2) {
        api.start({ x: 0 });
        return;
      }
      // Toggle the card state on swipe left with sufficient velocity
      setIsInFront(!isInFront);
    },
    onHover: ({ hovering }) => {
      // Show card on hover
      if (hovering) {
        api.start({ opacity: 1 });
      } else if (!isInFront) {
        api.start({ opacity: 0.7 });
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
        {description && (
          <div className="episode-description">
            <p>{description}</p>
          </div>
        )}
      </div>
    </animated.div>
  );
};
export default DraggableInfoCard;
