import React, { useEffect, useState } from 'react';
import './Newtab.css';

import ReactAudioPlayer from 'react-audio-player';

//HOW CAN I ADJUST THIS LOGIC SO IT CAN BE APPLIED TO MULTIPLE URLS FROM THE LIST?
//HOW DO NEWTABS LOOK IF PODCASTS ARE PLAYED IN AN OLDER TAB ALREADY?
//OPT1: METADATA ABOUT PLAYBACK TIME IS SAVED IN STORAGE AND SYNCHRONISED TO NEW TAB
//OPT2: LOGIC THAT CHECKS IF PLAYBACK = TRUE AND ADDS GOOGLE INSTEAD
//OPT3: FOUND IN POPUP.JSX INSTEAD

const Newtab = () => {
  const [items, setItems] = useState([]);
  const formatRss = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const items = feed.querySelectorAll('item');
    const feedItems = [...items].slice(0, 1).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      title: el.querySelector('title').innerHTML,
      author: el.querySelector('author').innerHTML,
    }));
    setItems(feedItems);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrl'], (item) => {
      formatRss(item.newUrl.text);
      console.log(item.newUrl.text);
    });
  }, []);

  // THIS MUST UPDATE IF NEWTODOS OR REMOVEDARR CHANGES
  useEffect(() => {
    chrome.storage.local.get(['hello'], (item) => {
      console.log(item.hello);
    });
  }, []);

  return (
    <div className="App">
      {items.map((item, key) => {
        return (
          <div key={key} className="hello">
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
          </div>
        );
      })}
    </div>
  );
};

export default Newtab;
