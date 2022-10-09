import React from 'react';
import './Onboarding.css';

function Onboarding() {
  return (
    <div className="onboarding">
      <div className="container">
        <div>
          <img
            className="logo-onboarding"
            src={require('/Users/lukasmoro/Desktop/podcasts-chrome-extension/public/img/podcastslogo.png')}
            alt="logo"
          />
        </div>
        <div className="textbox">
          <h1 className="head-onboarding">
            Seems like you did not add any RSS-Feeds, yet.
          </h1>
          <ol type="1" className="instructions">
            <li>
              Find <a className="link">RSS-Feeds</a> by searching for "Podcast's
              name + RSS-Feed".
            </li>
            <li>
              Add up to 5 URLs to RSS-Feeds of your favorite podcasts in the
              options or in the pop-up.
            </li>
            <li>
              Congratulations, the podcast's latest episode will now be
              displayed in your new tab!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
