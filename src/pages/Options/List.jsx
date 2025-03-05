import React from 'react';
import { animated } from '@react-spring/web';
import Item from './Item';

function List({ items, removeUrl, className = '' }) {
  return (
    <animated.div className={`podcast-list-container ${className}`}>
      <div className="podcast-list-overflow">
        <Item items={items} removeUrl={removeUrl} />
      </div>
    </animated.div>
  );
}

export default List;
