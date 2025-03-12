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
    <ThemeProvider>
      <div className="App">
        <div className='search-container'>
          <Searchbar onSubmit={handleAddPodcast} />
        </div>
        <div className='list-container'>
          <List
            items={items}
            removeUrl={handleRemovePodcast}
            moveItem={handleReorderPodcasts}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Popup;
