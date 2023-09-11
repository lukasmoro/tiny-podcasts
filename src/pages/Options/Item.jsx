import React, { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

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
      tension: 600,
      friction: 15,
    },
    onRest: () => {
      if (isRemoved) {
        removeUrl(item.key);
      }
    },
  })

  const removeButtonSpring = useSpring({
    config: {
      tension: 300,
      friction: 10,
    },
  })

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
        <div className="items">
          <p>{item.text}</p>
          <animated.button className="remove"
            onClick={handleRemove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            Remove
          </animated.button>
        </div>
      </animated.div>
    </animated.div>
  );
};

const Item = ({ items, removeUrl }) => {
  return (
    <div className="items-container">
      {items.map((item, key) => (
        <AnimatedItem key={item.key} h item={item} removeUrl={removeUrl} />
      ))}
    </div>
  );
};

export default Item;
