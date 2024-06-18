let storage = chrome.storage || browser.storage;

document.addEventListener('DOMContentLoaded', async () => {
  const toggleButton = document.getElementById('toggle-dark-mode');

  const { darkModeEnabled, brightness, contrast, blueLightFilter } = await getSettings();

  if (darkModeEnabled) {
    toggleDarkMode(true);
    updateToggleButtonText(toggleButton, true);
  }

  const brightnessSlider = document.getElementById('brightness');
  const contrastSlider = document.getElementById('contrast');
  const blueLightFilterCheckbox = document.getElementById('blue-light-filter');

  brightnessSlider.value = brightness || 100;
  contrastSlider.value = contrast || 100;
  blueLightFilterCheckbox.checked = blueLightFilter || false;

  applySettings(brightness, contrast, blueLightFilter);

  toggleButton.addEventListener('click', async () => {
    const { darkModeEnabled } = await getSettings();
    const newDarkModeSetting = !darkModeEnabled;
    await setSetting('darkModeEnabled', newDarkModeSetting);
    toggleDarkMode(newDarkModeSetting);
    updateToggleButtonText(toggleButton, newDarkModeSetting);
  });

  brightnessSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    setSetting('brightness', value);
    applySettings(value, contrastSlider.value, blueLightFilterCheckbox.checked);
  });

  contrastSlider.addEventListener('input', (event) => {
    const value = event.target.value;
    setSetting('contrast', value);
    applySettings(brightnessSlider.value, value, blueLightFilterCheckbox.checked);
  });

  blueLightFilterCheckbox.addEventListener('change', (event) => {
    const value = event.target.checked;
    setSetting('blueLightFilter', value);
    applySettings(brightnessSlider.value, contrastSlider.value, value);
  });
});

function toggleDarkMode(enable) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle-dark-mode', enable });
  });
}

function updateToggleButtonText(button, isDarkModeEnabled) {
  button.textContent = isDarkModeEnabled ? 'Disable Dark Mode' : 'Enable Dark Mode';
}

async function getSettings() {
  return new Promise((resolve) => {
    storage.sync.get(['darkModeEnabled', 'brightness', 'contrast', 'blueLightFilter'], (result) => {
      resolve({
        darkModeEnabled: result.darkModeEnabled || false,
        brightness: result.brightness || 100,
        contrast: result.contrast || 100,
        blueLightFilter: result.blueLightFilter || false
      });
    });
  });
}

async function setSetting(key, value) {
  return new Promise((resolve) => {
    storage.sync.set({ [key]: value }, () => {
      resolve();
    });
  });
}

function applySettings(brightness, contrast, blueLightFilter) {
  document.documentElement.style.setProperty('--brightness', brightness);
  document.documentElement.style.setProperty('--contrast', contrast);
  document.documentElement.style.setProperty('--blue-light-filter', blueLightFilter ? '1' : '0');
}
