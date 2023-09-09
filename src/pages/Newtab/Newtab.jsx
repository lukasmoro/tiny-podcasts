import React, { useEffect, useState } from 'react';
import Carousel from './Carousel';
import Redirect from './Redirect';

const Newtab = () => {
  const [redirect, setRedirect] = useState(false);
  useEffect(() => {

  }, []);

  return (
    <div>
      {onboarding ? (
        <div>
          <Redirect />
        </div>
      ) : (
        <Carousel />
      )}
    </div>
  );
};

export default Newtab;
