/**
 * Theme Quick Reference
 * Import and use these utilities in your components
 */

import { 
  roleThemes, 
  commonColors, 
  tableTheme, 
  cardTheme,
  getRoleTheme,
  buildSidebarClasses 
} from '@/lib/theme';

// ============================================
// ROLE-SPECIFIC THEMES
// ============================================

// Get theme for a specific role
const adminTheme = getRoleTheme('admin');
const practitionerTheme = getRoleTheme('practitioner');
const managerTheme = getRoleTheme('manager');
const employeeTheme = getRoleTheme('employee');

// Build sidebar classes for a role
const sidebarClasses = buildSidebarClasses('admin');
/*
  Returns:
  {
    sidebar: "border-blue-800 bg-blue-900 text-white",
    header: "border-blue-800",
    menuItemActive: "bg-blue-700 text-white",
    menuItemInactive: "text-blue-100 hover:bg-blue-800 hover:text-white",
    footer: "border-blue-800 hover:bg-blue-800",
    trigger: "text-blue-900 hover:bg-blue-50 hover:text-blue-700"
  }
*/

// ============================================
// STATUS COLORS (Universal across all roles)
// ============================================

// Success (Green)
const successBadge = `${commonColors.status.success.bg} ${commonColors.status.success.text}`;
// Example: bg-green-100 text-green-800

// Error (Red)
const errorAlert = `${commonColors.status.error.bg} ${commonColors.status.error.border} border ${commonColors.status.error.text}`;
// Example: bg-red-100 border-red-400 border text-red-700

// Warning (Yellow)
const warningBanner = `${commonColors.status.warning.bg} ${commonColors.status.warning.text}`;
// Example: bg-yellow-100 text-yellow-800

// Info (Blue)
const infoMessage = `${commonColors.status.info.bg} ${commonColors.status.info.text}`;
// Example: bg-blue-100 text-blue-800

// ============================================
// TABLE STYLING
// ============================================

const TableExample = () => (
  <table className="w-full">
    {/* Header */}
    <thead className={`${tableTheme.header.bg} ${tableTheme.header.border} border-b`}>
      <tr>
        <th className={`px-4 py-3 text-left text-xs font-semibold ${tableTheme.header.text} uppercase`}>
          Column Header
        </th>
      </tr>
    </thead>
    
    {/* Body */}
    <tbody>
      <tr className={`${tableTheme.row.hover} ${tableTheme.row.border} border-b cursor-pointer`}>
        <td className={`px-4 py-4 text-sm ${tableTheme.cell.text}`}>
          Cell Content
        </td>
      </tr>
    </tbody>
  </table>
);

// ============================================
// CARD STYLING
// ============================================

const CardExample = () => (
  <div className={cardTheme.base}>
    <h3 className={`text-lg font-semibold ${cardTheme.header}`}>
      Card Title
    </h3>
    <p className={`text-sm ${cardTheme.description}`}>
      Card description text
    </p>
  </div>
);

// ============================================
// BADGES
// ============================================

const BadgeExamples = () => (
  <>
    {/* Accepted/Completed badge */}
    <Badge className={`${commonColors.status.success.bg} ${commonColors.status.success.text} ${commonColors.status.success.hover}`}>
      Completed
    </Badge>
    
    {/* Rejected badge */}
    <Badge className={`${commonColors.status.error.bg} ${commonColors.status.error.text} ${commonColors.status.error.hover}`}>
      Rejected
    </Badge>
    
    {/* Pending badge */}
    <Badge className={`${commonColors.status.warning.bg} ${commonColors.status.warning.text} ${commonColors.status.warning.hover}`}>
      Pending
    </Badge>
    
    {/* Neutral badge */}
    <Badge className={`${commonColors.slate[100]} ${commonColors.slate[700]} hover:bg-slate-100`}>
      Unassigned
    </Badge>
  </>
);

// ============================================
// SIDEBAR NAVIGATION
// ============================================

const SidebarExample = ({ role = 'admin' }) => {
  const classes = buildSidebarClasses(role);
  const isActive = true; // Example state
  
  return (
    <Sidebar className={`border-r ${classes.sidebar}`}>
      {/* Header */}
      <SidebarHeader className={`flex h-16 items-center border-b ${classes.header} px-6`}>
        <span className="text-lg font-bold tracking-wide">
          Dashboard
        </span>
      </SidebarHeader>
      
      {/* Menu Item */}
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isActive}
          className={`mb-1 h-10 w-full rounded-md px-3 transition-colors ${
            isActive ? classes.menuItemActive : classes.menuItemInactive
          }`}
        >
          Menu Item
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {/* Footer */}
      <SidebarFooter className={`border-t ${classes.header} p-4`}>
        <div className={`flex items-center gap-2 rounded-md p-2 ${classes.footer}`}>
          Footer Content
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

// ============================================
// CSS VARIABLE USAGE
// ============================================

// You can also use CSS variables directly in your components
const CSSVariableExample = () => (
  <div style={{
    backgroundColor: 'rgb(var(--primary))',
    color: 'rgb(var(--primary-foreground))'
  }}>
    Using CSS Variables
  </div>
);

// Or with Tailwind classes
const TailwindCSSVarExample = () => (
  <div className="bg-primary text-primary-foreground">
    Using Tailwind with CSS Variables
  </div>
);

// ============================================
// RESPONSIVE TEXT COLORS
// ============================================

const TextColorExamples = () => (
  <>
    <h1 className="text-slate-900">Primary Heading</h1>
    <h2 className="text-slate-800">Secondary Heading</h2>
    <p className="text-slate-700">Body Text</p>
    <small className="text-slate-600">Muted Text</small>
    <span className="text-slate-500">Very Muted</span>
  </>
);

// ============================================
// ONLINE/OFFLINE INDICATORS
// ============================================

const StatusIndicator = ({ online = true }) => (
  <div className="flex items-center gap-2">
    <span className={`h-2 w-2 rounded-full ${online ? commonColors.status.success.indicator : commonColors.status.error.indicator}`}></span>
    <span className="text-sm font-medium text-slate-600">
      {online ? 'Online' : 'Offline'}
    </span>
  </div>
);

export {
  TableExample,
  CardExample,
  BadgeExamples,
  SidebarExample,
  StatusIndicator,
  TextColorExamples
};
