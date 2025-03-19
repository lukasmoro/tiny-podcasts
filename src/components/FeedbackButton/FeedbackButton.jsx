import React from 'react';
import './FeedbackButton.css';

function FeedbackButton({ text, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-button-link"
    >
      <span className="text-button">{text}</span>
    </a>
  );
}

export default FeedbackButton; 