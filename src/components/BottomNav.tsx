import React from 'react';
import { DashboardTab } from '../types';

interface BottomNavProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: DashboardTab[] = ["Dashboard", "Dashboard 1", "Dashboard 2"];

  return (
    <footer 
      id="bottom-floating-pill-nav"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-[#14151b] p-1.5 rounded-full shadow-2xl flex items-center gap-1.5 z-40 border border-white/10 backdrop-blur-md transition-all"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            id={`btn-bottom-tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => onSelectTab(tab)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              isActive 
                ? "bg-white text-slate-950 shadow-md scale-102" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </footer>
  );
};
