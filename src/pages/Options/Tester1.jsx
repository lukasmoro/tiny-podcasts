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

/* {// options.js
import React from 'react';
import {useSettingsStore} from './common/useSettingsStore';


const Options = () => {
    const [settings, setSettings, isPersistent, error] = useSettingsStore();

    const handleChange = event => {
        setSettings(prevState => {
            return {
                ...prevState,
                [event.target.name]: event.target.entry
            };
        });
    };

    return (
            <div>      
                    <input
                            type="text" 
                            name="rssUrl" 
                            placeholder="Enter your name!"
                            entry={settings.newUrl}
                            onSubmit={handleChange}
                    />
                    <input
                            type="checkbox"
                            name="showHistory"
                            checked={settings.showHistory}
                            onChange={handleChange}
                    />
                {!isPersistent && <div>Error writing to the chrome.storage: {error}</div>}
            </div>
    );
};}*/
