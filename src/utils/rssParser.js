function parseRss(xml) {
  try {
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    const firstItem = xmlDoc.querySelector('item');
    if (!firstItem) {
      console.log('No items found in RSS feed');
      return null;
    }

    const item = {
      mp3: getEnclosureUrl(firstItem) || null,
      image: getPodcastImage(xmlDoc) || null,
      author: getAuthor(xmlDoc, firstItem) || null,
      title: getPodcastTitle(xmlDoc) || 'Unknown Podcast',
      episode: getEpisodeTitle(firstItem) || 'Unknown Episode',
      releaseDate: safeExecute(() => getReleaseDate(firstItem)) || null,
      publisher: safeExecute(() => getPublisher(xmlDoc)) || null,
      category: safeExecute(() => getCategory(xmlDoc)) || null,
      description: safeExecute(() => getDescription(firstItem)) || null,
      duration: safeExecute(() => getDuration(firstItem)) || null,
    };

    console.log('Parsed item:', item);
    return item;
  } catch (err) {
    console.log('Error parsing RSS feed: ', err);
    return null;
  }
}

function safeExecute(fn) {
  try {
    return fn();
  } catch (error) {
    console.log('Error in parsing function:', error);
    return null;
  }
}

function getEnclosureUrl(item) {
  try {
    const enclosure = item.querySelector('enclosure');
    if (enclosure) {
      return enclosure.getAttribute('url');
    }
    const mediaContent = item.querySelector('media\\:content, content');
    return mediaContent ? mediaContent.getAttribute('url') : null;
  } catch (error) {
    console.log('Error getting enclosure URL:', error);
    return null;
  }
}

function getPodcastImage(xmlDoc) {
  try {
    console.log('Searching for podcast image...');
    const possibleImagePaths = [
      'channel > itunes\\:image',
      'channel itunes\\:image',
      'itunes\\:image',
      'channel > image > url',
      'image > url',
      'media\\:thumbnail',
    ];

    for (const path of possibleImagePaths) {
      const element = xmlDoc.querySelector(path);
      if (element) {
        console.log(`Found image element with path: ${path}`);
        const image =
          element.getAttribute('href') ||
          element.getAttribute('url') ||
          element.textContent.trim();
        if (image) {
          console.log(`Image URL found: ${image}`);
          return image;
        }
      }
    }

    const itunesImage = xmlDoc.getElementsByTagName('itunes:image')[0];
    if (itunesImage && itunesImage.getAttribute('href')) {
      const image = itunesImage.getAttribute('href');
      console.log(`Found image using getElementsByTagName: ${image}`);
      return image;
    }

    const channelImage = xmlDoc.querySelector('channel image');
    if (channelImage) {
      const urlElement = channelImage.querySelector('url');
      if (urlElement) {
        const image = urlElement.textContent.trim();
        console.log(`Found image using channel image fallback: ${image}`);
        return image;
      }
    }

    console.log('No image found in the RSS feed');
    return null;
  } catch (error) {
    console.log('Error getting podcast image:', error);
    return null;
  }
}

function getAuthor(xmlDoc, item) {
  try {
    const possibleAuthorPaths = [
      'author',
      'itunes\\:author',
      'dc\\:creator',
      'channel > author',
      'channel > itunes\\:author',
    ];

    for (const path of possibleAuthorPaths) {
      const element = item ? item.querySelector(path) : null;
      const channelElement = xmlDoc.querySelector(path);
      const foundElement = element || channelElement;

      if (foundElement && foundElement.textContent) {
        return foundElement.textContent.trim();
      }
    }

    return null;
  } catch (error) {
    console.log('Error getting author:', error);
    return null;
  }
}

function getPodcastTitle(xmlDoc) {
  try {
    const channelTitle = xmlDoc.querySelector('channel > title');
    const rssTitle = xmlDoc.querySelector('title');
    return (channelTitle || rssTitle)?.textContent?.trim() || 'Unknown Podcast';
  } catch (error) {
    console.log('Error getting podcast title:', error);
    return 'Unknown Podcast';
  }
}

function getEpisodeTitle(item) {
  try {
    const title = item.querySelector('title');
    return title?.textContent?.trim() || 'Unknown Episode';
  } catch (error) {
    console.log('Error getting episode title:', error);
    return 'Unknown Episode';
  }
}

function getReleaseDate(item) {
  const possibleDatePaths = [
    'pubDate',
    'dc\\:date',
    'itunes\\:pubDate',
    'published',
  ];

  for (const path of possibleDatePaths) {
    try {
      const element = item.querySelector(path);
      if (element && element.textContent) {
        const dateText = element.textContent.trim();
        const date = new Date(dateText);

        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        } else {
          console.log(`Invalid date format: ${dateText}`);
        }
      }
    } catch (e) {
      console.log(`Error parsing date with path ${path}:`, e);
    }
  }

  return null;
}

function getPublisher(xmlDoc) {
  const possiblePublisherPaths = [
    'channel > itunes\\:owner > itunes\\:name',
    'channel > publisher',
    'channel > dc\\:publisher',
    'channel > webMaster',
  ];

  for (const path of possiblePublisherPaths) {
    try {
      const element = xmlDoc.querySelector(path);
      if (element && element.textContent) {
        return element.textContent.trim();
      }
    } catch (e) {
      console.log(`Error finding publisher with path ${path}:`, e);
    }
  }

  try {
    return getAuthor(xmlDoc, null) || null;
  } catch (e) {
    console.log('Error getting publisher fallback:', e);
    return null;
  }
}

function getCategory(xmlDoc) {
  const possibleCategoryPaths = [
    'channel > itunes\\:category',
    'channel > category',
    'channel > dc\\:subject',
  ];

  for (const path of possibleCategoryPaths) {
    try {
      const element = xmlDoc.querySelector(path);
      if (element) {
        const categoryText =
          element.getAttribute('text') || element.textContent;
        if (categoryText) {
          return categoryText.trim();
        }
      }
    } catch (e) {
      console.log(`Error finding category with path ${path}:`, e);
    }
  }

  return null;
}

function getDescription(item) {
  const possibleDescriptionPaths = [
    'description',
    'itunes\\:summary',
    'content\\:encoded',
    'media\\:description',
  ];

  for (const path of possibleDescriptionPaths) {
    try {
      const element = item.querySelector(path);
      if (element && element.textContent) {
        const description = element.textContent
          .trim()
          .replace(/<\/?[^>]+(>|$)/g, '');
        return description;
      }
    } catch (e) {
      console.log(`Error finding description with path ${path}:`, e);
    }
  }

  return null;
}

function getDuration(item) {
  const possibleDurationPaths = [
    'itunes\\:duration',
    'duration',
    'media\\:content',
    'enclosure',
  ];

  for (const path of possibleDurationPaths) {
    try {
      const element = item.querySelector(path);
      if (!element) continue;
      if (path.includes('duration') && element.textContent) {
        return parseDurationString(element.textContent.trim());
      }
      if (path === 'media\\:content' && element.getAttribute('duration')) {
        const duration = parseInt(element.getAttribute('duration'));
        if (!isNaN(duration)) return duration;
      }
      if (path === 'enclosure' && element.getAttribute('length')) {
        const length = parseInt(element.getAttribute('length'));
        if (!isNaN(length) && length < 100000) {
          return length;
        }
      }
    } catch (e) {
      console.log(`Error finding duration with path ${path}:`, e);
    }
  }

  return null;
}

function parseDurationString(durationStr) {
  if (!durationStr) return null;
  if (/^\d+$/.test(durationStr)) {
    return parseInt(durationStr);
  }
  const parts = durationStr.split(':').map((part) => parseInt(part));
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  console.log(`Couldn't parse duration string: ${durationStr}`);
  return null;
}

export {
  parseRss,
  getEnclosureUrl,
  getPodcastImage,
  getAuthor,
  getPodcastTitle,
  getEpisodeTitle,
  getReleaseDate,
  getPublisher,
  getCategory,
  getDescription,
  getDuration,
};
