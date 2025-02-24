import React, { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import './Form.css';

function Form(props) {
  const [input, setInput] = useState('');
  const [hover, setHover] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const addButtonSpring = useSpring({
    width: hover ? '5rem' : '3rem',
    scaleY: hover ? 1.1 : 1,
    config: {
      tension: 500,
      friction: 20,
    },
  });

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

  const handleMouseEnter = () => {
    setHover(true);
  };

  const handleMouseLeave = () => {
    setHover(false);
  };

  return (
    <div className="podcast-search-container">
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          placeholder="Search a new podcast..."
          value={input}
          onChange={handleChange}
          name="text"
        />
        {/* <animated.button
          className={`submit ${hover ? 'hovered' : ''}`}
          onClick={handleSubmit}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            width: addButtonSpring.width,
          }}
        >
          {hover ? 'Search' : 'Find'}
        </animated.button> */}
      </form>

      {isSearching && <div className="search-loading">Searching...</div>}

      {searchResults.length > 0 && (
        <ul className="search-results">
          {searchResults.map((podcast) => (
            <li
              key={podcast.collectionId}
              onClick={() => handlePodcastSelect(podcast)}
            >
              <img src={podcast.artworkUrl60} alt={podcast.collectionName} />
              <div>
                <strong>{podcast.collectionName}</strong>
                <span>{podcast.artistName}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Form;
