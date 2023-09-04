import React, { useEffect, useState } from 'react';
import AudioPlayer from '/Users/lukasmoro/Documents/React/podcasts-chrome-extension/components/AudioPlayer.jsx';
import './Carousel.css';

//scroll indicators
//re-loading page after podcast is added
//loading new tabs just if no previous tab open else google
//animations pop-up & options
//onboarding
//icon
//publish

// Parse RSS feed & return items to render
function parseRss(xml) {
  try {
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    const firstItem = xmlDoc.querySelector('item');

    if (!firstItem) {
      console.log('No items found in RSS feed');
      return null;
    }

    const item = {
      mp3: firstItem.querySelector('enclosure').getAttribute('url'),
      image: xmlDoc.querySelector('url').childNodes[0].nodeValue,
      author: firstItem.querySelector('author').childNodes[0].nodeValue,
      title: xmlDoc.querySelector('title').childNodes[0].nodeValue,
      episode: firstItem.querySelector('title').childNodes[0].nodeValue,
    };

    console.log(item);

    return item;
  } catch (err) {
    console.log('Error parsing RSS feed: ', err);
    return null;
  }
}

const Carousel = () => {
  const [items, setItems] = useState([]);
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleClick = () => {
    setIsBlurVisible((prevIsBlurVisible) => !prevIsBlurVisible);
  };

  // Fetching urls from chrome.storage.local
  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      if (!item.newUrls) {
        return;
      }

      const newUrls = item.newUrls.map((newUrl) => newUrl.text);

      Promise.all(newUrls.map((url) => fetch(url)))
        .then((responses) => Promise.all(responses.map((r) => r.text())))
        .then((xmlStrings) => {
          const firstPodcasts = xmlStrings.map(parseRss);
          setItems(firstPodcasts);
        })
        .catch((error) => console.error(error));
    });
  }, []);

  return (
    <div className='App'>
      <ul className={`cards ${isBlurVisible ? 'visible' : ''}`}>
        <li className='spacer'></li>
        {items.map(
          (podcast, index) =>
            podcast && (
              <li key={index}>
                <div className='podcast-episode'><h2>{podcast.episode}</h2></div>
                <img src={podcast.image} alt={podcast.title} />
                <div className='player-container'>
                  <AudioPlayer src={podcast.mp3} handleClick={handleClick} />
                </div>
              </li>
            )
        )}
        <div className={`blur ${isBlurVisible ? 'visible' : ''}`} ></div>
        <li className='spacer'></li>
      </ul>
      <span className='indicators'>{items.map((__, index) => { return <button className='indicator' key={index} onClick={null}></button> })}</span>
    </div>
  );
};

export default Carousel;
