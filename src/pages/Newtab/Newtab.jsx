import React, { useEffect, useState } from 'react';
import './Newtab.css';
import Fetcher1 from './Fetcher1';
import Fetcher2 from './Fetcher2';
import Fetcher3 from './Fetcher3';

const Newtab = () => {
  return (
    <div className="App">
      <div className="feed">
        <div className="feed-item">
          <Fetcher1 />
          <Fetcher2 />
          <Fetcher3 />
        </div>
      </div>
    </div>
  );
};

export default Newtab;
