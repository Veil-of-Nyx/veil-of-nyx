let storage = chrome.storage || browser.storage;

document.getElementById('brightness').addEventListener('input', (event) => {
  storage.sync.set({ brightness: event.target.value });
});

document.getElementById('contrast').addEventListener('input', (event) => {
  storage.sync.set({ contrast: event.target.value });
});

document.getElementById('blue-light-filter').addEventListener('change', (event) => {
  storage.sync.set({ blueLightFilter: event.target.checked });
});

storage.sync.get(['brightness', 'contrast', 'blueLightFilter'], (data) => {
  document.getElementById('brightness').value = data.brightness || 100;
  document.getElementById('contrast').value = data.contrast || 100;
  document.getElementById('blue-light-filter').checked = data.blueLightFilter || false;
});
