import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Bell, 
  Check, 
  ArrowUpRight, 
  Briefcase, 
  ShieldCheck,
  Building2,
  CreditCard,
  Send,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, FinancialData, InboxAlertItem } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDZD } from '../services/apiService';

interface FinancialDashboardProps {
  financials: FinancialData;
  inbox: InboxAlertItem[];
  language: AppLanguage;
  onToggleInboxRead: (id: string) => void;
  onAddEventClick: () => void;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  financials,
  inbox,
  language,
  onToggleInboxRead,
  onAddEventClick
}) => {
  const t = TRANSLATIONS[language];
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'taxes' | 'cashflow'>('overview');
  const unreadCount = inbox.filter(m => m.unread).length;

  return (
    <motion.div 
      id="screen-financial-dashboard"
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-24"
    >
      {/* Subheader with Category Pill Tabs */}
      <div 
        id="financial-subheader"
        className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/70 pb-4"
      >
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {t.financials.title}
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {t.financials.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'overview'
                ? "bg-[#14151b] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            {language === 'ar' ? 'نظرة عامة والسيولة' : 'Trésorerie & Synthèse'}
          </button>
          <button
            onClick={() => setActiveSubTab('taxes')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'taxes'
                ? "bg-[#14151b] text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
            }`}
          >
            {language === 'ar' ? 'الجبائية (G50 & CNAS)' : 'Fiscalité G50 & CNAS'}
          </button>
          <button
            onClick={onAddEventClick}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#e4fc65] text-slate-950 hover:bg-[#d6f04d] border border-lime-300 flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Plus size={13} />
            <span>{t.financials.addEvent}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div id="financial-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Monthly Revenue (Lime Card) */}
        <div 
          id="fin-kpi-monthly-revenue"
          className="bg-[#e4fc65] p-5 rounded-3xl border border-lime-300 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {t.financials.monthlyRevenue}
            </span>
            <div className="w-6 h-6 rounded-lg bg-black/10 text-slate-950 flex items-center justify-center">
              <TrendingUp size={13} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
              {formatDZD(financials.metrics.monthly_revenue.amountDZD, language)}
            </h3>
            <span className="text-xs font-bold text-slate-800 mt-0.5 inline-block">
              {financials.metrics.monthly_revenue.subtitle}
            </span>
          </div>
        </div>

        {/* Net Profit Margin */}
        <div 
          id="fin-kpi-net-profit"
          className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.financials.netProfit}
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={13} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatDZD(financials.metrics.net_margin.amountDZD, language)}
            </h3>
            <span className="text-xs font-bold text-emerald-600 mt-0.5 inline-block">
              Marge nette : {financials.metrics.net_margin.percentage}
            </span>
          </div>
        </div>

        {/* Bank Balance (CIB) */}
        <div 
          id="fin-kpi-cib-bank"
          className="bg-white p-5 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.financials.bankCash}
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 size={13} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatDZD(financials.metrics.cash_in_bank_dzd, language)}
            </h3>
            <span className="text-xs font-semibold text-slate-500 mt-0.5 inline-block">
              Comptes BNA & CIB Entreprise
            </span>
          </div>
        </div>

        {/* BaridiMob / CCP Wallet (Peach Card) */}
        <div 
          id="fin-kpi-baridimob"
          className="bg-[#fed6c6] p-5 rounded-3xl border border-[#fbc4b0] shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {t.financials.baridiMob}
            </span>
            <div className="w-6 h-6 rounded-lg bg-black/10 text-slate-900 flex items-center justify-center">
              <CreditCard size={13} />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-950 tracking-tight">
              {formatDZD(financials.metrics.baridimob_balance_dzd, language)}
            </h3>
            <span className="text-xs font-bold text-slate-800 mt-0.5 inline-block">
              Encaissements instantanés clients
            </span>
          </div>
        </div>

      </div>

      {/* Main Content: Scheduled Events (Left) & Broker/Banking Notifications (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Scheduled Financial Operations (2/3 width) */}
        <div 
          id="fin-section-scheduled-events"
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t.financials.scheduledEvents}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Virements de salaires, déclarations fiscales G50, cotisations CNAS et créances
              </p>
            </div>
            <button 
              onClick={onAddEventClick}
              className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> {t.financials.addEvent}
            </button>
          </div>

          <div className="space-y-3">
            {financials.events.map((ev) => (
              <div 
                key={ev.id}
                id={`event-item-${ev.id}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-xs flex flex-col items-center justify-center leading-tight shrink-0 shadow-2xs font-mono">
                    <span className="text-[10px] text-slate-400">{ev.date_badge.split(' ')[1]}</span>
                    <span>{ev.date_badge.split(' ')[0]}</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">
                      {ev.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                      {ev.desc}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {ev.amountDZD && (
                    <span className="font-mono font-black text-xs text-slate-950 block">
                      {formatDZD(ev.amountDZD, language)}
                    </span>
                  )}
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 ${ev.badge}`}>
                    {ev.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Banking & System Notifications Inbox (1/3 width) */}
        <div 
          id="fin-section-inbox"
          className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Bell size={14} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.financials.brokerInbox}
                </h3>
              </div>

              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-[#ff6838] text-white px-2 py-0.5 rounded-full">
                  {unreadCount} {language === 'ar' ? 'جديد' : 'nouveaux'}
                </span>
              )}
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {inbox.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onToggleInboxRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.unread 
                      ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50' 
                      : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className={`text-xs font-bold leading-tight ${item.unread ? 'text-slate-950' : 'text-slate-700'}`}>
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">{item.time}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/40">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${item.unread ? 'text-amber-700' : 'text-slate-400'}`}>
                      {item.unread ? (language === 'ar' ? 'غير مقروء' : 'Non lu') : (language === 'ar' ? 'مقروء ✓' : 'Lu ✓')}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold hover:underline">
                      {language === 'ar' ? 'التفاصيل ←' : 'Détails →'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => inbox.forEach(i => onToggleInboxRead(i.id))}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {t.financials.markAllRead}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};
