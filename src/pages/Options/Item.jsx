import React, { useState, useEffect } from 'react';
import Form from './Form';

const Item = ({ urls, removeUrl }) => {
  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      console.log(item.newUrls);
    });
  }, []);

  //THIS MUST GET DATA FROM STORAGE
  return urls.map((url, key) => (
    <div key={key}>
      <div key={url.id}>{url.text}</div>
      <div>
        <button onClick={() => removeUrl(url.id)}> - </button>
      </div>
    </div>
  ));
};

export default Item;

/*

{items.map((item, key) => {
        return (
          <div key={key}>
            <h1>{item.title}</h1>
            <p>{item.author}</p>
            <ReactAudioPlayer src={item.mp3} preload="metadata" controls />
          </div>
        );
      })}

*/
