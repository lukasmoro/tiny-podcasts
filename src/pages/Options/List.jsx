import React, { useState, useEffect } from 'react';
import Form from './Form';
import Item from './Item';

function List() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    chrome.storage.sync.get(['newUrls'], (item) => {
      console.log(item.newUrls);
      const items = item.newUrls;
      const feedItems = [...items].map((el, key) => ({
        key: item.newUrls[key].key,
        text: item.newUrls[key].text,
      }));
      setItems(feedItems);
      console.log(feedItems);
    });
  }, []);

  const addUrl = (item) => {
    const urlChecker = (url) => url.text != item.text;

    let check = items.every(urlChecker);

    if (
      items.length > 4 ||
      !check ||
      !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
        item.text
      )
    ) {
      alert('Please enter a valid url! You can enter up to five podcast!');
      return;
    }

    let newUrls = [item, ...items];

    chrome.storage.sync.set({ newUrls }, () => {
      setItems(newUrls);
      console.log(newUrls);
    });
  };

  const removeUrl = (key) => {
    let newUrls = items.filter((item) => item.key !== key);
    console.log(key);
    chrome.storage.sync.set({ newUrls }, () => {
      setItems(newUrls);
    });
  };

  return (
    <div>
      <Form onSubmit={addUrl} />
      <Item items={items} removeUrl={removeUrl} />
    </div>
  );
}

export default List;
