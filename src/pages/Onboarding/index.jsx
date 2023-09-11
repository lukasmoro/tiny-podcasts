import React from 'react';
import { render } from 'react-dom';
import Onboarding from './Onboarding.jsx';
import './Onboarding.css';

render(<Onboarding />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
