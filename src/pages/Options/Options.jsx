import React, { useState, useEffect } from 'react';
import List from './List';

//FIX THE LIST TO DISPLAY ITEMS FROM STORAGE

export default function Options() {
  const [items, setItems] = useState();

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      console.log(item.newUrls);
      const items = item.newUrls;
      const feedItems = [...items].map((el, key) => ({
        key: item.newUrls[key].id,
        text: item.newUrls[key].text,
      }));
      setItems(feedItems);
      console.log(feedItems);
    });
  }, []);

  const removeUrl = (key) => {
    let newUrls = [...items].filter((item) => item.key !== key);
    setItems(newUrls);
  };

  return (
    <div className="App">
      <List />
      {items?.map((item, key) => {
        return (
          <div key={key}>
            <p key={item.key}>{item.text}</p>
            <button onClick={() => removeUrl(item.key)}> - </button>
          </div>
        );
      })}
    </div>
  );
}
