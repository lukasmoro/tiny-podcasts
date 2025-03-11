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

  // encapsulated load podcasts
  const loadPodcasts = () => {
    chrome.storage.local.get(['newItems'], (item) => {
      const items = item.newItems || [];
      const feedItems = items.map((feedItem) => ({
        key: feedItem.key,
        title: feedItem.title || 'Unknown Title',
        episode: feedItem.episode || 'Unknown Episode',
        url: feedItem.url,
        image: feedItem.image,
        description: feedItem.description || 'No Description',
        author: feedItem.author || 'Unknown Author',
        category: feedItem.category || 'Unknown Category',
        releaseDate: feedItem.releaseDate || 'Unknown Release',
        publisher: feedItem.publisher || 'Unknown Publisher',
        mp3: feedItem.mp3,
        duration: feedItem.duration,
        status: null,
        currentTime: feedItem.currentTime,
      }));
      setItems(feedItems);
      setIsLoaded(true);
    });
  };

  // mount on initial load of component
  useEffect(() => {
    // load podcasts on initial mount
    loadPodcasts();

    // event handler triggering if local storage changed
    const storageEventHandler = (changes, area) => {
      if (area === 'local' && changes.newItems) {
        loadPodcasts();
        console.log(changes.newItems);
      }
    };

    // podcast update eventhandler, reloading after specific action to podcasts
    const updateEventHandler = () => {
      loadPodcasts();
    };

    // add storage & event listener
    chrome.storage.onChanged.addListener(storageEventHandler);
    window.addEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);

    // remove storage & event listener
    return () => {
      chrome.storage.onChanged.removeListener(storageEventHandler);
      window.removeEventListener(PODCAST_UPDATED_EVENT, updateEventHandler);
    };
  }, []);

  // callback function for adding items
  const handleAddPodcast = useCallback(
    async (item) => {
      //check for duplicate podcasts & not more then 5 podcasts
      let check = items.every((url) => url.url !== item.url);
      if (items.length > 4 || !check) {
        alert('This podcast has already been added! 👀');
        return;
      }

      // create new item, update newItems array, set storage & notify
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
          currentTime: null,
        };

        const newItems = [newItem, ...items];

        setItems(newItems);
        chrome.storage.local.set({ newItems }, () => {
          console.log('New podcast added:', newItems);
          updateEventBroadcast({ action: 'add', item: newItem });
        });
      } catch (error) {
        alert(
          'Error fetching podcast feed. Please check the URL and try again.'
        );
        console.error('Error details:', error);
      }
    },
    [items]
  );

  // callback function for removing items
  const handleRemovePodcast = useCallback(
    (key) => {
      // remove url with matching key from array, update newItems array, set storage & notify
      const newItems = items.filter((item) => item.key !== key);

      setItems(newItems);
      chrome.storage.local.set({ newItems }, () => {
        updateEventBroadcast({ action: 'remove', key });
      });
    },
    [items]
  );

  // callback function for re-ordering podcasts
  const handleReorderPodcasts = useCallback(
    (sourceIndex, destinationIndex) => {
      //create copy of items array, remove moveItem from source index and add it destination index with splice & notify
      const reorderedItems = Array.from(items);
      const [movedItem] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, movedItem);

      setItems(reorderedItems);

      chrome.storage.local.set({ newItems: reorderedItems }, () => {
        updateEventBroadcast({
          action: 'reorder',
          sourceIndex,
          destinationIndex,
        });
      });
    },
    [items]
  );

  const handleUpdatePodcastTime = useCallback(
    (key, currentTime) => {
      chrome.storage.local.get(['newItems'], (result) => {
        const storedItems = result.newItems || [];
        const itemIndex = storedItems.findIndex((item) => item.key === key);

        if (
          itemIndex === -1 ||
          storedItems[itemIndex].currentTime === currentTime
        ) {
          return; // No need to update if the time is the same or item doesn't exist
        }

        const updatedItems = [...storedItems];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], currentTime };

        chrome.storage.local.set({ newItems: updatedItems }, () => {
          setItems(updatedItems);
          console.log(`Updated time for podcast ${key}: ${currentTime}`);
        });
      });
    },
    [] // Remove items dependency to prevent recreating function
  );

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
