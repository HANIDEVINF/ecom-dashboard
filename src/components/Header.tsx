import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Bell, 
  Code2, 
  AlertTriangle, 
  Globe, 
  ChevronDown,
  Building2,
  MapPin
} from 'lucide-react';
import { AppLanguage, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface HeaderProps {
  settings: BusinessSettings;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onQuickAdd: (type: 'worker' | 'product' | 'client' | 'task') => void;
  onToggleInspector: () => void;
  isInspectorOpen: boolean;
  activeAlarmsCount: number;
  onViewAlarmsClick: () => void;
  unreadAlertsCount: number;
  onNotificationsClick: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  language,
  onLanguageChange,
  onQuickAdd,
  onToggleInspector,
  isInspectorOpen,
  activeAlarmsCount,
  onViewAlarmsClick,
  unreadAlertsCount,
  onNotificationsClick,
  searchQuery,
  onSearchChange
}) => {
  const t = TRANSLATIONS[language];
  const isRtl = language === 'ar';
  const [timeStr, setTimeStr] = useState("10:37");
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      id="main-app-header"
      className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6"
    >
      {/* Company Title & Greeting */}
      <div id="header-greeting-block" className="space-y-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>{settings.companyName}</span>
            <span className="text-xl">🇩🇿</span>
          </h1>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-[#e4fc65] uppercase">
            {settings.legalForm}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-slate-700 font-semibold">
            <MapPin size={12} className="text-emerald-600" />
            {settings.wilaya}
          </span>
          <span className="text-slate-300">•</span>
          <span>{t.header.gladToSee}</span>
        </p>
      </div>

      {/* Action Pills & Controls */}
      <div id="header-actions-bar" className="flex flex-wrap items-center gap-2 text-xs font-medium">
        
        {/* 1. Language Switcher (FR | EN | AR) */}
        <div 
          id="header-language-switcher"
          className="flex items-center bg-white border border-slate-200/80 rounded-full p-1 shadow-2xs text-xs font-bold"
        >
          <Globe size={13} className="text-slate-400 mx-1.5" />
          {(['fr', 'en', 'ar'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2.5 py-1 rounded-full uppercase transition-all text-[11px] ${
                language === lang
                  ? 'bg-[#14151b] text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {lang === 'ar' ? 'العربية' : lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* 2. Critical Stock Alarm Pill (if active alarms > 0) */}
        {activeAlarmsCount > 0 && (
          <button
            id="btn-header-stock-alarm-ticker"
            onClick={onViewAlarmsClick}
            className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold flex items-center gap-1.5 shadow-2xs animate-pulse hover:bg-rose-100 transition-all cursor-pointer"
            title="Consulter les articles sous le seuil d'alarme"
          >
            <AlertTriangle size={13} className="text-rose-600" />
            <span>{activeAlarmsCount} {language === 'ar' ? 'تنبيه مخزون حرج' : language === 'en' ? 'Stock Alarms' : 'Alertes Stock'}</span>
          </button>
        )}

        {/* 3. Quick Action Dropdown (+ Ajouter) */}
        <div className="relative">
          <button
            id="btn-header-quick-add"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-3.5 py-1.5 bg-slate-900 text-[#e4fc65] rounded-full shadow-xs hover:bg-black active:scale-95 flex items-center gap-1.5 transition-all font-bold cursor-pointer"
          >
            <Plus size={13} />
            <span>{language === 'ar' ? 'إضافة +' : language === 'en' ? 'Add +' : 'Ajouter +'}</span>
            <ChevronDown size={12} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
          </button>

          {showAddMenu && (
            <div 
              className={`absolute top-full mt-1.5 ${isRtl ? 'left-0' : 'right-0'} w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-1 z-50 animate-in fade-in zoom-in-95`}
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <button
                onClick={() => { onQuickAdd('worker'); setShowAddMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2"
              >
                <span>👤</span>
                <span>{language === 'ar' ? 'موظف جديد' : language === 'en' ? 'New Worker' : 'Nouvel Employé'}</span>
              </button>
              <button
                onClick={() => { onQuickAdd('product'); setShowAddMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2"
              >
                <span>📦</span>
                <span>{language === 'ar' ? 'سلعة / منتج جديد' : language === 'en' ? 'New Product' : 'Nouveau Produit'}</span>
              </button>
              <button
                onClick={() => { onQuickAdd('client'); setShowAddMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2"
              >
                <span>🏢</span>
                <span>{language === 'ar' ? 'عميل جديد' : language === 'en' ? 'New Client' : 'Nouveau Client'}</span>
              </button>
              <button
                onClick={() => { onQuickAdd('task'); setShowAddMenu(false); }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2 border-t border-slate-100"
              >
                <span>📝</span>
                <span>{language === 'ar' ? 'عملية / مهمة' : language === 'en' ? 'Task / Order' : 'Tâche / Commande'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Search input */}
        <div id="header-search-container" className="relative">
          <Search size={13} className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-2.5 text-slate-400 pointer-events-none`} />
          <input
            id="input-header-search"
            type="text"
            placeholder={t.header.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`${isRtl ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-1.5 bg-white border border-slate-200/80 rounded-full shadow-2xs w-36 sm:w-48 focus:w-56 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-xs placeholder:text-slate-400 text-slate-800`}
          />
        </div>

        {/* 5. Notification Bell with Unread Badge */}
        <button
          id="btn-header-notifications"
          onClick={onNotificationsClick}
          title="Notifications & Alertes"
          className="relative p-2 bg-white border border-slate-200/80 rounded-full shadow-2xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
        >
          <Bell size={14} />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ff6838] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* 6. Clock Pill (Algerian Time) */}
        <div 
          id="chip-header-clock"
          className="px-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-2xs text-slate-700 font-bold hidden sm:flex items-center gap-1.5 font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{timeStr}</span>
        </div>

        {/* 7. Inspector Button */}
        <button
          id="btn-header-inspect"
          onClick={onToggleInspector}
          className={`px-3.5 py-1.5 rounded-full shadow-2xs flex items-center gap-1.5 transition-all font-bold cursor-pointer ${
            isInspectorOpen
              ? "bg-[#14151b] text-[#e4fc65] border border-slate-900"
              : "bg-[#e4fc65] text-slate-900 hover:bg-[#d6f04d] border border-lime-300"
          }`}
          title="Inspecter MongoDB et Collections"
        >
          <Code2 size={13} className="text-slate-900" />
          <span>MongoDB</span>
          <span className="hidden md:inline text-[9px] px-1.5 py-0.2 bg-black/10 rounded-sm font-mono uppercase">
            Ctrl+I
          </span>
        </button>

      </div>
    </header>
  );
};
