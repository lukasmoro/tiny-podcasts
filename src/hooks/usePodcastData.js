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
    chrome.storage.local.get(['newUrls'], (item) => {
      const existingItems = item.newUrls || [];
      const feedItems = existingItems.map((feedItem) => ({
        key: feedItem.key,
        title: feedItem.title,
        episode: feedItem.episode || 'Unknown Episode',
        url: feedItem.url,
        image: feedItem.image,
        description: feedItem.description,
        author: feedItem.author,
        category: feedItem.category,
        releaseDate: feedItem.releaseDate,
        publisher: feedItem.publisher,
        mp3: feedItem.mp3,
        status: null,
        duration: null,
        currentTime: null,
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
      if (area === 'local' && changes.newUrls) {
        loadPodcasts();
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
          episode: parsedItem.episode || 'Unknown Episode',
          image: parsedItem.image,
          description: parsedItem.description,
          author: parsedItem.author,
          category: parsedItem.category,
          mp3: parsedItem.mp3,
          releaseDate: parsedItem.releaseDate,
          publisher: parsedItem.publisher,
          status: null,
          duration: null,
          currentTime: null,
        };

        const newUrls = [newItem, ...items];

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
