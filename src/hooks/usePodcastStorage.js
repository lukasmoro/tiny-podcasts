import { useState, useEffect, useCallback } from 'react';

export const usePodcastStorage = () => {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load podcasts from storage on initial render
  useEffect(() => {
    const loadPodcasts = () => {
      chrome.storage.local.get(['newUrls'], (item) => {
        const existingItems = item.newUrls || [];
        // Map items to ensure consistent format
        const feedItems = existingItems.map((feedItem) => ({
          key: feedItem.key,
          text: feedItem.text,
          podcastName: feedItem.podcastName,
          artwork: feedItem.artwork || feedItem.artworkUrl,
        }));
        setItems(feedItems);
        setIsLoaded(true);
        console.log('Podcasts loaded from storage:', feedItems);
      });
    };

    loadPodcasts();
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

        // Update state first for immediate UI response
        setItems(newUrls);

        // Then update storage
        chrome.storage.local.set({ newUrls }, () => {
          console.log('Podcast added:', newItem);

          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              if (tabs && tabs[0] && tabs[0].id) {
                chrome.tabs.reload(tabs[0].id);
              }
            }
          );
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

      // Update state first for immediate UI response
      setItems(newUrls);

      // Then update storage
      chrome.storage.local.set({ newUrls }, () => {
        console.log('Podcast removed with key:', key);

        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
              chrome.tabs.reload(tabs[0].id);
            }
          }
        );
      });
    },
    [items]
  );

  const handleReorderPodcasts = useCallback(
    (sourceIndex, destinationIndex) => {
      console.log('Reordering podcasts:', sourceIndex, 'to', destinationIndex);

      // Create a new array
      const reorderedItems = Array.from(items);

      // Remove the item from source position
      const [movedItem] = reorderedItems.splice(sourceIndex, 1);

      // Insert it at the destination position
      reorderedItems.splice(destinationIndex, 0, movedItem);

      // Update state first for immediate UI response
      setItems(reorderedItems);

      // Log the item IDs to verify the reordering
      console.log(
        'Reordered items:',
        reorderedItems.map((item) => item.key)
      );

      // Then update storage with the new order
      chrome.storage.local.set({ newUrls: reorderedItems }, () => {
        console.log('Podcasts reordered in storage');

        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            if (tabs && tabs[0] && tabs[0].id) {
              chrome.tabs.reload(tabs[0].id);
            }
          }
        );
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
