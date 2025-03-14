import { useState, useEffect, useCallback, useRef } from 'react';
import { parseRss } from '../utils/rssParser';
import { sendEvent } from '../utils/googleAnalytics';

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

  // ref to track the most recent storage data without causing re-renders
  const storedItemsRef = useRef([]);

  // synchronize storage to state and ref
  const synchronizeFromStorage = useCallback(() => {
    chrome.storage.local.get(['newItems'], (result) => {
      const storedItems = result.newItems || [];
      storedItemsRef.current = storedItems;

      // update state (triggers re-render)
      const feedItems = storedItems.map((feedItem) => ({
        ...feedItem,
        title: feedItem.title || 'Unknown Title',
        episode: feedItem.episode || 'Unknown Episode',
        description: feedItem.description || 'No Description',
        author: feedItem.author || 'Unknown Author',
        category: feedItem.category || 'Unknown Category',
        releaseDate: feedItem.releaseDate || 'Unknown Release',
        publisher: feedItem.publisher || 'Unknown Publisher',
        status: feedItem.status || 'unplayed',
        currentTime: feedItem.currentTime || null,
      }));
      setItems(feedItems);
      setIsLoaded(true);
    });
  }, []);

  // synchronize state to storage
  const synchronizeToStorage = useCallback((newItems, action = {}) => {
    chrome.storage.local.set({ newItems }, () => {
      storedItemsRef.current = newItems; // update ref to match what's in storage

      // serialised string representation of each item title, episode, currentTime & status
      const itemsSerializedTitles = newItems.map(item =>
        `${item.title}`
      ).join('; ');

      const itemsSerializedEpisodes = newItems.map(item =>
        `${item.episode}`
      ).join('; ');

      const itemsSerializedTime = newItems.map(item =>
        `${item.currentTime}`
      ).join('; ');

      const itemsSerializedStatus = newItems.map(item =>
        `${item.status}`
      ).join('; ');

      const analyticsData = {
        action_type: action.action,
        items_count: newItems.length,
        items_serialized_titles: itemsSerializedTitles,
        items_serialized_episodes: itemsSerializedEpisodes,
        items_serialized_times: itemsSerializedTime,
        items_serialized_status: itemsSerializedStatus
      };

      // debug logging
      console.log('Sending analytics event:', {
        event: 'podcast_storage_update',
        data: analyticsData
      });

      // send analytics event and handle response
      sendEvent('podcast_storage_update', analyticsData)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          console.log('Analytics event sent successfully:', response.status);
          return response.text();
        })
        .then(text => {
          if (text) {
            console.log('Analytics response:', text);
          }
        })
        .catch(error => {
          console.error('Error sending analytics event:', error);
        });

      updateEventBroadcast({ ...action, items: newItems });
    });
  }, []);

  // initial load on component mount
  useEffect(() => {
    synchronizeFromStorage(); // load podcasts on initial mount
    const storageEventHandler = (changes, area) => {
      if (area === 'local' && changes.newItems) {
        const newValue = changes.newItems.newValue || [];
        if (
          JSON.stringify(newValue) !== JSON.stringify(storedItemsRef.current)
        ) {
          synchronizeFromStorage();
        }
      }
    };

    // podcast update event handler
    const updateEventHandler = () => {
      synchronizeFromStorage();
    };

    // add storage & event listener
    chrome.storage.onChanged.addListener(storageEventHandler);
    window.addEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);

    // remove storage & event listener on unmount
    return () => {
      chrome.storage.onChanged.removeListener(storageEventHandler);
      window.removeEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);
    };
  }, [synchronizeFromStorage]);

  // add podcast handler
  const handleAddPodcast = useCallback(
    async (item) => {
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
          status: 'unplayed',
          currentTime: 0,
        };

        const currentStoredItems = [...storedItemsRef.current]; // get the latest stored items from ref
        const updatedItems = [newItem, ...currentStoredItems];
        setItems(updatedItems); // update state & storage
        synchronizeToStorage(updatedItems, { action: 'add', item: newItem });
      } catch (error) {
        alert(
          'Error fetching podcast feed. Please check the URL and try again.'
        );
        console.error('Error details:', error);
      }
    },
    [items, synchronizeToStorage]
  );

  // remove podcast handler
  const handleRemovePodcast = useCallback(
    (key) => {
      const currentStoredItems = [...storedItemsRef.current]; // get the latest stored items from our ref
      const updatedItems = currentStoredItems.filter(
        (item) => item.key !== key
      );
      setItems(updatedItems); // update state & storage
      synchronizeToStorage(updatedItems, { action: 'remove', key });
    },
    [synchronizeToStorage]
  );

  // reorder podcasts handler
  const handleReorderPodcasts = useCallback(
    (sourceIndex, destinationIndex) => {
      const currentStoredItems = [...storedItemsRef.current]; // get the latest stored items from our ref

      // create a copy & perform reordering
      const reorderedItems = Array.from(currentStoredItems);
      const [movedItem] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, movedItem);

      // log before update to help debug
      console.log('Reordering items:');
      console.log(
        'Before:',
        currentStoredItems.map((item) => `${item.title} - ${item.currentTime}`)
      );
      console.log(
        'After:',
        reorderedItems.map((item) => `${item.title} - ${item.currentTime}`)
      );

      // update state and storage
      setItems(reorderedItems);
      synchronizeToStorage(reorderedItems, {
        action: 'reorder',
        sourceIndex,
        destinationIndex,
      });
    },
    [synchronizeToStorage]
  );

  // update podcast time handler
  const handleUpdatePodcastTime = useCallback(
    (key, currentTime) => {
      const currentStoredItems = [...storedItemsRef.current]; // get the latest stored items from our ref
      const itemIndex = currentStoredItems.findIndex(
        (item) => item.key === key
      );

      if (itemIndex === -1) {
        console.warn(`Podcast with key ${key} not found when updating time.`);
        return;
      }

      if (currentStoredItems[itemIndex].currentTime === currentTime) {
        return;
      }
      const updatedItems = [...currentStoredItems]; // create a copy & update the time
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        currentTime,
      };

      // log for debugging
      console.log(
        `Updating time for "${updatedItems[itemIndex].title}" (${key}): ${currentTime}`
      );

      // update state and storage
      setItems(updatedItems);
      synchronizeToStorage(updatedItems, {
        action: 'updateTime',
        key,
        currentTime,
      });
    },
    [synchronizeToStorage]
  );

  const handleUpdatePodcastStatus = useCallback(
    (key, status) => {
      const currentStoredItems = [...storedItemsRef.current]; // get the latest stored items from our ref
      const itemIndex = currentStoredItems.findIndex(
        (item) => item.key === key
      );

      if (itemIndex === -1) {
        console.warn(`Podcast with key ${key} not found when updating status.`);
        return;
      }

      if (currentStoredItems[itemIndex].status === status) {
        return;
      }
      const updatedItems = [...currentStoredItems]; // create a copy & update the status
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        status,
      };

      // log for debugging
      console.log(
        `Updating status for "${updatedItems[itemIndex].title}" (${key}): ${status}`
      );

      // update state and storage
      setItems(updatedItems);
      synchronizeToStorage(updatedItems, {
        action: 'updateStatus',
        key,
        status,
      });
    },
    [synchronizeToStorage]
  );

  return {
    items,
    isLoaded,
    setItems,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
    handleUpdatePodcastTime,
    handleUpdatePodcastStatus,
  };
};
