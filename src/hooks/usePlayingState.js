import { useState, useEffect } from 'react';

// custom event for broadcasting playing state changes
const PLAYING_STATE_CHANGED = 'podcast-playing-state-changed';

// broadcast the playing state change
export const broadcastPlayingState = (isAnyPodcastPlaying) => {
  const event = new CustomEvent(PLAYING_STATE_CHANGED, { 
    detail: { isPlaying: isAnyPodcastPlaying } 
  });
  window.dispatchEvent(event);
};

// hook to consume the playing state
export const usePlayingState = () => {
  const [isAnyPodcastPlaying, setIsAnyPodcastPlaying] = useState(false);

  useEffect(() => {
    const handlePlayingStateChange = (event) => {
      setIsAnyPodcastPlaying(event.detail.isPlaying);
    };

    window.addEventListener(PLAYING_STATE_CHANGED, handlePlayingStateChange);

    return () => {
      window.removeEventListener(PLAYING_STATE_CHANGED, handlePlayingStateChange);
    };
  }, []);

  return isAnyPodcastPlaying;
}; 