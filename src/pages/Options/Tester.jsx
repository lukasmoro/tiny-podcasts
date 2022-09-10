import React, { useState, useEffect } from 'react';

export default function Tester() {
  const [urls, setUrls] = useState([]);

  const handleInput = (e) => {
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
      console.log(newUrl);
      setUrls([...urls].concat(newUrl));
    });
  };

  return (
    <div>
      <form onSubmit={handleInput} action="">
        <input type="text" name="name" placeholder="Enter your feeds here!" />
        <button>Submit</button>
      </form>
    </div>
  );
}
