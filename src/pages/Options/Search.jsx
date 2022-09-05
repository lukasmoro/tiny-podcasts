/*global chrome*/

import React, { useState } from 'react';
import './Options.css';

// Search.jsx (functional component, functions: checkUrl (onSubmit), pass rssUrl (props))

export default function Search(rssUrl, setRssUrl) {
  const checkRss = async (e) => {
    e.preventDefault();
    console.log(setRssUrl);
    const urlRegex =
      /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    if (!urlRegex.test(rssUrl)) {
      return;
    }
  };

  return (
    <div>
      <form onSubmit={checkRss}>
        <div>
          <h1>Podcasts</h1>
          <label>Enter an URL!</label>
          <br />
          <input
            className="item"
            placeholder="hello world"
            onChange={(e) => setRssUrl(e.target.value)}
            value={rssUrl}
          />
        </div>
        <input className="item" type="submit" onClick={handleInput} />
      </form>
    </div>
  );
}
