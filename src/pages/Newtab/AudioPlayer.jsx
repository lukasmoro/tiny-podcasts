import React, { useState, useRef, useEffect } from 'react';
import { animated, useSpring } from '@react-spring/web';
import './AudioPlayer.css';
import BehaviourClick from './BehaviourClick.jsx';
import usePlaybackPosition from '../../hooks/usePlaybackPosition.js';
import Play from '../../assets/img/play.fill.svg';
import Pause from '../../assets/img/pause.fill.svg';

const AudioPlayer = (props) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const {
    currentTime: savedTime,
    status,
    updatePlaybackState,
    PLAYBACK_STATUS,
  } = usePlaybackPosition(props.podcastId);

  const audioPlayer = useRef();
  const progressBar = useRef();
  const animationRef = useRef();

  const [springs, api] = useSpring(() => ({
    from: { x: 0 },
    reverse: !isPlaying,
  }));

  useEffect(() => {
    const audio = audioPlayer.current;
    const handlePlay = () => {
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(whilePlaying);
    };

    const handlePause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
      updatePlaybackState(audio.currentTime, audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
      updatePlaybackState(audio.duration, audio.duration);

      api.start({
        from: {
          opacity: 1,
          y: 50,
        },
        to: {
          opacity: 0,
          y: 0,
        },
      });

      // Call the onEnded callback if it exists
      if (props.onEnded) {
        props.onEnded();
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const audio = audioPlayer.current;
    const handlePlay = () => {
      setIsPlaying(true);
      animationRef.current = requestAnimationFrame(whilePlaying);
    };

    const handlePause = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationRef.current);
      updatePlaybackState(audio.currentTime, audio.duration);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const togglePlayPause = () => {
    if (!isPlaying) {
      audioPlayer.current.play();
      api.start({
        from: {
          opacity: 0,
          y: 0,
        },
        to: {
          opacity: 1,
          y: 50,
        },
      });
    } else {
      audioPlayer.current.pause();
      api.start({
        from: {
          opacity: 1,
          y: 50,
        },
        to: {
          opacity: 0,
          y: 0,
        },
      });
    }
  };

  const whilePlaying = () => {
    if (audioPlayer.current) {
      const currentValue = audioPlayer.current.currentTime;
      progressBar.current.value = currentValue;
      setCurrentTime(currentValue);
      changePlayerCurrentTime();
      animationRef.current = requestAnimationFrame(whilePlaying);
    }
  };

  const onLoadedMetadata = () => {
    if (audioPlayer.current && progressBar.current) {
      const seconds = Math.floor(audioPlayer.current.duration);
      setDuration(seconds);
      progressBar.current.max = seconds;

      if (savedTime > 0) {
        audioPlayer.current.currentTime = savedTime;
        progressBar.current.value = savedTime;
        setCurrentTime(savedTime);
        const percentage = (savedTime / seconds) * 100;
        progressBar.current.style.setProperty(
          '--seek-before-width',
          `${percentage}%`
        );
      } else {
        progressBar.current.value = 0;
        setCurrentTime(0);
        progressBar.current.style.setProperty('--seek-before-width', '0%');
      }

      changePlayerCurrentTime();
    }
  };

  const changeRange = () => {
    if (audioPlayer.current) {
      const newTime = Number(progressBar.current.value);
      audioPlayer.current.currentTime = newTime;

      audioPlayer.current.currentTime = progressBar.current.value;
      setCurrentTime(newTime);
      changePlayerCurrentTime();
      updatePlaybackState(newTime, audioPlayer.current.duration);
    }
  };

  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  };

  const changePlayerCurrentTime = () => {
    if (progressBar.current && duration > 0) {
      const percentage = (progressBar.current.value / duration) * 100;
      const validPercentage = isFinite(percentage) ? percentage : 0;

      progressBar.current.style.setProperty(
        '--seek-before-width',
        `${validPercentage}%`
      );
      setCurrentTime(progressBar.current.value);
    }
  };

  return (
    <div className="audio-player">
      <div className="player-container">
        <audio
          ref={audioPlayer}
          src={props.src}
          preload="metadata"
          onLoadedMetadata={onLoadedMetadata}
        />
        <div className="button">
          <BehaviourClick>
            <button
              className="play-pause"
              onClick={() => {
                togglePlayPause();
                if (props.handleClick) props.handleClick();
              }}
            >
              <img
                src={isPlaying ? Pause : Play}
                alt={isPlaying ? 'Pause' : 'Play'}
              />
            </button>
          </BehaviourClick>
        </div>
        <animated.div style={{ ...springs }} className="progress">
          <div className="current-time">{calculateTime(currentTime)}</div>
          <div>
            <input
              className="progress-bar"
              type="range"
              defaultValue="0"
              ref={progressBar}
              onChange={changeRange}
            />
          </div>
          <div className="duration">
            {duration && !isNaN(duration) && calculateTime(duration)}
          </div>
        </animated.div>
      </div>
    </div>
  );
};

export default AudioPlayer;
