import React from 'react';
import List from '../Options/List';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Popup.css';
import '../../root/Root.css';

const Popup = () => {
  return (
    <div className="App">
      <ThemeProvider>
        <div className="list-container">
          <List />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Popup;
