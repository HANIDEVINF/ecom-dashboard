import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Play, 
  Square, 
  Phone, 
  MapPin,
  FileText,
  BadgeCheck,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLanguage, Worker } from '../types';
import { TRANSLATIONS } from '../i18n/translations';
import { formatDZD } from '../services/apiService';

interface WorkersViewProps {
  workers: Worker[];
  language: AppLanguage;
  onClockToggle: (workerId: string) => void;
  onPaySalary: (workerId: string) => void;
  onAddWorkerClick: () => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  language,
  onClockToggle,
  onPaySalary,
  onAddWorkerClick
}) => {
  const t = TRANSLATIONS[language];
  const [filter, setFilter] = useState<'all' | 'working' | 'pending'>('all');
  const [search, setSearch] = useState('');

  const activeWorkers = workers.filter(w => w.status === 'working');
  const totalPayrollDZD = workers.reduce((acc, w) => acc + w.monthlySalaryDZD, 0);
  const pendingCount = workers.filter(w => w.paymentStatus !== 'paid').length;

  const filteredWorkers = workers.filter(w => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'working' ? w.status === 'working' :
      w.paymentStatus !== 'paid';
    
    const matchesSearch = 
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase()) ||
      w.wilaya.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      id="screen-workers-management"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 pb-20"
    >
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users size={22} className="text-slate-900" />
            <span>{t.workers.title}</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {t.workers.subtitle}
          </p>
        </div>

        <button
          id="btn-add-worker-page"
          onClick={onAddWorkerClick}
          className="px-4 py-2 bg-slate-900 hover:bg-black text-[#e4fc65] rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>{t.workers.addWorker}</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Active Workers Currently Clocked-in (Lime Card) */}
        <div 
          id="card-active-workers-kpi"
          className="bg-[#e4fc65] p-5 rounded-3xl border border-lime-300/60 shadow-xs flex flex-col justify-between h-36 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.workers.activeNow}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 animate-ping"></span>
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-950 tracking-tight">
              {activeWorkers.length} <span className="text-sm font-bold text-slate-800">/ {workers.length} {language === 'ar' ? 'موظف' : 'employés'}</span>
            </div>
            <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
              {language === 'ar' ? 'يسجلون حضورهم الآن في أماكن العمل' : 'Pointages en cours sur les sites'}
            </p>
          </div>
        </div>

        {/* 2. Total Monthly Payroll (Peach Card) */}
        <div 
          id="card-payroll-budget-kpi"
          className="bg-[#fed6c6] p-5 rounded-3xl border border-[#fbc4b0] shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t.workers.totalPayroll}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 flex items-center justify-center text-slate-900">
              <DollarSign size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {formatDZD(totalPayrollDZD, language)}
            </div>
            <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
              {language === 'ar' ? 'المجموع الشهري لجميع العمال' : 'Masse salariale nette globale'}
            </p>
          </div>
        </div>

        {/* 3. Pending Payments */}
        <div 
          id="card-pending-payments-kpi"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.workers.pendingPayments}
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {pendingCount} <span className="text-xs font-semibold text-slate-500">{language === 'ar' ? 'رواتب للتسوية' : 'à régler'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              {language === 'ar' ? 'جاهزة للصرف والتحويل البنكي' : 'Prêts pour virement ou espèces'}
            </p>
          </div>
        </div>

        {/* 4. Next Payment Due Date */}
        <div 
          id="card-due-date-kpi"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.workers.nextPayDate}
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={15} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              30 / 09 / 2026
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
              <BadgeCheck size={13} />
              <span>{language === 'ar' ? 'نهاية الشهر المعتمدة' : 'Fin de mois standard'}</span>
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'all' ? 'bg-[#14151b] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'جميع العمال' : 'Tous'} ({workers.length})
          </button>
          <button
            onClick={() => setFilter('working')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'working' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
            <span>{language === 'ar' ? 'يعملون الآن' : 'En poste'} ({activeWorkers.length})</span>
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {language === 'ar' ? 'رواتب معلقة' : 'Salaires en attente'} ({pendingCount})
          </button>
        </div>

        <div className="relative">
          <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن عامل أو ولاية...' : 'Filtrer par nom, poste...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
          />
        </div>
      </div>

      {/* Workers Comprehensive Table */}
      <div 
        id="table-workers-container"
        className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs overflow-x-auto"
      >
        <table className="w-full text-left text-xs min-w-[760px]">
          <thead>
            <tr className="text-slate-400 font-bold border-b border-slate-100 uppercase text-[10px] tracking-wider">
              <th className="pb-3 px-2">{t.workers.workerName}</th>
              <th className="pb-3 px-2">{t.workers.status}</th>
              <th className="pb-3 px-2">{t.workers.hoursWorked}</th>
              <th className="pb-3 px-2">{t.workers.salary}</th>
              <th className="pb-3 px-2">{t.workers.dueDate}</th>
              <th className="pb-3 px-2">{t.workers.payStatus}</th>
              <th className="pb-3 px-2 text-right">{t.workers.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredWorkers.map((worker) => {
              const isWorking = worker.status === 'working';
              const isPaid = worker.paymentStatus === 'paid';

              return (
                <tr 
                  key={worker.id}
                  id={`worker-row-${worker.id}`}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {/* Name & Position */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                        {worker.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">
                          {worker.name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                          <span>{worker.role}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <MapPin size={9} /> {worker.wilaya}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Attendance Pointage Status */}
                  <td className="py-3.5 px-2">
                    {isWorking ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>{t.workers.working}</span>
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono">
                          {t.workers.shiftStartedAt} {worker.clockInTime}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold">
                        <span>{t.workers.offShift}</span>
                      </span>
                    )}
                  </td>

                  {/* Cumulative Hours */}
                  <td className="py-3.5 px-2">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      <span className="font-bold text-slate-900 font-mono text-xs">
                        {worker.hoursWorkedThisMonth} hrs
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {worker.hourlyRateDZD} DA / h
                    </span>
                  </td>

                  {/* Salary in DZD */}
                  <td className="py-3.5 px-2">
                    <span className="font-black text-slate-950 font-mono text-xs">
                      {formatDZD(worker.monthlySalaryDZD, language)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5 uppercase">
                      {worker.payFrequency}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-2 text-slate-600 font-semibold font-mono text-xs">
                    {worker.paymentDueDate}
                  </td>

                  {/* Payment Status */}
                  <td className="py-3.5 px-2">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                        <CheckCircle2 size={12} />
                        <span>{t.workers.paid}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                        <Clock size={11} />
                        <span>{t.workers.pending}</span>
                      </span>
                    )}
                  </td>

                  {/* Actions: Clock-In/Out & Pay */}
                  <td className="py-3.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Clock button */}
                      <button
                        onClick={() => onClockToggle(worker.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isWorking
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                        }`}
                        title={isWorking ? t.workers.clockOut : t.workers.clockIn}
                      >
                        {isWorking ? <Square size={10} /> : <Play size={10} />}
                        <span>{isWorking ? t.workers.clockOut : t.workers.clockIn}</span>
                      </button>

                      {/* Pay Salary Button */}
                      {!isPaid && (
                        <button
                          onClick={() => {
                            if (window.confirm(`${t.workers.confirmPayMsg} ${worker.name} (${formatDZD(worker.monthlySalaryDZD, language)}) ?`)) {
                              onPaySalary(worker.id);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#e4fc65] hover:bg-[#d6f04d] text-slate-950 rounded-xl text-[11px] font-bold border border-lime-300 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <DollarSign size={11} />
                          <span>{t.workers.recordPayment}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
