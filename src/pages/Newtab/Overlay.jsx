import React, { useState, useEffect } from 'react';
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
      <h2 className="corner top-right">🌙 </h2>
      <h2 className="corner top-left">{formatDate(currentTime)}</h2>
      <h2 className="corner bottom-right">STOCKHOLM, SWEDEN</h2>
    </div>
  );
};

export default Overlay;
