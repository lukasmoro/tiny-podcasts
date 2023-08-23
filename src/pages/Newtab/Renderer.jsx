import React, { useState, useEffect } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import './Renderer.css';

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

const Renderer = () => {
  const [items, setItems] = useState([]);

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

  return (
    <div className="App">
      {items.map(
        (podcast, index) =>
          podcast && (
            <div className="card" key={index}>
              <div className="content">
                <ul>
                  <li key={podcast.link}>
                    <img src={podcast.image}></img>
                    <h1 href={podcast.link}>{podcast.title}</h1>
                    <h2>
                      {podcast.episode
                        .replace(/&amp;/g, '&')
                        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')}
                    </h2>
                    <p>
                      {podcast.author
                        .replace(/&amp;/g, '&')
                        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')}
                    </p>
                    <ReactAudioPlayer
                      src={podcast.mp3}
                      preload="metadata"
                      controls
                    />
                  </li>
                </ul>
              </div>
            </div>
          )
      )}
      <p className="signature">
        Podcasts by <a href="https://lukasmoro.com">Lukas Moro</a>.
        <br />
        <a href="">Github</a> • <a href="">Privacy Policy</a>
      </p>
    </div>
  );
};

export default Renderer;
