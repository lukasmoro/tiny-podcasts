import React, { useState, useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';
import { PlayIcon } from '../Icons/PlayIcon';
import { PauseIcon } from '../Icons/PauseIcon';
import './AudioPlayer.css';

const AudioPlayer = (props) => {
  // states
  const [isPlaying, setIsPlaying] = useState(false);
  const [buttonClicked, setButtonClicked] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(props.initialTime || 0);
  const [status, setStatus] = useState(props.initialStatus || 'unplayed');

  // refs (no re-render when updated)
  const audioPlayer = useRef(); // ref for audio element
  const progressBar = useRef(); // ref for progressbar
  const podcastID = useRef(props.podcastID); // Store the podcast ID in a ref

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

  // last saved time reference to avoid redundant saves
  const lastSavedTimeRef = useRef(props.initialTime || 0);

  // useEffect to initialize status from props
  useEffect(() => {
    if (props.initialStatus) {
      setStatus(props.initialStatus);
    }
  }, [props.initialStatus]);

  // useEffect to handle podcastID changes and initialTime
  useEffect(() => {
    // Update the podcast ID ref when it changes
    podcastID.current = props.podcastID;

    // Log to help debug time tracking issues
    console.log(
      `AudioPlayer: Initializing ${props.podcastID} with time ${props.initialTime} and status ${props.initialStatus || 'unplayed'}`
    );

    // If status is 'played', ensure we start from the beginning
    if (props.initialStatus === 'played') {
      lastSavedTimeRef.current = 0;
      setCurrentTime(0);
      if (audioPlayer.current) {
        audioPlayer.current.currentTime = 0;
      }
      if (progressBar.current) {
        progressBar.current.value = 0;
        progressBar.current.style.setProperty('--seek-before-width', '0%');
      }
    } else {
      // Update the lastSavedTimeRef when initialTime changes
      lastSavedTimeRef.current = props.initialTime || 0;

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
    }
  }, [props.initialTime, props.podcastID, props.initialStatus]);

  // Save current time when component unmounts
  useEffect(() => {
    return () => {
      // When unmounting, save the current time
      // For 'played' podcasts, this should be 0
      if (podcastID.current) {
        saveCurrentTime(true); // Force save on unmount
      }
    };
  }, []);

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
      // Update status to "playing" when playback starts
      updateStatus('playing');
      api.start({
        to: {
          opacity: 1,
          y: 50,
        },
      });
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Don't change status on pause - it remains "playing"
      api.start({
        to: {
          opacity: 0,
          y: 0,
        },
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);

      // First notify parent component about completion so it can update storage
      if (props.onEnded) {
        props.onEnded(props.podcastID);
      }

      // Update status to "played" when playback completes
      updateStatus('played');

      // Reset the last saved time reference
      lastSavedTimeRef.current = 0;

      // Delay the UI reset slightly to prevent race conditions
      setTimeout(() => {
        // Reset currentTime to 0 in the component state
        setCurrentTime(0);

        // Reset current time in the audio element if it still exists
        if (audioPlayer.current) {
          audioPlayer.current.currentTime = 0;
        }

        // Update the progress bar to show 0 progress
        if (progressBar.current) {
          progressBar.current.value = 0;
          progressBar.current.style.setProperty('--seek-before-width', '0%');
        }

        console.log(`AudioPlayer: Reset podcast ${props.podcastID} to beginning after completion`);
      }, 50);

      api.start({
        to: {
          opacity: 0,
          y: 0,
        },
      });
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
  }, [api, props.onEnded, status]);

  // function to update status and notify parent component
  const updateStatus = (newStatus) => {
    if (status !== newStatus) {
      setStatus(newStatus);

      // If status is changing to 'played', ensure the time is reset to 0
      if (newStatus === 'played') {
        // Force save with time 0
        lastSavedTimeRef.current = 0;
        if (props.onTimeUpdate && podcastID.current) {
          props.onTimeUpdate(podcastID.current, 0);
        }
      }

      // Notify parent component if onStatusUpdate prop is provided
      if (props.onStatusUpdate && podcastID.current) {
        props.onStatusUpdate(podcastID.current, newStatus);
      }
    }
  };

  // function to toggle play/pause state
  const togglePlayPause = () => {
    if (!audioPlayer.current) return;
    if (!isPlaying) {
      // If resuming a podcast that was previously played to completion,
      // update its status back to 'playing'
      if (status === 'played') {
        updateStatus('playing');
      }

      audioPlayer.current.play().catch((err) => {
        console.error('Error playing audio:', err);
      });
    } else {
      audioPlayer.current.pause();
      saveCurrentTime();
    }
  };

  // function to save the current time
  const saveCurrentTime = (force = false) => {
    if (props.onTimeUpdate && props.podcastID) {
      // If status is 'played', always save time as 0 regardless of actual position
      const currentTimeToSave = status === 'played' ? 0 :
        (audioPlayer.current ? audioPlayer.current.currentTime : 0);

      // Only save if the time has changed significantly (more than 1 second) or if forced
      // or if the status is 'played' (always ensure played podcasts are at time 0)
      if (force || status === 'played' || Math.abs(currentTimeToSave - lastSavedTimeRef.current) > 1) {
        lastSavedTimeRef.current = currentTimeToSave;
        props.onTimeUpdate(props.podcastID, currentTimeToSave);
        console.log(
          `Saved time for podcast ${props.podcastID}: ${currentTimeToSave}${status === 'played' ? ' (fully played)' : ''}`
        );
      }
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

    // If the user starts interacting with a podcast, mark it as "playing"
    if (status === 'unplayed') {
      updateStatus('playing');
    }

    audioPlayer.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveCurrentTime(true); // Force save when manually seeking
    if (audioPlayer.current.duration && progressBar.current) {
      const percentage = (newTime / audioPlayer.current.duration) * 100;
      progressBar.current.style.setProperty(
        '--seek-before-width',
        `${percentage}%`
      );
    }
  };

  // function to format seconds into mm:ss display format
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
