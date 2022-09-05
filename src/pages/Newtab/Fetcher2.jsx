import React, { useEffect, useState } from 'react';
import './Newtab.css';

const Newtab = () => {
  const [items, setItems] = useState([]);
  const formatRss = async (newUrl) => {
    console.log(newUrl);
    const res = await fetch(`https://api.allorigins.win/get?url=${newUrl}`);
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
    const key = 'key2';
    chrome.storage.local.get([key], (item) => {
      const newUrl = item.key2.name;
      formatRss(newUrl);
      console.log(newUrl);
    });
  }, []);

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
