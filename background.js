let browserAPI = chrome || browser;

browserAPI.runtime.onInstalled.addListener(() => {
  browserAPI.storage.sync.set({ darkMode: true }); // Set darkMode to true for enabling by default
});

browserAPI.browserAction.onClicked.addListener((tab) => {
  browserAPI.tabs.sendMessage(tab.id, { action: 'toggle-dark-mode' });
});
