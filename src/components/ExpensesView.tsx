import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  Download, 
  TrendingDown, 
  Calendar, 
  Building, 
  Zap, 
  Truck, 
  Package, 
  ShieldAlert, 
  Users, 
  FileText, 
  Trash2,
  Receipt,
  PieChart as PieChartIcon
} from 'lucide-react';
import { AppLanguage, BusinessSettings, ExpenseCategory, ExpenseItem } from '../types';
import { exportExpensesCSV, formatDZD } from '../services/apiService';

interface ExpensesViewProps {
  expenses: ExpenseItem[];
  settings?: BusinessSettings;
  language: AppLanguage;
  onAddExpense: (expense: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  language,
  onAddExpense,
  onDeleteExpense
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Expense form state
  const [newTitle, setNewTitle] = useState('');
  const [newAmountDA, setNewAmountDA] = useState<number | ''>('');
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('loyer');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'especes' | 'baridimob' | 'virement_cib' | 'cheque'>('virement_cib');
  const [newPaidTo, setNewPaidTo] = useState('');
  const [newReceiptRef, setNewReceiptRef] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Category labels & icons helper
  const getCategoryMeta = (cat: ExpenseCategory) => {
    switch (cat) {
      case 'loyer':
        return { label: 'Loyer & Baux', icon: <Building size={13} />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'sonelgaz':
        return { label: 'Sonelgaz (Énergie)', icon: <Zap size={13} />, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'transport_livraison':
        return { label: 'Transport & Yalidine', icon: <Truck size={13} />, color: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'fournisseurs':
        return { label: 'Achats Fournisseurs', icon: <Package size={13} />, color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'impots_cnas':
        return { label: 'Impôts & CNAS', icon: <ShieldAlert size={13} />, color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'salaires':
        return { label: 'Salaires & Primes', icon: <Users size={13} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'materiel':
        return { label: 'Matériel & Bureau', icon: <FileText size={13} />, color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: 'Autre charge', icon: <Receipt size={13} />, color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (exp.paidTo && exp.paidTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (exp.receiptRef && exp.receiptRef.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  const totalExpensesDZD = expenses.reduce((acc, e) => acc + e.amountDZD, 0);

  const fixedCostsDZD = expenses
    .filter(e => e.category === 'loyer' || e.category === 'sonelgaz' || e.category === 'impots_cnas')
    .reduce((acc, e) => acc + e.amountDZD, 0);

  const operatingCostsDZD = expenses
    .filter(e => e.category === 'fournisseurs' || e.category === 'transport_livraison' || e.category === 'materiel')
    .reduce((acc, e) => acc + e.amountDZD, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amountDZD;
  });

  // Find biggest spending category
  let maxCat = 'loyer';
  let maxCatVal = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > maxCatVal) {
      maxCat = cat;
      maxCatVal = val;
    }
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmountDA || Number(newAmountDA) <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      category: newCategory,
      title: newTitle,
      amountDZD: Number(newAmountDA),
      paymentMethod: newPaymentMethod,
      paidTo: newPaidTo || undefined,
      notes: newNotes || undefined,
      receiptRef: newReceiptRef || undefined
    };

    onAddExpense(newExpense);
    setIsAddModalOpen(false);

    // Reset
    setNewTitle('');
    setNewAmountDA('');
    setNewPaidTo('');
    setNewReceiptRef('');
    setNewNotes('');
  };

  return (
    <motion.div
      id="expenses-tracking-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'تتبع المصاريف ونفقات التشغيل' : 'Charges & Dépenses d\'Exploitation'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#14151b] text-[#e4fc65]">
              DZD OUT
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {language === 'ar' 
              ? 'مراقبة تكاليف الإيجار، سونلغاز، رواتب العمال، الشحن ياليدين، والضرائب لاحتساب صافي الأرباح'
              : 'Enregistrement des coûts fixes et variables (Loyer, Sonelgaz, Fournisseurs, Yalidine, CNAS)'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportExpensesCSV(expenses)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={14} className="text-emerald-600" />
            <span>{language === 'ar' ? 'تصدير جدول النفقات (Excel)' : 'Exporter en Excel (CSV)'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-[#e4fc65] hover:bg-[#d5ee52] text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>{language === 'ar' ? 'تسجيل مصروف جديد' : 'Ajouter une Dépense'}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Expenses */}
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-3xl shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي النفقات هذا الشهر' : 'Total Dépenses (Mois)'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-200 text-rose-900 flex items-center justify-center">
              <TrendingDown size={14} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-rose-950 tracking-tight font-mono">
              {formatDZD(totalExpensesDZD, language)}
            </div>
            <p className="text-[10px] text-rose-700 font-semibold mt-0.5">
              {expenses.length} décaissements comptabilisés
            </p>
          </div>
        </div>

        {/* Fixed Costs */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'التكاليف الثابتة' : 'Charges Fixes'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building size={14} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {formatDZD(fixedCostsDZD, language)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Loyer commercial, Sonelgaz, CNAS
            </p>
          </div>
        </div>

        {/* Operating Costs */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'تكاليف التشغيل والتوريد' : 'Achats & Fret'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck size={14} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {formatDZD(operatingCostsDZD, language)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Fournisseurs & transport 58 Wilayas
            </p>
          </div>
        </div>

        {/* Biggest Category */}
        <div className="bg-[#14151b] text-white p-4 rounded-3xl border border-slate-800 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'ar' ? 'أكبر بند تكلفة' : '1er Poste de Dépense'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-white/10 text-[#e4fc65] flex items-center justify-center">
              <PieChartIcon size={14} />
            </div>
          </div>
          <div>
            <div className="text-lg font-black text-[#e4fc65] tracking-tight truncate">
              {getCategoryMeta(maxCat as ExpenseCategory).label}
            </div>
            <p className="text-[11px] font-mono text-slate-300 font-bold mt-0.5">
              {formatDZD(maxCatVal, language)} ({totalExpensesDZD > 0 ? Math.round((maxCatVal / totalExpensesDZD) * 100) : 0}%)
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: language === 'ar' ? 'الكل' : 'Toutes' },
            { id: 'loyer', label: 'Loyer' },
            { id: 'sonelgaz', label: 'Sonelgaz' },
            { id: 'transport_livraison', label: 'Transport / Yalidine' },
            { id: 'fournisseurs', label: 'Fournisseurs' },
            { id: 'impots_cnas', label: 'Impôts / CNAS' },
            { id: 'materiel', label: 'Matériel' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث في المصاريف...' : 'Rechercher une charge...'}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Réf Pièce</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Libellé / Désignation</th>
                <th className="py-3 px-4">Bénéficiaire / Organisme</th>
                <th className="py-3 px-4 text-right">Montant Décaissé (DA)</th>
                <th className="py-3 px-4">Règlement</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium text-xs">
                    {language === 'ar' ? 'لا توجد مصاريف مسجلة لهذا التصنيف' : 'Aucune dépense trouvée'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(exp => {
                  const meta = getCategoryMeta(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {exp.date}
                      </td>

                      {/* Receipt Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 text-[11px]">
                        {exp.receiptRef || '-'}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${meta.color}`}>
                          {meta.icon}
                          <span>{meta.label}</span>
                        </span>
                      </td>

                      {/* Title & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {exp.title}
                        </div>
                        {exp.notes && (
                          <span className="text-[10px] text-slate-400 block mt-0.5 truncate max-w-xs">
                            {exp.notes}
                          </span>
                        )}
                      </td>

                      {/* Paid to */}
                      <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                        {exp.paidTo || '-'}
                      </td>

                      {/* Amount DZD */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-rose-700 text-xs">
                        -{formatDZD(exp.amountDZD, language)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-[11px] font-medium text-slate-600 capitalize">
                        {exp.paymentMethod === 'virement_cib' ? 'Virement CIB' : 
                         exp.paymentMethod === 'baridimob' ? 'BaridiMob' : 
                         exp.paymentMethod === 'especes' ? 'Espèces' : 'Chèque'}
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-4"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingDown size={16} className="text-rose-400" />
                    <span>Enregistrer une Dépense / Charge</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ajoutez une charge d'exploitation pour ajuster le résultat net en DZD
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateExpense} className="p-6 space-y-4 text-xs text-slate-800">
                
                {/* Category */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Catégorie de charge
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                  >
                    <option value="loyer">Loyer Commercial & Entrepôts</option>
                    <option value="sonelgaz">Facture Sonelgaz (Électricité & Gaz)</option>
                    <option value="transport_livraison">Transport, Carburant & Yalidine Express</option>
                    <option value="fournisseurs">Achats Fournisseurs / Réapprovisionnement</option>
                    <option value="impots_cnas">Déclarations Impôts (G50) & Cotisations CNAS</option>
                    <option value="salaires">Avance sur Salaire / Prime Salarié</option>
                    <option value="materiel">Matériel, Outillage & Consommables bureau</option>
                    <option value="autre">Autre dépense diverse</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Libellé de la dépense *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="ex: Facture Sonelgaz El Harrach Q3"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                  />
                </div>

                {/* Amount & Mode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Montant en DA *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="100"
                      value={newAmountDA}
                      onChange={e => setNewAmountDA(e.target.value ? Number(e.target.value) : '')}
                      placeholder="38500"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-rose-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Mode de règlement
                    </label>
                    <select
                      value={newPaymentMethod}
                      onChange={e => setNewPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="virement_cib">Virement CIB / BNA</option>
                      <option value="baridimob">BaridiMob / CCP</option>
                      <option value="especes">Espèces</option>
                      <option value="cheque">Chèque bancaire</option>
                    </select>
                  </div>
                </div>

                {/* Beneficiary & Receipt Ref */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Bénéficiaire / Organisme
                    </label>
                    <input
                      type="text"
                      value={newPaidTo}
                      onChange={e => setNewPaidTo(e.target.value)}
                      placeholder="ex: Sonelgaz / Yalidine"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      N° Reçu / Pièce justificative
                    </label>
                    <input
                      type="text"
                      value={newReceiptRef}
                      onChange={e => setNewReceiptRef(e.target.value)}
                      placeholder="ex: SON-2026-0934"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Notes / Remarques comptables
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="ex: Payé en espèces au guichet"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 text-[#e4fc65] rounded-xl text-xs font-bold hover:bg-black cursor-pointer shadow-xs"
                  >
                    Enregistrer la dépense
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};
