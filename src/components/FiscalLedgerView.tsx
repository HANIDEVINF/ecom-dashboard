import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Hash, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileSpreadsheet, 
  Building2, 
  Scale, 
  Info,
  ExternalLink,
  Search,
  Key
} from 'lucide-react';
import { AppLanguage, FiscalLedgerEntry, Invoice } from '../types';
import { FiscalLedgerManager, GENESIS_HASH } from '../services/fiscalLedgerService';
import { formatDZD } from '../services/apiService';

interface FiscalLedgerViewProps {
  invoices: Invoice[];
  language: AppLanguage;
  onNavigateToInvoice?: (invoiceId: string) => void;
  onOpenAvoirModal?: (invoice: Invoice) => void;
}

export const FiscalLedgerView: React.FC<FiscalLedgerViewProps> = ({
  invoices,
  language,
  onNavigateToInvoice,
  onOpenAvoirModal
}) => {
  const [ledger, setLedger] = useState<FiscalLedgerEntry[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    totalBlocks: number;
    gapsDetected: string[];
    brokenHashIndex?: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDocType, setFilterDocType] = useState<'all' | 'facture' | 'avoir' | 'bon_livraison'>('all');

  useEffect(() => {
    const loaded = FiscalLedgerManager.getLedger();
    setLedger(loaded);
    // Initial silent verification
    const res = FiscalLedgerManager.verifyChainIntegrity(loaded);
    setVerificationResult(res);
  }, [invoices]);

  const handleManualVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const res = FiscalLedgerManager.verifyChainIntegrity(ledger);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 600);
  };

  // G50 Summary Calculation
  const validFactures = invoices.filter(i => i.type === 'facture' && i.status !== 'annulee');
  const avoirs = invoices.filter(i => i.type === 'avoir');
  
  const totalVentesHT = validFactures.reduce((acc, i) => acc + i.subtotalHT, 0);
  const totalAvoirsHT = avoirs.reduce((acc, i) => acc + i.subtotalHT, 0);
  const caImposableNetHT = Math.max(0, totalVentesHT - totalAvoirsHT);
  
  const totalTvaCollectee = validFactures.reduce((acc, i) => acc + i.tvaAmountDZD, 0);
  const totalTvaAvoirs = avoirs.reduce((acc, i) => acc + i.tvaAmountDZD, 0);
  const netTvaAPayer = Math.max(0, totalTvaCollectee - totalTvaAvoirs);

  // Filtered ledger entries
  const filteredLedger = ledger.filter(entry => {
    const matchesSearch = 
      entry.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.clientNif && entry.clientNif.includes(searchQuery));
    
    const matchesType = filterDocType === 'all' || entry.documentType === filterDocType;
    return matchesSearch && matchesType;
  });

  const exportG50Csv = () => {
    const headers = "Index,Date,Type,N_Document,Client,NIF,Montant_HT_DA,TVA_Taux,TVA_DA,Total_TTC_DA,SHA256_Hash,Hash_Precedent,Operateur\n";
    const rows = ledger.map(e => 
      `"${e.index}","${e.timestamp}","${e.documentType}","${e.documentNumber}","${e.clientName.replace(/"/g, '""')}","${e.clientNif || 'PARTICULIER'}","${e.amountHT}","${e.tvaRate * 100}%","${e.tvaAmountDZD}","${e.totalTTC}","${e.hash}","${e.previousHash}","${e.operatorName} (${e.operatorRole})"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `grand_livre_fiscal_g50_algerie_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      id="fiscal-ledger-audit-view"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Top Banner with Fiscal Law Reference */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#e4fc65]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-[#e4fc65] text-slate-950 font-black text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-slate-950" />
                Conformité Fiscale DGI G50
              </span>
              <span className="px-2.5 py-1 bg-white/10 text-white font-mono text-[11px] rounded-full border border-white/10">
                Code de Commerce Algérien (Art. 11 & 12)
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold text-[11px] rounded-full border border-emerald-500/30">
                Livre Journal Immuable
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Grand Livre Transactionnel & Piste d'Audit SHA-256
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Registre infalsifiable à écriture seule (Append-Only). En vertu de la législation commerciale algérienne, toute facture validée est cryptographiquement verrouillée. Les suppressions sont interdites : les rectifications s'opèrent obligatoirement par émission de <strong>Factures d'Avoir</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="verify-chain-integrity-btn"
              onClick={handleManualVerify}
              disabled={isVerifying}
              className="px-5 py-3 bg-[#e4fc65] hover:bg-[#d6f04c] text-slate-950 font-black text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={isVerifying ? 'animate-spin' : ''} />
              <span>{isVerifying ? 'Vérification SHA-256...' : 'Vérifier la Chaîne Cryptographique'}</span>
            </button>

            <button
              id="export-g50-ledger-btn"
              onClick={exportG50Csv}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Download size={15} />
              <span>Export Grand Livre (CSV)</span>
            </button>
          </div>
        </div>

        {/* Verification Status Bar */}
        {verificationResult && (
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${verificationResult.isValid ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-rose-500 animate-pulse'}`} />
              <span className="font-bold text-slate-200">
                État d'Intégrité :{' '}
                <span className={verificationResult.isValid ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>
                  {verificationResult.isValid 
                    ? `100% Intacte (${verificationResult.totalBlocks} Blocs Chiffrés - Zéro Rupture de Séquence)` 
                    : 'Alerte d\'Altération Détectée'}
                </span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>Genesis Hash : 0000...0000</span>
              <span>•</span>
              <span>Bloc Actuel N° {ledger.length}</span>
              <span>•</span>
              <span className="text-[#e4fc65]">Algorithme : SHA-256 Chained</span>
            </div>
          </div>
        )}
      </div>

      {/* G50 Tax Declaration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires Brut */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Ventes Brutes (HT)
            </span>
            <FileText size={16} className="text-slate-600" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatDZD(totalVentesHT)}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            {validFactures.length} Factures de vente émises
          </p>
        </div>

        {/* Total Avoirs Déductibles */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Avoirs & Ristournes (HT)
            </span>
            <Scale size={16} className="text-amber-700" />
          </div>
          <div className="text-xl font-black text-amber-900 tracking-tight">
            - {formatDZD(totalAvoirsHT)}
          </div>
          <p className="text-[11px] text-amber-700 font-medium">
            {avoirs.length} Factures d'Avoir régularisées
          </p>
        </div>

        {/* CA Net Imposable G50 */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Assiette G50 Imposable (HT)
            </span>
            <Building2 size={16} className="text-slate-700" />
          </div>
          <div className="text-xl font-black text-slate-900 tracking-tight">
            {formatDZD(caImposableNetHT)}
          </div>
          <p className="text-[11px] text-slate-600 font-medium">
            CA Déclaration Série G N° 50
          </p>
        </div>

        {/* TVA Nette à Payer 19% */}
        <div className="bg-emerald-50 rounded-3xl p-5 border border-emerald-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              TVA Nette 19% à Verser
            </span>
            <CheckCircle2 size={16} className="text-emerald-700" />
          </div>
          <div className="text-xl font-black text-emerald-950 tracking-tight">
            {formatDZD(netTvaAPayer)}
          </div>
          <p className="text-[11px] text-emerald-800 font-medium">
            Recette des Impôts (Wilaya compétente)
          </p>
        </div>
      </div>

      {/* Sequential Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters & Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Registre Chronologique des Factures & Avoirs
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Séquence continue sans trous de numérotation. Chaque bloc scelle le hash du bloc antérieur.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold">
              <button
                onClick={() => setFilterDocType('all')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${filterDocType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tous ({ledger.length})
              </button>
              <button
                onClick={() => setFilterDocType('facture')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${filterDocType === 'facture' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Factures
              </button>
              <button
                onClick={() => setFilterDocType('avoir')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${filterDocType === 'avoir' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Avoirs ({avoirs.length})
              </button>
              <button
                onClick={() => setFilterDocType('bon_livraison')}
                className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all ${filterDocType === 'bon_livraison' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Bons de Livraison
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher document, NIF, hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white w-56 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-black uppercase text-slate-600 border-b border-slate-100 tracking-wider">
                <th className="py-3 px-4">Bloc #</th>
                <th className="py-3 px-4">N° Document</th>
                <th className="py-3 px-4">Date & Heure</th>
                <th className="py-3 px-4">Client / NIF</th>
                <th className="py-3 px-4 text-right">Montant HT</th>
                <th className="py-3 px-4 text-right">TVA 19%</th>
                <th className="py-3 px-4 text-right">Total TTC</th>
                <th className="py-3 px-4">Empreinte SHA-256</th>
                <th className="py-3 px-4">Opérateur & Rôle</th>
                <th className="py-3 px-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredLedger.map((entry) => {
                const isAvoir = entry.documentType === 'avoir';
                const isBL = entry.documentType === 'bon_livraison';
                
                return (
                  <tr 
                    key={entry.index}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{String(entry.index).padStart(4, '0')}
                      </span>
                    </td>

                    {/* Document Number */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Lock size={12} className="text-slate-400" />
                        <span className={`font-black font-mono ${isAvoir ? 'text-amber-700' : isBL ? 'text-sky-700' : 'text-slate-900'}`}>
                          {entry.documentNumber}
                        </span>
                        {entry.referenceDocNumber && (
                          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            Réf: {entry.referenceDocNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {new Date(entry.timestamp).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Client & NIF */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 max-w-[180px] truncate">
                        {entry.clientName}
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono">
                        NIF: {entry.clientNif || '000000000000000 (Particulier)'}
                      </div>
                    </td>

                    {/* HT */}
                    <td className={`py-3 px-4 text-right font-bold font-mono ${isAvoir ? 'text-amber-700' : 'text-slate-800'}`}>
                      {isAvoir ? '-' : ''}{formatDZD(entry.amountHT)}
                    </td>

                    {/* TVA */}
                    <td className={`py-3 px-4 text-right font-mono text-slate-600 ${isAvoir ? 'text-amber-600' : ''}`}>
                      {isAvoir ? '-' : ''}{formatDZD(entry.tvaAmountDZD)}
                    </td>

                    {/* Total TTC */}
                    <td className={`py-3 px-4 text-right font-black font-mono ${isAvoir ? 'text-amber-700' : 'text-slate-950'}`}>
                      {isAvoir ? '-' : ''}{formatDZD(entry.totalTTC)}
                    </td>

                    {/* SHA256 Hash Preview */}
                    <td className="py-3 px-4 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-600" title={`Empreinte SHA-256 : ${entry.hash}\nPrécédent : ${entry.previousHash}`}>
                        <Hash size={11} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[110px] bg-slate-100 px-1 py-0.5 rounded">
                          {entry.hash.slice(0, 10)}...{entry.hash.slice(-6)}
                        </span>
                      </div>
                    </td>

                    {/* Operator */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">
                        {entry.operatorName}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-600">
                        {entry.operatorRole}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={10} />
                        Scellé
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <ShieldCheck size={32} className="mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm">Aucun enregistrement fiscal ne correspond à la recherche</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Notice */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>
              Certifié conforme à l'article 21 du Code des Taxes sur le Chiffre d'Affaires (TVA) et à l'instruction N° 35/MF/DGI relative aux logiciels de caisse et de facturation en Algérie.
            </span>
          </div>

          <span className="font-mono text-slate-400 shrink-0">
            Chain Anchor: DGI-DZ-2026-CERT
          </span>
        </div>
      </div>
    </motion.div>
  );
};
