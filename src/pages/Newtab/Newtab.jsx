import React, { useEffect, useState } from 'react';
import './Newtab.css';

const Newtab = () => {
  const [items, setItems] = useState([]);
  const formatRss = async (newUrl) => {
    console.log(newUrl.text);
    const res = await fetch(
      `https://api.allorigins.win/get?url=${newUrl.text}`
    );
    console.log(res);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const items = feed.querySelectorAll('item');
    const feedItems = [...items].map((el) => ({
      link: el.querySelector('link').innerHTML,
      title: el.querySelector('title').innerHTML,
      author: el.querySelector('author').innerHTML,
    }));
    setItems(feedItems);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrl'], (item) => {
      formatRss(item.newUrl);
    });
  }, []);

  // useEffect(() => {
  //   console.log(rssUrl);
  //   formatRss(rssUrl);
  // }, [rssUrl]);

  return (
    <div className="App">
      {items.map((item) => {
        return (
          <div>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <a href={item.link}>{item.link}</a>
          </div>
        );
      })}
    </div>
  );
};

export default Newtab;

/*
export default function List({ rssUrl }) {
  const [items, setItems] = useState([]);
  const formatRss = async (rssUrl) => {
    console.log(rssUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${rssUrl}`);
    const { contents } = await res.json();
    const feed = new window.DOMParser().parseFromString(contents, 'text/xml');
    const items = feed.querySelectorAll('item');
    const feedItems = [...items].map((el) => ({
      link: el.querySelector('link').innerHTML,
      title: el.querySelector('title').innerHTML,
      author: el.querySelector('author').innerHTML,
    }));
    setItems(feedItems);
  };

  useEffect(() => {
    console.log(rssUrl);
    formatRss(rssUrl);
  }, [rssUrl]);

  return (
    <div className="App">
      {items.map((item) => {
        return (
          <div>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <a href={item.link}>{item.link}</a>
          </div>
        );
      })}
    </div>
  );
}
*/
