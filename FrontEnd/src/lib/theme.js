/**
 * Health Matters - Centralized Theme Configuration
 * 
 * This file defines the color schemes and styles for each user role
 * and common UI elements across the application.
 */

// Role-based theme colors
export const roleThemes = {
  admin: {
    name: 'Admin',
    primary: 'blue',
    colors: {
      bg: {
        sidebar: 'bg-blue-900',
        sidebarHover: 'hover:bg-blue-800',
        sidebarActive: 'bg-blue-700',
        main: 'bg-slate-50',
        card: 'bg-white',
      },
      text: {
        sidebar: 'text-white',
        sidebarInactive: 'text-blue-100',
        sidebarMuted: 'text-blue-200',
        primary: 'text-blue-900',
        secondary: 'text-slate-800',
        muted: 'text-slate-600',
      },
      border: {
        sidebar: 'border-blue-800',
        main: 'border-slate-200',
      },
    },
  },
  practitioner: {
    name: 'Practitioner',
    primary: 'amber',
    colors: {
      bg: {
        sidebar: 'bg-amber-900',
        sidebarHover: 'hover:bg-amber-800',
        sidebarActive: 'bg-amber-700',
        main: 'bg-amber-50',
        card: 'bg-white',
      },
      text: {
        sidebar: 'text-white',
        sidebarInactive: 'text-amber-100',
        sidebarMuted: 'text-amber-200',
        primary: 'text-amber-900',
        secondary: 'text-slate-800',
        muted: 'text-slate-600',
      },
      border: {
        sidebar: 'border-amber-800',
        main: 'border-slate-200',
      },
    },
  },
  manager: {
    name: 'Manager',
    primary: 'slate',
    colors: {
      bg: {
        sidebar: 'bg-slate-900',
        sidebarHover: 'hover:bg-slate-800',
        sidebarActive: 'bg-slate-700',
        main: 'bg-slate-50',
        card: 'bg-white',
      },
      text: {
        sidebar: 'text-white',
        sidebarInactive: 'text-slate-100',
        sidebarMuted: 'text-slate-200',
        primary: 'text-slate-900',
        secondary: 'text-slate-800',
        muted: 'text-slate-600',
      },
      border: {
        sidebar: 'border-slate-800',
        main: 'border-slate-200',
      },
    },
  },
  employee: {
    name: 'Employee',
    primary: 'emerald',
    colors: {
      bg: {
        sidebar: 'bg-emerald-900',
        sidebarHover: 'hover:bg-emerald-800',
        sidebarActive: 'bg-emerald-700',
        main: 'bg-emerald-50',
        card: 'bg-white',
      },
      text: {
        sidebar: 'text-white',
        sidebarInactive: 'text-emerald-100',
        sidebarMuted: 'text-emerald-200',
        primary: 'text-emerald-900',
        secondary: 'text-slate-800',
        muted: 'text-slate-600',
      },
      border: {
        sidebar: 'border-emerald-800',
        main: 'border-slate-200',
      },
    },
  },
};

// Common UI Colors (used across all roles)
export const commonColors = {
  // Status colors
  status: {
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-400',
      hover: 'hover:bg-green-100',
      indicator: 'bg-green-500',
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-400',
      hover: 'hover:bg-red-100',
      indicator: 'bg-red-500',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-400',
      hover: 'hover:bg-yellow-100',
      indicator: 'bg-yellow-500',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-400',
      hover: 'hover:bg-blue-100',
      indicator: 'bg-blue-500',
    },
  },

  // Neutral/Slate colors for general UI
  slate: {
    50: 'bg-slate-50',
    100: 'bg-slate-100',
    200: 'bg-slate-200',
    500: 'text-slate-500',
    600: 'text-slate-600',
    700: 'text-slate-700',
    800: 'text-slate-800',
    900: 'text-slate-900',
  },

  // Landing page theme
  landing: {
    primary: 'from-cyan-500 to-blue-600',
    accent: 'bg-cyan-500/10',
    accentHover: 'hover:bg-cyan-500/20',
    text: 'text-cyan-300',
    border: 'border-cyan-400/30',
  },
};

// Table theme (consistent across all dashboards)
export const tableTheme = {
  header: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-700',
  },
  row: {
    border: 'border-slate-200',
    hover: 'hover:bg-slate-50',
    text: 'text-slate-900',
  },
  cell: {
    text: 'text-slate-700',
  },
};

// Card theme
export const cardTheme = {
  base: 'bg-white border border-slate-200 rounded-lg shadow-sm',
  header: 'text-slate-900',
  description: 'text-slate-600',
};

// Button variants
export const buttonTheme = {
  primary: (role) => {
    const color = roleThemes[role]?.primary || 'blue';
    return `bg-${color}-600 hover:bg-${color}-700 text-white`;
  },
  outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700',
  ghost: 'hover:bg-slate-100 text-slate-700',
  destructive: 'bg-red-600 hover:bg-red-700 text-white',
};

// Helper function to get role theme
export const getRoleTheme = (role) => {
  return roleThemes[role] || roleThemes.admin;
};

// Helper function to build sidebar class names
export const buildSidebarClasses = (role) => {
  const theme = getRoleTheme(role);
  return {
    sidebar: `${theme.colors.border.sidebar} ${theme.colors.bg.sidebar} ${theme.colors.text.sidebar}`,
    header: `${theme.colors.border.sidebar}`,
    menuItemActive: `${theme.colors.bg.sidebarActive} ${theme.colors.text.sidebar}`,
    menuItemInactive: `${theme.colors.text.sidebarInactive} ${theme.colors.bg.sidebarHover} hover:text-white`,
    footer: `${theme.colors.border.sidebar} ${theme.colors.bg.sidebarHover}`,
    trigger: `${theme.colors.text.primary} hover:bg-${theme.primary}-50 hover:text-${theme.primary}-700`,
  };
};

// CSS variable names for dynamic theming
export const cssVars = {
  primary: '--color-primary',
  primaryForeground: '--color-primary-foreground',
  secondary: '--color-secondary',
  accent: '--color-accent',
  destructive: '--color-destructive',
  muted: '--color-muted',
  border: '--color-border',
};
