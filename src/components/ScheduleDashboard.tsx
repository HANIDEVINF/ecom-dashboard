import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  CheckCircle2, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import { ScheduleDay, ScheduleEvent } from '../types';
import { SCHEDULE_DAYS } from '../data/mockData';

interface ScheduleDashboardProps {
  events: ScheduleEvent[];
  onAddScheduleClick: () => void;
  onToggleEventStatus: (id: string) => void;
}

export const ScheduleDashboard: React.FC<ScheduleDashboardProps> = ({
  events,
  onAddScheduleClick,
  onToggleEventStatus
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Filter events by selected day or show all
  const filteredEvents = events.filter(e => e.dayIndex === selectedDayIndex || e.dayIndex === undefined);

  return (
    <motion.div 
      id="screen-schedule-dashboard"
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 pb-24"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Weekly Schedule &amp; Events
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Keep track of meetings, client demos, appointments, and project deliverables
          </p>
        </div>

        <button 
          id="btn-schedule-meeting"
          onClick={onAddScheduleClick}
          className="px-4 py-2 bg-[#14151b] hover:bg-black text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus size={14} className="text-[#e4fc65]" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Main Week 22 Selector & Event List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Card: May 2026 Week 22 Calendar Selector */}
        <div 
          id="schedule-calendar-selector"
          className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-sm text-slate-900">May 2026</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                Week 22
              </span>
            </div>

            {/* 7 Days of the week */}
            <div className="grid grid-cols-7 gap-1.5 text-center mb-6">
              {SCHEDULE_DAYS.map((item, idx) => {
                const isActive = selectedDayIndex === idx;
                return (
                  <button 
                    key={idx} 
                    id={`btn-schedule-day-${item.dayName.toLowerCase()}`}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`py-2 px-1 rounded-2xl flex flex-col items-center gap-1 text-xs cursor-pointer transition-all ${
                      isActive 
                        ? "bg-[#14151b] text-white shadow-md scale-105" 
                        : "hover:bg-slate-100 text-slate-600 bg-slate-50/70"
                    }`}
                  >
                    <span className={`text-[10px] uppercase ${isActive ? 'text-[#e4fc65] font-bold' : 'opacity-70'}`}>
                      {item.dayName}
                    </span>
                    <span className="font-bold text-sm">{item.dayNum}</span>
                  </button>
                );
              })}
            </div>

            {/* Day Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  Day Overview ({SCHEDULE_DAYS[selectedDayIndex].dayName})
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {filteredEvents.length} events scheduled • {filteredEvents.length * 1.5} hours total work
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Sync with Google Cal</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected
            </span>
          </div>
        </div>

        {/* Right Card: Scheduled Events List */}
        <div 
          id="schedule-events-container"
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/70 shadow-xs flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">Agenda for {SCHEDULE_DAYS[selectedDayIndex].dateStr}</h3>
              <span className="text-xs text-slate-400 font-medium">Click event badge to toggle status</span>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No events scheduled for this day. Click "+ Schedule Meeting" to add one.
              </div>
            ) : (
              filteredEvents.map((ev) => (
                <div 
                  key={ev.id} 
                  id={`event-item-${ev.id}`}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all bg-slate-50/50 hover:bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[11px] font-bold text-slate-500 tracking-tight">
                        {ev.time}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-black">
                      {ev.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{ev.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => onToggleEventStatus(ev.id)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${ev.status_color} hover:brightness-95 active:scale-95`}
                      title="Click to toggle status"
                    >
                      {ev.status}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-right">
            <button 
              onClick={onAddScheduleClick}
              className="text-xs font-semibold text-slate-700 hover:text-black"
            >
              + Add Quick Timeslot
            </button>
          </div>
        </div>

      </div>

      {/* Performance Analytics Row (Screenshot 4) */}
      <div id="schedule-performance-analytics" className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900">Performance Analytics</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">Monthly Benchmark</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Lime Card: Total Productive Hours */}
          <div 
            id="perf-card-hours"
            className="bg-[#e4fc65] p-6 rounded-3xl shadow-xs border border-lime-300/40"
          >
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Total Productive Hours
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight">
              142.5 hrs
            </div>
            <span className="text-xs text-slate-800 font-semibold mt-1.5 inline-block">
              +14% vs last month
            </span>
          </div>

          {/* Peach Card: Tasks Completed */}
          <div 
            id="perf-card-tasks"
            className="bg-[#fed6c6] p-6 rounded-3xl shadow-xs border border-[#fbc4b0]"
          >
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Tasks Completed
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight">
              38 tasks
            </div>
            <span className="text-xs text-slate-800 font-semibold mt-1.5 inline-block">
              +94% on-time delivery
            </span>
          </div>

          {/* White Card: Efficiency Score */}
          <div 
            id="perf-card-efficiency"
            className="bg-white p-6 rounded-3xl border border-slate-200/70 shadow-xs"
          >
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Efficiency Score
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-950 mt-2 tracking-tight">
              98.4%
            </div>
            <span className="text-xs text-emerald-600 font-bold mt-1.5 inline-block flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Top 5% across organization
            </span>
          </div>

        </div>
      </div>

    </motion.div>
  );
};
