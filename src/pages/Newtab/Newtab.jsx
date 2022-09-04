import React, { useEffect, useState } from 'react';
import './Newtab.css';
import Fetcher from './Fetcher';

const Newtab = () => {
  return (
    <div className="App">
      <div className="feed">
        <Fetcher className="feed-item" />
        <Fetcher className="feed-item" />
        <Fetcher className="feed-item" />
      </div>
    </div>
  );
};

export default Newtab;
