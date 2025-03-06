import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './ThemeProvider.jsx';
import Carousel from './Carousel';
import Overlay from './Overlay.jsx';
import Onboarding from '../Panel/Onboarding.jsx';
import Redirect from './Redirect';
import '../../root/Root.css';

// Import the same event constant used in usePodcastStorage
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';

const Newtab = () => {
  const [onboarding, setOnboarding] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [isBlurVisible, setIsBlurVisible] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      for (let i = 0; i < tabs.length - 1; i++) {
        let tab = tabs[i];
        if (
          tab.pendingUrl === 'chrome://newtab/' ||
          tab.url === 'chrome://newtab/'
        ) {
          setRedirect(true);
        } else {
          setRedirect(false);
        }
      }
    });
  });

  // Check if podcasts exist in storage
  const checkForPodcasts = () => {
    chrome.storage.local.get(['newUrls'], (item) => {
      if (item.newUrls && item.newUrls.length > 0) {
        setOnboarding(false);
      } else {
        setOnboarding(true);
      }
    });
  };

  // Initial check
  useEffect(() => {
    checkForPodcasts();

    // Listen for podcast updates to automatically switch to Carousel
    const handlePodcastUpdated = (event) => {
      console.log('Podcast storage updated in Newtab:', event.detail?.action);

      // If a podcast was added and we're in onboarding, switch to carousel
      if (event.detail?.action === 'add' && onboarding) {
        checkForPodcasts();
      }
    };

    // Listen for both custom event and Chrome storage changes
    window.addEventListener(PODCAST_UPDATED_EVENT, handlePodcastUpdated);

    const handleStorageChanged = (changes, area) => {
      if (area === 'local' && changes.newUrls) {
        const newValue = changes.newUrls.newValue || [];

        // Switch to Carousel if podcasts exist and we're in onboarding
        if (newValue.length > 0 && onboarding) {
          setOnboarding(false);
        }
        // Switch to Onboarding if no podcasts exist and we're not in onboarding
        else if (newValue.length === 0 && !onboarding) {
          setOnboarding(true);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChanged);

    return () => {
      window.removeEventListener(PODCAST_UPDATED_EVENT, handlePodcastUpdated);
      chrome.storage.onChanged.removeListener(handleStorageChanged);
    };
  }, [onboarding]);

  // Move the blur functionality up to Newtab
  const handleBlurToggle = () => {
    setIsBlurVisible((prevIsBlurVisible) => !prevIsBlurVisible);
  };

  const handlePodcastEnd = () => {
    setIsBlurVisible(false);
  };

  // Add useEffect for body no-scroll class
  useEffect(() => {
    if (isBlurVisible) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isBlurVisible]);

  return (
    <ThemeProvider>
      <div>
        {onboarding ? (
          <div>
            <Onboarding onPodcastAdded={() => setOnboarding(false)} />
          </div>
        ) : redirect ? (
          <div>
            <Redirect />
          </div>
        ) : (
          <div className="App">
            <Overlay />
            <Carousel
              isBlurVisible={isBlurVisible}
              handleBlurToggle={handleBlurToggle}
              onPodcastEnd={handlePodcastEnd}
            />
            <div className={`blur ${isBlurVisible ? 'visible' : ''}`}></div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Newtab;
