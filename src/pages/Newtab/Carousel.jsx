import React, { useState, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './Carousel.css';

// 1. Handle scroll event DONE
// 2. Calculate scroll position DONE
// 3. Map scroll position to carousel position
// A. Set cover position through CSS
// B. Use scroll position to calculate position of every item in cover array
// 4. Animate carousel covers
// 5. Update state and render
// 6. Handle cover click

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
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewMode, setViewMode] = useState('coverflow');

  // Tracking scroll position of covers through event listener
  useEffect(() => {
    const container = document.getElementById('scrollable');

    const handleScroll = () => {
      const currentScrollPosition = container.scrollLeft;
      setScrollPosition(currentScrollPosition);
      console.log('Current Scroll Position:', currentScrollPosition);
    };

    container.addEventListener('scroll', handleScroll);
    console.log('Added scroll event listener');
    return () => {
      container.removeEventListener('scroll', handleScroll);
      console.log('Removed scroll event listener');
    };
  }, [])

  // Fetching urls from chrome.storage.local 
  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      if (!item.newUrls) {
        setOnboarding(true);
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


  // Handling viewmode with click event on cover
  const handlePodcastClick = (podcast) => {
    setSelectedPodcast(podcast);
    setViewMode('podcast');
  };

  useEffect(() => {


  }, []);

  return (
    <div className="App">
      {viewMode === 'coverflow' && (
        <div className="coverflow" id='scrollable'>
          {items.map(
            (podcast, index) =>
              podcast && (
                <div
                  className="card"
                  key={index}
                  style={{
                    transform: `translateX(${podcast.x + scrollPosition * podcast.speed}px)`,
                  }}
                  onClick={() => handlePodcastClick(podcast)}
                >
                  <img className='coverimage' src={podcast.image} alt={podcast.title} />
                </div>
              )
          )}
        </div>
      )}
      {viewMode === 'podcast' && selectedPodcast && (
        <div className="podcast-view">
          <button
            className="back-button"
            onClick={() => setViewMode('coverflow')}
          >
            Back
          </button>
          <div className="podcast-details">
            <img
              src={selectedPodcast.image}
              alt={'Oops! Cover not loading.'}
            ></img>
            <h2>{selectedPodcast.title}</h2>
            <p>{selectedPodcast.author}</p>
            <p>{selectedPodcast.episode}</p>
            <ReactAudioPlayer src={selectedPodcast.mp3} controls />
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
