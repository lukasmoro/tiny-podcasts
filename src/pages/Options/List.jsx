import React, { useState, useEffect } from 'react';
import Form from './Form';
import Item from './Item';

function List() {
  const [urls, setUrls] = useState([]);

  //THIS MUST IMPLEMENT REGEX ✅
  //THIS MUST THROW ERROR MESSAGE FOR WRONG FORMAT & DUPLICATE URL

  const addUrl = (url) => {
    if (
      !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
        url.text
      )
    ) {
      return;
    }
    //THIS MUST ADD TO STORAGE API ✅

    let newUrls = [url, ...urls];

    chrome.storage.local.set({ newUrls }, () => {
      setUrls(newUrls);
    });
  };

  //THIS MUST REMOVE FROM STORAGE API ✅
  const removeUrl = (id) => {
    let newUrls = [...urls].filter((url) => url.id !== id);

    chrome.storage.local.set({ newUrls }, () => {
      setUrls(newUrls);
    });
  };

  return (
    <>
      <Form onSubmit={addUrl} />
      <Item urls={urls} removeUrl={removeUrl} />
    </>
  );
}

export default List;
