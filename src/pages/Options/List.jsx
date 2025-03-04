import React from 'react';
import { animated } from '@react-spring/web';
import Form from './Form';
import Item from './Item';
import { usePodcastStorage } from '../../hooks/usePodcastStorage';

function List() {
  const { items, handleAddPodcast, setItems } = usePodcastStorage();

  const removeUrl = (key) => {
    const newUrls = items.filter((item) => item.key !== key);
    chrome.storage.local.set({ newUrls }, () => {
      setItems(newUrls);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  };

  return (
    <animated.div className="podcast-container">
      <div className="podcast-form-container">
        <Form onSubmit={handleAddPodcast} />
      </div>
      <div className="podcast-divider"></div>
      <div className="podcast-list-overflow">
        <Item items={items} removeUrl={removeUrl} />
      </div>
      <div className="podcast-divider"></div>
    </animated.div>
  );
}

export default List;
