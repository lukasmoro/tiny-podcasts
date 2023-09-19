import React, { useEffect, useState } from 'react';
import Carousel from './Carousel';
import Onboarding from '../Panel/Onboarding.jsx';
import Redirect from './Redirect';

const Newtab = () => {
  const [onboarding, setOnboarding] = useState(false);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      for (let i = 0; i < tabs.length - 1; i++) {
        let tab = tabs[i];
        if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
          setRedirect(true);
        } else {
          setRedirect(false);
        }
      }
    });
  })

  useEffect(() => {
    chrome.storage.local.get(['newUrls'], (item, key) => {
      const checker = item.newUrls.length;
      if (checker === 0) {
        setOnboarding(true);
      }
    });
  }, []);

  return (
    <div>
      {onboarding ? (
        <div>
          <Onboarding />
        </div>
      ) : redirect ? (
        <div>
          <Redirect />
        </div>
      ) : (
        <Carousel />
      )}
    </div>
  );

};

export default Newtab;
