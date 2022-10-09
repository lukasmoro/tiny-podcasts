import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';

import ReactAudioPlayer from 'react-audio-player';
import Loader from './Loader';
import Renderer from './Renderer';
import Onboarding from './Onboarding';

const Newtab = () => {
  const [onboarding, setOnboarding] = useState(false);

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
      ) : (
        <Renderer />
      )}
    </div>
  );
};

export default Newtab;
