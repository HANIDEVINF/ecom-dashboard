import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Printer, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  ShieldCheck,
  Receipt,
  Stamp,
  Check
} from 'lucide-react';
import { AppLanguage, BusinessSettings, Invoice } from '../types';
import { formatDZD } from '../services/apiService';
import { AlgerianSealStamp } from './AlgerianSealStamp';
import { ThermalReceipt80mm } from './ThermalReceipt80mm';

interface PrintInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  settings: BusinessSettings;
  language: AppLanguage;
  initialFormat?: 'a4' | 'thermal_80mm';
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  settings,
  language,
  initialFormat = 'a4'
}) => {
  const [formatMode, setFormatMode] = useState<'a4' | 'thermal_80mm'>(initialFormat);
  const [showStamp, setShowStamp] = useState(true);
  const [stampColor, setStampColor] = useState<'blue' | 'purple' | 'red'>('blue');

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDocTypeName = () => {
    if (invoice.type === 'bon_livraison') {
      return language === 'ar' ? 'وصل تسليم بضاعة (BON DE LIVRAISON)' : 'BON DE LIVRAISON';
    }
    if (invoice.type === 'proforma') {
      return language === 'ar' ? 'فاتورة شكلية (FACTURE PROFORMA)' : 'FACTURE PROFORMA';
    }
    return language === 'ar' ? 'فاتورة تجارية رسمية (FACTURE DÉFINITIVE)' : 'FACTURE DÉFINITIVE';
  };

  const getDocPrefix = () => {
    if (invoice.type === 'bon_livraison') return 'BL';
    if (invoice.type === 'proforma') return 'PRO';
    return 'FAC';
  };

  return (
    <AnimatePresence>
      <div 
        id="modal-print-invoice-backdrop"
        className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className={`bg-white w-full rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none ${
            formatMode === 'thermal_80mm' ? 'max-w-md' : 'max-w-4xl'
          }`}
        >
          {/* Top Non-Print Controls Bar */}
          <div className="bg-slate-900 text-white px-5 py-3.5 shrink-0 print:hidden space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#e4fc65] text-slate-950 flex items-center justify-center font-black text-xs">
                  {getDocPrefix()}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span>{getDocTypeName()}</span>
                    <span className="text-xs text-[#e4fc65] font-mono">{invoice.number}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {formatMode === 'a4' 
                      ? 'Format A4 officiel avec ventilation fiscale et cachet' 
                      : 'Format Ticket Caisse 80mm avec QR Code BaridiMob'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-[#e4fc65] hover:bg-[#d5ee52] text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer size={14} />
                  <span>Imprimer ({formatMode === 'a4' ? 'A4' : '80mm'})</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                  title="Fermer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Ergonomic Switcher Bar: A4 vs 80mm & Cachet Humide Controls */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Format Toggle */}
              <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setFormatMode('a4')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    formatMode === 'a4'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText size={13} />
                  <span>Document A4</span>
                </button>
                <button
                  onClick={() => setFormatMode('thermal_80mm')}
                  className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    formatMode === 'thermal_80mm'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Receipt size={13} />
                  <span>Ticket Caisse 80mm</span>
                </button>
              </div>

              {/* Cachet Humide Toggle & Colors */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowStamp(!showStamp)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                    showStamp
                      ? 'bg-blue-950/60 text-blue-200 border-blue-700/60'
                      : 'bg-slate-800/60 text-slate-400 border-slate-700'
                  }`}
                >
                  <Stamp size={13} className={showStamp ? 'text-blue-400' : 'text-slate-400'} />
                  <span>Cachet Humide : {showStamp ? 'Activé' : 'Masqué'}</span>
                </button>

                {showStamp && (
                  <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                    {(['blue', 'purple', 'red'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setStampColor(c)}
                        className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                          c === 'blue' ? 'bg-blue-600' : c === 'purple' ? 'bg-indigo-700' : 'bg-red-600'
                        } ${stampColor === c ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                        title={`Encre ${c}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="overflow-y-auto max-h-[80vh] print:max-h-none print:overflow-visible">
            {formatMode === 'thermal_80mm' ? (
              /* --- 80mm Thermal Receipt Layout --- */
              <div className="p-4 sm:p-6 bg-slate-200/60 flex justify-center print:p-0 print:bg-white">
                <ThermalReceipt80mm
                  invoice={invoice}
                  settings={settings}
                  language={language}
                  showStamp={showStamp}
                />
              </div>
            ) : (
              /* --- Professional A4 Invoicing Layout --- */
              <div className="p-8 sm:p-12 print:p-6 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 bg-white">
                
                {/* Header: Company Details & Document Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900 pb-6">
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                        {settings.companyName}
                      </h1>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                        {settings.legalForm}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      {settings.address} - {settings.wilaya}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      {settings.phone}
                    </p>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      {settings.email}
                    </p>

                    {/* Algerian Tax Identifiers Box */}
                    <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div><span className="font-bold text-slate-900">RC :</span> {settings.rcNumber}</div>
                      <div><span className="font-bold text-slate-900">NIF :</span> {settings.nif}</div>
                      <div><span className="font-bold text-slate-900">NIS :</span> {settings.nis}</div>
                      <div><span className="font-bold text-slate-900">A.I :</span> {settings.ai}</div>
                    </div>
                  </div>

                  {/* Document Stamp Box */}
                  <div className="text-right sm:self-start bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[220px]">
                    <div className="text-base font-black text-slate-950 uppercase tracking-wide">
                      {getDocTypeName()}
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                      N° {invoice.number}
                    </div>
                    <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                      <div><span className="font-semibold text-slate-700">Date :</span> {invoice.date}</div>
                      {invoice.dueDate && (
                        <div><span className="font-semibold text-slate-700">Échéance :</span> {invoice.dueDate}</div>
                      )}
                      <div>
                        <span className="font-semibold text-slate-700">Règlement :</span>{' '}
                        <span className="uppercase font-medium text-slate-900">
                          {invoice.paymentMethod === 'virement_cib' ? 'Virement CIB / BNA' : 
                           invoice.paymentMethod === 'baridimob' ? 'BaridiMob / CCP' : 
                           invoice.paymentMethod === 'especes' ? 'Espèces' : 'Chèque'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        invoice.status === 'payee' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                        invoice.status === 'en_attente' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {invoice.status === 'payee' ? 'PAYÉE / ACQUITTÉE' : 
                         invoice.status === 'en_attente' ? 'EN ATTENTE DE RÈGLEMENT' : 'ANNULÉE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Destination Box */}
                <div className="my-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      DOIT / CLIENT DESTINATAIRE :
                    </span>
                    <div className="text-base font-bold text-slate-950">
                      {invoice.clientCompany || invoice.clientName}
                    </div>
                    {invoice.clientCompany && invoice.clientName !== invoice.clientCompany && (
                      <div className="text-xs text-slate-600 font-medium">
                        Attn: {invoice.clientName}
                      </div>
                    )}
                    {invoice.clientAddress && (
                      <div className="text-xs text-slate-600 mt-1">
                        {invoice.clientAddress}
                      </div>
                    )}
                    {invoice.clientWilaya && (
                      <div className="text-xs text-slate-700 font-semibold mt-0.5">
                        Wilaya: {invoice.clientWilaya}
                      </div>
                    )}
                  </div>

                  {/* Client Fiscal Info if available */}
                  {(invoice.clientNif || invoice.clientNis || invoice.clientRc) && (
                    <div className="text-[11px] font-mono text-slate-600 space-y-0.5 bg-white p-3 rounded-lg border border-slate-200">
                      {invoice.clientNif && <div><span className="font-bold text-slate-900">NIF :</span> {invoice.clientNif}</div>}
                      {invoice.clientNis && <div><span className="font-bold text-slate-900">NIS :</span> {invoice.clientNis}</div>}
                      {invoice.clientRc && <div><span className="font-bold text-slate-900">RC :</span> {invoice.clientRc}</div>}
                    </div>
                  )}
                </div>

                {/* Products Items Table */}
                <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-900 text-white font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4 w-12 text-center">N°</th>
                        <th className="py-3 px-4">Réf / SKU</th>
                        <th className="py-3 px-4">Désignation des Articles</th>
                        <th className="py-3 px-4 text-center w-16">Qté</th>
                        <th className="py-3 px-4 text-right">Prix Unitaire HT</th>
                        <th className="py-3 px-4 text-right">Montant Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-800">
                      {invoice.items.map((item, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/50' : ''}>
                          <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.sku}</td>
                          <td className="py-3 px-4 font-semibold text-slate-950">{item.productName}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono">{formatDZD(item.unitPriceDZD, language)}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">
                            {formatDZD(item.totalDZD, language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Section: Totals & Summary */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-4">
                  
                  {/* Left: Algerian Legal & Payment terms */}
                  <div className="max-w-md space-y-2 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Conditions de règlement & Coordonnées bancaires :</span>
                      </div>
                      <p>• Règlement sous 30 jours par virement bancaire ou BaridiMob.</p>
                      <p>• RIB BNA : 001 00624 0300 001284 39 (Agence Alger-Centre)</p>
                      <p>• Compte CCP / RIP : 00799999 0018273645 88 (BaridiMob)</p>
                      {invoice.notes && (
                        <p className="italic text-slate-700 pt-1 border-t border-slate-200">
                          Note : {invoice.notes}
                        </p>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      Arrêté la présente facture à la somme TTC de :{' '}
                      <span className="font-bold text-slate-900">
                        {formatDZD(invoice.totalTTC, language)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Calculations Table */}
                  <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Brut HT :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatDZD(invoice.subtotalHT, language)}
                      </span>
                    </div>

                    {invoice.discountDZD > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Remise commerciale :</span>
                        <span className="font-mono">
                          -{formatDZD(invoice.discountDZD, language)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                      <span>TVA ({(invoice.tvaRate * 100).toFixed(0)}%) :</span>
                      <span className="font-mono font-bold text-slate-900">
                        {invoice.tvaAmountDZD > 0 ? formatDZD(invoice.tvaAmountDZD, language) : 'Exonéré (0 DA)'}
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-950 font-black text-sm pt-2 border-t-2 border-slate-900">
                      <span>NET À PAYER (TTC) :</span>
                      <span className="font-mono text-base text-slate-950">
                        {formatDZD(invoice.totalTTC, language)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature & Stamp Boxes */}
                <div className="mt-12 grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
                  <div className="h-36 border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col justify-between">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Accusé de réception & signature du client
                    </span>
                    <span className="text-[10px] text-slate-400 italic">Date et mention "Reçu conforme"</span>
                  </div>

                  <div className="h-36 border-2 border-dashed border-slate-300 rounded-xl p-3 flex flex-col justify-between relative overflow-visible">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Cachet humide & signature de l'entreprise
                    </span>

                    {/* Official Algerian Rubber Stamp Vector */}
                    {showStamp ? (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <AlgerianSealStamp
                          companyName={settings.companyName}
                          legalForm={settings.legalForm}
                          rcNumber={settings.rcNumber}
                          nif={settings.nif}
                          wilaya={settings.wilaya}
                          date={invoice.date}
                          size="md"
                          inkColor={stampColor}
                        />
                      </div>
                    ) : (
                      <div className="text-center text-slate-300 text-[11px] font-mono select-none my-auto">
                        [ Espace réservé au cachet manuel ]
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

