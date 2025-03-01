import React, { useState } from 'react';
import './Form.css';

function Form(props) {
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const searchPodcasts = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&entity=podcast`
      );
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching podcasts:', error);
    }
    setIsSearching(false);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.length > 2) {
      searchPodcasts(e.target.value);
    } else {
      setSearchResults([]);
    }
  };

  const handlePodcastSelect = (podcast) => {
    props.onSubmit({
      key: new Date().getTime(),
      text: podcast.feedUrl,
      title: podcast.collectionName,
      artwork: podcast.artworkUrl600,
    });
    setInput('');
    setSearchResults([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handlePodcastSelect(searchResults[0]);
    }
  };

  return (
    <div className="podcast-search-container">
      <form className="podcast-form" onSubmit={handleSubmit} autoComplete="off">
        <input
          className="podcast-input"
          placeholder="Search Podcasts..."
          value={input}
          onChange={handleChange}
          name="text"
        />
      </form>
      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((podcast) => (
            <li
              className="search-result-item"
              key={podcast.collectionId}
              onClick={() => handlePodcastSelect(podcast)}
            >
              <img
                className="result-thumbnail"
                src={podcast.artworkUrl60}
                alt={podcast.collectionName}
              />
              <div className="result-details">
                <strong className="result-title">
                  {podcast.collectionName}
                </strong>
                <span className="result-artist">{podcast.artistName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Form;
