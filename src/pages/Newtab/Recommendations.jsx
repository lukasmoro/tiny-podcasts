import React, { useEffect, useState } from 'react';

function Recommendations({ onAddPodcast }) {
  const [trendingPodcasts, setTrendingPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrendingPodcasts();
  }, []);

  const fetchTrendingPodcasts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://itunes.apple.com/us/rss/toppodcasts/limit=4/json'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch trending podcasts');
      }
      const data = await response.json();
      const podcasts = data.feed.entry.map((entry) => {
        return {
          collectionId: entry.id.attributes['im:id'],
          collectionName: entry['im:name'].label,
          artworkUrl60: entry['im:image'][0].label,
          artworkUrl600: entry['im:image'][2].label,
        };
      });
      const podcastsWithFeedUrls = await Promise.all(
        podcasts.map(async (podcast) => {
          try {
            const lookupResponse = await fetch(
              `https://itunes.apple.com/lookup?id=${podcast.collectionId}&entity=podcast`
            );
            const lookupData = await lookupResponse.json();
            if (lookupData.results && lookupData.results.length > 0) {
              return {
                ...podcast,
                feedUrl: lookupData.results[0].feedUrl,
              };
            }
            return podcast;
          } catch (error) {
            console.error(
              `Error fetching feed URL for ${podcast.collectionName}:`,
              error
            );
            return podcast;
          }
        })
      );
      setTrendingPodcasts(podcastsWithFeedUrls);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching trending podcasts:', error);
      setError('Failed to load recommendations');
      setIsLoading(false);
    }
  };

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

  if (error) {
    return <div className="podcast-recommendations-error">{error}</div>;
  }

  return (
    <div className="podcast-recommendations">
      <div
        className="podcast-recommendations-grid"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px', // Added more gap for larger thumbnails
          width: '100%',
        }}
      >
        {trendingPodcasts.map((podcast) => (
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
              style={{
                width: '75px',
                height: '75px',
                borderRadius: 'var(--border-radius-thumbnail)',
                objectFit: 'cover',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
