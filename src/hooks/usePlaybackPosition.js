import { useState, useEffect } from 'react';

const usePlaybackPosition = (podcastId) => {
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const loadSavedPosition = async () => {
      try {
        const result = await chrome.storage.local.get(podcastId);
        if (result[podcastId]) {
          setCurrentTime(result[podcastId]);
        }
      } catch (error) {
        console.error('Error loading playback position:', error);
      }
    };

    loadSavedPosition();
  }, [podcastId]);

  const savePosition = async (time) => {
    try {
      await chrome.storage.local.set({ [podcastId]: time });
      setCurrentTime(time);
    } catch (error) {
      console.error('Error saving playback position:', error);
    }
  };

  return [currentTime, savePosition];
};

export default usePlaybackPosition;
