import React from 'react';
import { render } from 'react-dom';

import Newtab from './Newtab';
import Renderer from './Renderer';
import Carousel from './Carousel';
// import './index.css';

render(<Carousel />, window.document.querySelector('#app-container'));

if (module.hot) module.hot.accept();
