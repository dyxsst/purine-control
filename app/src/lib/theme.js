// Theme Engine - Dragon Scale Shimmer
// Generates complete color palette from a single seed color

/**
 * Convert HEX to HSL
 */
export function hexToHSL(hex) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  
  if (0 <= h && h < 60) { r = c; g = x; b = 0; }
  else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
  else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
  else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
  else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
  else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
  
  r = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  g = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  b = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

/**
 * Generate complete theme from seed color
 */
export function generateThemeFromSeed(seedHex, isDarkMode = false) {
  const hsl = hexToHSL(seedHex);
  
  if (isDarkMode) {
    return {
      primary: seedHex,
      primaryLight: hslToHex(hsl.h, hsl.s * 0.8, Math.min(hsl.l + 15, 80)),
      primaryDark: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 15, 20)),
      background: hslToHex(hsl.h, hsl.s * 0.2, 12),
      surface: hslToHex(hsl.h, hsl.s * 0.15, 18),
      surfaceVariant: hslToHex(hsl.h, hsl.s * 0.2, 25),
      secondary: hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, 60),
      text: hslToHex(hsl.h, hsl.s * 0.1, 95),
      textSecondary: hslToHex(hsl.h, hsl.s * 0.15, 70),
      border: hslToHex(hsl.h, hsl.s * 0.2, 30),
      
      // Semantic colors (safety-critical - always recognizable)
      success: '#66BB6A',
      warning: '#FFA726',
      danger: '#EF5350',
    };
  }
  
  return {
    primary: seedHex,
    primaryLight: hslToHex(hsl.h, hsl.s * 0.6, Math.min(hsl.l + 20, 90)),
    primaryDark: hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 30)),
    background: hslToHex(hsl.h, hsl.s * 0.3, 97),
    surface: hslToHex(hsl.h, hsl.s * 0.1, 100),
    surfaceVariant: hslToHex(hsl.h, hsl.s * 0.2, 95),
    secondary: hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, hsl.l),
    text: hslToHex(hsl.h, hsl.s * 0.5, 15),
    textSecondary: hslToHex(hsl.h, hsl.s * 0.3, 40),
    border: hslToHex(hsl.h, hsl.s * 0.2, 85),
    
    // Semantic colors (safety-critical - always recognizable)
    success: '#66BB6A',
    warning: '#FFA726',
    danger: '#EF5350',
  };
}

/**
 * Preset themes
 */
export const THEME_PRESETS = {
  emerald: {
    name: 'Emerald Dragon',
    description: 'Bright, cheerful, default',
    seedColor: '#66BB6A',
    isDark: false,
  },
  midnight: {
    name: 'Midnight Dragon',
    description: 'Sleek, easy on eyes',
    seedColor: '#7B2CBF',
    isDark: true,
  },
  crystal: {
    name: 'Crystal Dragon',
    description: 'High contrast, accessible',
    seedColor: '#2196F3',
    isDark: false,
  },
};

/**
 * Apply theme to document
 */
export function applyTheme(theme) {
  const root = document.documentElement;
  
  Object.entries(theme).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
}

/**
 * Get status color based on value vs thresholds
 */
export function getStatusColor(value, min, max, theme) {
  if (value > max) return theme.danger;
  if (value > max * 0.8) return theme.warning;
  if (min && value < min * 0.8) return theme.warning;
  return theme.success;
}

/**
 * Get status level (for conditional rendering)
 */
export function getStatusLevel(value, min, max) {
  if (value > max) return 'danger';
  if (value > max * 0.8) return 'warning';
  if (min && value < min * 0.8) return 'warning';
  return 'success';
}
