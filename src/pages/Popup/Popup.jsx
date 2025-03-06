import React, { useState } from 'react';
import Form from '../Options/Form';
import List from '../Options/List';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastData } from '../../hooks/usePodcastData';
import './Popup.css';
import '../../root/Root.css';

const Popup = () => {
  const [isDragging, setIsDragging] = useState(false);
  const {
    items,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
  } = usePodcastData();

  const handleDragStateChange = (dragging) => {
    setIsDragging(dragging);
  };

  return (
    <div className="App">
      <ThemeProvider>
        <div className="list-container">
          <Form onSubmit={handleAddPodcast} />
          <List
            items={items}
            removeUrl={handleRemovePodcast}
            moveItem={handleReorderPodcasts}
            onDragStateChange={handleDragStateChange}
            isPopup={true}
          />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Popup;
