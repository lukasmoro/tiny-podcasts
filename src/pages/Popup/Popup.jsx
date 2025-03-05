import React from 'react';
import Form from '../Options/Form';
import List from '../Options/List';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastStorage } from '../../hooks/usePodcastStorage';
import './Popup.css';
import '../Options/List.css';
import '../../root/Root.css';

const Popup = () => {
  const { items, handleAddPodcast, handleRemovePodcast } = usePodcastStorage();

  return (
    <div className="App">
      <ThemeProvider>
        <div className="list-container">
          <Form onSubmit={handleAddPodcast} />
          <List
            items={items}
            removeUrl={handleRemovePodcast}
            className="popup-list-overflow"
            stretchContent={true}
          />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Popup;
