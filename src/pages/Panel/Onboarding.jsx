import React from 'react';
import './Onboarding.css';
import '../Newtab/Carousel.css';
import Logo from './icon.svg';

function Onboarding() {
  return (
    <div className="onboarding">
      <div className="container">
        <div>
          <img
            className="logo-onboarding"
            src={Logo}
            alt="logo"
          />
        </div>
        <div className="textbox">
          <h1 className="head-onboarding">
            Hey, you did not add any podcasts, yet.
          </h1>
          <div className="instructions">
            <ol>
              <li>
                Find{' '}
                <div className="tooltip">
                  <a href="https://feeds.simplecast.com/eew_vyNL">
                    rss-feeds <span className="tooltiptext">example</span>
                  </a>
                </div>{' '}
                by searching for the podcast's rss-feed URL.
              </li>
              <li>
                Copy & paste up to 5 URLs of podcasts into the options or
                pop-up window.
              </li>
              <li>
                The podcast's latest episode will now be displayed in your new
                tab!
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
