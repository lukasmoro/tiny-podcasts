import React, { useState, useEffect } from 'react';

export default function Tester() {
  const [urls, setUrls] = useState([]);

  const handleInput = (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    chrome.storage.local.set({ name }, () => {
      console.log(`Hello, ${name}`);
    });
  };

  useEffect(() => {
    chrome.storage.local.get(['name'], (item) => {
      console.log(item.name);
    });
  }, []);
  return (
    <div>
      <form onSubmit={handleInput} action="">
        <input type="text" name="name" placeholder="Enter your name!" />
        <button>Submit</button>
      </form>
    </div>
  );
}

// export default function Search(rssUrl, setRssUrl) {
//     const checkRss = async (e) => {
//       e.preventDefault();
//       console.log(setRssUrl);
//       const urlRegex =
//         /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
//       if (!urlRegex.test(rssUrl)) {
//         return;
//       }
//     };

//     return (
//       <div>
//         <form onSubmit={checkRss}>
//           <div>
//             <h1>Podcasts</h1>
//             <label>Enter an URL!</label>
//             <br />
//             <input
//               className="item"
//               placeholder="hello world"
//               onChange={(e) => setRssUrl(e.target.value)}
//               value={rssUrl}
//             />
//           </div>
//           <input className="item" type="submit" onClick={handleInput} />
//         </form>
//       </div>
//     );
//   }
