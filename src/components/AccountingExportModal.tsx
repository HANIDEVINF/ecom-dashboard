import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileSpreadsheet, 
  Download, 
  X, 
  CheckCircle2, 
  Building2, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Users, 
  TrendingDown, 
  Package
} from 'lucide-react';
import { AppLanguage, BusinessSettings, ExpenseItem, InventoryItem, Invoice, Worker } from '../types';
import { 
  exportExpensesCSV, 
  exportInventoryCSV, 
  exportPayrollCSV, 
  exportSalesJournalCSV 
} from '../services/apiService';

interface AccountingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  inventory: InventoryItem[];
  workers: Worker[];
  expenses: ExpenseItem[];
  settings: BusinessSettings;
  language: AppLanguage;
}

export const AccountingExportModal: React.FC<AccountingExportModalProps> = ({
  isOpen,
  onClose,
  invoices,
  inventory,
  workers,
  expenses,
  settings,
  language
}) => {
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const markDownloaded = (key: string) => {
    setDownloadedItems(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setDownloadedItems(prev => ({ ...prev, [key]: false }));
    }, 3000);
  };

  const handleExportSales = () => {
    exportSalesJournalCSV(invoices, settings.companyName);
    markDownloaded('sales');
  };

  const handleExportInventory = () => {
    exportInventoryCSV(inventory);
    markDownloaded('inventory');
  };

  const handleExportPayroll = () => {
    exportPayrollCSV(workers);
    markDownloaded('payroll');
  };

  const handleExportExpenses = () => {
    exportExpensesCSV(expenses);
    markDownloaded('expenses');
  };

  const handleExportAll = () => {
    exportSalesJournalCSV(invoices, settings.companyName);
    setTimeout(() => exportInventoryCSV(inventory), 200);
    setTimeout(() => exportPayrollCSV(workers), 400);
    setTimeout(() => exportExpensesCSV(expenses), 600);
    markDownloaded('all');
  };

  return (
    <AnimatePresence>
      <div 
        id="modal-accounting-export-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e4fc65] text-slate-950 flex items-center justify-center font-black">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>{language === 'ar' ? 'مركز التصدير المحاسبي والجبائي G50' : 'Exports Comptables & Fiscaux (G50 / Excel)'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#e4fc65]">
                    Format CSV / Excel
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Générez vos journaux avec encodage UTF-8 conforme pour déclaration mensuelle d'impôts et commissaire aux comptes
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
            
            {/* Fiscal info banner */}
            <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start gap-3">
              <ShieldCheck size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-amber-950 text-xs">
                  Conformité Réglementaire Algérienne (G50 & CNAS)
                </h4>
                <p className="text-[11px] text-amber-900/90 leading-relaxed">
                  Ces fichiers sont pré-formatés pour votre comptable ou logiciel de comptabilité (PC Compta, DLG, etc.). 
                  Ils ventilent le chiffre d'affaires HT, la <strong>TVA 19% collectée</strong>, la TAP éventuelle, le matricule CNAS des salariés et la valorisation du stock au prix d'achat.
                </p>
              </div>
            </div>

            {/* List of 4 report cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 1. Sales Journal (G50) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-indigo-600" />
                    <h5 className="font-black text-slate-950 text-xs">Journal des Ventes (G50)</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ventilation des factures : Total HT, TVA 19%, TTC, mode de règlement et NIF clients.
                  </p>
                  <span className="text-[10px] font-mono text-indigo-700 font-bold block">
                    {invoices.length} écritures enregistrées
                  </span>
                </div>

                <button
                  onClick={handleExportSales}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    downloadedItems['sales']
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                >
                  {downloadedItems['sales'] ? <CheckCircle2 size={13} /> : <Download size={13} />}
                  <span>{downloadedItems['sales'] ? 'Téléchargé !' : 'Télécharger CSV'}</span>
                </button>
              </div>

              {/* 2. Stock Inventory Valuation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-emerald-600" />
                    <h5 className="font-black text-slate-950 text-xs">État de Stock & Valorisation</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Inventaire physique chiffré au coût d'achat et au prix de vente, seuils d'alertes.
                  </p>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold block">
                    {inventory.length} références d'articles
                  </span>
                </div>

                <button
                  onClick={handleExportInventory}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    downloadedItems['inventory']
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                >
                  {downloadedItems['inventory'] ? <CheckCircle2 size={13} /> : <Download size={13} />}
                  <span>{downloadedItems['inventory'] ? 'Téléchargé !' : 'Télécharger CSV'}</span>
                </button>
              </div>

              {/* 3. Payroll & CNAS */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-sky-600" />
                    <h5 className="font-black text-slate-950 text-xs">Livre de Paie & CNAS</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bordereau récapitulatif des salariés, matricules d'assurance, heures et salaires nets.
                  </p>
                  <span className="text-[10px] font-mono text-sky-700 font-bold block">
                    {workers.length} employés actifs
                  </span>
                </div>

                <button
                  onClick={handleExportPayroll}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    downloadedItems['payroll']
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                >
                  {downloadedItems['payroll'] ? <CheckCircle2 size={13} /> : <Download size={13} />}
                  <span>{downloadedItems['payroll'] ? 'Téléchargé !' : 'Télécharger CSV'}</span>
                </button>
              </div>

              {/* 4. Expenses & Charges */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <TrendingDown size={16} className="text-rose-600" />
                    <h5 className="font-black text-slate-950 text-xs">Journal des Dépenses & Charges</h5>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Ventilation des décaissements : Loyer, Sonelgaz, transporteurs Yalidine, impôts.
                  </p>
                  <span className="text-[10px] font-mono text-rose-700 font-bold block">
                    {expenses.length} dépenses enregistrées
                  </span>
                </div>

                <button
                  onClick={handleExportExpenses}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    downloadedItems['expenses']
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                >
                  {downloadedItems['expenses'] ? <CheckCircle2 size={13} /> : <Download size={13} />}
                  <span>{downloadedItems['expenses'] ? 'Téléchargé !' : 'Télécharger CSV'}</span>
                </button>
              </div>

            </div>

            {/* Complete Pack Banner */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-[#e4fc65] flex items-center gap-2">
                  <Layers size={16} />
                  <span>Pack Complet Clôture de Mois</span>
                </h4>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Téléchargez l'ensemble des 4 registres en un seul clic pour votre dossier fiduciaire
                </p>
              </div>

              <button
                onClick={handleExportAll}
                className="px-5 py-2.5 bg-[#e4fc65] hover:bg-[#d5ee52] text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md active:scale-95"
              >
                {downloadedItems['all'] ? <CheckCircle2 size={14} /> : <Download size={14} />}
                <span>{downloadedItems['all'] ? 'Exportation terminée !' : 'Télécharger tout le pack'}</span>
              </button>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">
              {settings.companyName} • RC: {settings.rcNumber} • NIF: {settings.nif}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Fermer
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
