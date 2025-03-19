import React from 'react';
import './PodcastRemoveButton.css';

const PodcastRemoveButton = ({ onClick, onMouseDown, onTouchStart }) => {
  return (
    <button
      className="podcast-remove-btn"
      onClick={onClick}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      Remove
    </button>
  );
};

export default PodcastRemoveButton; 