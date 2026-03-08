# Health Matters - Theme System Documentation

## Overview
This application uses a role-based theme system where each user role (Admin, Practitioner, Manager, Employee) has its own distinct color palette while maintaining consistent UI patterns.

## Theme Colors by Role

### Admin Theme (Blue)
- **Primary Color**: Blue
- **Sidebar**: `bg-blue-900`, `border-blue-800`
- **Active State**: `bg-blue-700`
- **Hover State**: `hover:bg-blue-800`
- **Background**: `bg-slate-50`
- **Use Case**: System administrators

### Practitioner Theme (Amber)
- **Primary Color**: Amber/Orange
- **Sidebar**: `bg-amber-900`, `border-amber-800`
- **Active State**: `bg-amber-700`
- **Hover State**: `hover:bg-amber-800`
- **Background**: `bg-amber-50`
- **Use Case**: Healthcare practitioners

### Manager Theme (Slate/Gray)
- **Primary Color**: Slate
- **Sidebar**: `bg-slate-900`, `border-slate-800`
- **Active State**: `bg-slate-700`
- **Hover State**: `hover:bg-slate-800`
- **Background**: `bg-slate-50`
- **Use Case**: Department managers

### Employee Theme (Emerald/Green)
- **Primary Color**: Emerald
- **Sidebar**: `bg-emerald-900`, `border-emerald-800`
- **Active State**: `bg-emerald-700`
- **Hover State**: `hover:bg-emerald-800`
- **Background**: `bg-emerald-50`
- **Use Case**: Standard employees

## Status Colors (Universal)

### Success
- Background: `bg-green-100`
- Text: `text-green-800`
- Border: `border-green-400`
- Indicator: `bg-green-500`
- **Use**: Completed actions, acceptance states

### Error/Destructive
- Background: `bg-red-100`
- Text: `text-red-700`
- Border: `border-red-400`
- Indicator: `bg-red-500`
- **Use**: Errors, rejections, destructive actions

### Warning
- Background: `bg-yellow-100`
- Text: `text-yellow-800`
- Border: `border-yellow-400`
- Indicator: `bg-yellow-500`
- **Use**: Warnings, pending states

### Info
- Background: `bg-blue-100`
- Text: `text-blue-800`
- Border: `border-blue-400`
- Indicator: `bg-blue-500`
- **Use**: Informational messages

## Using the Theme System

### 1. Import the Theme Utilities
```javascript
import { getRoleTheme, buildSidebarClasses, commonColors } from '@/lib/theme';
```

### 2. Get Role-Specific Theme
```javascript
const theme = getRoleTheme('admin'); // or 'practitioner', 'manager', 'employee'
```

### 3. Apply Sidebar Classes
```javascript
const sidebarClasses = buildSidebarClasses('admin');

<Sidebar className={sidebarClasses.sidebar}>
  <SidebarMenuItem className={isActive ? sidebarClasses.menuItemActive : sidebarClasses.menuItemInactive}>
    // Menu content
  </SidebarMenuItem>
</Sidebar>
```

### 4. Use Status Colors
```javascript
// Success badge
<Badge className={`${commonColors.status.success.bg} ${commonColors.status.success.text}`}>
  Completed
</Badge>

// Error message
<div className={`${commonColors.status.error.bg} ${commonColors.status.error.border} ${commonColors.status.error.text}`}>
  Error message
</div>
```

## CSS Variables

All theme colors are defined as CSS variables in `src/index.css`:

### Light Mode Variables
- `--primary`: Main brand color (Blue)
- `--secondary`: Secondary actions (Slate)
- `--destructive`: Error states (Red)
- `--success`: Success states (Green)
- `--warning`: Warning states (Yellow)
- `--info`: Informational states (Blue)
- `--muted`: Subtle backgrounds (Slate)
- `--border`: Border colors (Slate-200)

### Dark Mode
Dark mode variables are automatically applied when `.dark` class is present on the root element.

## Components Using Theme

### Table Component
```javascript
import { tableTheme } from '@/lib/theme';

<table>
  <thead className={`${tableTheme.header.bg} ${tableTheme.header.border}`}>
    <th className={tableTheme.header.text}>Header</th>
  </thead>
  <tbody>
    <tr className={`${tableTheme.row.border} ${tableTheme.row.hover}`}>
      <td className={tableTheme.cell.text}>Cell</td>
    </tr>
  </tbody>
</table>
```

### Card Component
```javascript
import { cardTheme } from '@/lib/theme';

<div className={cardTheme.base}>
  <h3 className={cardTheme.header}>Title</h3>
  <p className={cardTheme.description}>Description</p>
</div>
```

## Tailwind Color Palette

The application uses Tailwind's default color palette:
- **Slate**: Neutral grays (50-900)
- **Blue**: Admin theme, info states
- **Amber**: Practitioner theme
- **Emerald**: Employee theme
- **Green**: Success states
- **Red**: Error/destructive states
- **Yellow**: Warning states
- **Cyan**: Landing page accents

## Best Practices

1. **Consistency**: Always use theme utilities instead of hardcoded colors
2. **Accessibility**: Ensure sufficient contrast ratios (WCAG AA minimum)
3. **Status Colors**: Use universal status colors across all roles
4. **Hover States**: Always provide visual feedback on interactive elements
5. **Dark Mode**: Test all components in both light and dark modes

## File Structure

```
src/
├── lib/
│   └── theme.js          # Theme configuration and utilities
├── index.css             # CSS variables and global styles
└── components/
    └── ui/               # Themed UI components
```

## Customization

To add a new role theme:

1. Add the role to `roleThemes` in `src/lib/theme.js`
2. Define colors following the existing pattern
3. Create a dashboard layout using `buildSidebarClasses()`
4. Update this documenta
tion

---

**Version**: 1.0.0  
**Last Updated**: March 2026
