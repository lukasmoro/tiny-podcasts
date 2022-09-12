import React, { useState, useEffect } from 'react';
import Form from './Form';

const Item = ({ urls, removeUrl }) => {
  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      console.log(item.newUrls);
    });
  }, []);

  //THIS MUST GET DATA FROM STORAGE
  return urls.map((url, index) => (
    <div key={index}>
      <div key={url.id}>{url.text}</div>
      <div>
        <button onClick={() => removeUrl(url.id)}> - </button>
      </div>
    </div>
  ));
};

export default Item;
