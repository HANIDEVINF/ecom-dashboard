import React, { useState } from 'react';
import { 
  Code2, 
  X, 
  Database, 
  Copy, 
  Check, 
  Layers, 
  Terminal, 
  MousePointerClick, 
  RefreshCw,
  ExternalLink,
  Laptop,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { BentoDashboardData, BusinessSettings, ClientProfile, ExpenseItem, FinancialData, InboxAlertItem, InventoryItem, Invoice, ScheduleEvent, Worker } from '../types';
import { FLASK_MONGODB_ALGERIA_BACKEND } from '../data/algerianBusinessData';

interface InspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  workers: Worker[];
  inventory: InventoryItem[];
  clients: ClientProfile[];
  bentoData: BentoDashboardData;
  financials: FinancialData;
  settings: BusinessSettings;
  schedules: ScheduleEvent[];
  inbox: InboxAlertItem[];
  invoices?: Invoice[];
  expenses?: ExpenseItem[];
  isHoverInspectEnabled: boolean;
  onToggleHoverInspect: () => void;
  onResetData: () => void;
}

export const InspectModal: React.FC<InspectModalProps> = ({
  isOpen,
  onClose,
  onOpen,
  workers,
  inventory,
  clients,
  bentoData,
  financials,
  settings,
  schedules,
  inbox,
  invoices = [],
  expenses = [],
  isHoverInspectEnabled,
  onToggleHoverInspect,
  onResetData
}) => {
  const [activeSection, setActiveSection] = useState<'mongodb' | 'elements' | 'backend-code' | 'api-endpoints'>('mongodb');
  const [selectedCollection, setSelectedCollection] = useState<'workers' | 'inventory' | 'clients' | 'invoices' | 'expenses' | 'financials' | 'bento' | 'settings'>('workers');
  const [copied, setCopied] = useState(false);

  const getCollectionData = () => {
    switch (selectedCollection) {
      case 'workers':
        return workers;
      case 'inventory':
        return inventory;
      case 'clients':
        return clients;
      case 'invoices':
        return invoices;
      case 'expenses':
        return expenses;
      case 'financials':
        return financials;
      case 'bento':
        return bentoData;
      case 'settings':
        return settings;
      default:
        return workers;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Persistent Floating Inspect Button (Bottom-Right on PC) */}
      <div 
        id="inspect-floating-trigger-container"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
      >
        <button
          id="btn-inspect-float"
          onClick={onOpen}
          className="bg-[#14151b] hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 group cursor-pointer"
          title="Ouvrir l'inspecteur MongoDB et API"
        >
          <div className="relative">
            <Code2 size={16} className="text-[#e4fc65] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#e4fc65] animate-ping"></span>
          </div>
          <span>Inspecteur MongoDB</span>
          <span className="hidden sm:inline bg-white/10 text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
            localhost:27017
          </span>
        </button>
      </div>

      {/* Slide-over Inspector Drawer */}
      {isOpen && (
        <div 
          id="inspect-drawer-backdrop"
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div 
            id="inspect-drawer-panel"
            className="w-full max-w-xl bg-[#14151b] text-slate-200 h-full p-6 shadow-2xl flex flex-col justify-between border-l border-white/10 overflow-y-auto animate-in slide-in-from-right duration-250"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#e4fc65]/10 border border-[#e4fc65]/30 flex items-center justify-center">
                    <Database size={17} className="text-[#e4fc65]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Inspecteur MongoDB &amp; API Algérie</h3>
                    <p className="text-[11px] text-slate-400">Collections BSON en temps réel • Devise: Dinar Algérien (DA)</p>
                  </div>
                </div>

                <button 
                  id="btn-close-inspector"
                  onClick={onClose}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs in Drawer */}
              <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-2xl my-4 text-xs font-semibold">
                <button
                  id="tab-inspect-mongodb"
                  onClick={() => setActiveSection('mongodb')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeSection === 'mongodb' 
                      ? 'bg-white text-slate-950 shadow-xs font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database size={13} />
                  <span>MongoDB</span>
                </button>

                <button
                  id="tab-inspect-backend"
                  onClick={() => setActiveSection('backend-code')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeSection === 'backend-code' 
                      ? 'bg-white text-slate-950 shadow-xs font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal size={13} />
                  <span>Flask API</span>
                </button>

                <button
                  id="tab-inspect-elements"
                  onClick={() => setActiveSection('elements')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeSection === 'elements' 
                      ? 'bg-white text-slate-950 shadow-xs font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers size={13} />
                  <span>Éléments</span>
                </button>

                <button
                  id="tab-inspect-api"
                  onClick={() => setActiveSection('api-endpoints')}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    activeSection === 'api-endpoints' 
                      ? 'bg-white text-slate-950 shadow-xs font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Laptop size={13} />
                  <span>Endpoints</span>
                </button>
              </div>

              {/* Connection Status Badge */}
              <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-2xl text-xs mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-300 font-mono text-[11px]">mongodb://localhost:27017/algeria_biz_db</span>
                </div>
                <button 
                  onClick={onResetData}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-slate-200 px-2.5 py-1 rounded-md font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Réinitialiser les collections"
                >
                  <RefreshCw size={10} /> Reset
                </button>
              </div>

              {/* TAB 1: MONGODB LIVE COLLECTIONS */}
              {activeSection === 'mongodb' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(['workers', 'inventory', 'clients', 'invoices', 'expenses', 'financials', 'bento', 'settings'] as const).map((col) => (
                      <button
                        key={col}
                        onClick={() => setSelectedCollection(col)}
                        className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                          selectedCollection === col
                            ? 'bg-[#e4fc65]/15 border-[#e4fc65] text-[#e4fc65] font-bold'
                            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        db.{col}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Documents BSON / JSON (db.{selectedCollection}) :
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(getCollectionData(), null, 2))}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? 'Copié !' : 'Copier JSON'}</span>
                    </button>
                  </div>

                  <pre className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 text-[11px] text-emerald-400 font-mono overflow-auto max-h-[46vh] leading-relaxed select-all">
                    {JSON.stringify(getCollectionData(), null, 2)}
                  </pre>
                </div>
              )}

              {/* TAB 2: FLASK & MONGODB PYTHON SCRIPT */}
              {activeSection === 'backend-code' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">backend/app.py (Flask + PyMongo)</span>
                    <button
                      onClick={() => handleCopy(FLASK_MONGODB_ALGERIA_BACKEND)}
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? 'Copié !' : 'Copier script Python'}</span>
                    </button>
                  </div>

                  <pre className="bg-[#0b0c10] border border-white/10 rounded-2xl p-4 text-[11px] text-amber-300 font-mono overflow-auto max-h-[46vh] leading-relaxed select-all">
                    {FLASK_MONGODB_ALGERIA_BACKEND}
                  </pre>
                </div>
              )}

              {/* TAB 3: VISUAL ELEMENT INSPECTOR */}
              {activeSection === 'elements' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <MousePointerClick size={14} className="text-[#e4fc65]" />
                        Inspecteur Visuel de Composants
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Survolez n'importe quel bloc ou bouton pour voir ses classes Tailwind et ID
                      </p>
                    </div>
                    <button
                      onClick={onToggleHoverInspect}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isHoverInspectEnabled
                          ? 'bg-[#e4fc65] text-slate-900 shadow-md'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                      }`}
                    >
                      {isHoverInspectEnabled ? 'Actif ✓' : 'Activer'}
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="font-mono text-[#e4fc65]">#screen-workers-management</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Pointage des arrivées, calcul des salaires nets en DA, échéances de paie.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="font-mono text-[#e4fc65]">#screen-inventory-management</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Quantités en stock, seuils d'alarme personnalisables, alerte sonore.</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="font-mono text-[#e4fc65]">#screen-clients-management</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Fiches clients 58 wilayas, NIF/NIS, remises tarifaires et devis imprimable.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: API ENDPOINTS LIST */}
              {activeSection === 'api-endpoints' && (
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-emerald-900/60 text-emerald-400 rounded text-[10px] font-bold">GET/POST</span>
                      <span className="text-white font-bold">/api/workers</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">Récupère ou crée un travailleur avec salaire DA et horaires de service.</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-blue-900/60 text-blue-400 rounded text-[10px] font-bold">POST</span>
                      <span className="text-white font-bold">/api/workers/:id/clock</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">Enregistre l'arrivée du travailleur et calcule la durée en poste.</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-amber-900/60 text-amber-400 rounded text-[10px] font-bold">PUT</span>
                      <span className="text-white font-bold">/api/inventory/:id/alarm</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">Définit le seuil d'alarme minimum fixé par le propriétaire.</p>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-purple-900/60 text-purple-400 rounded text-[10px] font-bold">GET</span>
                      <span className="text-white font-bold">/api/mongodb/dump</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">Exporte toutes les collections de la base algeria_biz_db en JSON.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-white/10 text-center">
              <span className="text-[11px] text-slate-500 font-medium">
                Atlas Solutions Algérie • Stack: React 18, Vite, Express, Tailwind, MongoDB
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
