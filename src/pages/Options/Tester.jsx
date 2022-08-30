import React, { useState, useEffect } from 'react';

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
      console.log(newUrl);
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
