# Adding a New Frontend Feature

This document explains how to add a new feature page in the frontend, following the same pattern used for the manager profile page.

## 1. Create the Component

1. **Location**: Put it in the appropriate dashboard folder under `src/pages/DashBoards/...`. For example, to add a "Settings" page for managers, create a new file:
   ```
   src/pages/DashBoards/ManagerDashboard/manager-settings.jsx
   ```
2. **Component Structure**: Export a React functional component. Use the same styling as other test pages:
   ```jsx
   export const ManagerSettings = () => {
     return (
       <div className="p-8 max-w-4xl mx-auto">
         <h1 className="text-2xl font-bold mb-4">Manager Settings</h1>
         <div className="bg-white shadow rounded-lg p-6 space-y-4">
           {/* add fields or controls here */}
         </div>
       </div>
     );
   };
   ```
3. Add static placeholders or fetch data from the Redux store or API as needed.

## 2. Import the Component in `main.jsx`

In `src/main.jsx`, add an import near the other manager imports:
```js
import { ManagerSettings } from "./pages/DashBoards/ManagerDashboard/manager-settings.jsx";
```

## 3. Update Routes

Still in `main.jsx`, look for the manager dashboard routes section. Add a new `<Route>` for the new page:
```jsx
<Route path="/manager/dashboard" element={<ManagerDashboardLayout />}>
  <Route index element={<ManagerOverview />} />
  <Route path="team" element={<ManagerTestTeam />} />
  <Route path="insights" element={<ManagerTestInsights />} />
  <Route path="budget" element={<ManagerTestBudget />} />
  <Route path="profile" element={<ManagerTestProfile />} />
  <Route path="settings" element={<ManagerSettings />} />    // new route
</Route>
```

If you add a component for another role (employee, practitioner, etc.), follow the same steps in their respective sections.

## 4. Update Sidebar or Navigation (if necessary)

Edit `src/components/Sidebar.jsx` or wherever navigation links live. Add a link pointing to the new path:
```jsx
<Link to="/manager/dashboard/settings" className="...">
  Settings
</Link>
```

Keep the sidebar layout untouched; just append link items to the appropriate section.

## 5. (Optional) Remove Duplicate Stubs

Some dashboard pages include placeholder components later in `manager-dashboard-pages.jsx`. If you create a dedicated file, you may want to remove or rename the corresponding stub there to avoid confusion.

## 6. Test

- Run the dev server (`npm run dev` in `FrontEnd` folder).
- Navigate to `http://localhost:PORT/manager/dashboard/settings` and verify the new component renders.
- Check navigation links and verify routing works via the browser or using CLI.

## 7. Extra considerations

- Use consistent naming conventions: `ManagerTestX` for test components, plain `ManagerX` for real features.
- If the component needs API data, connect it to Redux or make direct fetch calls.

---

This pattern applies to any role/dashboard combination. Create the component file, import it, adjust routes, and add navigation links. The profile page added earlier followed these steps.