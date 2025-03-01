import React, { useEffect, useState } from 'react';
import { animated } from '@react-spring/web';
import Form from './Form';
import Item from './Item';

function List() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      console.log(item.newUrls);
      const items = item.newUrls;
      const feedItems = items.map((feedItem) => ({
        key: feedItem.key,
        text: feedItem.text,
        podcastName: feedItem.podcastName,
        artwork: feedItem.artwork,
      }));
      setItems(feedItems);
      console.log('Feed Items:', feedItems);
    });
  }, []);

  const addUrl = async (item) => {
    const urlChecker = (url) => url.text != item.text;
    let check = items.every(urlChecker);
    if (
      items.length > 4 ||
      !check ||
      !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
        item.text
      )
    ) {
      alert('Please enter a valid url! You can enter up to five podcast!');
      return;
    }

    try {
      const response = await fetch(item.text);
      const text = await response.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const podcastName =
        xml.querySelector('channel > title')?.textContent || 'Unnamed Podcast';
      const newItem = { ...item, podcastName, artworkUrl: item.artwork };
      let newUrls = [newItem, ...items];
      chrome.storage.local.set({ newUrls }, () => {
        setItems(newUrls);
        console.log(newUrls);
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.reload(tabs[0].id);
          }
        );
      });
    } catch (error) {
      console.error('Error fetching podcast feed:', error);
      alert('Error fetching podcast feed. Please check the URL and try again.');
    }
  };

  const removeUrl = (key) => {
    let newUrls = items.filter((item) => item.key !== key);
    console.log(key);
    chrome.storage.local.set({ newUrls }, () => {
      setItems(newUrls);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.reload(tabs[0].id);
    });
  };

  return (
    <animated.div className="podcast-container">
      <div className="podcast-form-container">
        <Form onSubmit={addUrl} />
      </div>
      <div className="podcast-divider"></div>
      <div className="podcast-list-overflow">
        <Item items={items} removeUrl={removeUrl} />
      </div>
      <div className="podcast-divider"></div>
    </animated.div>
  );
}

export default List;
