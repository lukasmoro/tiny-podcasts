import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer.jsx';
import './Carousel.css';

function parseRss(xml) {
  try {
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    const firstItem = xmlDoc.querySelector('item');

    if (!firstItem) {
      console.log('No items found in RSS feed');
      return null;
    }

    const item = {
      mp3: getEnclosureUrl(firstItem),
      image: getPodcastImage(xmlDoc),
      author: getAuthor(xmlDoc, firstItem),
      title: getPodcastTitle(xmlDoc),
      episode: getEpisodeTitle(firstItem),
    };

    console.log('Parsed item:', item);
    return item;
  } catch (err) {
    console.log('Error parsing RSS feed: ', err);
    return null;
  }
}

function getEnclosureUrl(item) {
  const enclosure = item.querySelector('enclosure');
  if (enclosure) {
    return enclosure.getAttribute('url');
  }
  const mediaContent = item.querySelector('media\\:content, content');
  return mediaContent ? mediaContent.getAttribute('url') : null;
}

function getPodcastImage(xmlDoc) {
  console.log('Searching for podcast image...');

  const possibleImagePaths = [
    'channel > itunes\\:image',
    'channel itunes\\:image', // Added this variant
    'itunes\\:image',
    'channel > image > url',
    'image > url',
    'media\\:thumbnail',
  ];

  for (const path of possibleImagePaths) {
    const element = xmlDoc.querySelector(path);
    if (element) {
      console.log(`Found image element with path: ${path}`);
      const image =
        element.getAttribute('href') ||
        element.getAttribute('url') ||
        element.textContent.trim();

      if (image) {
        console.log(`Image URL found: ${image}`);
        return image;
      }
    }
  }

  const itunesImage = xmlDoc.getElementsByTagName('itunes:image')[0];
  if (itunesImage && itunesImage.getAttribute('href')) {
    const image = itunesImage.getAttribute('href');
    console.log(`Found image using getElementsByTagName: ${image}`);
    return image;
  }

  const channelImage = xmlDoc.querySelector('channel image');
  if (channelImage) {
    const urlElement = channelImage.querySelector('url');
    if (urlElement) {
      const image = urlElement.textContent.trim();
      console.log(`Found image using channel image fallback: ${image}`);
      return image;
    }
  }

  console.log('No image found in the RSS feed');
  return null;
}

function getAuthor(xmlDoc, item) {
  const possibleAuthorPaths = [
    'author',
    'itunes\\:author',
    'dc\\:creator',
    'channel > author',
    'channel > itunes\\:author',
  ];

  for (const path of possibleAuthorPaths) {
    const element = item.querySelector(path) || xmlDoc.querySelector(path);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  return null;
}

function getPodcastTitle(xmlDoc) {
  const channelTitle = xmlDoc.querySelector('channel > title');
  const rssTitle = xmlDoc.querySelector('title');

  return (channelTitle || rssTitle)?.textContent.trim() || null;
}

function getEpisodeTitle(item) {
  const title = item.querySelector('title');
  return title?.textContent.trim() || null;
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

  useEffect(() => {
    const parentContainer = document.getElementById('parent-container');
    if (!parentContainer) return;

    const handleScroll = () => {
      const position = parentContainer.scrollLeft;
      setScrollPosition(position);
      const maxScrollLeft =
        parentContainer.scrollWidth - parentContainer.clientWidth;
      if (maxScrollLeft === 0) return;
      const scrollRatio = position / maxScrollLeft;
      const currentIndex = Math.round(scrollRatio * (items.length - 1));
      setActiveIndicatorIndex(currentIndex);
    };

    parentContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      parentContainer.removeEventListener('scroll', handleScroll);
    };
  }, [items.length]);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      handleLoading();
    }, 2000);

    return () => {
      clearTimeout(loadingTimer);
    };
  }, []);

  return (
    <div className="App">
      <ul
        id="parent-container"
        className={`cards ${isBlurVisible ? 'visible' : ''}`}
      >
        <div className={`loader ${isLoading ? 'active' : ''}`}>
          <li className="spacer"></li>
          {items.map(
            (podcast, index) =>
              podcast && (
                <li key={index}>
                  <div className="podcast-episode">
                    <h2>{podcast.episode}</h2>
                  </div>
                  <img
                    className="cover"
                    src={podcast.image}
                    alt={podcast.title}
                  />
                  <div className="player-container">
                    <AudioPlayer src={podcast.mp3} handleClick={handleClick} />
                  </div>
                </li>
              )
          )}
          <div className={`blur ${isBlurVisible ? 'visible' : ''}`}></div>
          <li className="spacer"></li>
        </div>
      </ul>
      <span className="indicators">
        {items.map((__, index) => (
          <button
            key={index}
            className={`indicator ${index === indicatorIndex ? 'active' : ''}`}
          ></button>
        ))}
      </span>
    </div>
  );
};

export default Carousel;
