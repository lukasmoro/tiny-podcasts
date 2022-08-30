/*global chrome*/

import React, { useState, useEffect } from 'react';
import Search from './Search';

// Storage.jsx (functions: setStorage, getUrl, deleteUrl (onClick) )
// 1. If rssUrl passes regex pass it to Storage.jsx
// 2. In Storage.jsx rssUrl needs to be set for an array
// 3. This array needs to be stored in chrome storage
// 4. Another function needs to put passed url into that list array (evenhandler onsubmit input field)
// 5. Another function needs to be able to delete (splice) urls of list array (eventhandler onclick button component)

 export default function Storage({ rssUrl, setRssUrl }) {

    const [rssUrl, setRssUrl] = useState(['']);

    const setStorage = (rssUrl) => {chrome.storage.sync.set({ rssUrl: rssUrl ? rssUrl : setRssUrl })};

    const getUrl = () => {chrome.storage.sync.get('rssUrl', (item) => {
      if (item.rssUrl) {
       setRssUrl({
          rssUrl: item.rssUrl,
        })
      }
    })};

    componentDidMount = () => {setRssUrl()}
    
    const addUrl = () => {
    const newRssUrl = {rssUrl: setRssUrl}
    const rssUrl = [...setRssUrl];
    rssUrl.push(newRssUrl)
    setRssUrl({
      rssUrl: setRssUrl,
    })
    setStorage(rssUrl)};

    const deleteUrl = () => {const rssUrl = setRssUrl
      rssUrl.splice(index, 1)
      setRssUrl({
        rssUrl: rssUrl,
      })
      setStorage()};

      inputChangeHandler = (e) => {
        setRssUrl({
          [e.target.name]: e.target.value
        })
      }

  return (

   )
 };

