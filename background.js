let browserAPI = chrome || browser;

browserAPI.runtime.onInstalled.addListener(() => {
  browserAPI.storage.sync.set({ darkMode: false });
});

browserAPI.browserAction.onClicked.addListener((tab) => {
  browserAPI.tabs.sendMessage(tab.id, { action: 'toggle-dark-mode' });
});