import React, { useEffect, useState } from 'react';
import Carousel from './Carousel';
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
        <Carousel />
      )}
    </div>
  );
};

export default Newtab;
