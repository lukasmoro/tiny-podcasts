import React, { useState, useEffect } from 'react';
import moonIcon from '../../assets/img/moon.fill.svg';
import './Overlay.css';

const Overlay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const dateString = date.toLocaleDateString('en-US', options);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    return `${dateString} · ${timeString}`;
  };

  return (
    <div className="corner-overlay">
      <h2 className="corner bottom-left">→ PODCASTS FOR CHROME</h2>
      <div className="circles-container">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <h2 className="corner top-right">
        <img src={moonIcon} alt="Moon icon" />
      </h2>
      <h2 className="corner top-left">{formatDate(currentTime)}</h2>
      <h2 className="corner bottom-right">MADE IN STOCKHOLM, SWEDEN</h2>
    </div>
  );
};

export default Overlay;
