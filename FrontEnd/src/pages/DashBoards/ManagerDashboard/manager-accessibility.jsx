import { Eye, Moon, Sun } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setThemeMode } from '@/store/themeSlice';

export const ManagerAccessibility = () => {
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Accessibility</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
          Manage display preferences for the manager dashboard.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <Eye className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dark Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">
                Switch the manager workspace between light and dark themes.
              </p>
            </div>
          </div>

          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => dispatch(setThemeMode('light'))}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                mode === 'light'
                  ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button
              type="button"
              onClick={() => dispatch(setThemeMode('dark'))}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                mode === 'dark'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-slate-950'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              <Moon className="h-3.5 w-3.5" /> Dark
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
