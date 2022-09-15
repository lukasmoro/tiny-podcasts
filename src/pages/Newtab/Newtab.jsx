import React, { useEffect, useState } from 'react';
import './Newtab.css';

import ReactAudioPlayer from 'react-audio-player';

//HOW CAN I ADJUST THIS LOGIC SO IT CAN BE APPLIED TO MULTIPLE URLS FROM THE LIST?

//ERRORHANDLING IF NEWURL IS UNDEFINED, CAN ALSO BE ONBOARDING

//HOW DO NEWTABS LOOK IF PODCASTS ARE PLAYED IN AN OLDER TAB ALREADY?
//OPT1: METADATA ABOUT PLAYBACK TIME IS SAVED IN STORAGE AND SYNCHRONISED TO NEW TAB
//OPT2: LOGIC THAT CHECKS IF PLAYBACK = TRUE AND ADDS GOOGLE INSTEAD
//OPT3: FOUND IN POPUP.JSX INSTEAD

//SET PRESET PODCAST TO DESIGN DETAILS, LAYOUT & METAMUSE

const Newtab = () => {
  const [items1, setItems1] = useState([]);
  const [items2, setItems2] = useState([]);
  const [items3, setItems3] = useState([]);
  const [items4, setItems4] = useState([]);
  const [items5, setItems5] = useState([]);

  // MAP ITEMS TO GET URLS CREATE A NEW PLAYER WITH EVERY ITEM
  const formatRss1 = async (newUrl) => {
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
    setItems1(feedItems);
  };
  const formatRss2 = async (newUrl) => {
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
    setItems2(feedItems);
  };
  const formatRss3 = async (newUrl) => {
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
    setItems3(feedItems);
  };
  const formatRss4 = async (newUrl) => {
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
    setItems4(feedItems);
  };
  const formatRss5 = async (newUrl) => {
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
    setItems5(feedItems);
  };

  // THIS MUST UPDATE IF NEWTODOS CHANGES ✅
  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      formatRss1(item.newUrls[0].text);
      formatRss2(item.newUrls[1].text);
      formatRss3(item.newUrls[2].text);
      formatRss4(item.newUrls[3].text);
      formatRss5(item.newUrls[4].text);
    });
  }, []);

  //I NEED SOMETHING HERE TO CLEAN UP THE DATA (ESPECIALLY NUMBERING)
  return (
    <div className="App">
      {items1.map((item, key) => {
        return (
          <div key={key}>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
          </div>
        );
      })}
      {items2.map((item, key) => {
        return (
          <div key={key}>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
          </div>
        );
      })}
      {items3.map((item, key) => {
        return (
          <div key={key}>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
          </div>
        );
      })}
      {items4.map((item, key) => {
        return (
          <div key={key}>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
          </div>
        );
      })}
      {items5.map((item, key) => {
        return (
          <div key={key}>
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
