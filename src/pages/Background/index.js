chrome.runtime.onInstalled.addListener((event) => {
  console.log(event);
  if (
    event.reason === chrome.runtime.OnInstalledReason.INSTALL ||
    event.reason === chrome.runtime.OnInstalledReason.UPDATE
  ) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('panel.html'),
    });
  }
  setupPeriodicChecking();
});

// subscribe to event
const PODCAST_UPDATED_EVENT = 'podcast-storage-updated';

// check every minute
function setupPeriodicChecking() {
  chrome.alarms.create('checkPodcastUpdates', {
    periodInMinutes: 1,
  });

  // Debug: Check if alarm was created
  chrome.alarms.getAll((alarms) => {
    console.log('🔔 Current alarms:', alarms);
  });
}

// utility function to broadcast updates, matching usePodcastData.js
function updateEventBroadcast(detail = {}) {
  const event = new CustomEvent(PODCAST_UPDATED_EVENT, { detail });
  window.dispatchEvent(event);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPodcastUpdates') {
    checkForNewEpisodes();
  }
});

async function checkForNewEpisodes() {
  try {
    console.log('🎙 Starting background podcast update check...');

    // Get existing items using the same storage key as usePodcastData.js
    const storage = await chrome.storage.local.get(['newItems']);
    const existingItems = storage.newItems || [];

    if (!existingItems.length) {
      console.log('📭 No podcasts to update - storage is empty');
      return;
    }

    console.log(`🔄 Checking updates for ${existingItems.length} podcasts...`);

    const updatedItems = await Promise.all(
      existingItems.map(async (item) => {
        try {
          console.log(`📡 Fetching updates for podcast: ${item.title}`);
          const response = await fetch(item.url);
          const text = await response.text();
          const parsedFeed = parseRss(text);

          if (!parsedFeed) {
            console.warn(`⚠️ Failed to parse feed for: ${item.title}`);
            return item;
          }

          // Check if there are actual changes
          const hasChanges =
            parsedFeed.title !== item.title ||
            parsedFeed.episode !== item.episode ||
            parsedFeed.mp3 !== item.mp3 ||
            parsedFeed.releaseDate !== item.releaseDate;

          if (hasChanges) {
            console.log(`✨ Found updates for podcast: ${item.title}`);
          } else {
            console.log(`📎 No changes detected for: ${item.title}`);
          }

          // Preserve existing metadata while updating feed content
          return {
            ...item,
            title: parsedFeed.title || item.title,
            episode: parsedFeed.episode || item.episode,
            image: parsedFeed.image || item.image,
            description: parsedFeed.description || item.description,
            author: parsedFeed.author || item.author,
            category: parsedFeed.category || item.category,
            mp3: parsedFeed.mp3 || item.mp3,
            releaseDate: parsedFeed.releaseDate || item.releaseDate,
            publisher: parsedFeed.publisher || item.publisher,
            duration: parsedFeed.duration || item.duration,
            // Preserve user-specific data
            status: item.status,
            currentTime: item.currentTime,
            key: item.key
          };
        } catch (error) {
          console.error(`❌ Error updating podcast ${item.url}:`, error);
          return item; // Keep existing item on error
        }
      })
    );

    // Update storage and broadcast change
    await chrome.storage.local.set({ newItems: updatedItems });
    updateEventBroadcast({
      action: 'backgroundUpdate',
      items: updatedItems
    });

    console.log('✅ Background update completed:', {
      timestamp: new Date().toISOString(),
      podcastsChecked: existingItems.length,
      storageUpdated: true
    });
  } catch (error) {
    console.error('❌ Critical error in background update:', error);
  }
}
