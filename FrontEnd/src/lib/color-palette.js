/**
 * Health Matters - Complete Color Palette
 * Visual reference for all colors used in the application
 */

export const colorPalette = {
  // ============================================
  // ROLE COLORS
  // ============================================
  
  roles: {
    admin: {
      name: 'Admin Blue',
      hex: {
        50: '#eff6ff',   // blue-50
        100: '#dbeafe',  // blue-100
        600: '#2563eb',  // blue-600
        700: '#1d4ed8',  // blue-700
        800: '#1e40af',  // blue-800
        900: '#1e3a8a',  // blue-900
      },
      usage: 'System administrators, main brand color'
    },
    
    practitioner: {
      name: 'Practitioner Amber',
      hex: {
        50: '#fffbeb',   // amber-50
        100: '#fef3c7',  // amber-100
        600: '#d97706',  // amber-600
        700: '#b45309',  // amber-700
        800: '#92400e',  // amber-800
        900: '#78350f',  // amber-900
      },
      usage: 'Healthcare practitioners'
    },
    
    manager: {
      name: 'Manager Slate',
      hex: {
        50: '#f8fafc',   // slate-50
        100: '#f1f5f9',  // slate-100
        600: '#475569',  // slate-600
        700: '#334155',  // slate-700
        800: '#1e293b',  // slate-800
        900: '#0f172a',  // slate-900
      },
      usage: 'Department managers, neutral theme'
    },
    
    employee: {
      name: 'Employee Emerald',
      hex: {
        50: '#ecfdf5',   // emerald-50
        100: '#d1fae5',  // emerald-100
        600: '#059669',  // emerald-600
        700: '#047857',  // emerald-700
        800: '#065f46',  // emerald-800
        900: '#064e3b',  // emerald-900
      },
      usage: 'Standard employees'
    }
  },
  
  // ============================================
  // STATUS COLORS
  // ============================================
  
  status: {
    success: {
      name: 'Success Green',
      hex: {
        100: '#dcfce7',  // green-100
        400: '#4ade80',  // green-400
        500: '#22c55e',  // green-500
        600: '#16a34a',  // green-600
        800: '#166534',  // green-800
      },
      usage: 'Completed tasks, accepted referrals, positive states'
    },
    
    error: {
      name: 'Error Red',
      hex: {
        100: '#fee2e2',  // red-100
        400: '#f87171',  // red-400
        500: '#ef4444',  // red-500
        600: '#dc2626',  // red-600
        700: '#b91c1c',  // red-700
      },
      usage: 'Errors, rejected items, destructive actions'
    },
    
    warning: {
      name: 'Warning Yellow',
      hex: {
        100: '#fef3c7',  // yellow-100
        400: '#fbbf24',  // yellow-400
        500: '#eab308',  // yellow-500
        600: '#ca8a04',  // yellow-600
        800: '#854d0e',  // yellow-800
      },
      usage: 'Warnings, pending states, caution messages'
    },
    
    info: {
      name: 'Info Blue',
      hex: {
        100: '#dbeafe',  // blue-100
        400: '#60a5fa',  // blue-400
        500: '#3b82f6',  // blue-500
        600: '#2563eb',  // blue-600
        800: '#1e40af',  // blue-800
      },
      usage: 'Informational messages, help text'
    }
  },
  
  // ============================================
  // NEUTRAL COLORS (Used across all themes)
  // ============================================
  
  neutral: {
    slate: {
      name: 'Slate Gray',
      hex: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      usage: 'Text, borders, backgrounds, tables'
    }
  },
  
  // ============================================
  // CHART COLORS (Data Visualization)
  // ============================================
  
  charts: {
    chart1: { hex: '#3b82f6', name: 'Blue', rgb: '59 130 246' },
    chart2: { hex: '#10b981', name: 'Emerald', rgb: '16 185 129' },
    chart3: { hex: '#f59e0b', name: 'Amber', rgb: '245 158 11' },
    chart4: { hex: '#8b5cf6', name: 'Violet', rgb: '139 92 246' },
    chart5: { hex: '#ec4899', name: 'Pink', rgb: '236 72 153' },
    usage: 'Analytics dashboards, data visualizations, charts'
  },
  
  // ============================================
  // LANDING PAGE
  // ============================================
  
  landing: {
    primary: {
      from: '#06b6d4',  // cyan-500
      to: '#2563eb',    // blue-600
      name: 'Cyan to Blue Gradient'
    },
    accent: {
      hex: '#06b6d4',   // cyan-500
      name: 'Cyan Accent'
    },
    usage: 'Landing page hero, CTAs, brand elements'
  },
  
  // ============================================
  // SEMANTIC COLORS
  // ============================================
  
  semantic: {
    background: '#f8fafc',    // slate-50
    foreground: '#0f172a',    // slate-900
    card: '#ffffff',          // white
    border: '#e2e8f0',        // slate-200
    input: '#e2e8f0',         // slate-200
    ring: '#94a3b8',          // slate-400 (focus rings)
  }
};

// ============================================
// ACCESSIBILITY NOTES
// ============================================

export const accessibilityGuidelines = {
  contrastRatios: {
    largeText: '3:1 minimum (WCAG AA)',
    normalText: '4.5:1 minimum (WCAG AA)',
    enhanced: '7:1 recommended (WCAG AAA)'
  },
  
  recommendations: {
    text: [
      'Use slate-900 (#0f172a) on white for primary text',
      'Use slate-800 (#1e293b) for secondary headings',
      'Use slate-700 (#334155) for body text',
      'Use slate-600 (#475569) for muted text',
      'Never use slate-400 or lighter for text on white backgrounds'
    ],
    
    status: [
      'Success: green-800 (#166534) text on green-100 (#dcfce7) background',
      'Error: red-700 (#b91c1c) text on red-100 (#fee2e2) background',
      'Warning: yellow-800 (#854d0e) text on yellow-100 (#fef3c7) background',
      'Info: blue-800 (#1e40af) text on blue-100 (#dbeafe) background'
    ],
    
    interactive: [
      'Ensure 3px minimum width/height for touch targets',
      'Provide visible focus states with outline-ring',
      'Use transitions for better perceived performance',
      'Maintain color contrast for hover states'
    ]
  }
};

// ============================================
// COLOR USAGE BY COMPONENT
// ============================================

export const componentColors = {
  Button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900',
    outline: 'border-slate-300 hover:bg-slate-50 text-slate-700',
    destructive: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'hover:bg-slate-100 text-slate-700'
  },
  
  Badge: {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-slate-100 text-slate-700'
  },
  
  Card: {
    base: 'bg-white border-slate-200',
    header: 'text-slate-900',
    description: 'text-slate-600'
  },
  
  Table: {
    header: 'bg-slate-50 text-slate-700 border-slate-200',
    row: 'hover:bg-slate-50 text-slate-900',
    cell: 'text-slate-700'
  },
  
  Input: {
    base: 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20',
    disabled: 'bg-slate-50 text-slate-500 cursor-not-allowed',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
  }
};
