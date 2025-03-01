import React, { useState } from 'react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';

const AnimatedItem = ({ item, removeUrl }) => {
  const [isRemoved, setIsRemoved] = useState(false);
  const [hover, setHover] = useState(false);

  const fadeInSprings = useSpring({
    from: { transform: 'translateY(-10px)' },
    to: { transform: 'translateY(0px)' },
    config: {
      tension: 300,
      friction: 10,
    },
  });

  const fadeOutSprings = useSpring({
    opacity: isRemoved ? 0 : 1,
    transform: isRemoved ? 'translateX(-100%)' : 'translateX(0%)',
    config: {
      tension: 400,
      friction: 15,
    },
    onRest: () => {
      if (isRemoved) {
        removeUrl(item.key);
      }
    },
  });

  const handleRemove = () => {
    setIsRemoved(true);
  };

  const handleMouseEnter = () => {
    setHover(true);
  };

  const handleMouseLeave = () => {
    setHover(false);
  };

  return (
    <animated.div style={fadeInSprings}>
      <animated.div style={fadeOutSprings}>
        <div className="podcast-items">
          <img
            className="podcast-item-thumbnail"
            src={item.artwork}
            alt={item.podcastName}
          />
          <p
            className={
              item.podcastName?.length > 50
                ? 'podcast-item-title podcast-truncate-text'
                : 'podcast-item-title'
            }
          >
            {item.podcastName || 'Unnamed Podcast'}
          </p>
          <button
            className="podcast-remove-btn"
            onClick={handleRemove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            Remove
          </button>
        </div>
      </animated.div>
    </animated.div>
  );
};

const Item = ({ items, removeUrl }) => {
  return (
    <div className="podcast-items-container">
      {items.map((item) => (
        <AnimatedItem key={item.key} item={item} removeUrl={removeUrl} />
      ))}
    </div>
  );
};

export default Item;
