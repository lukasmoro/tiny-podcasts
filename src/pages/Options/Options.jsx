import React from 'react';
import Searchbar from './Searchbar';
import List from './List';
import Overlay from '../Newtab/Overlay';
import BuyMeACoffeeButton from '../../components/BuyMeACoffeeButton/BuyMeACoffeeButton';
import FeedbackButton from '../../components/FeedbackButton/FeedbackButton';
import Recommendations from '../Newtab/Recommendations';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import { usePodcastData } from '../../hooks/usePodcastData';
import './Options.css';
import './Searchbar.css';
import './List.css';
import '../../root/Root.css';

const Options = () => {
  const {
    items,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
  } = usePodcastData();

  // define podcast IDs for row of recommendations
  const recommendationRows = [
    ['1200361736', '1671669052', '1528594034', '81934659'],
  ];

  return (
    <div className="App">
      <ThemeProvider>
        <Overlay />
        <div className="cards-container">
          <div className="card left-card">
            <div className="text-container">
              <h2 className="sub-header">Manage Podcasts</h2>
              <h1 className="header">Subscriptions</h1>
              <p className="instructions">
                Add, remove & reorder podcasts here or in the pop-up.
              </p>
            </div>
            <div className="search-container">
              <Searchbar onSubmit={handleAddPodcast} />
            </div>
            <div className="list-container">
              <List
                items={items}
                removeUrl={handleRemovePodcast}
                moveItem={handleReorderPodcasts}
              />
            </div>
          </div>
          <div className="right-cards">
            <div className="card right-card">
              <div className="text-container">
                <h2 className="sub-header">Find Podcasts</h2>
                <h1 className="header">Recommendations</h1>
                <p className="instructions">
                  Unsure what to listen to? Here are some favorites.
                </p>
                {recommendationRows.map((rowIds, index) => (
                  <Recommendations
                    key={`row-${index}`}
                    podcastID={rowIds}
                    onAddPodcast={handleAddPodcast}
                  />
                ))}
              </div>
            </div>
            <div className="card right-card">
              <div className="text-container">
                <h2 className="sub-header">Enjoy Podcasts?</h2>
                <h1 className="header">Feedback & Tip Jar</h1>
                <p className="instructions">
                  Every feedback and tip helps Tiny Software to refine and create Tiny Products in the future.
                  <br /><br /><em>Thanks for your support!✨✨</em>
                </p>
                <div className="buttons-container">
                  <FeedbackButton text="Feedback" url="https://form.typeform.com/to/fjkoskTH" />
                  <BuyMeACoffeeButton />
                </div>
                <div className="items">
                  <p></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="socials-links-container">
          <a
            className="socials"
            href="https://discord.gg/kMDJ9xHr"
            target="_blank"
            rel="noopener noreferrer"
          >Join Discord</a>
          <a
            className="socials"
            href="https://tinysoftware.club/privacy/"
            target="_blank"
            rel="noopener noreferrer"
          >Privacy Policy</a>
          {/* <a
            className="socials"
            href="https://discord.gg/kMDJ9xHr"
            target="_blank"
            rel="noopener noreferrer"
          >Open Source</a> */}
        </div>
      </ThemeProvider >
    </div >
  );
};

export default Options;
