// Show onboarding on install
chrome.runtime.onInstalled.addListener((event) => {
    console.log('hello world');
    console.log(event);

    if (event.reason === chrome.runtime.OnInstalledReason.INSTALL || event.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        chrome.tabs.create({
            url: chrome.runtime.getURL('panel.html')
        });
    }
});
