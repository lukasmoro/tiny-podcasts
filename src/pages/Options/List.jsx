import React from 'react';
import { animated } from '@react-spring/web';
import Form from './Form';
import Item from './Item';
import { usePodcastStorage } from '../../hooks/usePodcastStorage';

function List() {
  const { items, handleAddPodcast, handleRemovePodcast } = usePodcastStorage();

  return (
    <animated.div className="podcast-container">
      <div className="podcast-form-container">
        <Form onSubmit={handleAddPodcast} />
      </div>
      <div className="podcast-divider"></div>
      <div className="podcast-list-overflow">
        <Item items={items} removeUrl={handleRemovePodcast} />
      </div>
      <div className="podcast-divider"></div>
    </animated.div>
  );
}

export default List;
