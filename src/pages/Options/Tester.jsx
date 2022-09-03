import React, { useState, useEffect } from 'react';

/*

//https://dev.to/paulasantamaria/chrome-extensions-local-storage-1b34

//Storage with key

const key = 'myKey';
const value = { name: 'my value' };

chrome.storage.local.set({key: value}, () => {
  console.log('Stored name: ' + value.name);
});

//Retrieve with key

const key = 'myKey';
chrome.storage.local.get([key], (result) => {
  console.log('Retrieved name: ' + result.myKey.name);
});

// Remove items under a certain key (Eventhandler => Delete Button)

const key = 'myKey';
chrome.storage.local.remove([key], (result) => {
  console.log('Removed items for the key: ' + key);
});

*/

export default function Tester() {
  const [urls, setUrls] = useState([]);

  const handleInput = async (e) => {
    e.preventDefault();

    const rssUrl = e.target[0].value;

    const urlRegex =
      /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    if (!urlRegex.test(rssUrl)) {
      return;
    }

    const newUrl = {
      id: new Date().getTime(),
      text: rssUrl,
    };

    chrome.storage.local.set({ newUrl }, () => {
      setUrls([...urls].concat(newUrl));
    });
  };

  function deleteUrl(id) {
    const updatedUrls = [...urls].filter((newUrl) => newUrl.id !== id);
    setUrls(updatedUrls);
  }

  useEffect(() => {
    chrome.storage.local.get(['newUrl'], (item) => {
      console.log(item.newUrl);
    });
  }, []);

  return (
    <div>
      <form onSubmit={handleInput} action="">
        <input type="text" name="rssUrl" placeholder="Enter your name!" />
        <button>Submit</button>
      </form>
      {urls.map((newUrl) => (
        <div key={newUrl.id}>
          <div>{newUrl.text}</div>
          <button onClick={() => deleteUrl(newUrl.id)}> - </button>
        </div>
      ))}
    </div>
  );
}
