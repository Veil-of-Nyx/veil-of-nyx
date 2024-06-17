let browserAPI = chrome || browser;

function invertColor(hex) {
  hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  r = 255 - r;
  g = 255 - g;
  b = 255 - b;
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function applyDarkMode() {
  let styleSheets = document.styleSheets;
  for (let i = 0; i < styleSheets.length; i++) {
    let styleSheet = styleSheets[i];
    try {
      let rules = styleSheet.cssRules || styleSheet.rules;
      for (let j = 0; j < rules.length; j++) {
        let rule = rules[j];
        if (rule.style) {
          for (let k = 0; k < rule.style.length; k++) {
            let styleName = rule.style[k];
            let styleValue = rule.style.getPropertyValue(styleName);
            if (styleName.includes('color') || styleName.includes('background')) {
              let invertedColor = invertColor(styleValue);
              rule.style.setProperty(styleName, invertedColor, rule.style.getPropertyPriority(styleName));
            }
            if (styleName === 'filter') {
              let currentFilter = styleValue;
              rule.style.setProperty('filter', `${currentFilter} brightness(0.9) contrast(1.1)`, rule.style.getPropertyPriority(styleName));
            }
          }
        }
      }
    } catch (e) {
      console.error(`Could not access CSS rules for stylesheet: ${styleSheet.href}`, e);
    }
  }
  document.body.style.filter = 'sepia(30%) hue-rotate(190deg) saturate(75%)';
}

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle-dark-mode') {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      applyDarkMode();
    } else {
      document.body.style.filter = '';  // Reset filters
      location.reload();  // Reload the page to reset styles
    }
  }
});

browserAPI.storage.sync.get(['brightness', 'contrast', 'blueLightFilter'], (data) => {
  const brightness = data.brightness || 100;
  const contrast = data.contrast || 100;
  if (data.blueLightFilter) {
    document.body.classList.add('blue-light-filter');
  }
  document.body.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
});
