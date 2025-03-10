import React, { useEffect } from 'react';
import { useGesture } from '@use-gesture/react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';
import { textTruncate } from '../../utils/textTruncate';
import './DraggableInfoCard.css';

const DraggableInfoCard = ({ podcast, expanded, setExpanded }) => {
  const collapsedPosition = -170;
  const expandedPosition = -410;

  const [{ x, y, scale, opacity, height }, api] = useSpring(() => ({
    x: collapsedPosition,
    y: 30,
    scale: 1,
    opacity: 1,
    height: '150px',
    immediate: true,
    config: { tension: 350, friction: 40 },
  }));

  useEffect(() => {
    api.start({
      x: expanded ? expandedPosition : collapsedPosition,
      y: 30,
      scale: 1,
      opacity: 1,
      height: expanded ? '300px' : '150px',
      immediate: false,
    });
  }, [expanded, api]);

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

      if (!expanded && mx > 0) {
        cancel();
        return;
      }

      if (expanded && mx < 0) {
        cancel();
        return;
      }

      if (!last) {
        const basePosition = expanded ? expandedPosition : collapsedPosition;
        api.start({
          x: basePosition + mx,
        });
        return;
      }
      const threshold = 100;

      if (expanded) {
        if (mx > threshold || (dx > 0 && vx > 0.5)) {
          setExpanded(false);
        } else {
          api.start({ x: expandedPosition });
        }
      } else {
        if (mx < -threshold || (dx < 0 && vx > 0.5)) {
          setExpanded(true);
        } else {
          api.start({ x: collapsedPosition });
        }
      }
    },
  });

  return (
    <animated.div
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
        <h2
          className="episode-title"
          title={podcast.episode || 'Unknown Episode'}
        >
          {textTruncate(podcast.episode || 'Unknown Episode', 70)}
        </h2>
        <div className="info-row-container">
          <div className="info-row">
            {podcast.publisher && podcast.publisher !== podcast.author && (
              <div className="info-item">
                <span className="info-label">Publisher: </span>
                <span className="info-value" title={podcast.publisher}>
                  {textTruncate(podcast.publisher, 20)}
                </span>
              </div>
            )}
            {podcast.releaseDate && (
              <div className="info-item">
                <span className="info-label">Release: </span>
                <span className="info-value" title={podcast.releaseDate}>
                  {textTruncate(podcast.releaseDate, 20)}
                </span>
              </div>
            )}
            {podcast.category && (
              <div className="info-item">
                <span className="info-label">Category: </span>
                <span className="info-value" title={podcast.category}>
                  {textTruncate(podcast.category, 20)}
                </span>
              </div>
            )}
          </div>
        </div>
        {expanded && podcast.description && (
          <div className="episode-description">
            <p>{podcast.description}</p>
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default DraggableInfoCard;
