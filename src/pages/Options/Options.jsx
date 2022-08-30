import React, { useState } from 'react';
import { render } from 'react-dom';
import Search from './Search';
import Tester from './Tester';

export default function Options() {
  // // const [rssUrl, setRssUrl] = useState(['']);

  return (
    <div className="App">
      {/* <Search rssUrl={rssUrl} setRssUrl={setRssUrl} /> */}
      <Tester />
    </div>
  );
}
