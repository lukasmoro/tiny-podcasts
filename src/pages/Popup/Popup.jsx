import React, { useState } from 'react';
import Searchbar from '../Options/Searchbar';
import List from '../Options/List';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastData } from '../../hooks/usePodcastData';
import './Popup.css';
import '../../root/Root.css';

const Popup = () => {
  const {
    items,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
  } = usePodcastData();

  return (
    <div className="App">
      <ThemeProvider>
        <div className="list-container">
          <Searchbar onSubmit={handleAddPodcast} />
          <List
            items={items}
            removeUrl={handleRemovePodcast}
            moveItem={handleReorderPodcasts}
          />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Popup;
