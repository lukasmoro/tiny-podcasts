import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import './Newtab.css';

import ReactAudioPlayer from 'react-audio-player';
import Loader from './Loader';
import Renderer1 from './Renderer1';
import Renderer2 from './Renderer2';
import Renderer3 from './Renderer3';
import Renderer4 from './Renderer4';
import Renderer5 from './Renderer5';

const Newtab = () => {
  // const ref = useRef(null);
  // const [width, setWidth] = useState(0);
  // useLayoutEffect(() => {
  //   setWidth(ref.current.offsetWidth);
  //   console.log(ref.current.offsetWidth);
  // }, []);

  //I NEED SOMETHING HERE TO CLEAN UP THE DATA (ESPECIALLY NUMBERING)

  return (
    <div className="App">
      <Renderer1 />
      <Renderer2 />
      <Renderer3 />
      <Renderer4 />
      <Renderer5 />
    </div>
  );
};

export default Newtab;
