import React from 'react';
import './Recommendations.css';

const Recommendations = ({ podcasts, onAddPodcast }) => {
  const handleAddPodcast = (podcast) => {
    if (!podcast.feedUrl) {
      console.error('No feed URL available for this podcast');
      return;
    }
    const podcastItem = {
      key: new Date().getTime(),
      text: podcast.feedUrl,
      title: podcast.collectionName,
      artwork: podcast.artworkUrl600,
    };
    onAddPodcast(podcastItem);
  };

  return (
    <div className="podcast-recommendations">
      <div className="podcast-recommendations-grid">
        {podcasts &&
          podcasts.map((podcast) => (
            <div
              key={podcast.collectionId}
              className="podcast-recommendation-item"
              onClick={() => handleAddPodcast(podcast)}
            >
              <img
                className="podcast-recommendation-thumbnail"
                src={podcast.artworkUrl600}
                alt={podcast.collectionName}
                title={`Subscribe to ${podcast.collectionName}`}
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default Recommendations;
