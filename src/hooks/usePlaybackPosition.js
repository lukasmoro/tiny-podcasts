import { useState, useEffect } from 'react';

const PLAYBACK_STATUS = {
  UNPLAYED: 'UNPLAYED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
};

const FINISHED_THRESHOLD = 30;

const usePlaybackPosition = (podcastId) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [status, setStatus] = useState(PLAYBACK_STATUS.UNPLAYED);

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
          setCurrentTime(time || 0);
          setStatus(savedStatus || PLAYBACK_STATUS.UNPLAYED);
          setDuration(savedDuration || 0);
        }
      } catch (error) {
        console.error('Error loading playback state:', error);
      }
    };

    loadSavedState();
  }, [podcastId]);

  const updatePlaybackState = async (time, totalDuration) => {
    try {
      let newStatus = status;

      if (time === 0) {
        newStatus = PLAYBACK_STATUS.UNPLAYED;
      } else if (totalDuration && totalDuration - time <= FINISHED_THRESHOLD) {
        newStatus = PLAYBACK_STATUS.FINISHED;
      } else if (time > 0) {
        newStatus = PLAYBACK_STATUS.IN_PROGRESS;
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
      setStatus(PLAYBACK_STATUS.UNPLAYED);
      setDuration(0);
    } catch (error) {
      console.error('Error resetting playback state:', error);
    }
  };

  return {
    currentTime,
    duration,
    status,
    updatePlaybackState,
    resetPlaybackState,
    PLAYBACK_STATUS,
  };
};

export default usePlaybackPosition;
