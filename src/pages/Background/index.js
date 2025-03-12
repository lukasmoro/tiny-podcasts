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

// rss parser function
async function parseRss(text) {
  try {
    const getTag = (tag, content) => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i');
      const match = content.match(regex);
      return match ? match[1].trim() : '';
    };

    const getTagAttribute = (tag, attr, content) => {
      const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*>`, 'i');
      const match = content.match(regex);
      return match ? match[1].trim() : '';
    };

    // Find the first item block
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/i;
    const itemMatch = text.match(itemRegex);

    if (!itemMatch) {
      console.warn('No item found in feed');
      return null;
    }

    const itemContent = itemMatch[1];
    const channelContent = text.replace(/<item[\s\S]*$/, '');

    return {
      title: getTag('title', channelContent),
      episode: getTag('title', itemContent),
      image: getTagAttribute('itunes:image', 'href', channelContent) || getTag('url', text.match(/<image>([\s\S]*?)<\/image>/i)?.[1] || ''),
      description: getTag('description', itemContent) || getTag('itunes:summary', itemContent),
      author: getTag('itunes:author', itemContent) || getTag('itunes:author', channelContent),
      category: getTag('itunes:category', itemContent) || getTag('itunes:category', channelContent),
      mp3: getTagAttribute('enclosure', 'url', itemContent),
      releaseDate: getTag('pubDate', itemContent),
      publisher: getTag('itunes:author', channelContent),
      duration: getTag('itunes:duration', itemContent)
    };
  } catch (error) {
    console.error('Error parsing RSS:', error);
    return null;
  }
}

// check every minute
function setupPeriodicChecking() {
  chrome.alarms.create('checkPodcastUpdates', {
    periodInMinutes: 1,
  });

  // debug: check if alarm was created
  chrome.alarms.getAll((alarms) => {
    console.log('🔔 Current alarms:', alarms);
  });
}

// utility function to broadcast updates - modified for service worker
function updateEventBroadcast(detail = {}) {
  // Instead of using window events, use chrome.runtime.sendMessage
  chrome.runtime.sendMessage({
    type: PODCAST_UPDATED_EVENT,
    detail
  }).catch(error => {
    // Ignore errors when no listeners are available
    if (error.message.includes('Could not establish connection')) return;
    console.error('Error broadcasting update:', error);
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkPodcastUpdates') {
    checkForNewEpisodes();
  }
});

async function checkForNewEpisodes() {
  try {
    console.log('🎙 Starting background podcast update check...');

    // get existing items using the same storage key as usePodcastData.js
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
          const parsedFeed = await parseRss(text);

          if (!parsedFeed) {
            console.warn(`⚠️ Failed to parse feed for: ${item.title}`);
            return item;
          }

          // check if there are actual changes
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

          // preserve existing metadata while updating feed content
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
            // preserve user-specific data
            status: item.status,
            currentTime: item.currentTime,
            key: item.key
          };
        } catch (error) {
          console.error(`❌ Error updating podcast ${item.url}:`, error);
          return item; // keep existing item on error
        }
      })
    );

    // pdate storage and broadcast change
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
