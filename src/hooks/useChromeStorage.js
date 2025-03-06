import { useState, useEffect, useCallback, useRef } from 'react';

// Constants
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';
const PLAYBACK_STATUS = {
  UNPLAYED: 'UNPLAYED',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
};
const FINISHED_THRESHOLD = 30;

// Helper to emit custom events when storage changes
const emitStorageUpdate = (detail = {}) => {
  const event = new CustomEvent(PODCAST_UPDATED_EVENT, { detail });
  window.dispatchEvent(event);
};

/**
 * Unified podcast store hook that manages both podcast data and playback state
 */
export const useChromeStorage = () => {
  // State
  const [podcastStore, setPodcastStore] = useState({
    podcasts: {},
    orderedIds: [],
    isLoaded: false,
  });

  // Refs to track operation state
  const initiatedUpdateRef = useRef(false);
  const isReorderingRef = useRef(false);
  const lastReorderSignatureRef = useRef(null);

  // Initialize store from Chrome storage
  useEffect(() => {
    const loadStore = async () => {
      try {
        const result = await chrome.storage.local.get(['podcastStore']);
        if (result.podcastStore) {
          setPodcastStore(result.podcastStore);
        } else {
          // Migrate from old storage format if needed
          await migrateFromLegacyStorage();
        }
      } catch (error) {
        console.error('Error loading podcast store:', error);
        setPodcastStore((prev) => ({ ...prev, isLoaded: true }));
      }
    };

    const migrateFromLegacyStorage = async () => {
      try {
        // Get existing podcasts
        const { newUrls = [] } = await chrome.storage.local.get(['newUrls']);

        // Initialize new store structure
        const podcasts = {};
        const orderedIds = [];

        // Process each podcast
        for (const item of newUrls) {
          const podcastId = item.key;
          orderedIds.push(podcastId);

          // Get playback data if exists
          const playbackData = await chrome.storage.local.get([podcastId]);

          podcasts[podcastId] = {
            metadata: {
              key: item.key,
              url: item.text,
              name: item.podcastName || 'Unnamed Podcast',
              artwork: item.artwork || item.artworkUrl,
            },
            playback: playbackData[podcastId]
              ? {
                  currentTime: playbackData[podcastId].time || 0,
                  duration: playbackData[podcastId].duration || 0,
                  status:
                    playbackData[podcastId].status || PLAYBACK_STATUS.UNPLAYED,
                  lastUpdated:
                    playbackData[podcastId].lastUpdated || Date.now(),
                }
              : {
                  currentTime: 0,
                  duration: 0,
                  status: PLAYBACK_STATUS.UNPLAYED,
                  lastUpdated: Date.now(),
                },
          };
        }

        // Save new structure
        const newStore = { podcasts, orderedIds, isLoaded: true };
        await chrome.storage.local.set({ podcastStore: newStore });
        setPodcastStore(newStore);

        console.log('Successfully migrated to new podcast store structure');
      } catch (error) {
        console.error('Migration error:', error);
        setPodcastStore((prev) => ({ ...prev, isLoaded: true }));
      }
    };

    loadStore();

    // Listen for storage changes
    const storageChangeHandler = (changes, area) => {
      if (
        area === 'local' &&
        changes.podcastStore &&
        !initiatedUpdateRef.current
      ) {
        setPodcastStore(changes.podcastStore.newValue);
      }
      initiatedUpdateRef.current = false;
    };

    // Listen for custom events
    const customEventHandler = () => {
      if (!initiatedUpdateRef.current) {
        loadStore();
      }
      initiatedUpdateRef.current = false;
    };

    chrome.storage.onChanged.addListener(storageChangeHandler);
    window.addEventListener(PODCAST_UPDATED_EVENT, customEventHandler);

    return () => {
      chrome.storage.onChanged.removeListener(storageChangeHandler);
      window.removeEventListener(PODCAST_UPDATED_EVENT, customEventHandler);
    };
  }, []);

  // Save store to Chrome storage
  const saveStore = useCallback(async (newStore) => {
    initiatedUpdateRef.current = true;
    setPodcastStore(newStore);
    await chrome.storage.local.set({ podcastStore: newStore });
    return newStore;
  }, []);

  // Add a new podcast
  const addPodcast = useCallback(
    async (item) => {
      const { podcasts, orderedIds } = podcastStore;

      // Validate URL format
      if (
        !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
          item.text
        )
      ) {
        throw new Error('Invalid URL format');
      }

      // Check if podcast already exists
      if (
        orderedIds.length > 4 ||
        Object.values(podcasts).some((p) => p.metadata.url === item.text)
      ) {
        throw new Error('This podcast has already been added! 👀');
      }

      try {
        // Fetch and parse podcast feed
        const response = await fetch(item.text);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const podcastName =
          xml.querySelector('channel > title')?.textContent ||
          'Unnamed Podcast';

        // Create new podcast entry
        const podcastId = item.key;
        const newPodcast = {
          metadata: {
            key: podcastId,
            url: item.text,
            name: podcastName,
            artwork: item.artwork,
          },
          playback: {
            currentTime: 0,
            duration: 0,
            status: PLAYBACK_STATUS.UNPLAYED,
            lastUpdated: Date.now(),
          },
        };

        // Update store
        const newStore = await saveStore({
          ...podcastStore,
          podcasts: {
            ...podcasts,
            [podcastId]: newPodcast,
          },
          orderedIds: [podcastId, ...orderedIds],
        });

        // Emit event
        emitStorageUpdate({
          action: 'add',
          item: newPodcast.metadata,
        });

        return newStore;
      } catch (error) {
        console.error('Error fetching podcast feed:', error);
        throw new Error(
          'Error fetching podcast feed. Please check the URL and try again.'
        );
      }
    },
    [podcastStore, saveStore]
  );

  // Remove a podcast
  const removePodcast = useCallback(
    async (podcastId) => {
      const { podcasts, orderedIds } = podcastStore;

      // Create new objects to avoid mutation
      const newPodcasts = { ...podcasts };
      delete newPodcasts[podcastId];

      const newOrderedIds = orderedIds.filter((id) => id !== podcastId);

      // Update store
      const newStore = await saveStore({
        ...podcastStore,
        podcasts: newPodcasts,
        orderedIds: newOrderedIds,
      });

      // Emit event
      emitStorageUpdate({
        action: 'remove',
        key: podcastId,
      });

      return newStore;
    },
    [podcastStore, saveStore]
  );

  // Reorder podcasts
  const reorderPodcasts = useCallback(
    async (sourceIndex, destinationIndex) => {
      const reorderSignature = `${sourceIndex}-${destinationIndex}`;

      // Prevent duplicate reordering operations
      if (
        lastReorderSignatureRef.current === reorderSignature &&
        isReorderingRef.current
      ) {
        return podcastStore;
      }

      isReorderingRef.current = true;
      lastReorderSignatureRef.current = reorderSignature;

      // Create a new ordered array
      const newOrderedIds = [...podcastStore.orderedIds];
      const [movedId] = newOrderedIds.splice(sourceIndex, 1);
      newOrderedIds.splice(destinationIndex, 0, movedId);

      // Update store
      const newStore = await saveStore({
        ...podcastStore,
        orderedIds: newOrderedIds,
      });

      // Emit event
      emitStorageUpdate({
        action: 'reorder',
        sourceIndex,
        destinationIndex,
      });

      isReorderingRef.current = false;
      return newStore;
    },
    [podcastStore, saveStore]
  );

  // Update playback state for a specific podcast
  const updatePlayback = useCallback(
    async (podcastId, time, totalDuration) => {
      const { podcasts } = podcastStore;
      const podcast = podcasts[podcastId];

      if (!podcast) {
        throw new Error(`Podcast with ID ${podcastId} not found`);
      }

      const currentPlayback = podcast.playback;
      const wasFinished = currentPlayback.status === PLAYBACK_STATUS.FINISHED;

      // Determine new status
      let newStatus = currentPlayback.status;

      if (time === 0) {
        newStatus = wasFinished
          ? PLAYBACK_STATUS.FINISHED
          : PLAYBACK_STATUS.UNPLAYED;
      } else if (totalDuration && totalDuration - time <= FINISHED_THRESHOLD) {
        newStatus = PLAYBACK_STATUS.FINISHED;
      } else if (time > 0) {
        newStatus = PLAYBACK_STATUS.IN_PROGRESS;
      }

      // Create new playback state
      const newPlayback = {
        currentTime: time,
        duration: totalDuration || currentPlayback.duration,
        status: newStatus,
        lastUpdated: Date.now(),
      };

      // Update store
      return await saveStore({
        ...podcastStore,
        podcasts: {
          ...podcasts,
          [podcastId]: {
            ...podcast,
            playback: newPlayback,
          },
        },
      });
    },
    [podcastStore, saveStore]
  );

  // Reset playback state for a specific podcast
  const resetPlayback = useCallback(
    async (podcastId) => {
      const { podcasts } = podcastStore;
      const podcast = podcasts[podcastId];

      if (!podcast) {
        throw new Error(`Podcast with ID ${podcastId} not found`);
      }

      // Create reset playback state
      const resetPlaybackState = {
        currentTime: 0,
        duration: 0,
        status: PLAYBACK_STATUS.UNPLAYED,
        lastUpdated: Date.now(),
      };

      // Update store
      return await saveStore({
        ...podcastStore,
        podcasts: {
          ...podcasts,
          [podcastId]: {
            ...podcast,
            playback: resetPlaybackState,
          },
        },
      });
    },
    [podcastStore, saveStore]
  );

  // Convert store to a flat array for legacy components
  const getOrderedPodcasts = useCallback(() => {
    const { podcasts, orderedIds } = podcastStore;
    return orderedIds.map((id) => {
      const podcast = podcasts[id];
      return {
        key: podcast.metadata.key,
        text: podcast.metadata.url,
        podcastName: podcast.metadata.name,
        artwork: podcast.metadata.artwork,
        playback: {
          currentTime: podcast.playback.currentTime,
          duration: podcast.playback.duration,
          status: podcast.playback.status,
        },
      };
    });
  }, [podcastStore]);

  // Get playback info for a specific podcast
  const getPlayback = useCallback(
    (podcastId) => {
      const podcast = podcastStore.podcasts[podcastId];
      if (!podcast) return null;

      return {
        currentTime: podcast.playback.currentTime,
        duration: podcast.playback.duration,
        status: podcast.playback.status,
        wasFinished: podcast.playback.status === PLAYBACK_STATUS.FINISHED,
      };
    },
    [podcastStore]
  );

  return {
    // Store data
    podcasts: podcastStore.podcasts,
    orderedIds: podcastStore.orderedIds,
    isLoaded: podcastStore.isLoaded,

    // API methods
    addPodcast,
    removePodcast,
    reorderPodcasts,
    updatePlayback,
    resetPlayback,

    // Helper methods
    getOrderedPodcasts,
    getPlayback,

    // Constants
    PLAYBACK_STATUS,
  };
};

export default useChromeStorage;
