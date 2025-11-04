/**
 * Design Tokens - Minimal Design System
 *
 * DEPENDENCY MAP:
 *
 * Parents (Files that import this file):
 *   ├─ src/components/common/Card/Card.tsx
 *   ├─ src/components/common/Badge/Badge.tsx
 *   ├─ src/components/common/Button/Button.tsx
 *   └─ src/components/common/Layout/Layout.tsx
 *
 * Dependencies (External files that this file imports):
 *   (none)
 *
 * Related Documentation:
 *   ├─ Plan: docs/03_plans/ui-minimal-design/20241104_01_implementation-plan.md
 *   └─ Issue: docs/01_issues/open/2024_11/20241104_01_ui-minimal-design-improvement.md
 */

/**
 * Minimal Design System Tokens
 *
 * Apple-inspired minimal design with focus on simplicity and clarity.
 */
export const designTokens = {
  // Color Palette - Minimal grayscale with subtle accent
  colors: {
    // Neutral colors - Primary color system
    neutral: {
      50: "#fafafa",
      100: "#f5f5f5",
      200: "#e5e5e5",
      300: "#d4d4d4",
      400: "#a3a3a3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
      950: "#0a0a0a",
    },

    // Primary - Subtle blue accent
    primary: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },

    // Status colors - Minimal and muted
    status: {
      success: {
        light: "#f0fdf4",
        main: "#22c55e",
        dark: "#166534",
      },
      warning: {
        light: "#fffbeb",
        main: "#f59e0b",
        dark: "#92400e",
      },
      error: {
        light: "#fef2f2",
        main: "#ef4444",
        dark: "#991b1b",
      },
      info: {
        light: "#f0f9ff",
        main: "#3b82f6",
        dark: "#1e40af",
      },
    },
  },

  // Spacing system - Consistent scale
  spacing: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Typography
  typography: {
    fontSize: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // Border radius - Soft and minimal
  borderRadius: {
    none: "0",
    sm: "0.25rem", // 4px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
    full: "9999px",
  },

  // Shadows - Subtle and soft
  shadows: {
    none: "none",
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -1px rgb(0 0 0 / 0.03)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -2px rgb(0 0 0 / 0.03)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.05), 0 10px 10px -5px rgb(0 0 0 / 0.02)",
  },

  // Transitions - Smooth and subtle
  transitions: {
    fast: "150ms ease-in-out",
    base: "200ms ease-in-out",
    slow: "300ms ease-in-out",
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
} as const;

export type DesignTokens = typeof designTokens;
