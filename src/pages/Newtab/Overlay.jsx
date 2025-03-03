import React, { useState, useEffect } from 'react';
import { SunIcon } from '../Icons/SunIcon';
import { MoonIcon } from '../Icons/MoonIcon';
import './Overlay.css';

const Overlay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || false
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

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
      <h2 className="corner bottom-left">→ TINY PODCASTS</h2>
      <div className="circles-container">
        <div className="circle"></div>
        <div className="circle"></div>
      </div>
      <div className="top-center"></div>
      <h2 className="corner top-right">
        {isDarkMode ? (
          <MoonIcon className="theme-toggle" onClick={handleThemeToggle} />
        ) : (
          <SunIcon className="theme-toggle" onClick={handleThemeToggle} />
        )}
      </h2>
      <h2 className="corner top-left">{formatDate(currentTime)}</h2>
      <h2 className="corner bottom-right">0.0.2 · MADE IN STOCKHOLM, SWEDEN</h2>
    </div>
  );
};

export default Overlay;
