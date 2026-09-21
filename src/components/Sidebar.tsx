import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Briefcase, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Settings, 
  Code2,
  AlertTriangle,
  ShoppingCart,
  FileText,
  Receipt
} from 'lucide-react';
import { AppLanguage, NavigationPage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface SidebarProps {
  activePage: NavigationPage;
  onSelectPage: (page: NavigationPage) => void;
  onToggleInspector: () => void;
  isInspectorOpen: boolean;
  activeWorkersCount: number;
  activeAlarmsCount: number;
  pendingInvoicesCount?: number;
  language: AppLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onSelectPage,
  onToggleInspector,
  isInspectorOpen,
  activeWorkersCount,
  activeAlarmsCount,
  pendingInvoicesCount = 0,
  language
}) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';

  const navItems: Array<{
    id: NavigationPage;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: t.nav.overview,
      icon: <LayoutDashboard size={19} />
    },
    {
      id: 'pos',
      label: t.nav.pos,
      icon: <ShoppingCart size={19} />
    },
    {
      id: 'invoices',
      label: t.nav.invoices,
      icon: <FileText size={19} />,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold'
    },
    {
      id: 'inventory',
      label: t.nav.inventory,
      icon: <Package size={19} />,
      badge: activeAlarmsCount > 0 ? activeAlarmsCount : undefined,
      badgeColor: 'bg-rose-500 text-white font-extrabold animate-pulse'
    },
    {
      id: 'workers',
      label: t.nav.workers,
      icon: <Users size={19} />,
      badge: activeWorkersCount > 0 ? activeWorkersCount : undefined,
      badgeColor: 'bg-emerald-500 text-slate-950 font-bold'
    },
    {
      id: 'expenses',
      label: t.nav.expenses,
      icon: <Receipt size={19} />
    },
    {
      id: 'clients',
      label: t.nav.clients,
      icon: <Briefcase size={19} />
    },
    {
      id: 'schedule',
      label: t.nav.schedule,
      icon: <CalendarIcon size={19} />
    },
    {
      id: 'financials',
      label: t.nav.financials,
      icon: <DollarSign size={19} />
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: <Settings size={19} />
    }
  ];

  return (
    <aside 
      id="main-sidebar"
      className={`w-18 my-4 ${isRtl ? 'mr-4 ml-2' : 'ml-4 mr-2'} bg-[#14151b] rounded-3xl flex flex-col items-center justify-between py-6 shadow-2xl text-slate-400 shrink-0 z-30 transition-all duration-300 select-none border border-white/5`}
    >
      {/* Top Logo / Algerian Flag colors accent */}
      <div className="flex flex-col items-center gap-6">
        <button 
          id="btn-brand-logo"
          title="Dashboards V2 - Algérie"
          onClick={() => onSelectPage('overview')}
          className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 group relative shadow-md"
        >
          {/* Subtle Algeria Green/Red/White motif */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#e4fc65] rounded-full group-hover:scale-125 transition-transform"></span>
            <span className="w-2 h-2 bg-[#ff6838] rounded-full group-hover:scale-125 transition-transform"></span>
          </div>
          {activeAlarmsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#14151b] animate-ping"></span>
          )}
        </button>

        {/* Primary Navigation Icons */}
        <nav id="nav-primary-menu" className="flex flex-col gap-3 mt-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => onSelectPage(item.id)}
                title={item.label}
                className={`relative p-3 rounded-2xl transition-all duration-200 group flex items-center justify-center ${
                  isActive 
                    ? "bg-white text-slate-950 shadow-md shadow-white/10 scale-105" 
                    : "hover:bg-white/10 hover:text-white text-slate-400"
                }`}
              >
                {item.icon}

                {/* Active Indicator Bar */}
                {isActive && (
                  <span 
                    className={`absolute ${isRtl ? 'right-0 -mr-1' : 'left-0 -ml-1'} top-1/2 -translate-y-1/2 w-1.5 h-4 bg-[#e4fc65] rounded-full`}
                  ></span>
                )}

                {/* Numerical Badge for Worker count or Stock alarm */}
                {item.badge !== undefined && (
                  <span 
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center shadow-xs ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* MongoDB Inspector Trigger */}
          <div className="w-8 h-px bg-white/10 my-1 mx-auto"></div>

          <button 
            id="nav-btn-inspector"
            onClick={onToggleInspector} 
            title={t.inspector.title}
            className={`p-3 rounded-2xl transition-all ${
              isInspectorOpen 
                ? "bg-[#e4fc65] text-slate-900 shadow-md" 
                : "text-slate-400 hover:bg-white/10 hover:text-[#e4fc65]"
            }`}
          >
            <Code2 size={19} />
          </button>
        </nav>
      </div>

      {/* User Avatar with Algerian Wilaya indicator */}
      <div 
        id="sidebar-user-avatar"
        onClick={() => onSelectPage('settings')}
        className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e4fc65] via-emerald-500 to-[#ff6838] p-0.5 cursor-pointer shadow-lg hover:scale-105 transition-transform relative group"
        title="Directeur Général • Alger 16"
      >
        <div className="w-full h-full bg-[#14151b] rounded-full flex items-center justify-center text-white text-xs font-bold font-mono">
          DZ
        </div>
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-[#14151b]"></span>
      </div>
    </aside>
  );
};
