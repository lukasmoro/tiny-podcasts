import React from 'react';
import { render } from 'react-dom';
import Newtab from '../Newtab/Newtab.jsx';
import './Onboarding.css';

render(<Newtab />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
