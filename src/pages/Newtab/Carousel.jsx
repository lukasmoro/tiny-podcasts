import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import './Carousel.css';

//BEFORE RELEASE

//loading new tabs just if no previous tab open else google ✅
//loading behavior ✅
//icon ✅
//fix file paths ✅
//buttons animation ✅
//fix blur ✅
//reload podcast page instead of current page ✅
//media queries ✅
//better onboarding
//readme 

//TO DO

//onboarding animation
//make items draggable
//compatibility airpods
//darkmode
//svg animation logo
//add icon to duplicate rss err message

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
  const [isLoading, setIsLoadingActive] = useState(true);
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [indicatorIndex, setActiveIndicatorIndex] = useState(0);

  const handleClick = () => {
    setIsBlurVisible((prevIsBlurVisible) => !prevIsBlurVisible);
  };

  const handleLoading = () => {
    setIsLoadingActive(false);
  };

  const handleScroll = () => {
    const parentContainer = document.getElementById('parent-container');
    const position = parentContainer.scrollLeft;
    setScrollPosition(position);
  };

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      if (!item.newUrls) {
        return;
      }

      const newUrls = item.newUrls.map((newUrl) => newUrl.text);

      Promise.all(newUrls.map((url) => fetch(url)))
        .then((responses) =>
          Promise.all(responses.map((r) => r.text())))
        .then((xmlStrings) => {
          const firstPodcasts = xmlStrings.map(parseRss);
          setItems(firstPodcasts);
        })
        .catch((error) => console.error(error));
    });
  }, []);

  useEffect(() => {
    const parentContainer = document.getElementById('parent-container');
    parentContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      parentContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const itemWidth = document.querySelector('.cards li').offsetWidth;
    const indicatorIndex = Math.floor(scrollPosition / itemWidth);
    console.log(indicatorIndex)
    setActiveIndicatorIndex(indicatorIndex);
  }, [scrollPosition]);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      handleLoading();
    }, 2000);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);


  return (
    <div className='App'>
      <ul id="parent-container" className={`cards ${isBlurVisible ? 'visible' : ''}`}>
        <div className={`loader ${isLoading ? 'active' : ''}`}>
          <li className='spacer'></li>
          {items.map(
            (podcast, index) =>
              podcast && (
                <li key={index}>
                  <div className='podcast-episode'><h2>{podcast.episode}</h2></div>
                  <img className='cover' src={podcast.image} alt={podcast.title} />
                  <div className='player-container'>
                    <AudioPlayer src={podcast.mp3} handleClick={handleClick} />
                  </div>
                </li>
              )
          )}
          <div className={`blur ${isBlurVisible ? 'visible' : ''}`} ></div>
          <li className='spacer'></li>
        </div>
      </ul>
      <span className='indicators'>{items.map((__, index) => { return <button key={index} className={`indicator ${index === indicatorIndex ? 'active' : ''}`}></button> })}</span>
    </div>
  );
};

export default Carousel;
