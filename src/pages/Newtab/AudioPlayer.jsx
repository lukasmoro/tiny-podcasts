import React, { useState, useRef, useEffect } from 'react';
import { animated } from '@react-spring/web';
import { useSpring } from '@react-spring/core';
import './AudioPlayer.css';
import { PlayIcon } from '../Icons/PlayIcon';
import { PauseIcon } from '../Icons/PauseIcon';

const AudioPlayer = (props) => {
  // states
  const [isPlaying, setIsPlaying] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // refs (no re-render when updated)
  const audioPlayer = useRef(); // ref for audio element
  const progressBar = useRef(); // ref for progressbar

  // animation config for player progress
  const [springs, api] = useSpring(() => ({
    from: { opacity: 0, y: 0 },
    to: { opacity: isPlaying ? 1 : 0, y: isPlaying ? 50 : 0 },
    config: { tension: 280, friction: 60 },
  }));

  // animation config for button click
  const buttonSpring = useSpring({
    display: 'inline-block',
    backfaceVisibility: 'hidden',
    transform: buttonClicked ? 'translateY(-10px)' : 'translateY(0px)',
    config: {
      tension: 300,
      friction: 10,
    },
  });

  // useEffect(() => {
  //   return () => {
  //     if (audioPlayer.current && props.podcastID) {
  //       saveCurrentTime();
  //     }
  //   };
  // }, []);

  // useEffect to set initial time from storage
  useEffect(() => {
    if (audioPlayer.current && props.initialTime) {
      audioPlayer.current.currentTime = props.initialTime;
      setCurrentTime(props.initialTime);
      if (progressBar.current && audioPlayer.current.duration) {
        const percentage =
          (props.initialTime / audioPlayer.current.duration) * 100;
        progressBar.current.value = props.initialTime;
        progressBar.current.style.setProperty(
          '--seek-before-width',
          `${percentage}%`
        );
      }
    }
  }, [props.initialTime]);

  // useEffect to reset button click animation
  useEffect(() => {
    if (!buttonClicked) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      setButtonClicked(false);
    }, 150);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [buttonClicked]);

  // useEffect to handle audio metadata loading
  useEffect(() => {
    const audio = audioPlayer.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      const audioDuration = audio.duration;
      setDuration(audioDuration);
      if (progressBar.current) {
        progressBar.current.max = audioDuration;
      }

      // Set initial time after duration is known
      if (props.initialTime && isFinite(audioDuration)) {
        audio.currentTime = props.initialTime;
        setCurrentTime(props.initialTime);

        // Update progress bar with correct percentage
        if (progressBar.current) {
          const percentage = (props.initialTime / audioDuration) * 100;
          progressBar.current.value = props.initialTime;
          progressBar.current.style.setProperty(
            '--seek-before-width',
            `${percentage}%`
          );
        }
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [props.initialTime]);

  // useEffect to update progress bar during playback
  useEffect(() => {
    const audio = audioPlayer.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const currentValue = audio.currentTime;
      const audioDuration = audio.duration;
      setCurrentTime(currentValue);
      if (Math.floor(currentValue) % 5 === 0) {
        saveCurrentTime();
      }
      if (progressBar.current && isFinite(audioDuration) && audioDuration > 0) {
        progressBar.current.value = currentValue;
        const percentage = (currentValue / audioDuration) * 100;
        const minVisibleWidth =
          currentValue > 0 ? Math.max(percentage, 0.5) : 0;
        const rightRadius = percentage >= 66.67 ? '3.5px' : '0px';
        progressBar.current.style.setProperty('--right-radius', rightRadius);
        const widthAdjust = percentage >= 66.67 ? '0px' : '1px';
        progressBar.current.style.setProperty('--width-adjust', widthAdjust);
        progressBar.current.style.setProperty(
          '--seek-before-width',
          `${minVisibleWidth}%`
        );
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // useEffect to handle play/pause state changes and track completion
  useEffect(() => {
    const audio = audioPlayer.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      api.start({
        to: {
          opacity: 1,
          y: 50,
        },
      });
    };

    const handlePause = () => {
      setIsPlaying(false);
      api.start({
        to: {
          opacity: 0,
          y: 0,
        },
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      api.start({
        to: {
          opacity: 0,
          y: 0,
        },
      });
      if (props.onEnded) {
        props.onEnded(props.podcastID);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        const seconds = Math.floor(audio.duration);
        setDuration(seconds);
        if (progressBar.current) {
          progressBar.current.max = seconds;
        }
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('durationchange', handleDurationChange);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('durationchange', handleDurationChange);
    };
  }, [api, props.onEnded]);

  // function to toggle play/pause state
  const togglePlayPause = () => {
    if (!audioPlayer.current) return;
    if (!isPlaying) {
      audioPlayer.current.play().catch((err) => {
        console.error('Error playing audio:', err);
      });
    } else {
      audioPlayer.current.pause();
      saveCurrentTime();
    }
  };

  // function to save the current time
  const saveCurrentTime = () => {
    if (props.onTimeUpdate && audioPlayer.current && props.podcastID) {
      props.onTimeUpdate(props.podcastID, audioPlayer.current.currentTime);
      console.log(props.podcastID, audioPlayer.current.currentTime);
    }
  };

  // function to handle button click combined with play/pause toggle
  const handleButtonClick = () => {
    setButtonClicked(true);
    togglePlayPause();
    if (props.handleClick) props.handleClick();
  };

  // function to handle manual seeking via progress bar
  const changeRange = () => {
    if (!audioPlayer.current || !progressBar.current) return;
    const newTime = Number(progressBar.current.value);
    if (isNaN(newTime)) return;
    audioPlayer.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveCurrentTime();
    if (audioPlayer.current.duration && progressBar.current) {
      const percentage = (newTime / audioPlayer.current.duration) * 100;
      progressBar.current.style.setProperty(
        '--seek-before-width',
        `${percentage}%`
      );
    }
  };

  // utility function to format seconds into mm:ss display format
  const calculateTime = (secs) => {
    if (!isFinite(secs) || secs < 0) return '00:00';
    const timeInSeconds = Number(secs);
    const minutes = Math.floor(timeInSeconds / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(timeInSeconds % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  };

  return (
    <div className="audio-player">
      <div className="player-container">
        <audio ref={audioPlayer} src={props.src} preload="metadata" />
        <div className="button">
          <animated.button
            className="play-pause"
            onClick={handleButtonClick}
            style={buttonSpring}
          >
            {isPlaying ? (
              <PauseIcon className="player-icon" />
            ) : (
              <PlayIcon className="player-icon" />
            )}
          </animated.button>
        </div>
        <animated.div style={springs} className="progress-container">
          <div className="current-time">{calculateTime(currentTime)}</div>
          <div className="progress-bar-wrapper">
            <input
              className="progress-bar"
              type="range"
              defaultValue="0"
              ref={progressBar}
              onChange={changeRange}
              onInput={changeRange}
            />
          </div>
          <div className="duration">
            {duration && isFinite(duration) ? calculateTime(duration) : '00:00'}
          </div>
        </animated.div>
      </div>
    </div>
  );
};

export default AudioPlayer;
