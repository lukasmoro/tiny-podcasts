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

  const handleInput1 = async (e) => {
    e.preventDefault();

    const rssUrl1 = e.target[0].value;

    const urlRegex =
      /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    if (!urlRegex.test(rssUrl1)) {
      return;
    }

    const key = 'key1';

    const url1 = { name: rssUrl1 };

    chrome.storage.local.set({ key: url1 }, () => {
      console.log(url1.name);
    });
  };

  const handleInput2 = async (e) => {
    e.preventDefault();

    const rssUrl2 = e.target[0].value;

    const urlRegex =
      /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    if (!urlRegex.test(rssUrl2)) {
      return;
    }

    const key = 'key2';

    const url2 = { name: rssUrl2 };

    chrome.storage.local.set({ key: url2 }, () => {
      console.log(url2.name);
    });
  };

  const handleInput3 = async (e) => {
    e.preventDefault();

    const rssUrl3 = e.target[0].value;

    const urlRegex =
      /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
    if (!urlRegex.test(rssUrl3)) {
      return;
    }

    const key = 'key3';

    const url3 = { name: rssUrl3 };

    chrome.storage.local.set({ key: url3 }, () => {
      console.log(url3.name);
    });
  };

  return (
    <div>
      <form onSubmit={handleInput1} action="">
        <input type="text" name="rssUrl1" placeholder="Enter your link!" />
        <button>+</button>
      </form>
      <form onSubmit={handleInput2} action="">
        <input type="text" name="rssUrl2" placeholder="Enter your link!" />
        <button>+</button>
      </form>
      <form onSubmit={handleInput3} action="">
        <input type="text" name="rssUrl3" placeholder="Enter your link!" />
        <button>+</button>
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
