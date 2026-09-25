import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Plus, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  Truck, 
  Download, 
  DollarSign, 
  Building2, 
  Calendar,
  CreditCard,
  Trash2,
  Eye,
  PlusCircle,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Lock,
  Scale,
  X,
  Check
} from 'lucide-react';
import { AppLanguage, BusinessSettings, ClientProfile, InventoryItem, Invoice, InvoiceItem, InvoiceType, UserSession } from '../types';
import { formatDZD } from '../services/apiService';
import { FiscalLedgerManager } from '../services/fiscalLedgerService';
import { PrintInvoiceModal } from './PrintInvoiceModal';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients: ClientProfile[];
  inventory: InventoryItem[];
  settings: BusinessSettings;
  language: AppLanguage;
  currentUser?: UserSession;
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, newStatus: 'payee' | 'en_attente' | 'annulee' | 'avoir_applique') => void;
  onDeleteInvoice: (id: string) => void;
  onOpenAccountingExport: () => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  clients,
  inventory,
  settings,
  language,
  currentUser,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  onOpenAccountingExport
}) => {
  const [filterType, setFilterType] = useState<'all' | 'facture' | 'avoir' | 'bon_livraison' | 'proforma'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'payee' | 'en_attente'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Invoice for Print / Preview Modal
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // New Invoice Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fiscal Compliance Modals
  const [fiscalBlockedDeleteInvoice, setFiscalBlockedDeleteInvoice] = useState<Invoice | null>(null);
  const [avoirTargetInvoice, setAvoirTargetInvoice] = useState<Invoice | null>(null);
  const [avoirReason, setAvoirReason] = useState('Marchandise défectueuse / non conforme');
  const [newDocType, setNewDocType] = useState<InvoiceType>('facture');
  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || 'custom');
  const [customClientName, setCustomClientName] = useState('');
  const [customWilaya, setCustomWilaya] = useState('16 - Alger');
  const [newInvoiceItems, setNewInvoiceItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [tvaApplicable, setTvaApplicable] = useState(true);
  const [newDiscountDA, setNewDiscountDA] = useState<number>(0);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'especes' | 'baridimob' | 'virement_cib' | 'cheque'>('virement_cib');
  const [newNotes, setNewNotes] = useState('');

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesType = filterType === 'all' || inv.type === filterType;
    const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
    const matchesSearch = inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (inv.clientCompany && inv.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesStatus && matchesSearch;
  });

  // Financial KPIs
  const totalBilledTTC = invoices
    .filter(i => i.type === 'facture' && i.status !== 'annulee')
    .reduce((acc, i) => acc + i.totalTTC, 0);

  const totalCollectedTTC = invoices
    .filter(i => i.type === 'facture' && i.status === 'payee')
    .reduce((acc, i) => acc + i.totalTTC, 0);

  const totalPendingTTC = invoices
    .filter(i => i.status === 'en_attente')
    .reduce((acc, i) => acc + i.totalTTC, 0);

  const totalTVACollected = invoices
    .filter(i => i.type === 'facture' && i.status === 'payee')
    .reduce((acc, i) => acc + i.tvaAmountDZD, 0);

  // Create Invoice line item handlers
  const handleAddLineItem = () => {
    if (inventory.length === 0) return;
    setNewInvoiceItems(prev => [...prev, { productId: inventory[0].id, quantity: 1 }]);
  };

  const handleUpdateLineItem = (index: number, field: 'productId' | 'quantity', value: string | number) => {
    setNewInvoiceItems(prev => prev.map((line, i) => {
      if (i === index) {
        return { ...line, [field]: value };
      }
      return line;
    }));
  };

  const handleRemoveLineItem = (index: number) => {
    setNewInvoiceItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveNewInvoice = () => {
    if (newInvoiceItems.length === 0) return;

    const chosenClient = clients.find(c => c.id === selectedClientId);
    const clientName = chosenClient ? chosenClient.name : customClientName || 'Client Divers';
    const clientCompany = chosenClient ? chosenClient.company : undefined;
    const clientWilaya = chosenClient ? chosenClient.wilaya : customWilaya;

    const items: InvoiceItem[] = newInvoiceItems.map(line => {
      const prod = inventory.find(p => p.id === line.productId) || inventory[0];
      return {
        productId: prod.id,
        productName: prod.name[language] || prod.name.fr,
        sku: prod.sku,
        quantity: line.quantity,
        unitPriceDZD: prod.sellingPriceDZD,
        totalDZD: prod.sellingPriceDZD * line.quantity
      };
    });

    const subtotalHT = items.reduce((acc, it) => acc + it.totalDZD, 0);
    const effectiveBase = Math.max(0, subtotalHT - newDiscountDA);
    const tvaRate = tvaApplicable ? 0.19 : 0;
    const tvaAmount = Math.round(effectiveBase * tvaRate);
    const totalTTC = effectiveBase + tvaAmount;

    const num = FiscalLedgerManager.getNextDocumentNumber(newDocType, invoices);
    const today = new Date().toISOString().slice(0, 10);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      number: num,
      type: newDocType,
      date: today,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      clientId: chosenClient ? chosenClient.id : undefined,
      clientName,
      clientCompany,
      clientWilaya,
      clientNif: chosenClient?.nif,
      clientNis: chosenClient?.nis,
      clientRc: chosenClient?.rcNumber,
      clientAddress: chosenClient ? `${chosenClient.wilaya}, Algérie` : undefined,
      items,
      subtotalHT,
      tvaRate,
      tvaAmountDZD: tvaAmount,
      discountDZD: newDiscountDA,
      totalTTC,
      paymentMethod: newPaymentMethod,
      status: 'en_attente',
      notes: newNotes || undefined,
      isLocked: newDocType === 'facture'
    };

    onAddInvoice(newInvoice);

    // Register into append-only cryptographic fiscal ledger
    FiscalLedgerManager.appendEntry(
      newInvoice,
      currentUser?.name || 'Yacine Mansouri',
      currentUser?.role || 'gerant'
    ).catch(err => console.error('Fiscal ledger error:', err));

    setIsCreateModalOpen(false);
    setNewInvoiceItems([]);
    setNewDiscountDA(0);
    setNewNotes('');

    // Open printable modal right away
    setSelectedInvoiceForPrint(newInvoice);
    setIsPrintModalOpen(true);
  };

  // Intercept invoice deletion under Algerian Commercial Law & DGI G50 rules
  const handleRequestDelete = (inv: Invoice) => {
    if (inv.type === 'facture' || inv.type === 'avoir') {
      // Deleting a validated invoice is illegal under Art. 11/12 Code de Commerce
      setFiscalBlockedDeleteInvoice(inv);
    } else {
      // Proformas and non-fiscal draft slips can be deleted
      onDeleteInvoice(inv.id);
    }
  };

  // Create official Facture d'Avoir (Credit Note)
  const handleConfirmCreateAvoir = async () => {
    if (!avoirTargetInvoice) return;

    const { avoirInvoice, updatedOriginal } = FiscalLedgerManager.createAvoir(
      avoirTargetInvoice,
      avoirReason,
      currentUser?.name || 'Direction Générale',
      currentUser?.role || 'gerant',
      invoices
    );

    // Update original status to avoir_applique
    onUpdateInvoiceStatus(avoirTargetInvoice.id, 'avoir_applique');

    // Add new Avoir invoice
    onAddInvoice(avoirInvoice);

    // Append to fiscal ledger
    await FiscalLedgerManager.appendEntry(
      avoirInvoice,
      currentUser?.name || 'Direction Générale',
      currentUser?.role || 'gerant'
    );

    setAvoirTargetInvoice(null);
    setFiscalBlockedDeleteInvoice(null);
    setSelectedInvoiceForPrint(avoirInvoice);
    setIsPrintModalOpen(true);
  };

  return (
    <motion.div
      id="invoices-documents-view"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-6"
    >
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {language === 'ar' ? 'الفواتير، وصولات التسليم وعروض الأسعار' : 'Facturation & Bons de Livraison (BL)'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#14151b] text-[#e4fc65]">
              Algérie A4
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {language === 'ar' 
              ? 'إصدار وطباعة الفواتير المطابقة للمعايير الجبائية الجزائرية (NIF / NIS / RC / TVA 19%)'
              : 'Émission et impression des factures, BL et proformas conformes aux normes fiscales (TVA 19%, NIF, NIS, RC)'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenAccountingExport}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={14} className="text-emerald-600" />
            <span>{language === 'ar' ? 'تصدير محاسبي (G50 / Excel)' : 'Export G50 & Excel'}</span>
          </button>

          <button
            onClick={() => {
              setNewInvoiceItems([{ productId: inventory[0]?.id || '', quantity: 1 }]);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-[#e4fc65] hover:bg-[#d5ee52] text-slate-950 font-bold text-xs rounded-2xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus size={15} />
            <span>{language === 'ar' ? 'إنشاء فاتورة / وصل جديد' : 'Nouveau Document'}</span>
          </button>
        </div>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Billed */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'إجمالي المفوتر TTC' : 'Total Facturé (TTC)'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileCheck size={14} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
              {formatDZD(totalBilledTTC, language)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {invoices.filter(i => i.type === 'facture').length} factures émises
            </p>
          </div>
        </div>

        {/* Collected */}
        <div className="bg-[#e4fc65] p-4 rounded-3xl border border-lime-300 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {language === 'ar' ? 'المبالغ المحصلة' : 'Encaissé (Acquitté)'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 text-slate-900 flex items-center justify-center">
              <CheckCircle size={14} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950 tracking-tight font-mono">
              {formatDZD(totalCollectedTTC, language)}
            </div>
            <p className="text-[10px] text-slate-800 font-semibold mt-0.5">
              Règlements BNA, BaridiMob & Espèces
            </p>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="bg-[#fed6c6] p-4 rounded-3xl border border-[#fbc4b0] shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {language === 'ar' ? 'مستحقات قيد الانتظار' : 'Créances en Attente'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-black/10 text-slate-900 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-950 tracking-tight font-mono">
              {formatDZD(totalPendingTTC, language)}
            </div>
            <p className="text-[10px] text-slate-800 font-semibold mt-0.5">
              À recouvrer sous 30 jours
            </p>
          </div>
        </div>

        {/* TVA 19% Collected for G50 */}
        <div className="bg-slate-900 text-white p-4 rounded-3xl border border-slate-800 shadow-xs flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={13} className="text-[#e4fc65]" />
              <span>TVA 19% (G50)</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#e4fc65]">
              Impôts DZ
            </span>
          </div>
          <div>
            <div className="text-2xl font-black text-[#e4fc65] tracking-tight font-mono">
              {formatDZD(totalTVACollected, language)}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              À déclarer avant le 20 du mois
            </p>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Document Type Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: language === 'ar' ? 'جميع الوثائق' : 'Tous' },
            { id: 'facture', label: language === 'ar' ? 'فواتير رسمية' : 'Factures' },
            { id: 'avoir', label: language === 'ar' ? 'فواتير الإلغاء (Avoirs)' : 'Avoirs (Notes de Crédit)' },
            { id: 'bon_livraison', label: language === 'ar' ? 'وصولات تسليم (BL)' : 'Bons de Livraison' },
            { id: 'proforma', label: language === 'ar' ? 'فواتير شكلية' : 'Proformas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer text-xs ${
                filterType === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input & Status Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالرقم أو العميل...' : 'Rechercher N° ou client...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">{language === 'ar' ? 'كل الحالات' : 'Tous statuts'}</option>
            <option value="payee">{language === 'ar' ? 'مسددة' : 'Payée'}</option>
            <option value="en_attente">{language === 'ar' ? 'قيد الانتظار' : 'En attente'}</option>
          </select>
        </div>

      </div>

      {/* Invoices List Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Document</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client / Entreprise</th>
                <th className="py-3 px-4">Wilaya</th>
                <th className="py-3 px-4 text-right">Total HT</th>
                <th className="py-3 px-4 text-right">TVA (19%)</th>
                <th className="py-3 px-4 text-right">Net TTC (DA)</th>
                <th className="py-3 px-4">Règlement</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-medium text-xs">
                    {language === 'ar' ? 'لا توجد وثائق تطابق هذا البحث' : 'Aucun document trouvé pour cette sélection'}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Document Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.number}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        inv.type === 'facture' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                        inv.type === 'avoir' ? 'bg-purple-100 text-purple-900 border border-purple-200 font-bold' :
                        inv.type === 'bon_livraison' ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {inv.type === 'facture' ? 'FACTURE' : 
                         inv.type === 'avoir' ? 'AVOIR (CRÉDIT)' :
                         inv.type === 'bon_livraison' ? 'BON LIVRAISON' : 'PROFORMA'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {inv.date}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 truncate max-w-[170px]">
                        {inv.clientCompany || inv.clientName}
                      </div>
                      {inv.clientNif && (
                        <span className="text-[9px] font-mono text-slate-400 block">
                          NIF: {inv.clientNif}
                        </span>
                      )}
                    </td>

                    {/* Wilaya */}
                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {inv.clientWilaya || '-'}
                    </td>

                    {/* HT */}
                    <td className={`py-3.5 px-4 text-right font-mono ${inv.type === 'avoir' ? 'text-purple-700 font-bold' : 'text-slate-600'}`}>
                      {inv.type === 'avoir' ? `-${formatDZD(inv.subtotalHT, language)}` : formatDZD(inv.subtotalHT, language)}
                    </td>

                    {/* TVA */}
                    <td className={`py-3.5 px-4 text-right font-mono ${inv.type === 'avoir' ? 'text-purple-600' : 'text-slate-500'}`}>
                      {inv.type === 'avoir' 
                        ? `-${formatDZD(inv.tvaAmountDZD, language)}`
                        : inv.tvaAmountDZD > 0 ? formatDZD(inv.tvaAmountDZD, language) : '0 DA'}
                    </td>

                    {/* TTC */}
                    <td className={`py-3.5 px-4 text-right font-mono font-black text-xs ${
                      inv.type === 'avoir' ? 'text-purple-900' : 'text-slate-950'
                    }`}>
                      {inv.type === 'avoir' ? `-${formatDZD(inv.totalTTC, language)}` : formatDZD(inv.totalTTC, language)}
                    </td>

                    {/* Payment Method */}
                    <td className="py-3.5 px-4 text-[11px] font-medium text-slate-600">
                      <span className="capitalize">
                        {inv.paymentMethod === 'virement_cib' ? 'Virement CIB' : 
                         inv.paymentMethod === 'baridimob' ? 'BaridiMob' : 
                         inv.paymentMethod === 'especes' ? 'Espèces' : 'Chèque'}
                      </span>
                    </td>

                    {/* Status Toggle Button */}
                    <td className="py-3.5 px-4 text-center">
                      {inv.status === 'avoir_applique' ? (
                        <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                          Annulée par Avoir
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const nextStatus = inv.status === 'payee' ? 'en_attente' : 'payee';
                            onUpdateInvoiceStatus(inv.id, nextStatus);
                          }}
                          className={`text-[9px] font-bold uppercase px-2.5 py-1 rounded-full cursor-pointer transition-all ${
                            inv.status === 'payee'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
                          }`}
                          title="Cliquer pour changer l'état du paiement"
                        >
                          {inv.status === 'payee' ? 'Payée ✓' : 'En attente'}
                        </button>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedInvoiceForPrint(inv);
                            setIsPrintModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-900 hover:text-[#e4fc65] text-slate-700 rounded-lg transition-all cursor-pointer shadow-2xs"
                          title="Imprimer / Aperçu A4"
                        >
                          <Printer size={13} />
                        </button>

                        {/* Émettre Avoir Button for Validated Invoices */}
                        {inv.type === 'facture' && inv.status !== 'avoir_applique' && (
                          <button
                            onClick={() => {
                              setAvoirTargetInvoice(inv);
                              setAvoirReason('Marchandise défectueuse / non conforme');
                            }}
                            className="p-1.5 bg-purple-50 hover:bg-purple-700 hover:text-white text-purple-700 border border-purple-200 rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-[10px] font-bold"
                            title="Émettre une Facture d'Avoir (Annulation / Rectification Fiscale)"
                          >
                            <RotateCcw size={12} />
                            <span className="hidden xl:inline">Avoir</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleRequestDelete(inv)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
                          title={inv.type === 'facture' || inv.type === 'avoir' ? "Réglementation Fiscale G50 : Suppression Encadrée" : "Supprimer"}
                        >
                          {inv.type === 'facture' || inv.type === 'avoir' ? (
                            <Lock size={13} className="text-slate-400 hover:text-rose-500" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal for Invoice / Delivery Slip */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-4"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={16} className="text-[#e4fc65]" />
                    <span>Créer un Document Commercial Algérien</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Générez une facture, un bon de livraison (BL) ou une proforma avec calcul TVA 19%
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-800">
                
                {/* 1. Document Type */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Type de document
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'facture', label: 'Facture Définitive' },
                      { id: 'bon_livraison', label: 'Bon de Livraison (BL)' },
                      { id: 'proforma', label: 'Facture Proforma' }
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setNewDocType(type.id as any)}
                        className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                          newDocType === type.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Client Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Sélectionner un Client (CRM)
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={e => setSelectedClientId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none"
                    >
                      <option value="custom">+ Autre client / Saisie manuelle</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.company} ({c.wilaya})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedClientId === 'custom' && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Nom ou Raison Sociale Client
                      </label>
                      <input
                        type="text"
                        value={customClientName}
                        onChange={e => setCustomClientName(e.target.value)}
                        placeholder="ex: EURL Djurdjura Matériaux"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Items Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Lignes d'articles (Articles en stock)
                    </label>
                    <button
                      type="button"
                      onClick={handleAddLineItem}
                      className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <PlusCircle size={13} />
                      <span>Ajouter un article</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {newInvoiceItems.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <select
                          value={line.productId}
                          onChange={e => handleUpdateLineItem(idx, 'productId', e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold"
                        >
                          {inventory.map(inv => (
                            <option key={inv.id} value={inv.id}>
                              {inv.sku} - {inv.name[language] || inv.name.fr} ({formatDZD(inv.sellingPriceDZD, language)})
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1 w-24">
                          <span className="text-[10px] text-slate-400">Qté:</span>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={e => handleUpdateLineItem(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-14 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-center font-mono text-xs font-bold"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Taxes & Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      TVA Algérienne
                    </label>
                    <label className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tvaApplicable}
                        onChange={e => setTvaApplicable(e.target.checked)}
                        className="rounded text-slate-900 focus:ring-0"
                      />
                      <span className="font-semibold text-xs">Appliquer TVA 19%</span>
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Remise globale (DA)
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      value={newDiscountDA || ''}
                      onChange={e => setNewDiscountDA(Math.max(0, parseInt(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
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

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Notes particulières / Conditions de livraison
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={e => setNewNotes(e.target.value)}
                    placeholder="ex: Livraison assurée par nos camions sous 48h"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={newInvoiceItems.length === 0}
                  onClick={handleSaveNewInvoice}
                  className="px-5 py-2 bg-slate-900 text-[#e4fc65] rounded-xl text-xs font-bold hover:bg-black cursor-pointer shadow-xs"
                >
                  Générer & Imprimer A4
                </button>
              </div>

            </motion.div>
          </div>
        )}

        {/* Modal: Interception Fiscale de Suppression (Art. 11/12 Code de Commerce Algérien) */}
        {fiscalBlockedDeleteInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden"
            >
              <div className="bg-rose-950 text-white p-5 flex items-center justify-between border-b border-rose-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Suppression Fiscale Interdite</h3>
                    <p className="text-[10px] text-rose-300 font-mono">Conformité DGI • Code de Commerce Algérien</p>
                  </div>
                </div>
                <button
                  onClick={() => setFiscalBlockedDeleteInvoice(null)}
                  className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-slate-600 leading-relaxed">
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-2.5 text-rose-900">
                  <Lock size={16} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-[11px] text-rose-950">
                      La facture {fiscalBlockedDeleteInvoice.number} est enregistrée et verrouillée
                    </p>
                    <p className="text-[10px] text-rose-700 mt-0.5">
                      En droit commercial et fiscal algérien (Articles 11 & 12 du Code de Commerce, Déclaration Mensuelle G50), les factures validées ne peuvent être détruites ou supprimées.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-slate-700">
                  <p className="font-semibold text-slate-900">
                    Pourquoi cette protection est-elle active ?
                  </p>
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] text-slate-600">
                    <li><strong className="text-slate-800">Continuité séquentielle :</strong> La suppression créerait un "trou de numérotation" dans le livre journal des ventes, passible de sanctions lors d'un contrôle fiscal.</li>
                    <li><strong className="text-slate-800">Neutralisation légale :</strong> Pour annuler ou rectifier une créance, la procédure réglementaire obligatoire consiste à émettre une <strong className="text-purple-700">Facture d'Avoir</strong> (Note de Crédit).</li>
                  </ul>
                </div>

                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">Montant à régulariser</span>
                    <span className="font-bold font-mono text-purple-950 text-sm">{formatDZD(fiscalBlockedDeleteInvoice.totalTTC, language)}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold">
                    TVA 19%: {formatDZD(fiscalBlockedDeleteInvoice.tvaAmountDZD, language)}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setFiscalBlockedDeleteInvoice(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    const target = fiscalBlockedDeleteInvoice;
                    setFiscalBlockedDeleteInvoice(null);
                    setAvoirTargetInvoice(target);
                    setAvoirReason('Annulation de commande / Régularisation fiscale');
                  }}
                  className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>Émettre une Facture d'Avoir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal: Émission d'une Facture d'Avoir (Credit Note) */}
        {avoirTargetInvoice && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-purple-200 w-full max-w-lg overflow-hidden"
            >
              <div className="bg-purple-950 text-white p-5 flex items-center justify-between border-b border-purple-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
                    <RotateCcw size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Émettre une Facture d'Avoir</h3>
                    <p className="text-[10px] text-purple-300 font-mono">Annulation / Rectification Fiscale DGI</p>
                  </div>
                </div>
                <button
                  onClick={() => setAvoirTargetInvoice(null)}
                  className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/50"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Facture d'origine :</span>
                    <span className="font-bold font-mono text-purple-900">{avoirTargetInvoice.number}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">Client :</span>
                    <span className="font-bold text-slate-800">{avoirTargetInvoice.clientCompany || avoirTargetInvoice.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Montant crédité :</span>
                    <span className="font-mono font-black text-rose-700">-{formatDZD(avoirTargetInvoice.totalTTC, language)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Motif réglementaire de l'Avoir
                  </label>
                  <select
                    value={avoirReason}
                    onChange={e => setAvoirReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-700 outline-none"
                  >
                    <option value="Marchandise défectueuse / non conforme">Marchandise défectueuse / non conforme</option>
                    <option value="Erreur de facturation / Ristourne commerciale">Erreur de facturation / Ristourne commerciale</option>
                    <option value="Annulation de commande / Rétractation client">Annulation de commande / Rétractation client</option>
                    <option value="Retour physique au stock magasin">Retour physique au stock magasin</option>
                    <option value="Régularisation comptable de fin d'exercice">Régularisation comptable de fin d'exercice</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Check size={14} className="text-emerald-600" />
                    <span>Effets de la validation :</span>
                  </div>
                  <p>• Génère un numéro officiel séquentiel (ex: AVOIR-2026-0001).</p>
                  <p>• Inscrit la transaction dans le registre immuable (hachage cryptographique).</p>
                  <p>• Déduit automatiquement le montant de la TVA collectée sur la déclaration G50.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setAvoirTargetInvoice(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmCreateAvoir}
                  className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Confirmer & Émettre l'Avoir</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable Modal */}
      <PrintInvoiceModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        invoice={selectedInvoiceForPrint}
        settings={settings}
        language={language}
      />
    </motion.div>
  );
};
