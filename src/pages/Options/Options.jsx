import React, { useState, useEffect } from 'react';
import List from './List';
import Overlay from '../Newtab/Overlay';
import Recommendations from '../Newtab/Recommendations';
import BuyMeACoffeeButton from '../Newtab/BuyMeACoffeeButton';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Options.css';
import './Form.css';
import '../../root/Root.css';

export default function Options() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Load existing podcast URLs from storage
    chrome.storage.local.get(['newUrls'], (item) => {
      const existingItems = item.newUrls || [];
      setItems(existingItems);
    });
  }, []);

  // Function to add a podcast URL
  const handleAddPodcast = async (item) => {
    // Check if we already have this URL or if we've reached the limit
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

        // Refresh the current tab to reflect changes
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
        <Overlay />
        <div className="spacer"></div>
        <div className="cards-container">
          <div className="card left-card">
            <div className="container">
              <h2 className="sub-header">Managing Podcasts</h2>
              <h1 className="header">Options</h1>
              <p className="instructions">
                Manage podcasts here or in the pop-up window.
              </p>
              <div className="overflow">
                <List />
              </div>
              <p className="greets">Enjoy your Podcasts! 🎧</p>
            </div>
          </div>
          <div className="right-cards">
            <div className="card right-card">
              <div className="container">
                <h2 className="sub-header">Finding Podcasts</h2>
                <h1 className="header">Recommendations</h1>
                <p className="instructions">
                  Unsure where to start? Here are some favorites.
                </p>
                <Recommendations onAddPodcast={handleAddPodcast} />
              </div>
            </div>
            <div className="card right-card">
              <div className="container">
                <h2 className="sub-header">Enjoy Podcasts?</h2>
                <h1 className="header">Support</h1>
                <p className="instructions">
                  Support is much appreciated and helps me to create more tiny
                  products in the future. Thank you!
                </p>
                <BuyMeACoffeeButton />
                <div className="items">
                  <p></p>
                </div>
              </div>
            </div>
          </div>
          <p className="signature">
            Podcasts by <a href="https://lukasmoro.com">Lukas Moro</a>.
            <br />
            <a href="https://github.com/lukasmoro/podcasts-chrome-extension">
              Github
            </a>{' '}
            • <a href="">Privacy Policy</a>
          </p>
        </div>
      </ThemeProvider>
    </div>
  );
}
