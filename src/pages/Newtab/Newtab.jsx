import React, { useEffect, useState } from 'react';
import './Newtab.css';

import ReactAudioPlayer from 'react-audio-player';

const Newtab = () => {
  const [items, setItems] = useState([]);
  const formatRss = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const items = feed.querySelectorAll('item');
    const feedItems = [...items].slice(0, 3).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      title: el.querySelector('title').innerHTML,
      author: el.querySelector('author').innerHTML,
    }));
    setItems(feedItems);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrl'], (item) => {
      formatRss(item.newUrl.text);
    });
  }, []);

  return (
    <div className="App">
      {items.map((item, key) => {
        return (
          <div key={key} className="hello">
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} controls />
          </div>
        );
      })}
    </div>
  );
};

export default Newtab;
