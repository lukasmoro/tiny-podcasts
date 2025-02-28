import React from 'react';
import List from '../Options/List';
import { ThemeProvider } from '../Newtab/ThemeProvider';
import './Popup.css';
import '../../root/Root.css';

const Popup = () => {
  return (
    <div className="App">
      <ThemeProvider>
        <List />
      </ThemeProvider>
    </div>
  );
};

export default Popup;
