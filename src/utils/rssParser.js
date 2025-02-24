function parseRss(xml) {
  try {
    const xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    const firstItem = xmlDoc.querySelector('item');

    if (!firstItem) {
      console.log('No items found in RSS feed');
      return null;
    }

    const item = {
      mp3: getEnclosureUrl(firstItem),
      image: getPodcastImage(xmlDoc),
      author: getAuthor(xmlDoc, firstItem),
      title: getPodcastTitle(xmlDoc),
      episode: getEpisodeTitle(firstItem),
    };

    console.log('Parsed item:', item);
    return item;
  } catch (err) {
    console.log('Error parsing RSS feed: ', err);
    return null;
  }
}

function getEnclosureUrl(item) {
  const enclosure = item.querySelector('enclosure');
  if (enclosure) {
    return enclosure.getAttribute('url');
  }
  const mediaContent = item.querySelector('media\\:content, content');
  return mediaContent ? mediaContent.getAttribute('url') : null;
}

function getPodcastImage(xmlDoc) {
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
}

function getAuthor(xmlDoc, item) {
  const possibleAuthorPaths = [
    'author',
    'itunes\\:author',
    'dc\\:creator',
    'channel > author',
    'channel > itunes\\:author',
  ];

  for (const path of possibleAuthorPaths) {
    const element = item.querySelector(path) || xmlDoc.querySelector(path);
    if (element && element.textContent) {
      return element.textContent.trim();
    }
  }
  return null;
}

function getPodcastTitle(xmlDoc) {
  const channelTitle = xmlDoc.querySelector('channel > title');
  const rssTitle = xmlDoc.querySelector('title');

  return (channelTitle || rssTitle)?.textContent.trim() || null;
}

function getEpisodeTitle(item) {
  const title = item.querySelector('title');
  return title?.textContent.trim() || null;
}

export {
  parseRss,
  getEnclosureUrl,
  getPodcastImage,
  getAuthor,
  getPodcastTitle,
  getEpisodeTitle,
};
