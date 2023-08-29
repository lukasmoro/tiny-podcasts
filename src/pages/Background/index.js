console.log('This is the background page.');
console.log('Put the background scripts here.');

chrome.runtime.onInstalled.addListener(function () {
    // Initialize the flag to indicate that content hasn't been rendered yet
    chrome.storage.local.set({ rendered: false });
    console.log("hello");
});

chrome.runtime.onInstalled.addListener((reason) => {
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({
            url: 'https://developer.chrome.com/docs/extensions/mv3/manifest/icons/'
        });
    }
});

