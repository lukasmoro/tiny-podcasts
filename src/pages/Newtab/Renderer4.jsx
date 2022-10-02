import React, { useState, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import Loader from './Loader';

function Renderer4() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatRss = async (newUrl) => {
    console.log(newUrl);
    setLoading(true);
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
    setItems(feedItems);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      formatRss(item.newUrls[3].text);
    });
  }, []);

  return (
    <div className="App">
      {loading ? (
        <Loader />
      ) : (
        items.map((item, key) => {
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
        })
      )}
    </div>
  );
}

export default Renderer4;
