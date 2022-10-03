import React, { useState, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';

function Renderer(props) {
  const [items1, setItems1] = useState([]);
  const [items2, setItems2] = useState([]);
  const [items3, setItems3] = useState([]);
  const [items4, setItems4] = useState([]);
  const [items5, setItems5] = useState([]);

  const formatRss1 = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const image = feed.querySelectorAll('channel');
    const item = feed.querySelectorAll('item');
    const feedTitle = [...item].slice(0, 1).map((el) => ({
      episode: el.querySelector('title').innerHTML,
    }));
    const feedItems = [...image].slice(0, 1).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      author: el.querySelector('author').innerHTML,
      image: el.querySelector('url').innerHTML,
      title: el.querySelector('title').innerHTML,
      episode: feedTitle[0].episode,
    }));
    setItems1(feedItems);
  };
  const formatRss2 = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const image = feed.querySelectorAll('channel');
    const item = feed.querySelectorAll('item');
    const feedTitle = [...item].slice(0, 1).map((el) => ({
      episode: el.querySelector('title').innerHTML,
    }));
    const feedItems = [...image].slice(0, 1).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      author: el.querySelector('author').innerHTML,
      image: el.querySelector('url').innerHTML,
      title: el.querySelector('title').innerHTML,
      episode: feedTitle[0].episode,
    }));
    setItems2(feedItems);
  };
  const formatRss3 = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const image = feed.querySelectorAll('channel');
    const item = feed.querySelectorAll('item');
    const feedTitle = [...item].slice(0, 1).map((el) => ({
      episode: el.querySelector('title').innerHTML,
    }));
    const feedItems = [...image].slice(0, 1).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      author: el.querySelector('author').innerHTML,
      image: el.querySelector('url').innerHTML,
      title: el.querySelector('title').innerHTML,
      episode: feedTitle[0].episode,
    }));
    setItems3(feedItems);
  };
  const formatRss4 = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const image = feed.querySelectorAll('channel');
    const item = feed.querySelectorAll('item');
    const feedTitle = [...item].slice(0, 1).map((el) => ({
      episode: el.querySelector('title').innerHTML,
    }));
    const feedItems = [...image].slice(0, 1).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      author: el.querySelector('author').innerHTML,
      image: el.querySelector('url').innerHTML,
      title: el.querySelector('title').innerHTML,
      episode: feedTitle[0].episode,
    }));
    setItems4(feedItems);
  };
  const formatRss5 = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const image = feed.querySelectorAll('channel');
    const item = feed.querySelectorAll('item');
    const feedTitle = [...item].slice(0, 1).map((el) => ({
      episode: el.querySelector('title').innerHTML,
    }));
    const feedItems = [...image].slice(0, 1).map((el) => ({
      mp3: el.querySelector('enclosure').getAttribute('url'),
      author: el.querySelector('author').innerHTML,
      image: el.querySelector('url').innerHTML,
      title: el.querySelector('title').innerHTML,
      episode: feedTitle[0].episode,
    }));
    setItems5(feedItems);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      formatRss1(item.newUrls[0].text);
      formatRss2(item.newUrls[1].text);
      formatRss3(item.newUrls[2].text);
      formatRss4(item.newUrls[3].text);
      formatRss5(item.newUrls[4].text);
    });
  }, []);

  return (
    <div className="App">
      {items1.map((item, key) => {
        return (
          <div className="card" key={key}>
            <div className="content">
              <img src={item.image}></img>
              <h1>{item.title}</h1>
              <h2>{item.episode.replace(/&amp;/g, '&')}</h2>
              <p>{item.author}</p>
              <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
            </div>
          </div>
        );
      })}
      {items2.map((item, key) => {
        return (
          <div className="card" key={key}>
            <div className="content">
              <img src={item.image}></img>
              <h1>{item.title}</h1>
              <h2>{item.episode.replace(/&amp;/g, '&')}</h2>
              <p>{item.author}</p>
              <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
            </div>
          </div>
        );
      })}
      {items3.map((item, key) => {
        return (
          <div className="card" key={key}>
            <div className="content">
              <img src={item.image}></img>
              <h1>{item.title}</h1>
              <h2>{item.episode.replace(/&amp;/g, '&')}</h2>
              <p>{item.author}</p>
              <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
            </div>
          </div>
        );
      })}
      {items4.map((item, key) => {
        return (
          <div className="card" key={key}>
            <div className="content">
              <img src={item.image}></img>
              <h1>{item.title}</h1>
              <h2>{item.episode.replace(/&amp;/g, '&')}</h2>
              <p>{item.author}</p>
              <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
            </div>
          </div>
        );
      })}
      {items5.map((item, key) => {
        return (
          <div className="card" key={key}>
            <div className="content">
              <img src={item.image}></img>
              <h1>{item.title}</h1>
              <h2>{item.episode.replace(/&amp;/g, '&')}</h2>
              <p>{item.author}</p>
              <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Renderer;
