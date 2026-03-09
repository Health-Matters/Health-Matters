// export const EmployeeSettings = () => {
//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1>Settings</h1>
//       <p className="mt-4 text-sm text-gray-600">
//         Employee-specific settings and preferences will be managed here.
//       </p>
//     </div>
//   );
// };

import React, { useState } from "react";
import { 
  Moon, 
  Sun, 
  Type, 
  Eye, 
  Save,
  Monitor
} from "lucide-react";

export const Accessibility = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(14);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Accessibility</h1>
        <p className="mt-2 text-sm text-gray-600">
          Customize your display preferences and accessibility options.
        </p>
      </div>

      <div className="grid gap-6">
        
        {/* 1. Theme / Dark Mode */}
        <section className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                {darkMode ? <Moon size={22} /> : <Sun size={22} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Display Mode</h3>
                <p className="text-xs text-slate-500">Switch between light and dark themes.</p>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setDarkMode(false)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${!darkMode ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setDarkMode(true)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${darkMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Dark
              </button>
            </div>
          </div>
        </section>

        {/* 2. High Contrast Mode */}
        <section className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <Eye size={22} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">High Contrast</h3>
                <p className="text-xs text-slate-500">Increase visibility of text and buttons.</p>
              </div>
            </div>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className={`w-12 h-6 rounded-full transition-colors relative ${highContrast ? 'bg-emerald-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${highContrast ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* 3. Font Size Scaling */}
        <section className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
          <div className="flex gap-4 mb-6">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Type size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Font Size Scaling</h3>
              <p className="text-xs text-slate-500">Adjust the interface text size for better readability.</p>
            </div>
          </div>
          
          <div className="px-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
              <span>Small</span>
              <span>Default ({fontSize}px)</span>
              <span>Large</span>
            </div>
            <input 
              type="range" 
              min="12" 
              max="20" 
              step="2"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Monitor size={14} /> Changes will be applied to this browser session.
          </p>
          <button className="flex items-center gap-2 px-8 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800 shadow-lg shadow-emerald-100 transition-all active:scale-95">
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};