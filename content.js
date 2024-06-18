let browserAPI = chrome || browser;

// Function to invert a hex color
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

// Function to apply dark mode styles dynamically
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
              // Check if the website already has a dark color scheme
              if (isDarkColorScheme(styleValue)) {
                // If it does, skip inverting the color
                continue;
              }
              
              // Adjust color saturation and avoid pure black/white
              let adjustedColor = adjustColorForDarkMode(styleValue);
              rule.style.setProperty(styleName, adjustedColor, rule.style.getPropertyPriority(styleName));

              // Adjust text color based on background color
              if (styleName.includes('background')) {
                let textColor = getContrastingTextColor(adjustedColor);
                rule.style.setProperty('color', textColor, rule.style.getPropertyPriority('color'));
              }
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

// Helper function to adjust color for dark mode
function adjustColorForDarkMode(color) {
  // Convert color to RGB values
  let r, g, b;
  if (color.startsWith('rgb')) {
    [r, g, b] = color.slice(4, -1).split(',').map(Number);
  } else if (color.startsWith('#')) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else {
    return color; // Unsupported color format
  }

  // Adjust saturation and avoid pure black/white
  const darkGray = '#121212'; // Recommended dark gray background color
  const maxSaturation = 0.8; // Maximum saturation level for dark mode
  const minLuminance = 0.1; // Minimum luminance level for dark mode
  const maxLuminance = 0.9; // Maximum luminance level for dark mode

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);

  if (luminance < minLuminance || luminance > maxLuminance || saturation > maxSaturation) {
    // Adjust color to be within the recommended range for dark mode
    const hsl = rgbToHsl(r, g, b);
    hsl[1] = Math.min(hsl[1], maxSaturation); // Adjust saturation
    hsl[2] = Math.max(minLuminance, Math.min(maxLuminance, hsl[2])); // Adjust luminance
    const adjustedRgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    return `rgb(${adjustedRgb[0]}, ${adjustedRgb[1]}, ${adjustedRgb[2]})`;
  }

  return color;
}

// Helper function to get contrasting text color based on background color
function getContrastingTextColor(hexColor) {
  // Convert hex color to RGB values
  let r = parseInt(hexColor.slice(1, 3), 16);
  let g = parseInt(hexColor.slice(3, 5), 16);
  let b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate the relative luminance
  let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Threshold for considering a color light or dark
  let threshold = 0.5;

  // Return contrasting text color
  return luminance > threshold ? '#000000' : '#ffffff';
}

// Helper function to check if a color is considered dark
function isDarkColorScheme(color) {
  // Convert color to RGB values
  let r, g, b;
  if (color.startsWith('rgb')) {
    [r, g, b] = color.slice(4, -1).split(',').map(Number);
  } else if (color.startsWith('#')) {
    r = parseInt(color.slice(1, 3), 16);
    g = parseInt(color.slice(3, 5), 16);
    b = parseInt(color.slice(5, 7), 16);
  } else {
    return false; // Unsupported color format
  }

  // Calculate the relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Threshold for considering a color dark
  const darkThreshold = 0.3;

  return luminance < darkThreshold;
}

// Function to analyze and adjust colors for dark mode
function analyzeAndAdjustColors() {
  let elements = document.querySelectorAll('*');
  elements.forEach(element => {
    let computedStyle = getComputedStyle(element);
    let backgroundColor = computedStyle.backgroundColor;
    let color = computedStyle.color;

    // Invert background color if it's not transparent
    if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      let invertedBackgroundColor = adjustColorForDarkMode(rgbToHex(backgroundColor));
      element.style.backgroundColor = invertedBackgroundColor;
    }

    // Invert text color
    let invertedColor = adjustColorForDarkMode(rgbToHex(color));
    element.style.color = invertedColor;
  });
}

// Helper function to convert RGB to Hex
function rgbToHex(rgb) {
  let result = rgb.match(/\d+/g);
  return `#${((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1)}`;
}

// Helper function to convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Event listener for toggling dark mode
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle-dark-mode') {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
      applyDarkMode();
      analyzeAndAdjustColors();
    } else {
      document.body.style.filter = ''; // Reset filters
      location.reload(); // Reload the page to reset styles
    }
  }
});

// Apply user preferences for brightness, contrast, and blue light filter
browserAPI.storage.sync.get(['brightness', 'contrast', 'blueLightFilter'], (data) => {
  const brightness = data.brightness || 100;
  const contrast = data.contrast || 100;
  if (data.blueLightFilter) {
    document.body.classList.add('blue-light-filter');
  }
  document.body.style.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
});
