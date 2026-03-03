# Color Configuration Guide

## Overview
File `colors.ts` berisi semua kode warna yang digunakan dalam project Gacor Gaming. Dengan centralized color configuration ini, Anda dapat dengan mudah mengubah tema website hanya dengan memodifikasi warna-warna.

## File Location
```
client/config/colors.ts
```

## Color Categories

### 1. Primary Colors (Pink/Purple Gradient)
```typescript
primary: {
  light: "#FFC1DA",      // Light pink
  main: "#F178A1",       // Main pink
  dark: "#E05A85",       // Dark pink
  gradient: "...",       // Horizontal gradient
  gradientReverse: "..." // Vertical gradient
}
```

### 2. Secondary Colors
```typescript
secondary: {
  cyan: "#00D4FF",       // Cyan/Blue for deposit button
  orange: "#FF8C42"      // Orange accent
}
```

### 3. Background Colors
```typescript
background: {
  page: "#F1C8D6",           // Main page background
  card: "#FFFFFF",           // Card background
  modal: "#F178A1",          // Modal background
  hover: "rgba(..., 0.2)",   // Hover effect
  overlay: "rgba(..., 0.5)"  // Overlay/modal backdrop
}
```

### 4. Text Colors
```typescript
text: {
  white: "#FFFFFF",      // White text
  dark: "#333333",       // Dark text
  gray: "#666666",       // Gray text
  lightGray: "#999999"   // Light gray text
}
```

### 5. Button Colors
```typescript
button: {
  primary: "#F178A1",    // Primary button
  secondary: "#00D4FF",  // Secondary button (cyan)
  success: "#4CAF50",    // Success state
  danger: "#F44336",     // Danger/Error state
  warning: "#FF9800",    // Warning state
  info: "#2196F3"        // Info state
}
```

## How to Use

### In TypeScript/React Components
```typescript
import COLORS from '@/config/colors';

// Direct usage
const primaryColor = COLORS.primary.main;
const gradientBg = COLORS.primary.gradient;

// Using helper functions
import { getColor, getGradient } from '@/config/colors';

const color = getColor('primary');
const gradient = getGradient('default');
const reverseGradient = getGradient('reverse');
```

### In Inline Styles
```tsx
<div style={{ 
  background: COLORS.primary.gradient,
  color: COLORS.text.white 
}}>
  Content
</div>
```

### In Tailwind CSS (Custom Config)
Update `tailwind.config.ts`:
```typescript
import COLORS from '@/config/colors';

export default {
  theme: {
    extend: {
      colors: {
        primary: {
          light: COLORS.primary.light,
          main: COLORS.primary.main,
          dark: COLORS.primary.dark,
        },
        // ... more colors
      }
    }
  }
}
```

## API Integration

### Exporting Colors as JSON
File ini includes a `colorsAsJSON` export yang bisa digunakan untuk API:

```typescript
import { colorsAsJSON } from '@/config/colors';

// Get all colors as JSON string
// console.log(colorsAsJSON);
```

### Consuming from API
Anda bisa fetch colors dari API endpoint:

```typescript
// Example API endpoint
GET /api/theme/colors
Response:
{
  "primary": {
    "light": "#FFC1DA",
    "main": "#F178A1",
    "dark": "#E05A85",
    ...
  },
  ...
}
```

### Applying API Theme at Runtime
```typescript
async function applyTheme(colorsFromAPI) {
  // Update CSS variables
  const root = document.documentElement;
  root.style.setProperty('--color-primary', colorsFromAPI.primary.main);
  root.style.setProperty('--color-secondary', colorsFromAPI.secondary.cyan);
  // ... etc
}

// Usage
const themeColors = await fetch('/api/theme/colors').then(r => r.json());
applyTheme(themeColors);
```

## Color Reference Table

| Usage | Color | Hex Code | Context |
|-------|-------|----------|---------|
| Header Gradient | Primary Gradient | #F178A1 - #FFC1DA | Header & buttons |
| Page Background | Page BG | #F1C8D6 | Main background |
| Deposit Button | Cyan | #00D4FF | CTA button |
| Withdraw Button | Pink | #F178A1 | Secondary button |
| Text (Primary) | White | #FFFFFF | White text |
| Text (Secondary) | Gray | #666666 | Gray text |

## Modifying Colors for Different Themes

### Method 1: Direct Modification
Edit `colors.ts` directly and update color values.

### Method 2: API-Driven Theming
1. Fetch color configuration from API
2. Apply colors to CSS variables
3. Use CSS variables in components

### Method 3: Environment-Based Theming
```typescript
const isDarkMode = process.env.REACT_APP_THEME === 'dark';
export const COLORS = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
```

## Future Enhancements

1. **CSS Variables Integration**: Convert to CSS custom properties for runtime theming
2. **Theme API Endpoint**: Create backend endpoint to manage multiple themes
3. **Theme Manager Hook**: Create React hook for easier theme switching
4. **Color Validation**: Add color format validation utility
5. **WCAG Compliance**: Add contrast ratio checking for accessibility

## Support

For questions about color configuration, please refer to the project documentation or contact the development team.
