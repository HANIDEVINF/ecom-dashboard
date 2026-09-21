import React, { useState } from 'react';
import { 
  Clock, 
  Folder, 
  Plus, 
  TrendingUp, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  Users,
  Package,
  AlertTriangle,
  MapPin,
  Building2,
  DollarSign,
  ShoppingCart,
  FileText,
  Receipt,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, BentoDashboardData, LastNoteItem, NavigationPage } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDZD } from '../services/apiService';

interface BentoDashboardProps {
  data: BentoDashboardData;
  language: AppLanguage;
  onOpenAddWidget: () => void;
  onSelectNote?: (note: LastNoteItem) => void;
  onNavigate: (page: NavigationPage) => void;
  activeWorkersCount: number;
  activeAlarmsCount: number;
}

export const BentoDashboard: React.FC<BentoDashboardProps> = ({
  data,
  language,
  onOpenAddWidget,
  onSelectNote,
  onNavigate,
  activeWorkersCount,
  activeAlarmsCount
}) => {
  const t = TRANSLATIONS[language];
  const [timeUnit, setTimeUnit] = useState<'hours' | 'minutes'>('hours');
  const [hoveredDay, setHoveredDay] = useState<{ day: string; hours: number; revenueDZD: number; x: number; y: number } | null>(null);
  const [isBlindMode, setIsBlindMode] = useState<boolean>(() => {
    return localStorage.getItem('pos_blind_mode') === 'true';
  });

  const toggleBlindMode = () => {
    setIsBlindMode(prev => {
      const next = !prev;
      localStorage.setItem('pos_blind_mode', String(next));
      return next;
    });
  };

  // SVG Spline Points for Sun - Sat (Algerian business week: Sunday to Thursday, with Saturday half-day)
  const splineMilestones = [
    { day: "Dim", hours: 8, revenueDZD: 720000, cx: 45, cy: 50 },
    { day: "Lun", hours: 9, revenueDZD: 950000, cx: 115, cy: 28 },
    { day: "Mar", hours: 7, revenueDZD: 680000, cx: 185, cy: 65 },
    { day: "Mer", hours: 8.5, revenueDZD: 840000, cx: 255, cy: 38 },
    { day: "Jeu", hours: 8, revenueDZD: 920000, cx: 325, cy: 34 },
    { day: "Ven", hours: 0, revenueDZD: 0, cx: 395, cy: 115 },
    { day: "Sam", hours: 4, revenueDZD: 420000, cx: 465, cy: 85 }
  ];

  return (
    <motion.div 
      id="screen-bento-dashboard"
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-24"
    >
      {/* Algerian Enterprise Live Ticker Banner */}
      <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-slate-800">
        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{data.businessName}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <MapPin size={12} className="text-emerald-400" /> {data.wilaya}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-bold">
          {/* Cashier Blind Mode / Privacy Eye Toggle */}
          <button
            onClick={toggleBlindMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition cursor-pointer text-xs ${
              isBlindMode
                ? 'bg-amber-400 text-slate-950 font-extrabold shadow-xs'
                : 'bg-white/10 hover:bg-white/20 text-slate-200'
            }`}
            title="Masquer le chiffre d'affaires devant les clients (Mode Discret)"
          >
            {isBlindMode ? <EyeOff size={13} /> : <Eye size={13} />}
            <span>{isBlindMode ? 'Chiffres Masqués' : 'Mode Discret'}</span>
          </button>

          {/* Active Workers Widget */}
          <button
            onClick={() => onNavigate('workers')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer text-slate-200"
          >
            <Users size={13} className="text-[#e4fc65]" />
            <span>{activeWorkersCount} {language === 'ar' ? 'عمال في الخدمة' : 'en poste'}</span>
          </button>

          {/* Stock Alarms Widget */}
          <button
            onClick={() => onNavigate('inventory')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition cursor-pointer ${
              activeAlarmsCount > 0 
                ? 'bg-rose-500 text-white font-extrabold animate-pulse' 
                : 'bg-white/10 text-slate-200'
            }`}
          >
            <Package size={13} />
            <span>{activeAlarmsCount} {language === 'ar' ? 'تنبيه مخزون' : 'alertes stock'}</span>
          </button>
        </div>
      </div>

      {/* 1. Top 4 Bento Metric Cards */}
      <div id="bento-top-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Lime Card: Time Tracked by Team */}
        <motion.div 
          id="bento-card-time-tracked"
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('workers')}
          className="bg-[#e4fc65] p-5 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden h-40 border border-lime-300/40 group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
            <div className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center">
              <Clock size={14} className="text-slate-900" />
            </div>
            <span>{t.bento.timeTracked}</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                {timeUnit === 'hours' ? `${data.hours_worked} h` : `${data.hours_worked * 60} m`}
              </h2>
            </div>
            <p className="text-[11px] text-slate-800/80 font-semibold mt-0.5">
              {t.bento.timeTrackedSub}
            </p>
          </div>
          <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-white/40 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform"></div>
        </motion.div>

        {/* Peach Card: Delivered Orders & Projects */}
        <motion.div 
          id="bento-card-projects"
          whileHover={{ y: -3 }}
          onClick={() => onNavigate('clients')}
          className="bg-[#fed6c6] p-5 rounded-3xl flex flex-col justify-between shadow-sm h-40 border border-[#fbc4b0] group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-slate-800 text-xs font-bold">
            <div className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center">
              <Folder size={14} className="text-slate-900" />
            </div>
            <span>{t.bento.projects}</span>
          </div>
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              {data.tasks_completed} {language === 'ar' ? 'طلبية' : 'livraisons'}
            </h2>
            <p className="text-[11px] text-slate-800/80 font-semibold mt-0.5">
              {t.bento.projectsSub}
            </p>
          </div>
          <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-white/30 rounded-full blur-xl pointer-events-none"></div>
        </motion.div>

        {/* Dashed Add Card: Quick Action */}
        <motion.div 
          id="bento-card-add-widget"
          whileHover={{ y: -3, borderColor: '#64748b' }}
          onClick={onOpenAddWidget}
          className="border-2 border-dashed border-slate-300 rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-white/60 hover:bg-white transition-all h-40 shadow-2xs group"
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 group-hover:bg-black transition-all">
            <Plus size={18} />
          </div>
          <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950">{t.bento.addWidgets}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">{t.bento.addWidgetsSub}</span>
        </motion.div>

        {/* Vibrant Orange Gradient Card: Algerian Enterprise Pro */}
        <motion.div 
          id="bento-card-go-premium"
          whileHover={{ y: -3 }}
          className="bg-gradient-to-br from-[#ff6838] via-[#ff5722] to-[#f4511e] p-5 rounded-3xl flex flex-col justify-between text-white shadow-md shadow-orange-500/15 h-40 border border-orange-400/30 relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wide uppercase text-orange-100 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-200" /> {t.bento.goPremium}
              </span>
              {isBlindMode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/30 text-amber-200 flex items-center gap-1">
                  <EyeOff size={10} /> Discret
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-lg mt-1 text-white font-mono">
              {isBlindMode ? '•••••••• DA' : formatDZD(data.total_revenue_dzd, language)}
            </h3>
            <p className="text-[11px] text-orange-100/90 font-medium">
              {language === 'ar' ? 'رقم الأعمال المحقق هذا الشهر' : 'Chiffre d\'affaires mensuel en cours'}
            </p>
          </div>

          <button 
            id="btn-bento-opportunities"
            onClick={() => onNavigate('financials')}
            className="px-4 py-1.5 bg-white text-orange-600 rounded-full text-xs font-bold w-fit hover:bg-orange-50 active:scale-95 transition shadow-xs cursor-pointer"
          >
            {t.nav.financials} →
          </button>
        </motion.div>

      </div>

      {/* Quick Business Operations Strip */}
      <div 
        id="bento-quick-ops-strip"
        className="bg-white rounded-3xl p-4 shadow-2xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-3"
      >
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff6838]"></span>
          <span className="text-xs font-bold text-slate-800">
            {language === 'ar' ? 'عمليات سريعة للمسير :' : language === 'en' ? 'Quick Operations :' : 'Opérations Rapides :'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('pos')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-[#e4fc65] hover:bg-black font-bold flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ShoppingCart size={13} />
            <span>{language === 'ar' ? 'نقطة البيع (POS)' : 'Caisse Express (POS)'}</span>
          </button>

          <button
            onClick={() => onNavigate('invoices')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText size={13} className="text-indigo-600" />
            <span>{language === 'ar' ? 'الفواتير والتسليم' : 'Factures & BL'}</span>
          </button>

          <button
            onClick={() => onNavigate('expenses')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Receipt size={13} className="text-rose-600" />
            <span>{language === 'ar' ? 'تسجيل مصاريف' : 'Saisir Dépense'}</span>
          </button>

          <button
            onClick={() => onNavigate('workers')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Users size={13} className="text-emerald-600" />
            <span>{language === 'ar' ? 'جدول العمال والرواتب' : 'Pointage & Paie'}</span>
          </button>

          <button
            onClick={() => onNavigate('inventory')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Package size={13} className="text-amber-600" />
            <span>{language === 'ar' ? 'تعديل إنذارات المخزون' : 'Seuils d\'alerte stock'}</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Section: Spline Graph & Task Progress Card */}
      <div id="bento-middle-grid" className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Spline Curve Card: Weekly Performance Tracker */}
        <div 
          id="bento-card-spline-tracker"
          className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70 relative flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">{t.bento.trackTimeTitle}</h3>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full">
                  +18.4% vs Août
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{t.bento.trackTimeSub}</p>
            </div>

            {/* Hours / Minutes Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-[11px] font-semibold text-slate-600 self-start sm:self-auto">
              <button
                id="btn-spline-unit-hours"
                onClick={() => setTimeUnit('hours')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeUnit === 'hours' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.bento.hours}
              </button>
              <button
                id="btn-spline-unit-minutes"
                onClick={() => setTimeUnit('minutes')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeUnit === 'minutes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.bento.minutes}
              </button>
            </div>
          </div>

          {/* Curvature SVG Graphic */}
          <div className="h-44 w-full relative flex items-end pt-4">
            <svg 
              id="svg-time-spline"
              viewBox="0 0 500 130" 
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="limeSplineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e4fc65" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#e4fc65" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Background gradient fill below lime line */}
              <path 
                d="M 10 110 Q 45 50, 115 28 T 255 38 T 325 34 T 395 115 T 465 85 L 485 130 L 10 130 Z" 
                fill="url(#limeSplineGrad)" 
              />

              {/* Primary Lime Curve (Tracked Hours / Activity) */}
              <path 
                d="M 10 110 Q 45 50, 115 28 T 185 65 T 255 38 T 325 34 T 395 115 T 465 85" 
                fill="none" 
                stroke="#d6f03d" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />

              {/* Secondary Orange Accent Curve (Sales Target in DA) */}
              <path 
                d="M 10 95 Q 60 45, 120 40 T 260 50 T 330 45 T 400 95 T 465 70" 
                fill="none" 
                stroke="#ff6838" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeDasharray="6 6" 
              />

              {/* Peak Milestone Dots with Tooltips */}
              {splineMilestones.map((m, idx) => (
                <g 
                  key={idx} 
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredDay({ day: m.day, hours: m.hours, revenueDZD: m.revenueDZD, x: m.cx, y: m.cy })}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  <circle 
                    cx={m.cx} 
                    cy={m.cy} 
                    r="8" 
                    fill="#14151b" 
                    className="opacity-0 group-hover:opacity-20 transition-opacity" 
                  />
                  <circle 
                    cx={m.cx} 
                    cy={m.cy} 
                    r="5" 
                    fill="#14151b" 
                    stroke="#ffffff" 
                    strokeWidth="2.5" 
                    className="transition-transform group-hover:scale-125" 
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay with DZD Revenue */}
            {hoveredDay && (
              <div 
                className="absolute bg-[#14151b] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-lg pointer-events-none -translate-x-1/2 -translate-y-10 flex flex-col items-center gap-0.5 z-20 border border-white/10"
                style={{ left: `${(hoveredDay.x / 500) * 100}%`, top: `${(hoveredDay.y / 130) * 100}%` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[#e4fc65]">{hoveredDay.day}:</span>
                  <span>{hoveredDay.hours} h travaillées</span>
                </div>
                {hoveredDay.revenueDZD > 0 && (
                  <span className="text-emerald-400 font-mono">
                    CA: {formatDZD(hoveredDay.revenueDZD, language)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Days Label Axis for Algeria (Dimanche à Samedi) */}
          <div id="spline-weekday-axis" className="flex justify-between text-[11px] text-slate-400 font-bold px-4 mt-4 pt-3 border-t border-slate-100">
            {(language === 'ar' ? ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] : ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]).map((d, i) => (
              <span key={i} className="hover:text-slate-900 transition-colors cursor-default">
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* Right Task Progress Card: Pastel Lime */}
        <div 
          id="bento-card-completed-statistics"
          className="bg-[#e4fc65] rounded-3xl p-6 shadow-xs flex flex-col justify-between border border-lime-300/40 relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-950 font-bold text-sm">
                <div className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center">
                  <TrendingUp size={15} className="text-slate-950" />
                </div>
                <span>{t.bento.completedStats}</span>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-4 my-2">
              {data.monthly_progress.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{item.month}</span>
                    <span className="font-extrabold">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-black/10 h-3 rounded-full overflow-hidden p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.1 }}
                      className="bg-slate-950 h-full rounded-full"
                    />
                  </div>
                  {item.targetAchievedDZD && (
                    <span className="text-[10px] text-slate-800 font-semibold block">
                      {item.targetAchievedDZD}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Link */}
          <button 
            id="btn-view-more-progress"
            onClick={() => onNavigate('financials')}
            className="flex items-center justify-between text-xs font-extrabold text-slate-950 pt-4 border-t border-slate-950/15 hover:opacity-80 active:scale-95 transition-all mt-4 cursor-pointer"
          >
            <span>{t.bento.viewMoreProgress}</span>
            <div className="w-6 h-6 rounded-full bg-slate-950 text-[#e4fc65] flex items-center justify-center">
              <ArrowUpRight size={13} />
            </div>
          </button>
        </div>

      </div>

      {/* 3. Bottom Row: Last Notes / Operations Table */}
      <div 
        id="bento-card-last-notes"
        className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200/70"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">{t.bento.lastNotes}</h3>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {data.last_notes.length} {t.bento.lastNotesCount}
            </span>
          </div>
          <button 
            id="btn-new-note"
            onClick={onOpenAddWidget}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:underline cursor-pointer"
          >
            <Plus size={13} /> {t.bento.addNote}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table id="table-last-notes" className="w-full text-left text-xs min-w-[600px]">
            <thead>
              <tr className="text-slate-400 font-semibold border-b border-slate-100">
                <th className="pb-3 font-semibold">{t.bento.type}</th>
                <th className="pb-3 font-semibold">{t.bento.date}</th>
                <th className="pb-3 font-semibold">{t.bento.status}</th>
                <th className="pb-3 font-semibold">{t.bento.duration}</th>
                <th className="pb-3 font-semibold text-right">{t.bento.action}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.last_notes.map((note) => (
                <tr 
                  key={note.id} 
                  onClick={() => onSelectNote?.(note)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-slate-950 group-hover:scale-125 transition-transform"></span>
                    <span>{note.type}</span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-medium">{note.date}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-slate-900" 
                          style={{ width: `${note.statusPercent}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-900 text-xs">{note.status}</span>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-700 font-bold font-mono">
                    {note.amountDZD ? formatDZD(note.amountDZD, language) : note.duration}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </motion.div>
  );
};
