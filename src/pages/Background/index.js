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

// custom text-based RSS parser for background context
async function fetchAndParseRss(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    // decoding HTML entities
    const decodeHtmlEntities = (text) => {
      if (!text) return text;
      const entities = {
        '&apos;': "'",
        '&quot;': '"',
        '&lt;': '<',
        '&gt;': '>',
        '&amp;': '&',
        '&nbsp;': ' ',
        '&#39;': "'",
        '&#x27;': "'",
        '&#x2F;': '/',
        '&#x2f;': '/',
        '&nbsp;': ' ' 
      };

      return text.replace(/&[^;]+;/g, (entity) => {
        return entities[entity] || entity;
      });
    };

    // XML parsing functions for background context
    const getTag = (tag, content) => {
      const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, 'i');
      const match = content.match(regex);
      return decodeHtmlEntities(match ? match[1].trim() : '');
    };

    const getTagAttribute = (tag, attr, content) => {
      const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*>`, 'i');
      const match = content.match(regex);
      return decodeHtmlEntities(match ? match[1].trim() : '');
    };

    // find the first item block
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/i;
    const itemMatch = text.match(itemRegex);

    if (!itemMatch) {
      console.warn('No item found in feed');
      return null;
    }

    const itemContent = itemMatch[1];
    const channelContent = text.replace(/<item[\s\S]*$/, '');

    // extract image with fallbacks
    let image = getTagAttribute('itunes:image', 'href', channelContent);
    if (!image) {
      const imageBlockMatch = text.match(/<image>([\s\S]*?)<\/image>/i);
      if (imageBlockMatch) {
        image = getTag('url', imageBlockMatch[1]);
      }
    }

    // format the release date
    let releaseDate = getTag('pubDate', itemContent);
    if (releaseDate) {
      try {
        const date = new Date(releaseDate);
        if (!isNaN(date.getTime())) {
          releaseDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      } catch (e) {
        console.log('Error formatting date:', e);
      }
    }

    // parse duration
    let duration = getTag('itunes:duration', itemContent);
    if (duration) {
      if (/^\d+$/.test(duration)) {
        duration = parseInt(duration);
      } else {
        const parts = duration.split(':').map(part => parseInt(part));
        if (parts.length === 3) {
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          duration = parts[0] * 60 + parts[1];
        }
      }
    }

    // strip HTML from description
    let description = getTag('description', itemContent) || getTag('itunes:summary', itemContent);
    if (description) {
      description = description.replace(/<\/?[^>]+(>|$)/g, '');
    }

    return {
      title: getTag('title', channelContent) || 'Unknown Podcast',
      episode: getTag('title', itemContent) || 'Unknown Episode',
      image: image || null,
      description: description || null,
      author: getTag('itunes:author', itemContent) || getTag('itunes:author', channelContent) || null,
      category: getTag('itunes:category', itemContent) || getTag('itunes:category', channelContent) || null,
      mp3: getTagAttribute('enclosure', 'url', itemContent) || null,
      releaseDate: releaseDate || null,
      publisher: getTag('itunes:author', channelContent) || null,
      duration: duration || null
    };
  } catch (error) {
    console.error('Error fetching or parsing RSS:', error);
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
  chrome.runtime.sendMessage({
    type: PODCAST_UPDATED_EVENT,
    detail
  }).catch(error => {
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
          const parsedFeed = await fetchAndParseRss(item.url);

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

    // update storage and broadcast change
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
