import React, { useState, useEffect, useRef } from 'react';
import './Recommendations.css';

const Recommendations = ({ podcastID, onAddPodcast }) => {
  // state
  const [podcasts, setPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  // cleanup
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // fetch podcast data once on mount
  useEffect(() => {
    const fetchPodcasts = async () => {
      setIsLoading(true);

      try {
        // process each podcast ID in the array
        const podcastPromises = podcastID.map(async (id) => {
          try {
            const response = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=podcast`);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              return {
                collectionId: id,
                collectionName: result.collectionName,
                artworkUrl600: result.artworkUrl600,
                feedUrl: result.feedUrl,
                artistName: result.artistName
              };
            }
            return null;
          } catch (error) {
            console.error(`Error fetching podcast with ID ${id}:`, error);
            return null;
          }
        });

        const results = await Promise.all(podcastPromises);

        //only update state if the component is still mounted
        if (isMounted.current) {
          setPodcasts(results.filter(Boolean));
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching podcasts:', error);
        // only update state if the component is still mounted
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchPodcasts();
  }, [podcastID]);

  // pass fetched url to parent
  const handlePodcastAdd = (podcast) => {
    const podcastToAdd = {
      url: podcast.feedUrl,
      image: podcast.artworkUrl600,
      title: podcast.collectionName,
      publisher: podcast.artistName
    };

    // Only process if component is still mounted
    if (isMounted.current) {
      onAddPodcast(podcastToAdd);
    }
  };

  const renderLoadingPlaceholders = () => {
    return Array(4).fill(null).map((_, index) => (
      <div key={`placeholder-${index}`} className="podcast-recommendation-item">
        <div className="podcast-recommendation-placeholder" />
      </div>
    ));
  };

  return (
    <div className="podcast-recommendations">
      <div className="podcast-recommendations-grid">
        {isLoading ? renderLoadingPlaceholders() : (
          podcasts.map((podcast) => (
            <div
              key={podcast.collectionId}
              className="podcast-recommendation-item"
              onClick={() => handlePodcastAdd(podcast)}
            >
              <img
                className="podcast-recommendation-thumbnail"
                src={podcast.artworkUrl600}
                alt={podcast.collectionName}
                title={`Subscribe to ${podcast.collectionName}`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Recommendations;