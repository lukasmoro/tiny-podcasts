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
  // refs (no re-render)
  const initiatedUpdateRef = useRef(false);

  // encapsulated load podcasts
  const loadPodcasts = () => {
    chrome.storage.local.get(['newUrls'], (item) => {
      const existingItems = item.newUrls || [];
      const feedItems = existingItems.map((feedItem) => ({
        key: feedItem.key,
        url: feedItem.url,
        title: feedItem.title,
        image: feedItem.image,
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
      if (area === 'local' && changes.newUrls && !initiatedUpdateRef.current) {
        loadPodcasts();
      }
      initiatedUpdateRef.current = false;
    };

    // podcast update eventhandler, reloading after specific action to podcasts
    const updateEventHandler = () => {
      if (!initiatedUpdateRef.current) {
        loadPodcasts();
      }
      initiatedUpdateRef.current = false;
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

      // create new item, update newUrls array, set storage & notify
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
          image: parsedItem.image,
          description: parsedItem.description,
          author: parsedItem.author,
          categories: parsedItem.category,
          mp3: parsedItem.mp3,
          status: null,
          duration: null,
          currentTime: null,
        };

        const newUrls = [newItem, ...items];
        initiatedUpdateRef.current = true;
        setItems(newUrls);
        chrome.storage.local.set({ newUrls }, () => {
          console.log('New podcast added:', newUrls);
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
      // remove url with matching key from array, update newUrls array, set storage & notify
      const newUrls = items.filter((item) => item.key !== key);
      initiatedUpdateRef.current = true;
      setItems(newUrls);

      chrome.storage.local.set({ newUrls }, () => {
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
      initiatedUpdateRef.current = true;
      setItems(reorderedItems);

      chrome.storage.local.set({ newUrls: reorderedItems }, () => {
        updateEventBroadcast({
          action: 'reorder',
          sourceIndex,
          destinationIndex,
        });
      });
    },
    [items]
  );

  return {
    items,
    isLoaded,
    setItems,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
  };
};
