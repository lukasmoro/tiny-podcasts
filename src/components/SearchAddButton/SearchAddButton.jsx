import React from 'react';
import './SearchAddButton.css';

const SearchAddButton = ({ onClick }) => {
  return (
    <button
      className="search-add-btn"
      onClick={onClick}
    >
      Subscribe
    </button>
  );
};

export default SearchAddButton; 