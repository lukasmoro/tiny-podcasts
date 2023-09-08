// chrome.tabs.query({ currentWindow: true }, function (tabs) {
//     for (var i = 0; i < tabs.length; i++) {
//         var tab = tabs[i];
//         var tabUrl = tab.url;
//         console.log("Tab URL: " + tabUrl);
//         if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
//             chrome.tabs.update(tab.id, { url: 'https://google.com' });
//         }
//     }
// });