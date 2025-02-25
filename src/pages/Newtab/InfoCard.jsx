import React from 'react';
import './InfoCard.css';

const InfoCard = ({ podcast, expanded, setExpanded }) => {
  const {
    title,
    episode,
    author,
    releaseDate,
    publisher,
    category,
    description,
  } = podcast || {};

  return (
    <div className={`info-card`}>
      <div className="info-card-content">
        <h4 className="episode-title">{title || 'Unknown Episode'}</h4>
        <div className="info-row">
          {publisher && publisher !== author && (
            <div className="info-item">
              <span className="info-label">Publisher:</span>
              <span className="info-value">{publisher}</span>
            </div>
          )}
          {releaseDate && (
            <div className="info-item">
              <span className="info-label">Release:</span>
              <span className="info-value">{releaseDate}</span>
            </div>
          )}
          {category && (
            <div className="info-item">
              <span className="info-label">Category:</span>
              <span className="info-value">{category}</span>
            </div>
          )}
        </div>
        {description && (
          <div className="episode-description">
            <p>{description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoCard;
