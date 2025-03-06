import { useState, useEffect, useCallback, useRef } from 'react';

const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';

const notifyStorageUpdated = (detail = {}) => {
  const event = new CustomEvent(PODCAST_UPDATED_EVENT, { detail });
  window.dispatchEvent(event);
};

export const usePodcastStorage = () => {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isReorderingRef = useRef(false);
  const lastReorderSignatureRef = useRef(null);
  const initiatedUpdateRef = useRef(false);

  useEffect(() => {
    const loadPodcasts = () => {
      chrome.storage.local.get(['newUrls'], (item) => {
        const existingItems = item.newUrls || [];
        const feedItems = existingItems.map((feedItem) => ({
          key: feedItem.key,
          text: feedItem.text,
          podcastName: feedItem.podcastName,
          artwork: feedItem.artwork || feedItem.artworkUrl,
        }));
        setItems(feedItems);
        setIsLoaded(true);
      });
    };

    loadPodcasts();

    const storageChangeHandler = (changes, area) => {
      if (area === 'local' && changes.newUrls && !initiatedUpdateRef.current) {
        loadPodcasts();
      }
      initiatedUpdateRef.current = false;
    };

    const customEventHandler = () => {
      if (!initiatedUpdateRef.current) {
        loadPodcasts();
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

  const handleAddPodcast = useCallback(
    async (item) => {
      const urlChecker = (url) => url.text !== item.text;
      let check = items.every(urlChecker);

      if (
        items.length > 4 ||
        !check ||
        !/(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(
          item.text
        )
      ) {
        alert('This podcast has already been added! 👀');
        return;
      }

      try {
        const response = await fetch(item.text);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const podcastName =
          xml.querySelector('channel > title')?.textContent ||
          'Unnamed Podcast';
        const newItem = { ...item, podcastName, artwork: item.artwork };
        const newUrls = [newItem, ...items];
        initiatedUpdateRef.current = true;

        setItems(newUrls);

        chrome.storage.local.set({ newUrls }, () => {
          console.log('Podcast added:', newItem);
          notifyStorageUpdated({ action: 'add', item: newItem });
        });
      } catch (error) {
        console.error('Error fetching podcast feed:', error);
        alert(
          'Error fetching podcast feed. Please check the URL and try again.'
        );
      }
    },
    [items]
  );

  const handleRemovePodcast = useCallback(
    (key) => {
      const newUrls = items.filter((item) => item.key !== key);
      initiatedUpdateRef.current = true;
      setItems(newUrls);

      chrome.storage.local.set({ newUrls }, () => {
        notifyStorageUpdated({ action: 'remove', key });
      });
    },
    [items]
  );

  const handleReorderPodcasts = useCallback(
    (sourceIndex, destinationIndex) => {
      const reorderSignature = `${sourceIndex}-${destinationIndex}`;

      if (
        lastReorderSignatureRef.current === reorderSignature &&
        isReorderingRef.current
      ) {
        return;
      }

      isReorderingRef.current = true;
      lastReorderSignatureRef.current = reorderSignature;
      const reorderedItems = Array.from(items);
      const [movedItem] = reorderedItems.splice(sourceIndex, 1);
      reorderedItems.splice(destinationIndex, 0, movedItem);
      initiatedUpdateRef.current = true;
      setItems(reorderedItems);

      chrome.storage.local.set({ newUrls: reorderedItems }, () => {
        notifyStorageUpdated({
          action: 'reorder',
          sourceIndex,
          destinationIndex,
        });

        isReorderingRef.current = false;
      });
    },
    [items]
  );

  const refreshFromStorage = useCallback(() => {
    chrome.storage.local.get(['newUrls'], (item) => {
      const existingItems = item.newUrls || [];
      const feedItems = existingItems.map((feedItem) => ({
        key: feedItem.key,
        text: feedItem.text,
        podcastName: feedItem.podcastName,
        artwork: feedItem.artwork || feedItem.artworkUrl,
      }));
      setItems(feedItems);
    });
  }, []);

  return {
    items,
    isLoaded,
    setItems,
    handleAddPodcast,
    handleRemovePodcast,
    handleReorderPodcasts,
    refreshFromStorage,
  };
};
