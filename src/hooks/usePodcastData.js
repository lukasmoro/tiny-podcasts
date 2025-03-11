import { useState, useEffect, useCallback, useRef } from 'react';
import { parseRss } from '../utils/rssParser';

// update event broadcast utility function to make specific storage changes listenable across application
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';

const updateEventBroadcast = (detail = {}) => {
  const event = new CustomEvent(PODCAST_UPDATED_EVENT, { detail });
  window.dispatchEvent(event);
};

export const usePodcastData = () => {
  // state (re-render)
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use a ref to track the most recent storage data without causing re-renders
  const storedItemsRef = useRef([]);

  // Synchronize storage to state and ref
  const synchronizeFromStorage = useCallback(() => {
    chrome.storage.local.get(['newItems'], (result) => {
      const storedItems = result.newItems || [];

      // Update ref first
      storedItemsRef.current = storedItems;

      // Then update state (triggers re-render)
      const feedItems = storedItems.map((feedItem) => ({
        ...feedItem,
        title: feedItem.title || 'Unknown Title',
        episode: feedItem.episode || 'Unknown Episode',
        description: feedItem.description || 'No Description',
        author: feedItem.author || 'Unknown Author',
        category: feedItem.category || 'Unknown Category',
        releaseDate: feedItem.releaseDate || 'Unknown Release',
        publisher: feedItem.publisher || 'Unknown Publisher',
        status: feedItem.status || null,
        currentTime: typeof feedItem.currentTime === 'number' ? feedItem.currentTime : 0,
      }));

      setItems(feedItems);
      setIsLoaded(true);
    });
  }, []);

  // Synchronize state to storage
  const synchronizeToStorage = useCallback((newItems, action = {}) => {
    chrome.storage.local.set({ newItems }, () => {
      // Update ref to match what's in storage
      storedItemsRef.current = newItems;

      console.log('Storage updated:', action);
      updateEventBroadcast({ ...action, items: newItems });
    });
  }, []);

  // Initial load on component mount
  useEffect(() => {
    // Load podcasts on initial mount
    synchronizeFromStorage();

    // Event handler triggering if local storage changed
    const storageEventHandler = (changes, area) => {
      if (area === 'local' && changes.newItems) {
        // Only synchronize if the change didn't come from this instance
        // This helps prevent circular updates
        const newValue = changes.newItems.newValue || [];
        if (JSON.stringify(newValue) !== JSON.stringify(storedItemsRef.current)) {
          synchronizeFromStorage();
        }
      }
    };

    // Podcast update event handler
    const updateEventHandler = () => {
      synchronizeFromStorage();
    };

    // Add storage & event listener
    chrome.storage.onChanged.addListener(storageEventHandler);
    window.addEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);

    // Remove storage & event listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(storageEventHandler);
      window.removeEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);
    };
  }, [synchronizeFromStorage]);

  // Add podcast handler
  const handleAddPodcast = useCallback(async (item) => {
    // Check for duplicate podcasts & not more than 5 podcasts
    let check = items.every((podcastItem) => podcastItem.url !== item.url);
    if (items.length > 4 || !check) {
      alert('This podcast has already been added! 👀');
      return;
    }

    try {
      const response = await fetch(item.url);
      const text = await response.text();
      const parsedItem = parseRss(text);

      if (!parsedItem) {
        throw new Error('Failed to parse RSS feed');
      }

      const newItem = {
        ...item,
        key: new Date().getTime(),
        title: parsedItem.title || 'Unnamed Podcast',
        episode: parsedItem.episode || 'Unknown Episode',
        image: parsedItem.image,
        description: parsedItem.description,
        author: parsedItem.author,
        category: parsedItem.category,
        mp3: parsedItem.mp3,
        releaseDate: parsedItem.releaseDate,
        publisher: parsedItem.publisher,
        duration: parsedItem.duration,
        status: null,
        currentTime: 0,
      };

      // Get the latest stored items from our ref
      const currentStoredItems = [...storedItemsRef.current];
      const updatedItems = [newItem, ...currentStoredItems];

      // Update state and storage
      setItems(updatedItems);
      synchronizeToStorage(updatedItems, { action: 'add', item: newItem });

    } catch (error) {
      alert('Error fetching podcast feed. Please check the URL and try again.');
      console.error('Error details:', error);
    }
  }, [items, synchronizeToStorage]);

  // Remove podcast handler
  const handleRemovePodcast = useCallback((key) => {
    // Get the latest stored items from our ref
    const currentStoredItems = [...storedItemsRef.current];
    const updatedItems = currentStoredItems.filter((item) => item.key !== key);

    // Update state and storage
    setItems(updatedItems);
    synchronizeToStorage(updatedItems, { action: 'remove', key });

  }, [synchronizeToStorage]);

  // Reorder podcasts handler
  const handleReorderPodcasts = useCallback((sourceIndex, destinationIndex) => {
    // Get the latest stored items from our ref
    const currentStoredItems = [...storedItemsRef.current];

    // Create a copy and perform reordering
    const reorderedItems = Array.from(currentStoredItems);
    const [movedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(destinationIndex, 0, movedItem);

    // Log before update to help debug
    console.log('Reordering items:');
    console.log('Before:', currentStoredItems.map(item => `${item.title} - ${item.currentTime}`));
    console.log('After:', reorderedItems.map(item => `${item.title} - ${item.currentTime}`));

    // Update state and storage
    setItems(reorderedItems);
    synchronizeToStorage(reorderedItems, {
      action: 'reorder',
      sourceIndex,
      destinationIndex
    });

  }, [synchronizeToStorage]);

  // Update podcast time handler
  const handleUpdatePodcastTime = useCallback((key, currentTime) => {
    // Get the latest stored items from our ref
    const currentStoredItems = [...storedItemsRef.current];
    const itemIndex = currentStoredItems.findIndex((item) => item.key === key);

    if (itemIndex === -1) {
      console.warn(`Podcast with key ${key} not found when updating time.`);
      return;
    }

    if (currentStoredItems[itemIndex].currentTime === currentTime) {
      return; // No need to update if the time is the same
    }

    // Create a copy and update the time
    const updatedItems = [...currentStoredItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      currentTime
    };

    // Log for debugging
    console.log(`Updating time for "${updatedItems[itemIndex].title}" (${key}): ${currentTime}`);

    // Update state and storage
    setItems(updatedItems);
    synchronizeToStorage(updatedItems, {
      action: 'updateTime',
      key,
      currentTime
    });

  }, [synchronizeToStorage]);

  return {
    items,
    isLoaded,
    setItems,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
    handleUpdatePodcastTime,
  };
};
