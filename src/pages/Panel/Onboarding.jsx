import React, { useState } from 'react';
import './Onboarding.css';
import '../Newtab/Carousel.css';
import Logo from './icon.png';

function Onboarding() {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = (url) => {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
  };

  const tooltipText = copied ? 'url copied' : 'example';

  return (
    <div className="onboarding">
      <div className="container">
        <div>
          <img className="logo-onboarding" src={Logo} alt="logo" />
        </div>
        <div className="textbox">
          <h1 className="head-onboarding">
            You did not add any podcasts, yet.
          </h1>
          <div className="instructions">
            <ol>
              <li>
                Find{' '}
                <div className="tooltip">
                  <a
                    href="https://feeds.simplecast.com/eew_vyNL"
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyClick('https://feeds.simplecast.com/eew_vyNL');
                    }}
                  >
                    rss-feeds <span className="tooltiptext">{tooltipText}</span>
                  </a>
                </div>{' '}
                by searching for the podcast's rss-feed url.
              </li>
              <li>
                Add up to 5 urls of podcasts in the options or pop-up window.
              </li>
              <li>
                The latest episodes will now be displayed in your new tab!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
