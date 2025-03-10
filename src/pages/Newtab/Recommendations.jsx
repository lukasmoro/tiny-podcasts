import React, { useState, useEffect } from 'react';
import './Recommendations.css';

const Recommendations = ({ podcastID, onAddPodcast }) => {
  //state
  const [podcasts, setPodcasts] = useState([]);

  useEffect(() => {
    // fetch podcast url from itunes api for ui & adding item if handleAddPodcast is called
    const fetchPodcasts = async () => {
      try {
        const podcastPromises = podcastID.map((id) =>
          fetch(`https://itunes.apple.com/lookup?id=${id}&entity=podcast`)
            .then((response) => response.json())
            .then((data) => data.results[0])
        );
        const podcasts = await Promise.all(podcastPromises);
        setPodcasts(podcasts.filter((podcast) => podcast));
      } catch (error) {
        console.error('Error fetching podcast recommendations:', error);
      }
    };
    if (podcastID && podcastID.length > 0) {
      fetchPodcasts();
    }
  }, [podcastID]);

  //pass fetched url to parent
  const handleAddPodcast = (podcast) => {
    const podcastData = {
      url: podcast.feedUrl,
    };
    onAddPodcast(podcastData);
  };

  return (
    <div className="podcast-recommendations">
      <div className="podcast-recommendations-grid">
        {podcasts.map((podcast) => (
          <div
            key={podcast.key}
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
