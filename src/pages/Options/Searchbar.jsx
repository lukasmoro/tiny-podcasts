import React, { useState } from 'react';
import { textTruncate } from '../../utils/textTruncate';
import SearchAddButton from '../../components/SearchAddButton/SearchAddButton';
import './Searchbar.css';

const Searchbar = (props) => {
  // state
  const [input, setInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // search podcasts via itunes podcast api & show the top 3 results
  const searchPodcasts = async (query) => {
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(
          query
        )}&entity=podcast&limit=5`
      );
      const data = await response.json();
      setSearchResults(data.results.slice(0, 5));
    } catch (error) {
      console.error('Error searching podcasts:', error);
    }
  };

  // when user types into searchbar display search results after two characters
  const handleChange = (e) => {
    setInput(e.target.value);
    if (e.target.value.length > 2) {
      searchPodcasts(e.target.value);
    } else {
      setSearchResults([]);
    }
  };

  // handle podcast select by passing up queried url to parent component (options, onboarding or popup)
  // reset input field & search results
  const handlePodcastSelect = (podcast) => {
    props.onSubmit({
      url: podcast.feedUrl,
    });
    setInput('');
    setSearchResults([]);
  };

  // handle submit event (pressing enter) by calling handlePodcastSelect with first result
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
            <li className="search-result-item" key={podcast.collectionId}>
              <div className="search-items">
                <img
                  className="search-item-thumbnail"
                  src={podcast.artworkUrl60}
                  alt={podcast.collectionName}
                />
                <p className="search-item-title">
                  {textTruncate(
                    podcast.collectionName || 'Unnamed Podcast',
                    10
                  )}
                </p>
                <SearchAddButton
                  onClick={() => handlePodcastSelect(podcast)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Searchbar;
