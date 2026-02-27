/**
 * Centralized Color Configuration
 * This file contains all color values used throughout the project
 * Can be easily modified to apply different color themes via API
 */

export const COLORS = {
  // Primary Colors - Pink/Purple Gradient
  primary: {
    light: "#FFC1DA",
    main: "#F178A1",
    dark: "#E05A85",
    gradient: "linear-gradient(90deg, #F178A1 0%, #FFC1DA 100%)",
    gradientReverse: "linear-gradient(180deg, #F178A1 0%, #FFC1DA 100%)",
  },

  // Secondary Colors
  secondary: {
    cyan: "#00D4FF",
    orange: "#FF8C42",
  },

  // Background Colors
  background: {
    page: "#F1C8D6",
    card: "#FFFFFF",
    modal: "#F178A1",
    hover: "rgba(255, 255, 255, 0.2)",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Text Colors
  text: {
    white: "#FFFFFF",
    dark: "#333333",
    gray: "#666666",
    lightGray: "#999999",
  },

  // Button Colors
  button: {
    primary: "#F178A1",
    secondary: "#00D4FF",
    success: "#4CAF50",
    danger: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
  },

  // Border & Divider Colors
  border: {
    light: "#E0E0E0",
    medium: "#BDBDBD",
    dark: "#757575",
    pink: "#E91E63",
  },

  // Status Colors
  status: {
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
    loading: "#00D4FF",
  },

  // Announcement & Marquee
  announcement: {
    background: "#4B5563",
    text: "#FFFFFF",
  },

  // Banner Colors
  banner: {
    overlay: "rgba(0, 0, 0, 0.3)",
  },

  // Shadow Colors
  shadow: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.2)",
    dark: "rgba(0, 0, 0, 0.3)",
  },

  // Special Effects
  effects: {
    glowPink: "rgba(241, 120, 161, 0.5)",
    glowCyan: "rgba(0, 212, 255, 0.7)",
    shadowInner: "inset 0 0 10px rgba(255, 255, 255, 0.3)",
    shadowInnerBright: "inset 0 0 15px rgba(255, 255, 255, 0.5)",
  },

  // Opacity Variants
  opacity: {
    light: 0.1,
    medium: 0.3,
    semitransparent: 0.5,
    heavy: 0.8,
  },
} as const;

/**
 * Helper function to apply theme colors
 * Can be used in components or utility functions
 */
export const getColor = (path: keyof typeof COLORS): string => {
  return COLORS[path] as unknown as string;
};

/**
 * Helper function to apply gradient
 */
export const getGradient = (type: "default" | "reverse" = "default"): string => {
  return type === "reverse" ? COLORS.primary.gradientReverse : COLORS.primary.gradient;
};

/**
 * Export as JSON for API/external use
 * This can be consumed by API clients or other systems
 */
export const colorsAsJSON = JSON.stringify(COLORS, null, 2);

export default COLORS;
