import React from 'react';
import './Onboarding.css';

function Onboarding() {
  return (
    <div className="onboarding">
      <div className="container">
        {/* <div>
          <img
            className="logo-onboarding"
            src={require('/Users/lukasmoro/Documents/React/podcasts-chrome-extension/src/assets/img/podcastslogo.png')}
            alt="logo"
          />
        </div> */}
        <div className="textbox">
          <h1 className="head-onboarding">
            Looks like you did not add any Podcasts, yet.
          </h1>
          <div className="instructions">
            <ol>
              <li>
                Find{' '}
                <div className="tooltip">
                  <a href="https://feeds.simplecast.com/eew_vyNL">
                    RSS-Feeds <span className="tooltiptext">example</span>
                  </a>
                </div>{' '}
                by searching for "Podcast's name + RSS-Feed".
              </li>
              <li>
                Copy and paste up to 5 URLs of podcasts into the options or
                pop-up.
              </li>
              <li>
                The podcast's latest episode will now be displayed in your new
                tab!
              </li>
            </ol>
          </div>
        </div>
      </div>
      <p className="signature">
        Podcasts by <a href="https://lukasmoro.com">Lukas Moro</a>.
        <br />
        <a href="">Github</a> • <a href="">Privacy Policy</a>
      </p>
    </div>
  );
}

export default Onboarding;
