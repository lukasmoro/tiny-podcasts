import React, { useState, useEffect } from 'react';
import List from '../../pages/Options/List.jsx';
import Recommendations from '../Newtab/Recommendations.jsx';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Onboarding.css';
import '../../root/Root.css';

export default function Onboarding() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      const existingItems = item.newUrls || [];
      setItems(existingItems);
    });
  }, []);

  const handleAddPodcast = async (item) => {
    const urlChecker = (url) => url.text !== item.text;
    let check = items.every(urlChecker);

    if (
      items.length > 4 ||
      !check ||
      !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
        item.text
      )
    ) {
      alert('This podcast has already been added! 👀');
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
        console.log('Podcast added:', newItem);

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

  return (
    <div className="App">
      <ThemeProvider>
        <div className="card">
          <div className="container">
            <h2 className="sub-header">Onboarding</h2>
            <h1 className="header">Welcome! 👋</h1>
            <p className="instructions">
              To start search a podcast or pick a recommendation...
            </p>
            <List />
            <Recommendations onAddPodcast={handleAddPodcast} />
            <p className="greets">Enjoy your Podcasts! 🎧</p>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
