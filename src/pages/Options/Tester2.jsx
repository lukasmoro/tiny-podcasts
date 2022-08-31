import React, { useState, useEffect } from 'react';
import {useChromeStorageLocal} from 'use-chrome-storage';

export default function Tester() {

  const [settings, setSettings, isPersistent, error] = useChromeStorageLocal();

  const handleChange = event => {
    setSettings(prevState => {
        return {
            ...prevState,
            [event.target.name]: event.target.entry
        };
    });

  return (
    <div>
       <input
          type="text" 
          name="rssUrl" 
          placeholder="Enter your name!"
          entry={settings.newUrl}
          onSubmit={handleChange}
        />
        <button>Submit</button> 
        {!isPersistent && <div>Error writing to the chrome.storage: {error}</div>}
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
