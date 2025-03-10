import { useState, useEffect } from 'react';

const currentStatus = {
  UNPLAYED: 'UNPLAYED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
};

const usePodcastPlayback = (podcastId) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState(currentStatus.UNPLAYED);

  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const result = await chrome.storage.local.get(podcastId);
        if (result[podcastId]) {
          const {
            time,
            status: savedStatus,
            duration: savedDuration,
          } = result[podcastId];

          if (savedStatus === currentStatus.FINISHED) {
            setCurrentTime(0);
          } else {
            setCurrentTime(time || 0);
          }

          setStatus(savedStatus || currentStatus.UNPLAYED);
          setDuration(savedDuration || 0);
        }
      } catch (error) {
        console.error('Error loading playback state:', error);
      }
    };

    loadSavedState();

    const handleStorageChange = (changes, namespace) => {
      if (namespace === 'local' && changes[podcastId]) {
        const newValue = changes[podcastId].newValue;
        if (newValue) {
          if (newValue.time > 0 && newValue.time < newValue.duration - 30) {
            setCurrentTime(newValue.time || 0);
          }
          setStatus(newValue.status || currentStatus.UNPLAYED);
          setDuration(newValue.duration || 0);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [podcastId]);

  const updatePlaybackState = async (time, totalDuration) => {
    try {
      let newStatus = status;

      if (time === 0) {
      } else if (totalDuration && totalDuration - time <= 30) {
        newStatus = currentStatus.FINISHED;
      } else if (time > 0) {
        newStatus = currentStatus.IN_PROGRESS;
      }

      const newState = {
        time,
        status: newStatus,
        duration: totalDuration,
        lastUpdated: Date.now(),
      };

      await chrome.storage.local.set({ [podcastId]: newState });

      setCurrentTime(time);
      setStatus(newStatus);
      setDuration(totalDuration);
    } catch (error) {
      console.error('Error saving playback state:', error);
    }
  };

  const resetPlaybackState = async () => {
    try {
      await chrome.storage.local.remove(podcastId);
      setCurrentTime(0);
      setStatus(currentStatus.UNPLAYED);
      setDuration(0);
    } catch (error) {
      console.error('Error resetting playback state:', error);
    }
  };

  return {
    currentTime,
    duration,
    status,
    currentStatus,
    updatePlaybackState,
    resetPlaybackState,
  };
};

export default usePodcastPlayback;
