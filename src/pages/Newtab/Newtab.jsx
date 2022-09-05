import React, { useEffect, useState } from 'react';
import './Newtab.css';
import Fetcher1 from './Fetcher1';
import Fetcher2 from './Fetcher2';
import Fetcher3 from './Fetcher3';

const Newtab = () => {
  return (
    <div className="App">
      <div className="feed">
        <Fetcher1 className="feed-item" />
        <Fetcher2 className="feed-item" />
        <Fetcher3 className="feed-item" />
      </div>
    </div>
  );
};

export default Newtab;
