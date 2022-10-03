import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import './Newtab.css';

import ReactAudioPlayer from 'react-audio-player';
import Loader from './Loader';
import Renderer from './Renderer';

const Newtab = () => {
  const [loading, setLoading] = useState(false);

  const loader = () => {
    setLoading(true);
    console.log('something');
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  useEffect(() => {
    loader();
  }, []);

  // const ref = useRef(null);
  // const [width, setWidth] = useState(0);
  // useLayoutEffect(() => {
  //   setWidth(ref.current.offsetWidth);
  //   console.log(ref.current.offsetWidth);
  // }, []);

  //I NEED SOMETHING HERE TO CLEAN UP THE DATA (ESPECIALLY NUMBERING)

  return (
    <div>
      {loading ? (
        <div className="loader">
          <Loader />
        </div>
      ) : (
        <Renderer />
      )}
    </div>
  );
};

export default Newtab;
